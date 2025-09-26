import React from 'react';
import { Question, Answer, AnswerOptions } from '../types';
import { ProgressBar } from './ProgressBar';
import { SaveIcon, ChevronLeftIcon, ChevronRightIcon, RestartIcon } from './icons';

interface TestScreenProps {
    questions: Question[];
    answers: Record<number, Answer>;
    setAnswers: React.Dispatch<React.SetStateAction<Record<number, Answer>>>;
    currentQuestionIndex: number;
    setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
    onFinishTest: () => void;
    onSave: () => void;
    onReset: () => void;
    childName: string;
}

export const TestScreen: React.FC<TestScreenProps> = ({
    questions,
    answers,
    setAnswers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    onFinishTest,
    onSave,
    onReset,
    childName,
}) => {
    const currentQuestion = questions[currentQuestionIndex];

    const handleAnswerSelect = (answer: Answer) => {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
        if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex + 1), 200);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 w-full animate-fade-in">
            <header className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                    <h1 className="text-2xl font-bold text-sky-800">מבחן התפתחות עבור {childName}</h1>
                    <p className="text-slate-500">שאלה {currentQuestionIndex + 1} מתוך {questions.length}</p>
                </div>
                <div className="flex items-center gap-2">
                     <button onClick={onReset} className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                        <RestartIcon className="w-5 h-5"/>
                        <span>התחל מחדש</span>
                    </button>
                    <button onClick={onSave} className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                        <SaveIcon className="w-5 h-5"/>
                        <span>שמור התקדמות</span>
                    </button>
                </div>
            </header>
            
            <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />

            <div className="my-8 text-center">
                <p className="text-sm font-semibold text-sky-600 bg-sky-100 rounded-full inline-block px-4 py-1 mb-4">{currentQuestion.domain}</p>
                <p className="text-2xl text-slate-800 font-medium leading-relaxed">{currentQuestion.text}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 my-8">
                {AnswerOptions.map(option => (
                    <button
                        key={option}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full sm:w-48 py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
                            ${answers[currentQuestion.id] === option 
                                ? 'bg-sky-600 text-white ring-2 ring-sky-600'
                                : 'bg-slate-100 hover:bg-sky-100 text-slate-700 ring-1 ring-slate-300'
                            }`}
                    >
                        {option}
                    </button>
                ))}
            </div>

            <footer className="flex justify-between items-center mt-10 pt-4 border-t">
                <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-600 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRightIcon className="w-5 h-5"/>
                    <span>הקודם</span>
                </button>

                {isLastQuestion ? (
                    <button
                        onClick={onFinishTest}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                    >
                        סיים וצפה בתוצאות
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={isLastQuestion}
                        className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>הבא</span>
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                )}
            </footer>
        </div>
    );
};