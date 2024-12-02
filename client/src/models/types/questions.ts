import { SlideTypes, BaseSlide } from "./slides";
import type { ShowCorrectAnswerTypes } from "./quiz";

export enum QuestionTypes {
  MCQSA = "MCQSA",
  MCQMA = "MCQMA",
  FTA = "FTA",
  FA = "FA",
  RANK = "RANK",
  MATCHING = "MATCHING",
  BOMB = "BOMB"
}

export type QuestionType = QuestionTypes;

export enum AnswerTypes {
  singleString = "singleString",
  multipleStrings = "multipleStrings",
  freeText = "freeText",
  rank = "rank",
  time = "time",
  matching = "matching",
  bomb = "bomb"
}

export type answerType = AnswerTypes;

interface QuestionSlideBase extends BaseSlide {
  type: SlideTypes.question;
  questionType: QuestionType;
  timeLimit: number;
  answerType: answerType;
  points: number;
  showCorrectAnswer: ShowCorrectAnswerTypes;
}

export interface RankSlide extends QuestionSlideBase {
  ranking: string[];
  questionType: QuestionTypes.RANK;
  answerType: AnswerTypes.rank;
}

export interface MCQSASlide extends QuestionSlideBase {
  questionType: QuestionTypes.MCQSA;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  answerType: AnswerTypes.singleString;
}

export interface MCQMASlide extends QuestionSlideBase {
  questionType: QuestionTypes.MCQMA;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  answerType: AnswerTypes.multipleStrings;
}

export interface FTASlide extends QuestionSlideBase {
  questionType: QuestionTypes.FTA;
  answerType: AnswerTypes.freeText;
  correctAnswer: string;
}

export interface FASlide extends QuestionSlideBase {
  questionType: QuestionTypes.FA;
  answerType: AnswerTypes.time;
}

export interface MatchingSlide extends QuestionSlideBase {
  questionType: QuestionTypes.MATCHING;
  answerType: AnswerTypes.matching;
  labels: Array<{
    id: string;
    text: string;
    correctOptions: string[];
  }>;
  options: string[];
}

export interface BombSlide extends QuestionSlideBase {
  questionType: QuestionTypes.BOMB,
  answerType: AnswerTypes.bomb,
  initialTime: number,
  hearts: number,
  labels: Array<{
    id: string[];
    answers: string[];
    usedAnswers: string[]
  }>;
  
}

export type QuestionSlide =
  | MCQSASlide
  | MCQMASlide
  | FTASlide
  | FASlide
  | RankSlide
  | MatchingSlide
  | BombSlide
