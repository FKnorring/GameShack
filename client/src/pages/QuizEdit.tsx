import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { quizAPI } from '@/api/quizzes';
import type Quiz from '@/models/Quiz';
import { SlideSidebar } from '@/components/quiz-editor/SlideSidebar';
import type { Slide, SlideType, QuestionType } from '@/types/quiz';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Editor } from '@/components/quiz-editor/Editor';
import { Toolbar } from '@/components/quiz-editor/Toolbar';
import { QuizBackground } from '@/components/quiz-editor/QuizBackground';
import { QuizSettingsToolbar } from '@/components/quiz-editor/QuizSettingsToolbar';

function QuizEdit() {
    const { id } = useParams();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [slides, setSlides] = useState<Slide[]>([]);
    const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        async function fetchQuiz() {
            if (!id) return;

            const { data, error } = await quizAPI.getById(id);
            if (error) {
                setError(error.message);
                return;
            }
            setQuiz(data);
        }

        fetchQuiz();
    }, [id]);

    const handleAddSlide = (type: SlideType, questionType?: QuestionType) => {
        const baseSlide = {
            id: crypto.randomUUID(),
            title: `New ${type} slide`,
            content: '',
            backgroundStyle: 'waves' as const,
        };

        let newSlide: Slide;

        switch (type) {
            case 'info':
                newSlide = {
                    ...baseSlide,
                    type: 'info',
                };
                break;
            case 'score':
                newSlide = {
                    ...baseSlide,
                    type: 'score',
                    mockScores: [
                        { playerName: 'Player 1', score: 100 },
                        { playerName: 'Player 2', score: 80 },
                    ],
                };
                break;
            case 'question':
                if (!questionType) throw new Error('Question type is required');

                switch (questionType) {
                    case 'MCQSA':
                        newSlide = {
                            ...baseSlide,
                            type: 'question',
                            questionType: 'MCQSA',
                            options: Array.from({ length: 4 }, (_, i) => ({
                                id: crypto.randomUUID(),
                                text: `Option ${i + 1}`,
                                isCorrect: i === 0,
                            })),
                        };
                        break;
                    case 'MCQMA':
                        newSlide = {
                            ...baseSlide,
                            type: 'question',
                            questionType: 'MCQMA',
                            options: Array.from({ length: 4 }, (_, i) => ({
                                id: crypto.randomUUID(),
                                text: `Option ${i + 1}`,
                                isCorrect: i <= 1,
                            })),
                        };
                        break;
                    case 'FA':
                        newSlide = {
                            ...baseSlide,
                            type: 'question',
                            questionType: 'FA',
                            correctAnswer: '',
                        };
                        break;
                    default:
                        throw new Error('Invalid question type');
                }
                break;
            default:
                throw new Error('Invalid slide type');
        }

        setSlides(prev => [...prev, newSlide]);
        setActiveSlideId(newSlide.id);
    };

    const handleSlideUpdate = (updatedSlide: Slide) => {
        setSlides(prev => prev.map(slide =>
            slide.id === updatedSlide.id ? updatedSlide : slide
        ));
    };

    const handleSlideDelete = (slideId: string) => {
        setSlides(prev => prev.filter(slide => slide.id !== slideId));
        if (activeSlideId === slideId) {
            setActiveSlideId(slides.find(s => s.id !== slideId)?.id ?? null);
        }
    };

    const handleSlideDuplicate = (slideId: string) => {
        const currentIndex = slides.findIndex(slide => slide.id === slideId);
        const slideToClone = slides[currentIndex];
        if (!slideToClone) return;

        const newSlide = {
            ...slideToClone,
            id: crypto.randomUUID(),
            title: `${slideToClone.title} (Copy)`,
            backgroundStyle: slideToClone.backgroundStyle || 'waves',
        };

        const newSlides = [...slides];
        newSlides.splice(currentIndex + 1, 0, newSlide);
        setSlides(newSlides);
        setActiveSlideId(newSlide.id);
    };

    const handleSlideMove = (slideId: string, direction: 'up' | 'down') => {
        const currentIndex = slides.findIndex(slide => slide.id === slideId);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= slides.length) return;

        const newSlides = [...slides];
        [newSlides[currentIndex], newSlides[newIndex]] = [newSlides[newIndex], newSlides[currentIndex]];
        setSlides(newSlides);
    };

    const handleQuizUpdate = (updates: {
        quizName?: string;
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
    }) => {
        if (!quiz) return;

        const updatedQuiz = {
            ...quiz,
            quiz_name: updates.quizName ?? quiz.quiz_name,
            primary_color: updates.primaryColor ?? quiz.primary_color,
            secondary_color: updates.secondaryColor ?? quiz.secondary_color,
            background_color: updates.backgroundColor ?? quiz.background_color,
        };

        setQuiz(updatedQuiz);
        // TODO: Save quiz updates to backend
    };

    const activeSlide = slides.find(slide => slide.id === activeSlideId) ?? null;

    if (error) return <div>Error: {error}</div>;
    if (!quiz) return <div>Loading...</div>;

    return (
        <div className="flex-1 flex overflow-hidden">
            <QuizBackground
                primaryColor={quiz.primary_color}
                secondaryColor={quiz.secondary_color}
                backgroundColor={quiz.background_color}
                className="absolute inset-0 -z-10"
            />
            <ResizablePanelGroup direction="horizontal" style={{ height: "inherit" }}>
                <ResizablePanel defaultSize={14} minSize={12} maxSize={20}>
                    <SlideSidebar
                        quizName={quiz.quiz_name}
                        slides={slides}
                        onAddSlide={handleAddSlide}
                        activeSlideId={activeSlideId}
                        onSlideSelect={(slideId) => { 
                            setActiveSlideId(slideId); 
                            setShowSettings(false) 
                        }}
                        onSlideDelete={handleSlideDelete}
                        onSlideDuplicate={handleSlideDuplicate}
                        onSlideMove={handleSlideMove}
                        onSettingsClick={() => setShowSettings(true)}
                        backgroundColor={quiz.background_color}
                        primaryColor={quiz.primary_color}
                        secondaryColor={quiz.secondary_color}
                    />
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={60}>
                    <Editor
                        slide={activeSlide}
                        backgroundColor={quiz.background_color}
                        primaryColor={quiz.primary_color}
                        secondaryColor={quiz.secondary_color}
                    />
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={20} minSize={15}>
                    {showSettings ? (
                        <QuizSettingsToolbar
                            quizName={quiz.quiz_name}
                            primaryColor={quiz.primary_color}
                            secondaryColor={quiz.secondary_color}
                            backgroundColor={quiz.background_color}
                            onUpdate={handleQuizUpdate}
                        />
                    ) : activeSlide ? (
                        <Toolbar
                            slide={activeSlide}
                            onSlideUpdate={handleSlideUpdate}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground bg-secondary/90">
                            Select a slide
                        </div>
                    )}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
export default QuizEdit;
