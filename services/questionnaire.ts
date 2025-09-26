
import { Question, Domain } from '../types';

export const QUESTIONS: Question[] = [
    // 0-6 months
    { id: 1, domain: Domain.GROSS_MOTOR, text: 'האם הילד מרים את ראשו וחזהו בשכיבה על הבטן?', ageRangeMonths: [1, 4] },
    { id: 2, domain: Domain.SOCIAL, text: 'האם הילד מחייך חיוך חברתי בתגובה לחיוך שלכם?', ageRangeMonths: [1, 3] },
    { id: 3, domain: Domain.FINE_MOTOR, text: 'האם הילד מביא ידיים אל פיו?', ageRangeMonths: [2, 4] },
    { id: 4, domain: Domain.LANGUAGE, text: 'האם הילד מפיק קולות גרגור והנאה ("אהה", "אוו")?', ageRangeMonths: [2, 5] },
    { id: 5, domain: Domain.GROSS_MOTOR, text: 'האם הילד מתהפך מהבטן לגב או מהגב לבטן?', ageRangeMonths: [4, 7] },

    // 7-12 months
    { id: 6, domain: Domain.GROSS_MOTOR, text: 'האם הילד יושב באופן יציב ללא תמיכה?', ageRangeMonths: [6, 8] },
    { id: 7, domain: Domain.FINE_MOTOR, text: 'האם הילד מעביר חפץ מיד ליד?', ageRangeMonths: [6, 9] },
    { id: 8, domain: Domain.COGNITIVE, text: 'האם הילד מחפש חפץ שהוחבא חלקית (למשל, מתחת לשמיכה)?', ageRangeMonths: [7, 10] },
    { id: 9, domain: Domain.LANGUAGE, text: 'האם הילד מפיק הברות כפולות (לדוגמה: "בה-בה", "מה-מה")?', ageRangeMonths: [7, 11] },
    { id: 10, domain: Domain.SOCIAL, text: 'האם הילד מגיב לשמו?', ageRangeMonths: [7, 10] },
    { id: 11, domain: Domain.GROSS_MOTOR, text: 'האם הילד זוחל (זחילת גחון או על שש)?', ageRangeMonths: [8, 11] },
    { id: 12, domain: Domain.FINE_MOTOR, text: 'האם הילד אוסף חפצים קטנים בעזרת אגודל ואצבע (אחיזת צבת)?', ageRangeMonths: [9, 12] },

    // 13-18 months
    { id: 13, domain: Domain.GROSS_MOTOR, text: 'האם הילד עומד לבד ועושה צעדים ראשונים?', ageRangeMonths: [11, 15] },
    { id: 14, domain: Domain.LANGUAGE, text: 'האם הילד אומר 1-3 מילים בעלות משמעות (מלבד "אמא", "אבא")?', ageRangeMonths: [12, 16] },
    { id: 15, domain: Domain.COGNITIVE, text: 'האם הילד מצביע על איברי גוף בסיסיים (עין, אף) כששואלים אותו?', ageRangeMonths: [15, 20] },
    { id: 16, domain: Domain.ADAPTIVE, text: 'האם הילד מנסה לאכול לבד עם כפית (גם אם מתלכלך)?', ageRangeMonths: [14, 18] },
    { id: 17, domain: Domain.FINE_MOTOR, text: 'האם הילד בונה מגדל של 2-3 קוביות?', ageRangeMonths: [15, 20] },

    // 19-24 months
    { id: 18, domain: Domain.GROSS_MOTOR, text: 'האם הילד הולך באופן יציב ומתחיל לרוץ?', ageRangeMonths: [18, 24] },
    { id: 19, domain: Domain.LANGUAGE, text: 'האם הילד מחבר 2 מילים יחד למשפט קצר (לדוגמה: "כדור גדול", "רוצה מים")?', ageRangeMonths: [20, 26] },
    { id: 20, domain: Domain.COGNITIVE, text: 'האם הילד ממיין חפצים לפי צבע או צורה?', ageRangeMonths: [22, 30] },
    { id: 21, domain: Domain.SOCIAL, text: 'האם הילד מחקה פעולות של מבוגרים או ילדים אחרים (משחק "כאילו")?', ageRangeMonths: [20, 26] },
    { id: 22, domain: Domain.ADAPTIVE, text: 'האם הילד עוזר להלביש את עצמו (למשל, מושיט יד לשרוול)?', ageRangeMonths: [22, 28] },

    // 25-36 months (2-3 years)
    { id: 23, domain: Domain.GROSS_MOTOR, text: 'האם הילד קופץ במקום על שתי רגליים?', ageRangeMonths: [24, 30] },
    { id: 24, domain: Domain.FINE_MOTOR, text: 'האם הילד משלים פאזל פשוט של 3-4 חלקים?', ageRangeMonths: [26, 34] },
    { id: 25, domain: Domain.LANGUAGE, text: 'האם הילד משתמש במשפטים של 3-4 מילים?', ageRangeMonths: [30, 38] },
    { id: 26, domain: Domain.COGNITIVE, text: 'האם הילד מבין מושגים כמו "גדול" ו"קטן"?', ageRangeMonths: [28, 36] },
    { id: 27, domain: Domain.SOCIAL, text: 'האם הילד מגלה עניין במשחק לצד ילדים אחרים (משחק מקביל)?', ageRangeMonths: [26, 34] },
    { id: 28, domain: Domain.ADAPTIVE, text: 'האם הילד מראה סימני מוכנות לגמילה מחיתולים?', ageRangeMonths: [24, 36] },

    // 37-48 months (3-4 years)
    { id: 29, domain: Domain.GROSS_MOTOR, text: 'האם הילד רוכב על תלת אופן?', ageRangeMonths: [34, 42] },
    { id: 30, domain: Domain.FINE_MOTOR, text: 'האם הילד מצייר עיגול ומנסה להעתיק צלב?', ageRangeMonths: [36, 46] },
    { id: 31, domain: Domain.LANGUAGE, text: 'האם הילד שואל שאלות "למה?" ו-"איך?"?', ageRangeMonths: [36, 48] },
    { id: 32, domain: Domain.COGNITIVE, text: 'האם הילד מכיר כמה צבעים בשמותיהם?', ageRangeMonths: [34, 44] },
    { id: 33, domain: Domain.SOCIAL, text: 'האם הילד מתחיל לשתף פעולה עם ילדים אחרים במשחק קצר?', ageRangeMonths: [38, 48] },
    { id: 34, domain: Domain.ADAPTIVE, text: 'האם הילד מתלבש ומתפשט כמעט לבד (למעט כפתורים ושרוכים)?', ageRangeMonths: [40, 50] },

    // 49-60 months (4-5 years)
    { id: 35, domain: Domain.GROSS_MOTOR, text: 'האם הילד עומד על רגל אחת למשך מספר שניות?', ageRangeMonths: [48, 58] },
    { id: 36, domain: Domain.FINE_MOTOR, text: 'האם הילד גוזר עם מספריים לאורך קו?', ageRangeMonths: [46, 56] },
    { id: 37, domain: Domain.LANGUAGE, text: 'האם הילד מספר סיפור פשוט עם התחלה, אמצע וסוף?', ageRangeMonths: [50, 60] },
    { id: 38, domain: Domain.COGNITIVE, text: 'האם הילד סופר עד 10 ומזהה מספר ספרות?', ageRangeMonths: [52, 62] },
    { id: 39, domain: Domain.SOCIAL, text: 'האם הילד משחק במשחקי "דמיון" מורכבים עם חברים?', ageRangeMonths: [50, 60] },
    { id: 40, domain: Domain.ADAPTIVE, text: 'האם הילד הולך לשירותים באופן עצמאי לחלוטין?', ageRangeMonths: [48, 60] },
];
