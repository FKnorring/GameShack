import { BombSlide } from '@/models/Quiz';
import { ToolbarProps } from '@/slides/toolbar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { max_options } from '@/config/max';
import { useTranslation } from 'react-i18next';
import { HeartIcon, Timer } from 'lucide-react';

export function BombOptionsInput({
  slide,
  onSlideUpdate,
}: ToolbarProps<BombSlide>) {
  const [newAnswer, setNewAnswer] = useState<string>('');

  const updateSlide = (updates: Partial<BombSlide>) => {
    onSlideUpdate({
      ...slide,
      ...updates,
    });
  };
  const { t } = useTranslation(['questions']);

  const addAnswers = (input: string) => {
    const newAnswers = input
      .split(',')
      .map((answer) => answer.trim())
      .filter((answer) => answer !== '');

    if (newAnswers.length === 0) return;

    // Ensure slide.answers is an array before adding new answers
    updateSlide({
      answers: Array.from(new Set([...(slide.answers || []), ...newAnswers])),
    });
  };

  const removeAnswer = (answerToRemove: string) => {
    updateSlide({
      answers: slide.answers.filter((answer) => answer !== answerToRemove),
    });
  };

  return (
    <div className="space-y-6">
      {/* Hearts and Initial Time */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1">
          <Timer size={17} />
          <Label>{t('initialTime')}</Label>
        </div>

        <Input
          type="number"
          value={slide.initialTime}
          onChange={(e) => updateSlide({ initialTime: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-1">
          <HeartIcon fill="#FF4545" color="#FF4545" />
          <Label>{t('lives')}</Label>
        </div>
        <Input
          type="number"
          value={slide.hearts}
          max={max_options.bomb.lives}
          onChange={(e) => updateSlide({ hearts: Number(e.target.value) })}
        />
      </div>

      {/* Answers Section */}
      <div className="space-y-2">
        <Label>{t('availableAnswers')}</Label>
        {/* Conditionally render the answers section if there are answers */}
        {slide.answers &&
        Array.isArray(slide.answers) &&
        slide.answers.length > 0 ? (
          slide.answers.map((answer, index) => (
            <div key={index} className="flex items-center space-x-2">
              <h2>{index + 1}</h2>
              <Input
                value={answer}
                onChange={(e) => {
                  const updatedAnswer = e.target.value.trim().toUpperCase();
                  if (!updatedAnswer) return;

                  updateSlide({
                    answers: slide.answers.map((a, i) =>
                      i === index ? updatedAnswer : a
                    ),
                  });
                }}
                placeholder="Answer"
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeAnswer(answer)}
              >
                {t('del')}
              </Button>
            </div>
          ))
        ) : (
          <p>{t('noAnswer')}</p> // Optional message if there are no answers
        )}

        <div className="flex space-x-2 m-4">
          <Input
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder={t('ans1ans2')}
          />
        </div>
        <div className='justify-center flex'>
          <Button
            onClick={() => {
              if (newAnswer.trim() !== '') {
                addAnswers(newAnswer.toUpperCase());
                setNewAnswer('');
              }
            }}
          >
            {t('addAnswer')}
          </Button>
        </div>
      </div>
    </div>
  );
}
