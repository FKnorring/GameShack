export * from './Preview';
export * from './Participant';
export * from './ParticipantAnswer';
export * from './Host';
export * from './HostAnswer';
export * from './CalculateScore';

import { QuestionTypes, SlideTypes, AnswerTypes } from '@/models/Quiz';
import { ListOrdered } from 'lucide-react';
import { SlideInfo } from '../..';

export const Info: SlideInfo = {
  value: 'question:RANK',
  icon: ListOrdered,
  label: 'Rank It Right',
  slideType: SlideTypes.question,
  questionType: QuestionTypes.RANK,
  defaults: {
    ranking: ['First', 'Second', 'Third', 'Last'],
    answerType: AnswerTypes.rank,
    points: 1000,
  },
} as const;
