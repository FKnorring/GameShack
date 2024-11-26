export * from './Preview';
export * from './Toolbar';
export * from './Participant';
export * from './ParticipantAnswer';
export * from './Host';
export * from './HostAnswer';

import { QuestionTypes, SlideTypes, AnswerTypes } from '@/models/Quiz';
import { CircleDotIcon } from "lucide-react";
import { SlideInfo } from '../..';
import { nanoid } from 'nanoid'

export const Info: SlideInfo = {
    value: "question:MCQSA",
    icon: CircleDotIcon,
    label: "Single Answer MCQ",
    slideType: SlideTypes.question,
    questionType: QuestionTypes.MCQSA,
    defaults: {
        options: Array.from({ length: 4 }, (_, i) => ({
            id: nanoid(),
            text: `Option ${i + 1}`,
            isCorrect: i === 0,
        })),
        answerType: AnswerTypes.singleString,
    }
} as const; 