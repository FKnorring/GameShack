import { useEffect, useRef, useState } from 'react';

import 'tw-elements'; // Import Tailwind Elements JS
import 'tailwindcss/tailwind.css'; // Tailwind CSS

import { LobbySlide, Participant } from '@/models/Quiz';
import { useAppContext } from '@/contexts/App/context';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Participants from './Participants';
import Title from './Title';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import TeamView from './TeamView';
import { useTranslation } from 'react-i18next';

interface Team {
  id: string;
  name: string;
  participants: Participant[];
  isEditing?: boolean;
}

export default function Render({
  onNextSlide,
  quizCode,
  participants,
}: {
  slide: LobbySlide;
  participants: Participant[];
  onNextSlide: () => void;
  quizCode: string;
}) {
  const participantsRef = useRef<HTMLDivElement>(null);
  const [teamsEnabled, setTeamsEnabled] = useState(false);
  const [numberOfTeams, setNumberOfTeams] = useState(2);
  const [teams, setTeams] = useState<Team[]>([]);
  const { t } = useTranslation();

  const {
    quizzes: { optimisticUpdate },
    ongoingQuizzes: {
      optimisticDelete,
      optimisticUpdate: updateOngoingQuiz,
      resources: ongoingQuizzes,
    },
  } = useAppContext();
  const navigate = useNavigate();
  const { id } = useParams();

  const ongoingQuiz = ongoingQuizzes.find((quiz) => quiz.id === id);

  useEffect(() => {
    if (participantsRef.current) {
      // Ensure scrolling happens after the DOM is updated
      setTimeout(() => {
        participantsRef.current!.scrollTop =
          participantsRef.current!.scrollHeight;
      }, 0);
    }
  }, []);

  useEffect(() => {
    const initialTeams: Team[] = [];
    // Get all currently assigned participants
    const allAssignedParticipants = teams
      .filter((team) => team.id !== 'unassigned')
      .flatMap((team) => team.participants);

    // Create new teams
    for (let i = 0; i < numberOfTeams; i++) {
      const existingTeam = teams.find((t) => t.id === `team-${i}`);
      if (existingTeam) {
        // Keep existing team
        initialTeams.push(existingTeam);
      } else {
        // Create new empty team
        initialTeams.push({
          id: `team-${i}`,
          name: `Team ${i + 1}`,
          participants: [],
          isEditing: false,
        });
      }
    }

    // Get participants that were in removed teams
    const participantsToReassign = allAssignedParticipants.filter(
      (participant) =>
        !initialTeams.some((team) =>
          team.participants.some(
            (p) => p.participantId === participant.participantId
          )
        )
    );

    // Find new participants that aren't in any team yet
    const existingUnassigned = teams.find((t) => t.id === 'unassigned');
    const allTeamParticipantIds = new Set([
      ...allAssignedParticipants.map((p) => p.participantId),
      ...(existingUnassigned?.participants.map((p) => p.participantId) || []),
    ]);

    const newParticipants = participants.filter(
      (p) => !allTeamParticipantIds.has(p.participantId)
    );

    // Add unassigned team with all unassigned participants
    initialTeams.push({
      id: 'unassigned',
      name: 'Unassigned',
      participants: [
        ...(existingUnassigned?.participants || []),
        ...participantsToReassign,
        ...newParticipants,
      ],
      isEditing: false,
    });

    setTeams(initialTeams);
  }, [numberOfTeams, participants]);

  const handleEndQuiz = async () => {
    if (!ongoingQuiz) return navigate('/');

    await Promise.all([
      optimisticDelete(ongoingQuiz.id),
      optimisticUpdate(ongoingQuiz.quiz.id, { isHosted: false }),
    ]);

    navigate('/');
  };

  const handleStartGame = async () => {
    if (!id) return;
    // Here you can process the teams data before starting the game
    const assignedTeams = teams.filter((team) => team.id !== 'unassigned');
    await updateOngoingQuiz(id, {
      teams: assignedTeams.reduce(
        (acc, team) => {
          acc[team.id] = {
            name: team.name,
            participants: team.participants.map((p) => p.participantId),
          };
          return acc;
        },
        {} as Record<string, { name: string; participants: string[] }>
      ),
    });
    onNextSlide();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between gap-4 p-10 overflow-y-auto">
      <Title title={ongoingQuiz?.quiz.quiz_name} quizCode={quizCode} />

      <div className="flex flex-col items-center gap-4 w-full max-w-6xl">
        {teamsEnabled ? (
          <TeamView
            numberOfTeams={numberOfTeams}
            participants={participants}
            teams={teams}
            setTeams={setTeams}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <span className="text-4xl font-display">
              {t('general:participants')}
            </span>
            <div
              ref={participantsRef}
              className="grid grid-cols-4 gap-4 bg-black/50 backdrop-blur-md rounded-lg min-h-40 overflow-y-auto w-full"
            >
              <Participants participants={participants} />
            </div>
          </div>
        )}
        <div className="flex flex-col items-center space-y-2 bg-black/30 p-4 rounded-lg">
          <Switch
            checked={teamsEnabled}
            onCheckedChange={setTeamsEnabled}
            id="team-mode"
          />
          <Label htmlFor="team-mode">{t('slides:enableTeams')}</Label>
          {teamsEnabled && (
            <div className="flex items-center space-x-2 ">
              <Label htmlFor="team-count">{t('slides:numTeams')}:</Label>
              <Input
                id="team-count"
                type="number"
                min={2}
                max={8}
                value={numberOfTeams}
                onChange={(e) => setNumberOfTeams(Number(e.target.value))}
                className="w-20 text-black"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <Button
          className="absolute left-5 top-5"
          variant="destructive"
          onClick={handleEndQuiz}
        >
          {t('slides:endQuiz')}
        </Button>
        <Button className="absolute right-5 bottom-5" onClick={handleStartGame}>
          {t('slides:startQuiz')}
        </Button>
      </div>
    </div>
  );
}
