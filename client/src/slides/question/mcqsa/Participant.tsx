import { MCQSASlide } from '@/models/Quiz';
import { getColor } from '../base/QuizColors';
import { Button } from '@/components/ui/button';

interface Options {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface McqsaViewProps {
  slide: MCQSASlide;
  answerQuestion: (answer: string[]) => void;
}

export function Participant({ slide, answerQuestion }: McqsaViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-10">
      <h1 className="text-5xl font-display font-bold text-center mb-8">
        {slide.title}
      </h1>
      <div className="grid grid-cols-2 gap-6 w-full max-w-3xl">
        {slide.options.map((option: Options, index: number) => (
          <Button
            key={option.id}
            onClick={() => answerQuestion([option.text])}
            isInteractive
            inGrid
            style={{
              backgroundColor: getColor(index),
              cursor: 'pointer',
            }}
            className="flex items-center justify-center text-2xl text-white font-display h-24 rounded-lg hover:ring-4 hover:ring-white"
          >
            {option.text}
          </Button>
        ))}
      </div>
    </div>
  );
}
