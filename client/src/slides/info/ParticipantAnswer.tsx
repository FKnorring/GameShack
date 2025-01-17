import { InfoSlide } from "@/models/Quiz";
import { Render } from "./Render";

export function ParticipantAnswer({ slide }: { slide: InfoSlide }) {
  return <Render slide={slide} />;
}
