import { ToolbarProps } from '@/slides/toolbar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FTASlide } from '@/models/Quiz';
import { InfoIcon, SpellCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function AnswerText({ slide, onSlideUpdate }: ToolbarProps<FTASlide>) {
  // Ensure the slide is of type FTASlide
  const { t } = useTranslation(['quizEditor']);

  return (
    <div className="space-y-1">
      <div className="flex flex-row items-center space-x-1">
        <SpellCheck size={16} />
        <Label>{t('correctAnswer')}</Label>
      </div>

      <Input
        value={slide.correctAnswer}
        onChange={(e) => {
          const updatedSlide = {
            ...slide,
            correctAnswer: e.target.value, // Update the correctAnswer
          };
          onSlideUpdate(updatedSlide); // Trigger the slide update
        }}
        className={cn(slide.correctAnswer === '' && 'border-red-400 border-2')}
        placeholder={t('enterCorrectAnswer') + '...'}
      />
      {slide.correctAnswer === '' && (
        <div className="flex flex-row items-center space-x-1 ">
          <InfoIcon size={16} className="text-red-400" />
          <p className="text-red-400 text-sm">{t('noAnswer')}</p>
        </div>
      )}
    </div>
  );
}
