import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";
import { ColorInput } from "./ColorInput";
import { ShowCorrectAnswerTypes } from "@/models/Quiz";
import { SimpleSelect } from "../ui/SimpleSelect";
import { Quiz, QuizSettings } from "@/models/Quiz";
import { quizDefaults } from "./utils/quiz-defaults";
import { BackgroundStyle } from "./QuizBackground";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";

interface QuizSettingsToolbarProps {
    quiz: Quiz;
    onUpdate: (updates: { 
        quizName?: string; 
        settings?: QuizSettings;
    }) => void;
}

export function QuizSettingsToolbar({ 
    quiz,
    onUpdate 
}: QuizSettingsToolbarProps) {
    const { quiz_name } = quiz
    const originalSettings = useMemo(() => ({
        ...quizDefaults,
        ...quiz.settings,
    }), [quiz.settings]);
    
    const handleColorChange = (colorKey: string, value: string) => {
        const hexRegex = /^#[0-9A-F]{6}$/i;
        if (hexRegex.test(value)) {
            onUpdate({ settings: { ...originalSettings, [colorKey]: value } });
        }
    };

    return (
        <div className="h-full bg-secondary/90 p-4 flex flex-col gap-4 overflow-y-auto text-black">
            <div className="space-y-2">
                <Label>Quiz Name</Label>
                <Input
                    value={quiz_name}
                    onChange={(e) => onUpdate({ quizName: e.target.value })}
                    className="text-xl font-bold"
                    placeholder="Quiz Name"
                />
            </div>

            <div className="space-y-4">
                <Label>Color Scheme</Label>
                
                <ColorInput
                    label="Background Color"
                    value={originalSettings.backgroundColor}
                    onChange={(value) => handleColorChange('backgroundColor', value)}
                    placeholder="#000B58"
                />

                <ColorInput
                    label="Primary Color"
                    value={originalSettings.primaryColor}
                    onChange={(value) => handleColorChange('primaryColor', value)}
                    placeholder="#498e77"
                />

                <ColorInput
                    label="Secondary Color"
                    value={originalSettings.secondaryColor}
                    onChange={(value) => handleColorChange('secondaryColor', value)}
                    placeholder="#006a67"
                />
            </div>

            <SimpleSelect
                label="Show Correct Answer (Default)"
                value={originalSettings.showCorrectAnswerDefault || "auto"}
                onValueChange={(value) => onUpdate({ 
                    settings: { 
                        ...originalSettings, 
                        showCorrectAnswerDefault: value as ShowCorrectAnswerTypes 
                    } 
                })}
                options={[
                    { value: "auto", label: "Auto" },
                    { value: "manual", label: "Manual" },
                    { value: "never", label: "Never" },
                ]}
            />

            <SimpleSelect
                label="Background Style (Default)"
                value={originalSettings.backgroundStyleDefault || "blobInverted"}
                onValueChange={(value) => onUpdate({ 
                    settings: { 
                        ...originalSettings, 
                        backgroundStyleDefault: value as BackgroundStyle 
                    } 
                })}
                options={[
                    { value: "waves", label: "Waves" },
                    { value: "blob", label: "Blob" },
                    { value: "blobInverted", label: "Blob Inverted" },
                    { value: "circle", label: "Circle" },
                    { value: "solid", label: "Solid" },
                ]}
            />

            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="mt-4">
                        Reset Settings
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Quiz Settings</DialogTitle>
                        <DialogDescription>
                            This will reset all quiz settings to their default values. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button 
                                variant="destructive"
                                onClick={() => onUpdate({ settings: quizDefaults })}
                            >
                                Reset Settings
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 