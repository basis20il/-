export enum Domain {
    GROSS_MOTOR = 'מוטוריקה גסה',
    FINE_MOTOR = 'מוטוריקה עדינה',
    COGNITIVE = 'קוגניציה וחשיבה',
    LANGUAGE = 'שפה ותקשורת',
    SOCIAL = 'כישורים חברתיים ורגשיים',
    ADAPTIVE = 'תפקוד יום-יומי ועצמאות'
}

export interface Question {
    id: number;
    domain: Domain;
    text: string;
    ageRangeMonths: [number, number]; // [min, max]
}

export enum Answer {
    ALWAYS = 'תמיד',
    SOMETIMES = 'לפעמים',
    NEVER = 'אף פעם'
}

export const AnswerOptions: Answer[] = [Answer.ALWAYS, Answer.SOMETIMES, Answer.NEVER];

export interface UserInfo {
    name: string;
    ageYears: number;
    ageMonths: number;
    ageInMonths: number;
}

export enum TestState {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
}

export interface AppState {
    userInfo: UserInfo;
    answers: Record<number, Answer>;
    currentQuestionIndex: number;
    testState: TestState;
}