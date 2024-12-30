import React from 'react';
import { JeopardySlide } from '@/models/Quiz';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Minus, Grid, HelpCircle, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  slide: JeopardySlide;
  onSlideUpdate: (slide: JeopardySlide) => void;
}

export const JeopardyInput: React.FC<Props> = ({ slide, onSlideUpdate }) => {
  const { t } = useTranslation('jeopardy');

  const addCategory = () => {
    if (slide.categories.length >= 6) return;

    const newCategory = {
      id: nanoid(),
      name: t('newCategory'),
      questions: Array(5).fill(null).map(() => ({
        id: nanoid(),
        question: "",
        answer: "",
      })),
    };

    onSlideUpdate({
      ...slide,
      categories: [...slide.categories, newCategory],
    });
  };

  const removeCategory = (categoryId: string) => {
    onSlideUpdate({
      ...slide,
      categories: slide.categories.filter((cat) => cat.id !== categoryId),
    });
  };

  const updateCategory = (categoryId: string, field: string, value: string) => {
    onSlideUpdate({
      ...slide,
      categories: slide.categories.map((cat) =>
        cat.id === categoryId ? { ...cat, [field]: value } : cat
      ),
    });
  };

  const updateQuestion = (categoryId: string, questionId: string, field: string, value: string) => {
    onSlideUpdate({
      ...slide,
      categories: slide.categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              questions: cat.questions.map((q) =>
                q.id === questionId ? { ...q, [field]: value } : q
              ),
            }
          : cat
      ),
    });
  };

  const calculateQuestionValue = (index: number) => {
    const step = (slide.maxScore - slide.minScore) / 4;
    return Math.round(slide.minScore + (index * step));
  };

  return (
    <div key={slide.id} className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>{t('categories')} ({slide.categories.length}/6)</Label>
        <Button
          onClick={addCategory}
          disabled={slide.categories.length >= 6}
          size="sm"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-1" />
          {t('addCategory')}
        </Button>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {slide.categories.map((category) => (
          <AccordionItem key={category.id} value={category.id}>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Input
                  value={category.name}
                  onChange={(e) =>
                    updateCategory(category.id, "name", e.target.value)
                  }
                  placeholder={t('categoryName')}
                  className="flex-1"
                />
                <Button
                  onClick={() => removeCategory(category.id)}
                  size="sm"
                  variant="destructive"
                  disabled={slide.categories.length <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>

              <AccordionTrigger className="hover:no-underline">
                <span className="text-sm font-medium flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  {t('questions')}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 mt-4">
                  {category.questions.map((question, index) => (
                    <div key={question.id} className="space-y-2 p-4 bg-secondary/10 rounded-lg">
                      <Label className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        {t('question')} ${calculateQuestionValue(index)}
                      </Label>
                      <Input
                        value={question.question}
                        onChange={(e) =>
                          updateQuestion(
                            category.id,
                            question.id,
                            "question",
                            e.target.value
                          )
                        }
                        placeholder={t('question')}
                      />
                      <Input
                        value={question.answer}
                        onChange={(e) =>
                          updateQuestion(
                            category.id,
                            question.id,
                            "answer",
                            e.target.value
                          )
                        }
                        placeholder={t('answer')}
                      />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default JeopardyInput; 