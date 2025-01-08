import { useState, useEffect } from 'react';
import { Participant } from '@/models/Quiz';
import Avatar from '@/Avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon } from 'lucide-react';
import { BombSlide } from '@/models/Quiz';
import { ParticipantService } from '@/services/participant';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { BombIcon } from 'lucide-react';
import NextSlide from '@/slides/_components/NextSlide';

type HostProps = {
  participants: Participant[];
  slide: BombSlide;
  quizCode: string;
  slideNumber: number;
  changeTurn: (participantId: string, quizCode: string) => void;

  updateSlideUsedAnswers: (
    slideId: string,
    quizCode: string,
    usedAnswers: string[]
  ) => void;
  onNextSlide: () => void;
  onPrevSlide: () => void;
};

type ParticipantHearts = {
  participantId: string;
  hearts: number;
};

export function Host({
  participants,
  slide,
  quizCode,
  slideNumber,
  onNextSlide,
  onPrevSlide,
  changeTurn,
  updateSlideUsedAnswers,
}: HostProps) {
  const { t } = useTranslation();
  const [time, setTime] = useState(1000000000);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentParticipants, setCurrentParticipants] = useState(participants);
  const [participantHearts, setParticipantHearts] = useState<
    ParticipantHearts[]
  >([]);
  const [winner, setWinner] = useState<Participant[] | null>(null);
  const [hasUpdatedDatabaseDontDelete, setHasUpdatedDatabaseDontDelete] =
    useState(false);

  const [userAnswer, setUserAnswer] = useState('Answer');
  const [usedAnswers, setUsedAnswers] = useState<string[]>([]);
  const [answers] = useState(slide.answers);
  const [isCorrect, setIsCorrect] = useState('');
  const [deadParticipants, setDeadParticipants] = useState<string[]>([]);
  const [aliveParticipants, setAliveParticipants] = useState<Participant[]>([]);

  const [turn, setTurn] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [gameStarted, setGameStarted] = useState(false);

  const initializeHeartsAndTime = () => {
    const newParticipantHearts = participants.map((participant) => {
      const existingHeart = Array.isArray(slide.participantHearts)
        ? slide.participantHearts.find(
            (ph) => ph.participantId === participant.participantId
          )
        : null;

      return {
        participantId: participant.participantId,
        hearts: Math.min(existingHeart?.hearts ?? slide.hearts, 5),
      };
    });
    setGameStarted(true);
    setIsTimerRunning(true);
    setTime(slide.initialTime);
    handleChangeTurn(currentParticipants[0].participantId);

    setParticipantHearts(newParticipantHearts);
    setAliveParticipants(currentParticipants);
  };

  const handleChangeTurn = async (participantId: string) => {
    try {
      await changeTurn(participantId, quizCode);

      setTurn(participantId);
    } catch (error) {
      console.error('Error while changing turn:', error);
    }
  };

  const getNextParticipantIndex = (startIndex: number): number => {
    const totalParticipants = currentParticipants.length;
    let index = startIndex;

    while (
      (participantHearts.find(
        (ph) => ph.participantId === currentParticipants[index].participantId
      )?.hearts ?? 0) <= 0
    ) {
      index = (index + 1) % totalParticipants;
      if (index === startIndex) break;
    }

    return index;
  };

  const retainParticipantOrder = () => {
    if (!participants) {
      return <h1>No Host </h1>;
    }
    // Only update the participants if they are not already in sync and the arrays have the same length
    if (
      participants !== currentParticipants &&
      participants &&
      currentParticipants.length === participants.length
    ) {
      // Retain the original order from currentParticipants while updating data from participants
      const newParticipants = currentParticipants.map((currentParticipant) => {
        // Find the matching participant in the new data (from the database)
        const matchingParticipant = participants.find(
          (participant) =>
            participant.participantId === currentParticipant.participantId
        );

        // If a match is found, merge data; otherwise, keep the original currentParticipant
        return matchingParticipant
          ? { ...currentParticipant, ...matchingParticipant }
          : currentParticipant;
      });

      // Update the state with the new array
      setCurrentParticipants(newParticipants);
    }
  };

  useEffect(() => {
    // Update the order only if participants are different
    retainParticipantOrder();
  }, [participants]); // Trigger this effect only when participants change

  useEffect(() => {
    if (currentParticipants) {
      const updateParticipants = async () => {
        if (time <= 0 || isTransitioning || currentParticipants.length === 0)
          return;

        const currentParticipant = currentParticipants[0];
        const lastTempAnswer = currentParticipant?.tempAnswer?.tempAnswer;

        if (
          lastTempAnswer &&
          answers.includes(lastTempAnswer.toUpperCase().trim()) &&
          !usedAnswers.includes(lastTempAnswer.toUpperCase().trim()) &&
          currentParticipant.participantId == turn
        ) {
          setIsCorrect('true');

          setUsedAnswers((prev) => {
            const updatedAnswers = [...prev, lastTempAnswer.toUpperCase()];

            if (answers.length === updatedAnswers.length) {
              sendAnswersToDatabase(
                aliveParticipants,
                deadParticipants,
                updatedAnswers
              );
              setWinner(aliveParticipants);
            }

            return updatedAnswers;
          });

          setUserAnswer(lastTempAnswer);
          setIsTransitioning(true);

          // Update is turn logic
          setTimeout(async () => {
            setIsCorrect('');
            setUserAnswer('');

            // Get the first participant from the updated order
            const nextParticipant = [
              ...currentParticipants.slice(getNextParticipantIndex(1)),
              ...currentParticipants.slice(0, getNextParticipantIndex(1)),
            ][0];

            // Compute the updated participants array
            setCurrentParticipants((prevParticipants) => {
              const nextIndex = getNextParticipantIndex(1); // Get the next participant index
              return [
                ...prevParticipants.slice(nextIndex),
                ...prevParticipants.slice(0, nextIndex),
              ];
            });

            // Wait for the async operation to finish before continuing
            await ParticipantService.removeTempAnswer(
              quizCode,
              currentParticipant.participantId
            );

            handleChangeTurn(nextParticipant.participantId);

            setTime(slide.initialTime); // Reset the timer
            setIsTransitioning(false); // Unlock transitions
            setUserAnswer('');
          }, 1200);
        } else if (
          lastTempAnswer &&
          !answers.includes(lastTempAnswer.toUpperCase().trim())
        ) {
          setIsCorrect('false');
          setUserAnswer(lastTempAnswer);
        } else if (
          lastTempAnswer &&
          answers.includes(lastTempAnswer.toUpperCase().trim()) &&
          usedAnswers.includes(lastTempAnswer.toUpperCase().trim())
        ) {
          setIsCorrect('used');
          setUserAnswer(lastTempAnswer);
          setIsTransitioning(false); // Reset transition lock
          setTimeout(() => {});
        }
      };

      updateParticipants(); // Call the async function
    }
  }, [currentParticipants]);

  useEffect(() => {
    if (time == 0) {
      playerLoseHeart(currentParticipants[0]);
    }
    if (isTimerRunning) {
      const timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [time]);

  function calculateAliveLength(participants: Participant[]) {
    return participants.length;
  }

  function playerLoseHeart(participant: Participant) {
    setUserAnswer('');

    if (aliveParticipants) {
      if (!isTransitioning) {
        const currentPlayerId = participant.participantId;

        setParticipantHearts((prevHearts) => {
          const updatedHearts = prevHearts.map((ph) =>
            ph.participantId === currentPlayerId
              ? { ...ph, hearts: Math.max(0, ph.hearts - 1) }
              : ph
          );

          const currentParticipant = updatedHearts.find(
            (ph) => ph.participantId === currentPlayerId
          );

          if (currentParticipant && currentParticipant.hearts === 0) {
            setDeadParticipants((prevDead) => [...prevDead, currentPlayerId]);

            setAliveParticipants((prevAlive) => {
              const updatedAlive = prevAlive.filter(
                (participant) => participant.participantId !== currentPlayerId
              );

              // Calculate aliveLength directly here
              const aliveLength = calculateAliveLength(updatedAlive);

              // Handle the game-ending logic inline
              if (
                aliveLength === 1 &&
                !winner &&
                !hasUpdatedDatabaseDontDelete
              ) {
                setWinner(updatedAlive);
                sendAnswersToDatabase(
                  updatedAlive,
                  [...deadParticipants, currentPlayerId],
                  usedAnswers
                );
              }

              console.log(
                'answers.length',
                answers.length,
                'usedanswers.length',
                usedAnswers.length
              );

              return updatedAlive;
            });
          }

          return updatedHearts;
        });

        const nextIndex = getNextParticipantIndex(1);
        const nextParticipant = [
          ...currentParticipants.slice(nextIndex),
          ...currentParticipants.slice(0, nextIndex),
        ][0];

        handleChangeTurn(nextParticipant.participantId);

        setCurrentParticipants((prevParticipants) => {
          const nextIndex = getNextParticipantIndex(1);
          return [
            ...prevParticipants.slice(nextIndex),
            ...prevParticipants.slice(0, nextIndex),
          ];
        });
        setUserAnswer('');
        setTime(slide.initialTime);
      }
    }
  }

  async function sendAnswersToDatabase(
    finalParticipants: Participant[],
    deadParticipantsId: string[],
    usedAnswersToDatabase: string[]
  ) {
    const allParticipants: string[] = [];

    await handleSendUsedAnswer(slide.id, quizCode, usedAnswersToDatabase);

    const processAnswers = async (
      participants: string[] | Participant[],
      indexOffset: number
    ) => {
      console.log(indexOffset, 'indexOffset');
      const promises = participants.map(async (participant, index) => {
        try {
          const participantId =
            typeof participant === 'string'
              ? participant
              : participant.participantId;

          // Calculate the index to send
          const answerIndex =
            indexOffset > 0
              ? indexOffset.toString()
              : (index + indexOffset).toString();

          console.log(answerIndex, 'answerIndex');

          const result = await ParticipantService.addAnswer(
            quizCode,
            participantId,
            [answerIndex],
            slideNumber - 1
          );

          if (result) {
            console.log(
              `Answer successfully submitted for participant: ${participantId}`
            );
          } else {
            console.error(
              `Failed to submit answer for participant: ${participantId}`
            );
          }
        } catch (error) {
          console.error(
            `Error submitting answer for participant ${typeof participant === 'string' ? participant : participant.participantId}:`,
            error
          );
        }
      });

      await Promise.all(promises);
    };

    if (finalParticipants.length > 1) {
      // Handle tie case
      console.log('tie');
      await processAnswers(
        finalParticipants,
        deadParticipantsId.length === 0 ? 1 : deadParticipantsId.length
      );

      if (deadParticipantsId.length > 0) {
        await processAnswers(deadParticipantsId, 0);
      }
    } else if (finalParticipants.length === 1) {
      // Handle single final participant case
      allParticipants.push(
        ...deadParticipantsId,
        finalParticipants[0].participantId
      );
      await processAnswers(allParticipants, 0);
    }

    // Finalize and update state
    setHasUpdatedDatabaseDontDelete(true);
  }

  const handleSendUsedAnswer = async (
    slideId: string,
    quizCode: string,
    usedAnswers: string[]
  ) => {
    try {
      await updateSlideUsedAnswers(slideId, quizCode, usedAnswers);
    } catch (error) {
      console.error('Could not updated usedAnswers', error);
    }
  };

  if (!gameStarted) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-8">
        <div className="mt-8 rounded-lg bg-[#F4F3F2] text-black mb-4 flex justify-center font-display text-4xl items-center break-words text-center">
          <BombIcon size={32} className="ml-4"></BombIcon>
          <h1 className="p-8 text-5xl max-w-screen-lg">{slide.title} </h1>
        </div>

        <div className="space-y-10 mx-10">
          <Button
            size={'lg'}
            className="text-5xl p-16 mx-10 rounded-full font-display"
            onClick={initializeHeartsAndTime}
          >
            Start
          </Button>
        </div>
      </div>
    );
  }

  if (
    currentParticipants &&
    currentParticipants.length > 0 &&
    gameStarted &&
    slide.answers
  ) {
    return (
      <div className="h-screen flex flex-col items-center justify-start gap-16">
        {/* Title moved outside of the motion.div */}
        <div className="mt-16  rounded-lg bg-[#F4F3F2] text-black mb-4 flex justify-center font-display text-4xl items-center max-w-[60%] break-words text-center">
          <BombIcon size={32} className="ml-4"></BombIcon>
          <h1 className="p-4">{slide.title}</h1>
        </div>

        <motion.div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '4rem',
            width: '100%', // Ensure width is properly set
          }}
        >
          <AnimatePresence mode="wait">
            {currentParticipants[0] &&
              (participantHearts.find(
                (ph) =>
                  ph.participantId === currentParticipants[0].participantId
              )?.hearts ?? 0) > 0 && (
                <motion.div
                  key={currentParticipants[0].name}
                  initial={{ opacity: 0, x: '-100%' }}
                  animate={{ opacity: 1, x: '0%' }}
                  exit={{ opacity: 0, y: '+100%' }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    zIndex: 2,
                    width: '100%', // Ensure full width for content
                  }}
                >
                  <div className="m-8 p-12 items-center bg-component-background rounded-lg grid grid-cols-2 gap-4">
                    {/* Timer stays in the first column */}
                    <div className="flex-col justify-center items-center font-display">
                      <h2 className=" text-black text-5xl">{time}</h2>
                      <div className="mt-4 text-4xl">
                        <h3 className="text-black font-display">
                          {currentParticipants[0].name}
                        </h3>
                      </div>
                      <div className="justify-center items center flex gap-0.5rem">
                        {Array.from({
                          length:
                            participantHearts.find(
                              (ph) =>
                                ph.participantId ===
                                currentParticipants[0].participantId
                            )?.hearts || 0,
                        }).map((_, index) => (
                          <HeartIcon
                            key={index}
                            fill="#FF4545"
                            color="#FF4545"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Avatar stays in the second column, center aligned */}
                    <motion.div
                      className=" flex-col items-center justify-center"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                    >
                      <Avatar
                        avatarString={currentParticipants[0].avatar}
                        collectionName={currentParticipants[0].collectionName}
                        width="8em"
                        height="8rem"
                      />
                    </motion.div>
                  </div>

                  <div
                    className={`p-8 mt-16 rounded-md text-black font-display text-6xl  ${
                      userAnswer === ''
                        ? 'bg-white' // White background for empty answer
                        : isCorrect === 'true'
                          ? 'bg-green-500' // Green for 'true'
                          : isCorrect === 'false'
                            ? 'bg-red-500' // Red for 'false'
                            : isCorrect === 'used'
                              ? 'bg-yellow-500' // Yellow for 'used'
                              : 'bg-white' // Default to white
                    }`}
                  >
                    {userAnswer === '' ? t('questions:answering') : userAnswer}
                  </div>
                </motion.div>
              )}
          </AnimatePresence>
          <div
            className="absolute flex flex-col justify-center items-center"
            style={{
              left: '25%',
              top: '45%',
              transform: 'translate(-90%, -50%)',
            }}
          >
            <h1 className="text-3xl font-display">
              {t('questions:used')} / {t('questions:total')}
            </h1>
            <h1 className="text-6xl font-display">
              {usedAnswers.length}/{answers.length}
            </h1>
          </div>
          <div className="relative flex items-center justify-center w-full">
            <motion.div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4rem',
                width: '100%',
                overflow: 'hidden',
              }}
            >
              {currentParticipants.slice(1, 10).map((participant) => (
                <motion.div
                  key={participant.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    filter:
                      (participantHearts.find(
                        (ph) => ph.participantId === participant.participantId
                      )?.hearts ?? 0) > 0
                        ? 'none'
                        : 'grayscale(100%)',
                  }}
                >
                  <Avatar
                    avatarString={participant.avatar}
                    collectionName={participant.collectionName}
                    width="6rem"
                    height="6rem"
                  />
                  <h3 className="font-display text-2xl">{participant.name}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(participantHearts.find(
                      (ph) => ph.participantId === participant.participantId
                    )?.hearts ?? 0) > 0 ? (
                      Array.from({
                        length:
                          participantHearts.find(
                            (ph) =>
                              ph.participantId === participant.participantId
                          )?.hearts ?? 0,
                      }).map((_, index) => (
                        <HeartIcon key={index} fill="#FF4545" color="#FF4545" />
                      ))
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>💀</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
        <NextSlide onPrev={onPrevSlide} onNext={onNextSlide} />
      </div>
    );
  }
}

export default Host;
