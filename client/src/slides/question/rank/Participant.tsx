import { useState, useEffect } from 'react';
import {
  useDraggable,
  useDroppable,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensors,
  useSensor,
  DragEndEvent,
} from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { RankSlide } from '@/models/Quiz';
import { rankColors } from '../base/QuizColors';
import { getSlideComponents } from '@/slides/utils';
import { cn } from '@/lib/utils';

interface RankViewProps {
  slide: RankSlide;
  answerQuestion: (answer: string[]) => void;
}

// Draggable item component
function DraggableItem({ text, index }: { text: string; index: number }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `draggable-${index}`, // Unique ID for each item
  });

  const style = transform
    ? {
        transform: `translate3d(0, ${transform.y}px, 0)`,
        zIndex: 1000,
      }
    : {};

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex items-center w-full p-2.5 rounded-lg shadow-md bg-[#F4F3F2] text-xl font-display cursor-grab text-black"
      style={style}
    >
      {text}
    </div>
  );
}

// Droppable container component
function DroppableContainer({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${index}`, // Unique ID for each droppable area
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'p-0.5 rounded-xl w-full border-primary/80 border-dashed border-2',
        isOver && 'bg-primary/50 border-primary'
      )}
    >
      {children}
    </div>
  );
}

export function Participant({ slide, answerQuestion }: RankViewProps) {
  const [currentRanking, setCurrentRanking] = useState<string[]>([]);

  useEffect(() => {
    // Randomize the ranking on the first render
    const shuffleArray = (array: string[]): string[] =>
      array
        .map((item) => ({ sort: Math.random(), value: item }))
        .sort((a, b) => a.sort - b.sort)
        .map((item) => item.value);

    setCurrentRanking(shuffleArray([...slide.ranking]));
  }, [slide.ranking]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      console.log('Item dropped outside of droppable areas.');
      return;
    }

    // Convert UniqueIdentifier to string and parse index
    const activeIndex = parseInt(String(active.id).split('-')[1], 10);
    const overIndex = parseInt(String(over.id).split('-')[1], 10);

    if (activeIndex !== overIndex) {
      const updatedRanking = [...currentRanking];
      const [movedItem] = updatedRanking.splice(activeIndex, 1); // Remove the dragged item
      updatedRanking.splice(overIndex, 0, movedItem); // Insert at the new position
      setCurrentRanking(updatedRanking);
    }
  };

  const handleAnswerQuestion = () => {
    answerQuestion(currentRanking); // Submit the current ranking as string[]
  };

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const SlideComponent = getSlideComponents(slide);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col items-center justify-center w-full p-4">
        <div className="flex flex-col items-center w-full max-w-md space-y-4">
          <div className="bg-white items-center rounded text-wrap p-3 max-w-4/5 flex flex-row space-x-1">
            <SlideComponent.Info.icon className="w-8 h-8 text-black" />
            <h1 className="text-3xl text-black font-display">{slide.title}</h1>
          </div>
          <div className="flex flex-col w-full space-y-3 pb-5">
            {currentRanking.map((text, index) => (
              <div
                key={index}
                className="rounded-lg flex items-center w-full space-x-4"
              >
                {/* Display the index with proper alignment */}
                <h2
                  style={{
                    backgroundColor: rankColors(),
                  }}
                  className="font-display text-2xl font-bold text-center p-2.5 rounded-lg text-[#F4F3F2] w-14"
                >
                  {index + 1}
                </h2>
                <DroppableContainer index={index}>
                  <DraggableItem text={text} index={index} />
                </DroppableContainer>
              </div>
            ))}
          </div>

          <Button
            onClick={handleAnswerQuestion}
            isInteractive
            className="w-full h-12 text-xl font-display text-white"
          >
            Submit Answer
          </Button>
        </div>
      </div>
    </DndContext>
  );
}
