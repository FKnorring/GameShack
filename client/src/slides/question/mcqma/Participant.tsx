import { useState } from 'react';
import { MCQMASlide } from '@/models/Quiz';
import { getColor } from '@/slides/question/base/QuizColors';
import { Button } from '@/components/ui/button';

interface Options {
  id: string;
  text: string;
  isCorrect: boolean;
}
interface McqmaViewProps {
  slide: MCQMASlide;
  answerQuestion: (answer: string[]) => void;
}

export function Participant({ slide, answerQuestion }: McqmaViewProps) {
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  const toggleOption = (index: number) => {
    setSelectedIndexes(
      (prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index) // Remove if already selected
          : [...prev, index] // Add if not selected
    );
  };

  const handleSubmit = () => {
    const selectedAnswers = selectedIndexes.map(
      (index) => slide.options[index].text
    );
    answerQuestion(selectedAnswers);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-10 select-none">
      <h1 className="text-5xl font-display font-bold text-center mb-8 ">
        {slide.title}
      </h1>
      <div className="grid grid-cols-2 gap-6 w-full overflow-visible">
        {slide.options.map((option: Options, index: number) => (
          <Button
            key={option.id}
            isInteractive
            inGrid
            onClick={() => toggleOption(index)}
            style={{
              backgroundColor: getColor(index),
            }}
            className={`flex items-center justify-center text-2xl text-white font-display h-24 rounded-lg ${
              selectedIndexes.includes(index) ? 'ring-4 ring-white' : ''
            }`}
          >
            {option.text}
          </Button>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={selectedIndexes.length === 0}
        className="mt-8 py-4 px-6 text-2xl font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50"
      >
        Submit Answer
      </button>
    </div>
  );
}
