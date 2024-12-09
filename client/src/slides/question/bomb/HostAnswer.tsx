import { BombSlide, Participant } from "@/models/Quiz";
import { Button } from "@/components/ui/button";
import { getColor } from "../base/QuizColors";

export function HostAnswer({
  slide,
  participants = [],
  onNextSlide,
}: {
  slide: BombSlide;
  participants: Participant[];
  onNextSlide: () => void;
}) {
  

  return (
    <div className="flex flex-col items-center h-full p-10 w-full">
      <Button
        onClick={() => {
          onNextSlide();
        }}
        className="absolute bottom-5 right-5"
      >
        Next Slide
      </Button>
    </div>
  );
}
