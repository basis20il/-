import React, { useState, useCallback } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TestScreen } from './components/TestScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { UserInfo, Answer, TestState, AppState } from './types';
import { QUESTIONS } from './services/questionnaire';

const App: React.FC = () => {
    const [testState, setTestState] = useState<TestState>(TestState.NOT_STARTED);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [answers, setAnswers] = useState<Record<number, Answer>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

    const handleStartTest = (name: string, ageYears: number, ageMonths: number) => {
        const ageInMonths = ageYears * 12 + ageMonths;
        setUserInfo({ name, ageYears, ageMonths, ageInMonths });
        setTestState(TestState.IN_PROGRESS);
        setAnswers({});
        setCurrentQuestionIndex(0);
    };
    
    const handleReset = () => {
        if (window.confirm("האם אתה בטוח שברצונך להתחיל מחדש? כל ההתקדמות תמחק.")) {
            setTestState(TestState.NOT_STARTED);
            setUserInfo(null);
            setAnswers({});
            setCurrentQuestionIndex(0);
            localStorage.removeItem('mshTestData');
        }
    };

    const handleBackToTest = () => {
        setTestState(TestState.IN_PROGRESS);
    };

    const handleSaveState = useCallback(() => {
        if (!userInfo) return;
        const stateToSave: AppState = {
            userInfo,
            answers,
            currentQuestionIndex,
            testState: TestState.IN_PROGRESS,
        };
        localStorage.setItem('mshTestData', JSON.stringify(stateToSave));
        alert('ההתקדמות נשמרה בהצלחה!');
    }, [userInfo, answers, currentQuestionIndex]);

    const handleLoadState = useCallback(() => {
        const savedStateJSON = localStorage.getItem('mshTestData');
        if (savedStateJSON) {
            try {
                const savedState: AppState = JSON.parse(savedStateJSON);
                setUserInfo(savedState.userInfo);
                setAnswers(savedState.answers);
                setCurrentQuestionIndex(savedState.currentQuestionIndex);
                setTestState(TestState.IN_PROGRESS);
            } catch (error) {
                console.error("Failed to parse saved state:", error);
                alert("לא ניתן היה לטעון את השמירה. קובץ השמירה פגום.");
                localStorage.removeItem('mshTestData');
            }
        } else {
            alert('לא נמצא מבחן שמור.');
        }
    }, []);

    const renderContent = () => {
        switch (testState) {
            case TestState.IN_PROGRESS:
                if (userInfo) {
                    return (
                        <TestScreen
                            questions={QUESTIONS}
                            answers={answers}
                            setAnswers={setAnswers}
                            currentQuestionIndex={currentQuestionIndex}
                            setCurrentQuestionIndex={setCurrentQuestionIndex}
                            onFinishTest={() => setTestState(TestState.COMPLETED)}
                            onSave={handleSaveState}
                            onReset={handleReset}
                            childName={userInfo.name}
                        />
                    );
                }
                return null; // Should not happen
            case TestState.COMPLETED:
                 if (userInfo) {
                    return <ResultsScreen 
                                answers={answers} 
                                userInfo={userInfo} 
                                onReset={handleReset}
                                onBackToTest={handleBackToTest}
                            />;
                }
                return null;
            case TestState.NOT_STARTED:
            default:
                return <WelcomeScreen onStart={handleStartTest} onLoad={handleLoadState} />;
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col items-center justify-center p-4 font-sans">
            <div className="fixed top-4 left-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md border z-50">
                <p className="font-bold text-sky-800 text-sm">מגדנות אבחונים</p>
                <p className="text-slate-600 text-xs">077-2269702</p>
            </div>
            <div className="w-full max-w-4xl mx-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default App;