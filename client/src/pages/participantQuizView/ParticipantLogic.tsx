import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ParticipantService, useGameStatus } from '@/services/participant';
import TeamInfo from './components/ParticipantInfo';
import CreateParticipant from './components/CreateParticipant';
import { LogIn, Zap } from 'lucide-react';
import { useCookies } from 'react-cookie';
import LobbyView from '@/pages/participantQuizView/components/LobbyView';
import HasAnsweredView from '@/pages/participantQuizView/components/HasAnsweredView';
import QuizEndedView from '@/pages/participantQuizView/components/QuizEndedView';
import { Participant, QuestionTypes, Slide } from '@/models/Quiz';
import { getSlideComponents } from '@/slides/utils';
import Spinner from '@/components/Spinner';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

function QuizView({
  questions,
  currentSlide,
  participantData,
  answerQuestion,
  answerTempQuestion,
  isTurn,
  showAnswer,
}: {
  questions: Slide[] | undefined;
  currentSlide: number;
  participantData: Participant;
  answerQuestion: (answer: string[]) => Promise<void>;
  answerTempQuestion: (answer: string) => Promise<void>;
  isTurn: string;
  showAnswer: boolean;
}) {
  if (!questions || !participantData) return <Spinner />;
  if (currentSlide === 0) return <LobbyView />;
  if (currentSlide > questions.length) return <QuizEndedView />;

  const currentQuestion = questions[currentSlide - 1];
  const SlideComponent = getSlideComponents(currentQuestion);

  // If we are on a question slide render the corresponding answerView
  if (showAnswer && 'ParticipantAnswer' in SlideComponent) {
    return (
      <SlideComponent.ParticipantAnswer
        slide={currentQuestion as never}
        participant={participantData}
      />
    );
  }

  if (
    participantData.hasAnswered ||
    (participantData.tempAnswer &&
      'questionType' in currentQuestion &&
      currentQuestion.questionType !== QuestionTypes.BOMB)
  )
    return <HasAnsweredView />;

  return (
    <SlideComponent.Participant
      slide={currentQuestion as never}
      answerQuestion={answerQuestion as never}
      answerTempQuestion={answerTempQuestion as never}
      participantData={participantData}
      isTurn={isTurn}
    />
  );
}

export default function ParticipantLogic() {
  const { quizCode } = useParams();
  const [participantId, setParticipantId] = useState<string | undefined>(
    undefined
  );
  const [cookies, setCookie, removeCookie] = useCookies(['participantId']);
  const [questions, setQuestions] = useState<Slide[]>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { currentSlide, participantData, showAnswer, isTurn } = useGameStatus(
    quizCode as string,
    participantId as string
  );

  // Fetch quiz and participant data
  useEffect(() => {
    const initialize = async () => {
      if (!quizCode) return;

      try {
        // Check if the ongoingQuiz exists, if not send the player back to /play
        const quizExists = await ParticipantService.checkIfGameExists(quizCode);
        if (!quizExists) {
          navigate('/play');
          removeCookie('participantId');
          return;
        }

        // Check if a cookie exists
        if (cookies.participantId) {
          const participant = await ParticipantService.getParticipant(
            quizCode,
            cookies.participantId
          );
          // Check if the cookie corresponds to a participant in this ongoingQuiz
          if (participant) {
            setParticipantId(cookies.participantId);

            const slides = await ParticipantService.getQuizSlides(quizCode);
            setQuestions(slides);
          } else {
            // Cookie corresponds to participant in different quiz, remove it
            removeCookie('participantId');
            setParticipantId(undefined);
          }
        }
      } catch (error) {
        console.error('Error initializing quiz:', error);
      }
    };

    initialize();
  }, [quizCode, cookies, navigate, removeCookie]);

  const handleRemoveParticipant = async () => {
    if (!quizCode || !participantId) return;
    try {
      const success = await ParticipantService.removeParticipant(
        quizCode,
        participantId
      );
      if (success) {
        removeCookie('participantId');
        navigate('/play');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
    }
  };

  const handleAddParticipant = async (
    participantName: string,
    participantAvatar: string,
    participantCollection: string
  ) => {
    if (
      !quizCode ||
      !participantName ||
      !participantAvatar ||
      !participantCollection
    )
      return;
    try {
      const createdId = await ParticipantService.addParticipant(
        quizCode,
        participantName,
        participantAvatar,
        participantCollection
      );
      if (createdId) {
        setCookie('participantId', createdId);
        setParticipantId(createdId);
        const slides = await ParticipantService.getQuizSlides(quizCode);
        setQuestions(slides);
      }
    } catch (error) {
      console.error('Error adding participant:', error);
    }
  };

  const answerTempQuestion = async (tempAnswer: string) => {
    if (!quizCode || !participantId) return;
    try {
      await ParticipantService.addTempAnswer(
        quizCode,
        participantId,
        tempAnswer
      );
      console.log('in answerTempQuestion');
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const answerQuestion = async (answer: string[]) => {
    if (!quizCode || !participantId || !answer) return;
    try {
      await ParticipantService.addAnswer(
        quizCode,
        participantId,
        answer,
        currentSlide - 1
      );
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (!participantId || !participantData) {
    return <CreateParticipant handleAddParticipant={handleAddParticipant} />;
  }

  return (
    <div className="h-dvh flex flex-col w-full font-display">
      {/* Top: Leave functionality */}
      <div className="flex p-2 w-full bg-[#F4F3F2] text-[#333333]">
        <div className="flex-1 flex items-center justify-start">
          <Dialog>
            <DialogTrigger className="flex w-full items-center gap-2">
              <Button className="gap-1" variant="outline">
                <LogIn transform="rotate(180)" />
                {t('participants:leave')}
              </Button>
            </DialogTrigger>
            <DialogContent
              onClick={(e) => e.stopPropagation()}
              className="w-4/5 rounded-lg"
            >
              <DialogHeader>
                <DialogTitle>{t('participants:leaveTitle')}</DialogTitle>
                <DialogDescription>
                  {t('participants:leaveDescription')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <div className="flex justify-end gap-2 mt-4">
                  <DialogClose asChild>
                    <Button variant="outline">{t('general:cancel')}</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveParticipant();
                      }}
                    >
                      {t('participants:leave')}
                    </Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 flex items-center justify-center text-xl">
          <Zap className="w-6 h-6 mr-1 text-primary" />
          Zap!
        </div>

        <div className="flex-1 flex items-center justify-end text-xl">
          {currentSlide}/{questions?.length}
        </div>
      </div>

      {/* Middle: Quiz Question */}
      <div className="flex-grow flex flex-col w-full overflow-auto">
        <QuizView
          questions={questions}
          currentSlide={currentSlide}
          participantData={participantData}
          answerQuestion={answerQuestion}
          showAnswer={showAnswer}
          answerTempQuestion={answerTempQuestion}
          isTurn={isTurn}
        />
      </div>

      {/* Bottom: Team info */}
      {showAnswer ||
        (currentSlide === 0 && <TeamInfo participant={participantData} />)}
    </div>
  );
}
