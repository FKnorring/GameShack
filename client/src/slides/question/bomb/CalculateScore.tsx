import { BombSlide } from '@/models/Quiz';
import { CalculateScoreProps } from '@/slides';

export function CalculateScore({
  slide,
  participants,
}: CalculateScoreProps<BombSlide>): number[] {
    console.log("inside calculate score for bomb")
  return participants.map(() => 2000);
}
