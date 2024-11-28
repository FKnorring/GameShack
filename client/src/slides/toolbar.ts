import { Slide, InfoSlide, MCQMASlide, MCQSASlide, RankSlide, QuestionSlide, FTASlide } from "@/models/Quiz";
import ImageInput from "./_toolbar/inputs/ImageInput";
import BackgroundInput from "./_toolbar/inputs/BackgroundInput";
import EmbedVideoInput from "./_toolbar/inputs/EmbedVideoInput";
import { MCQOptionsInput } from "./_toolbar/inputs/MCQOptionsInput";
import { RankOptionsInput } from "./_toolbar/inputs/RankOptionsInput";
import { QuestionSettingsInput } from "./_toolbar/inputs/QuestionSettingsInput";
import TitleInput from "./_toolbar/inputs/TitleInput";
import ContentInput from "./_toolbar/inputs/ContentInput";
import { AnswerText } from "./_toolbar/inputs/AnswerInput";
import { SelectPoints } from "./_toolbar/inputs/SelectPoints";

export interface ToolbarProps<T extends Slide> {
  slide: T;
  onSlideUpdate: (slide: T) => void;
}

type BaseToolbarItem<T extends Slide> = {
  label: string;
  component: React.ComponentType<ToolbarProps<T>>;
};

type ToolbarConfig<T extends Slide = Slide> = (BaseToolbarItem<T> & {
  field: keyof T;
})[];

const baseToolbarConfig: ToolbarConfig = [
  {
    field: "title",
    label: "Title",
    component: TitleInput,
  },
  {
    field: "content",
    label: "Content",
    component: ContentInput,
  },
  {
    field: "imageUrl",
    label: "Image",
    component: ImageInput,
  },
  {
    field: "backgroundStyle",
    label: "Background",
    component: BackgroundInput,
  },
];

const baseQuestionToolbarConfig: ToolbarConfig<QuestionSlide> = [
  {
    field: "showCorrectAnswer",
    label: "Question Settings",
    component: QuestionSettingsInput,
  },
  {
    field: "points",
    label: "Select Points",
    component: SelectPoints,
  }
];


export const toolbarConfigs = {
  info: [
    ...baseToolbarConfig,
    {
      field: "video" as keyof InfoSlide,
      label: "Video",
      component: EmbedVideoInput,
    },
  ],

  score: [
    ...baseToolbarConfig,
  ],

  lobby: [],

  MCQMA: [
    ...baseToolbarConfig,
    ...baseQuestionToolbarConfig,
    {
      field: "options" as keyof MCQMASlide,
      label: "Options",
      component: MCQOptionsInput,
    },
  ],

  MCQSA: [
    ...baseToolbarConfig,
    ...baseQuestionToolbarConfig,
    {
      field: "options" as keyof MCQSASlide,
      label: "Options",
      component: MCQOptionsInput,
    },
  ],

  RANK: [
    ...baseToolbarConfig,
    ...baseQuestionToolbarConfig,
    {
      field: "ranking" as keyof RankSlide,
      label: "Ranking",
      component: RankOptionsInput,
    },
    
  ],

  FTA: [
    ...baseToolbarConfig,
    ...baseQuestionToolbarConfig,
    {
      field: "correctAnswer" as keyof FTASlide,
      label: "Correct Answer",
      component: AnswerText,
    },
    
  ],
} as const; 