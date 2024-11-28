import { Participant, MatchingSlide } from "@/models/Quiz";
import { BaseQuestionRender } from "../base/QuestionRender";
import { Button } from "@/components/ui/button";

function randomizeList<T>(list: T[]): T[] {
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }
  return shuffled;
}

export function Host({
  slide,
  participants,
  onNextSlide,
}: {
  slide: MatchingSlide;
  participants: Participant[];
  onNextSlide: () => void;
}) {
  const randomizedOptions = randomizeList(slide.options);
  
  return (
    <div>
      <BaseQuestionRender participants={participants} slide={slide}>
        <div className="flex flex-col space-y-4">
          {slide.labels.map((label) => (
            <div key={label.id} className="bg-secondary p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">{label.text}</h3>
              <div className="h-16 bg-background/50 rounded-lg border-2 border-dashed border-muted-foreground/50" />
            </div>
          ))}
          <div className="flex flex-wrap gap-2 mt-4">
            {randomizedOptions.map((option, index) => (
              <div
                key={index}
                className="bg-primary/10 p-3 rounded-lg"
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      </BaseQuestionRender>
      <Button
        onClick={onNextSlide}
        className="absolute bottom-5 right-5"
      >
        Next Slide
      </Button>
    </div>
  );
} 