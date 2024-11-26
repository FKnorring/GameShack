import { ScoreSlide, Participant } from "@/models/Quiz";
import { SlideTitle } from "@/slides/_components/SlideTitle";
import ScoreBoard from "@/slides/_components/Scoreboard";

const mockParticipants: Participant[] = [
  {
    answers: [
      { slideNumber: 1, answer: ["Yes"], time: "2024-11-18T10:05:00Z" },
      { slideNumber: 2, answer: ["No"], time: "2024-11-18T10:10:00Z" },
    ],
    hasAnswered: true,
    avatar: "https://example.com/avatar1.png",
    name: "Alice Johnson",
    participantId: "P001",
    score: [8, 12],
  },
  {
    answers: [
      { slideNumber: 1, answer: ["Maybe"], time: "2024-11-18T10:06:00Z" },
      { slideNumber: 2, answer: ["Yes"], time: "2024-11-18T10:11:00Z" },
    ],
    hasAnswered: true,
    avatar: "https://example.com/avatar2.png",
    name: "Bob Smith",
    participantId: "P002",
    score: [10, 15],
  },
  {
    answers: [{ slideNumber: 1, answer: ["No"], time: "2024-11-18T10:07:00Z" }],
    hasAnswered: true,
    avatar: "https://example.com/avatar3.png",
    name: "Charlie Brown",
    participantId: "P003",
    score: [5],
  },
  {
    answers: [],
    hasAnswered: false,
    avatar: "https://example.com/avatar4.png",
    name: "Diana Prince",
    participantId: "P004",
    score: [],
  },
  {
    answers: [
      { slideNumber: 1, answer: ["Agree"], time: "2024-11-18T10:08:00Z" },
      { slideNumber: 3, answer: ["Disagree"], time: "2024-11-18T10:15:00Z" },
    ],
    hasAnswered: true,
    avatar: "https://example.com/avatar5.png",
    name: "Ethan Hunt",
    participantId: "P005",
    score: [9, 11],
  },
];

export function Preview({ slide }: { slide: ScoreSlide }) {
  return (
    <>
      <div className="space-y-12 w-full">
        <SlideTitle title={slide.title} />
        <ScoreBoard slide={slide} participants={mockParticipants} />
      </div>
    </>
  );
}
