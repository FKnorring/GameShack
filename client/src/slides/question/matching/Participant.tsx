import { useState, useEffect } from "react";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensors,
  useSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { MatchingSlide } from "@/models/Quiz";
import { DraggableItem, DroppableContainer } from "@/slides/_components/dnd";
import { getColor } from "../base/QuizColors";

interface MatchingViewProps {
  slide: MatchingSlide;
  answerQuestion: (answer: Record<string, string[]>) => void;
}

export function Participant({ slide, answerQuestion }: MatchingViewProps) {
  const [matches, setMatches] = useState<Record<string, string[]>>({});
  const [availableOptions, setAvailableOptions] = useState<string[]>([]);

  useEffect(() => {
    setAvailableOptions(shuffle([...slide.options]));
    // Initialize empty arrays for each label
    const initialMatches: Record<string, string[]> = {};
    slide.labels.forEach(label => {
      initialMatches[label.id] = [];
    });
    setMatches(initialMatches);
  }, [slide.options, slide.labels]);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const optionId = String(active.id);
    const targetId = String(over.id);

    // If dragging from available options to a label
    if (targetId.startsWith('label-')) {
      const labelId = targetId.replace('label-', '');
      
      // Remove from any existing label
      const newMatches = { ...matches };
      Object.keys(newMatches).forEach(key => {
        newMatches[key] = newMatches[key].filter(opt => opt !== optionId);
      });

      // Add to new label
      newMatches[labelId] = [...(newMatches[labelId] || []), optionId];
      setMatches(newMatches);
      
      // Remove from available options if it's coming from there
      if (availableOptions.includes(optionId)) {
        setAvailableOptions(prev => prev.filter(opt => opt !== optionId));
      }
    }
    // If dragging back to available options
    else if (targetId === 'available-options') {
      // Remove from any label
      const newMatches = { ...matches };
      Object.keys(newMatches).forEach(key => {
        newMatches[key] = newMatches[key].filter(opt => opt !== optionId);
      });
      setMatches(newMatches);
      
      // Add to available options if not already there
      if (!availableOptions.includes(optionId)) {
        setAvailableOptions(prev => [...prev, optionId]);
      }
    }
  };

  const handleSubmit = () => {
    answerQuestion(matches);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col items-center justify-center w-full p-2">
        <div className="w-full max-w-2xl space-y-4">
          <h2 className="text-4xl font-display text-center">{slide.title}</h2>
          <h3 className="text-2xl font-display text-center mb-8">{slide.content}</h3>

          <div className="space-y-4">
            {slide.labels.map((label, idx) => (
              <div 
                key={label.id}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: getColor(idx)
                }}
              >
                <DroppableContainer
                  key={label.id}
                  id={`label-${label.id}`}
                  label={label.text}
                  matchedOptions={matches[label.id] || []}
                />
              </div>
            ))}
          </div>

          <div 
            className="flex flex-wrap gap-2 mt-8 p-4 bg-secondary/50 rounded-lg min-h-[100px]"
            id="available-options"
          >
            {availableOptions.map((option) => (
              <DraggableItem
                key={option}
                id={option}
                text={option}
              />
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full mt-8 py-6 text-xl font-display"
            disabled={Object.values(matches).every(arr => arr.length === 0)}
          >
            Submit Answer
          </Button>
        </div>
      </div>
    </DndContext>
  );
}

function shuffle<T>(array: T[]): T[] {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
} 