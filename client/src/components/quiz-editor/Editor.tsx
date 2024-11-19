import type { Slide } from "@/models/Quiz";
import { SlideRender } from "./SlideRender";

interface EditorProps {
    slide: Slide | null;
    backgroundColor: string;
    primaryColor: string;
    secondaryColor: string;
}

export function Editor({ slide, backgroundColor, primaryColor, secondaryColor }: EditorProps) {
    if (!slide) {
        return (
            <div className="h-full flex items-center justify-center text-muted font-medium">
                Select a slide to edit or create a new one
            </div>
        );
    }

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg p-4">
                <div className="w-full max-w-4xl">
                    <SlideRender 
                        slide={slide} 
                        backgroundColor={backgroundColor}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                    />
                </div>
            </div>
        </div>
    );
} 