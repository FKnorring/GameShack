import { QuestionType, Slide, SlideType } from "@/models/Quiz";
import { LucideIcon } from "lucide-react";
import * as Info from "./info";
import * as Score from "./score";
import * as Lobby from "./lobby";
import * as MCQSA from "./question/mcqsa";
import * as MCQMA from "./question/mcqma";
import * as FTA from "./question/fta";
import * as FA from "./question/fa";
import * as Rank from "./question/rank";
import * as Matching from "./question/matching";
import * as LocateIt from "./question/locateit";
import * as Bomb from "./question/bomb";

interface SlideInfo {
  value: string;
  icon: LucideIcon;
  label: string;
  slideType: SlideType;
  questionType?: QuestionType;
  defaults: Partial<Slide>;
  uneditable?: boolean;
  interactivePreview?: boolean;
}

export type { SlideInfo };

export { Info, Score, Lobby, MCQSA, MCQMA, FTA, Rank, FA, Matching,LocateIt, Bomb };
