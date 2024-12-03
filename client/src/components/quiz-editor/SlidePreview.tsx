import type { Slide } from "@/models/Quiz";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { QuizBackground } from "./QuizBackground";
import { getSlideComponents } from "@/slides/utils";

interface SlidePreviewProps {
  slide: Slide & { titleWiggle?: boolean; contentWiggle?: boolean };
  className?: string;
  thumbnail?: boolean;
  backgroundColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  whichPreview?: string;
  onSlideUpdate?: (slide: Slide) => void;
}

const DESKTOP_WIDTH = 1920;
const DESKTOP_HEIGHT = 1080;

const PHONE_WIDTH = 375;
const PHONE_HEIGHT = 812;

export function SlidePreview({
  slide,
  className,
  backgroundColor = "#000B58",
  primaryColor = "#006a67",
  secondaryColor = "#fff4b7",
  whichPreview = "Preview",
  onSlideUpdate,
}: SlidePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const isPhoneView = whichPreview === "Participant";

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const newScale =
        containerWidth / (isPhoneView ? PHONE_WIDTH : DESKTOP_WIDTH);
      setScale(newScale);
    };

    updateScale();
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [isPhoneView]);

  const SlideComponent = getSlideComponents(slide);

  const Slide =
    whichPreview in SlideComponent
      ? (SlideComponent[
          whichPreview as keyof typeof SlideComponent
        ] as React.ElementType<{ slide: Slide }>)
      : null;

  const interactivePreview = SlideComponent.Info.interactivePreview || false;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden",
        isPhoneView ? "aspect-[9/16]" : "aspect-video",
        !interactivePreview && "pointer-events-none",
        className,
      )}
    >
      <QuizBackground
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        backgroundColor={backgroundColor}
        className="absolute inset-0"
        style={slide.backgroundStyle}
      />
      <div
        className="origin-top-left relative"
        style={{
          width: isPhoneView ? PHONE_WIDTH : DESKTOP_WIDTH,
          height: isPhoneView ? PHONE_HEIGHT : DESKTOP_HEIGHT,
          transform: `scale(${scale})`,
        }}
      >
        <div className="w-full h-full flex items-center justify-center p-16">
          {Slide && <Slide slide={slide} onSlideUpdate={onSlideUpdate} />}
        </div>
      </div>
    </div>
  );
}
