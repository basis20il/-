import React, { useMemo } from 'react';
import { UserInfo, Answer, Domain, Question } from '../types';
import { QUESTIONS } from '../services/questionnaire';
import { DownloadIcon, ArrowUturnLeftIcon } from './icons';

declare const html2canvas: any;
declare const jspdf: any;

interface ResultsScreenProps {
    answers: Record<number, Answer>;
    userInfo: UserInfo;
    onReset: () => void;
    onBackToTest: () => void;
}

const getScoreForAnswer = (answer: Answer | undefined): number => {
    switch (answer) {
        case Answer.ALWAYS: return 2;
        case Answer.SOMETIMES: return 1;
        case Answer.NEVER: return 0;
        default: return 0;
    }
};

const getInterpretation = (score: number): { text: string; color: string } => {
    const percentage = Math.round(score * 100);
    if (percentage >= 80) {
        return { text: 'התפתחות תקינה ומצופה לגיל.', color: 'text-green-700' };
    }
    if (percentage >= 50) {
        return { text: 'נראים אתגרים מסוימים בתחום זה. מומלץ לעקוב ולעודד תרגול.', color: 'text-yellow-700' };
    }
    return { text: 'הביצועים בתחום זה נמוכים מהמצופה. מומלץ לשקול התייעצות עם איש מקצוע.', color: 'text-red-700' };
};

const DomainResultBar: React.FC<{ domain: string, score: number, interpretation: { text: string; color: string } }> = ({ domain, score, interpretation }) => {
    const percentage = Math.round(score * 100);
    let bgColor = 'bg-green-500';
    if (percentage < 70) bgColor = 'bg-yellow-500';
    if (percentage < 40) bgColor = 'bg-red-500';

    return (
        <div className="mb-6 p-4 border rounded-lg bg-slate-50">
            <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700 text-lg">{domain}</span>
                <span className="text-sm font-bold text-slate-600">{percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4 mb-2">
                <div
                    className={`${bgColor} h-4 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <p className={`text-sm ${interpretation.color}`}>{interpretation.text}</p>
        </div>
    );
};

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ answers, userInfo, onReset, onBackToTest }) => {
    const resultsByDomain = useMemo(() => {
        const scores: Record<Domain, { score: number; maxScore: number }> = {
            [Domain.GROSS_MOTOR]: { score: 0, maxScore: 0 },
            [Domain.FINE_MOTOR]: { score: 0, maxScore: 0 },
            [Domain.COGNITIVE]: { score: 0, maxScore: 0 },
            [Domain.LANGUAGE]: { score: 0, maxScore: 0 },
            [Domain.SOCIAL]: { score: 0, maxScore: 0 },
            [Domain.ADAPTIVE]: { score: 0, maxScore: 0 },
        };

        QUESTIONS.forEach((q: Question) => {
            if (userInfo.ageInMonths >= q.ageRangeMonths[0] && userInfo.ageInMonths <= q.ageRangeMonths[1] + 6) {
                scores[q.domain].score += getScoreForAnswer(answers[q.id]);
                scores[q.domain].maxScore += 2;
            }
        });

        return Object.entries(scores)
            .map(([domain, data]) => ({
                domain: domain as Domain,
                score: data.maxScore > 0 ? data.score / data.maxScore : 0,
            }))
            .filter(result => (scores[result.domain].maxScore > 0));

    }, [answers, userInfo.ageInMonths]);

    const handleDownloadPdf = () => {
        const { jsPDF } = jspdf;
        const input = document.getElementById('results-to-download');
        if (input) {
            html2canvas(input, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`msh-results-${userInfo.name.replace(' ', '-')}.pdf`);
            });
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 w-full animate-fade-in-up">
            <div id="results-to-download" className="p-4">
                <header className="text-center mb-8 pb-4 border-b">
                     <div className="mb-4">
                        <p className="font-bold text-sky-800 text-lg">מגדנות אבחונים</p>
                        <p className="text-slate-600 text-sm">077-2269702</p>
                    </div>
                    <h1 className="text-3xl font-bold text-sky-800">סיכום תוצאות עבור {userInfo.name}</h1>
                    <p className="text-slate-500 mt-1">גיל בעת המבחן: {userInfo.ageYears} שנים ו-{userInfo.ageMonths} חודשים</p>
                </header>
                
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">ביצועים לפי תחומי התפתחות:</h2>
                    {resultsByDomain.length > 0 ? resultsByDomain.map(result => {
                         const interpretation = getInterpretation(result.score);
                         return <DomainResultBar key={result.domain} domain={result.domain} score={result.score} interpretation={interpretation} />
                    }) : <p className="text-slate-600 text-center">לא נמצאו שאלות רלוונטיות לגיל שהוזן.</p>}
                </div>

                <div className="text-start bg-slate-100 p-4 rounded-lg mb-8">
                    <h3 className="font-bold text-slate-800 mb-2">הבהרה חשובה</h3>
                    <p className="text-slate-700 text-sm">
                        התוצאות המוצגות הן הערכה כללית בלבד ואינן מהוות אבחנה רפואית או התפתחותית. הניתוח מבוסס על השאלות הרלוונטיות לגילו של הילד. פערים בתחומים מסוימים עשויים להצביע על צורך בבדיקה מעמיקה יותר, אך הם גם יכולים לנבוע ממגוון סיבות אחרות. לקבלת ייעוץ מקצועי ואבחנה מדויקת, יש לפנות לרופא ילדים, נוירולוג ילדים, או מכון להתפתחות הילד.
                    </p>
                </div>
            </div>

            <footer className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 pt-4 border-t">
                 <button
                    onClick={onBackToTest}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 duration-300"
                >
                    <ArrowUturnLeftIcon className="w-5 h-5"/>
                    <span>חזור למבחן</span>
                </button>
                <button
                    onClick={handleDownloadPdf}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 duration-300"
                >
                    <DownloadIcon className="w-5 h-5"/>
                    <span>הורד תוצאות (PDF)</span>
                </button>
                <button
                    onClick={onReset}
                    className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 duration-300"
                >
                    התחל מבחן חדש
                </button>
            </footer>
        </div>
    );
};