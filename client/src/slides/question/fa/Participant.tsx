import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FASlide } from "@/models/Quiz";

interface FastAnswerViewProps {
  slide: FASlide;
  answerQuestion: (answer: string[]) => void;
}

export function Participant({ slide, answerQuestion }: FastAnswerViewProps) {
  const [value, setValue] = useState("");
  return (
    <div className="flex flex-col items-center justify-center mt-60 bg-white p-8 space-y-5 m-4 rounded-md">
      <h1 className="text-3xl font-display text-center text-[#333333]">
        {slide.title}
      </h1>
      <Input
        placeholder="Enter Answer"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="font-display text-3xl text-[#333333] bg-[#F4F3F2]"
      />

      <Button onClick={() => answerQuestion([value])}>Submit Answer</Button>
    </div>
  );
}
