import React, { useState } from 'react';
import { SaveIcon, StartIcon } from './icons';

interface WelcomeScreenProps {
    onStart: (name: string, ageYears: number, ageMonths: number) => void;
    onLoad: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onLoad }) => {
    const [name, setName] = useState('');
    const [ageYears, setAgeYears] = useState<string>('');
    const [ageMonths, setAgeMonths] = useState<string>('');
    const [error, setError] = useState('');

    const handleStartClick = () => {
        const years = parseInt(ageYears, 10);
        const months = parseInt(ageMonths, 10);

        if (!name.trim() || isNaN(years) || isNaN(months)) {
            setError('יש למלא את כל השדות בצורה תקינה כדי להתחיל.');
            return;
        }
        if (years < 0 || years > 18 || months < 0 || months > 11) {
            setError('הגיל שהוזן אינו תקין. יש להזין שנים (0-18) וחודשים (0-11).');
            return;
        }
        setError('');
        onStart(name, years, months);
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center animate-fade-in-up">
            <h1 className="text-4xl font-bold text-sky-700 mb-2">מערכת אבחון מ.ש.ה</h1>
            <p className="text-slate-600 mb-6 text-lg">כלי עזר להערכה התפתחותית</p>
            <div className="text-start max-w-2xl mx-auto bg-slate-100 p-4 rounded-lg mb-8">
                <p className="text-slate-700">
                    <strong>שימו לב:</strong> כלי זה הוא הדמיה ונועד למטרות סינון והתרשמות בלבד. הוא אינו מהווה תחליף לאבחון מקצועי על ידי איש מוסמך. את התוצאות יש לקחת בעירבון מוגבל. לקבלת אבחנה מדויקת, יש לפנות לגורם מקצועי בתחום התפתחות הילד.
                </p>
            </div>
            
            <div className="max-w-md mx-auto">
                <div className="mb-4">
                    <label htmlFor="childName" className="block text-slate-700 text-sm font-bold mb-2 text-start">שם הילד/ה</label>
                    <input
                        id="childName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="לדוגמה: דניאל"
                        className="bg-white shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
                    />
                </div>
                <div className="mb-6">
                     <label htmlFor="ageYears" className="block text-slate-700 text-sm font-bold mb-2 text-start">גיל הילד/ה</label>
                     <div className="flex gap-4">
                        <input
                            id="ageYears"
                            type="number"
                            value={ageYears}
                            onChange={(e) => setAgeYears(e.target.value)}
                            placeholder="שנים"
                            min="0"
                            max="18"
                            className="bg-white shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
                        />
                         <input
                            id="ageMonths"
                            type="number"
                            value={ageMonths}
                            onChange={(e) => setAgeMonths(e.target.value)}
                            placeholder="חודשים"
                            min="0"
                            max="11"
                            className="bg-white shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
                        />
                     </div>
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <div className="flex flex-col sm:flex-row gap-4">
                     <button
                        onClick={handleStartClick}
                        className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105 duration-300 flex items-center justify-center gap-2"
                    >
                        <StartIcon className="w-5 h-5" />
                        <span>התחל מבחן חדש</span>
                    </button>
                    <button
                        onClick={onLoad}
                        className="flex-1 bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105 duration-300 flex items-center justify-center gap-2"
                    >
                        <SaveIcon className="w-5 h-5"/>
                        <span>טען מבחן שמור</span>
                    </button>
                </div>
            </div>
        </div>
    );
};