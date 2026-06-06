# מגדנות בטעם של עוד — אתר אינטרנט

אתר תדמית והזמנות לקונדיטוריה "בטעם של עוד" בנתיבות. נבנה עם React + Vite + Tailwind + Supabase (אימות, מסד נתונים והרשאות).

## הרצה מקומית

1. התקנת תלויות: `npm install`
2. העתיקו את `.env.example` ל-`.env` ומלאו את פרטי הפרויקט ב-Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. הרצה: `npm run dev`

## פריסה (Cloudflare Pages)

- Build command: `npm run build`
- Build output directory: `dist`
- משתני סביבה: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- חברו את הדומיין שלכם תחת Custom domains בפרויקט ה-Pages

## ניהול

משתמש עם `is_admin = true` בטבלת `profiles` ב-Supabase מקבל גישה לעמוד הניהול (`/admin`) — הוספה/עריכה/מחיקה של מוצרים (כולל תמונות מקישור או מהמחשב), וצפייה וניהול סטטוס הזמנות.

כדי להפוך משתמש קיים למנהל, הריצו ב-SQL editor של Supabase:
```sql
update profiles set is_admin = true where id = '<USER_UUID>';
```
