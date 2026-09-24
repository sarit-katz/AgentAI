# בסיס ידע AI — חפיפה וויטרינת יכולות

אתר סטטי בעברית (RTL) שמתעד את הידע שנצבר בתפקיד Chief of AI, ובמקביל מדגים את
היכולות שהוא מתאר. 13 עמודים, 9 רכיבי הדגמה אינטראקטיביים, אפס תלויות.

## הרצה

```bash
# פשוט לפתוח את הקובץ. אין התקנה ואין server.
start index.html
```

האתר נבנה במיוחד כדי לעבוד בפתיחה ישירה מהדיסק (`file://`) — בלי npm, בלי build,
בלי חיבור לאינטרנט (הפונטים מגוגל, ויש להם fallback מלא).

אם רוצים בכל זאת server מקומי:

```bash
npx --yes serve .   # דורש אינטרנט. לא נדרש לשום דבר באתר
```

## מבנה

```
index.html                 שער: מסלול שלוש הרמות, מפת נושאים, מדד התקדמות
01-claude-md.html          רמה 1 · תכנון, קונטקסט נקי ואימות
02-context-economy.html    רמה 1 · כלכלת קונטקסט + מחשבון חי
03-agent-architecture.html רמה 2 · multi-agent, chief-of-staff, דיאל אוטונומיה
04-runtimes.html           רמה 2 · Hermes Agent, nanoclaw
05-toolbox.html            רמה 2 · 40 תוספות + ספריות מומלצות
06-artemis.html            רמה 2 · ARTEMIS, אייג'נטים על מובייל
07-company-brain.html      רמה 3 · מוח ארגוני: rings, MANIFEST, validators
08-memory-graphs.html      רמה 3 · Cognee ו-Graphiti
09-ontology.html           רמה 3 · Microsoft Fabric Ontology
capabilities.html          רוחבי · מה הוכח בפועל, מה בהערכה, מה רק נקרא
glossary.html              רוחבי · מילון מונחים
sources.html               רוחבי · מקורות, כולל הקישורים שחסרים

assets/
  styles.css        מערכת העיצוב כולה: טוקנים + כל הקומפוננטות
  app.js            ערכת נושא, ניווט, העתקה, אקורדיון, TOC, checklist, חיפוש
  demos.js          תשעת רכיבי ההדגמה. כל אחד יוצא מיד אם ה-host שלו לא בעמוד
  site-data.js      window.SITE — נקודת ההרחבה של האתר
  search-index.js   נוצר אוטומטית. לא לערוך ביד

tools/build-index.mjs   מרענן את search-index.js מה-HTML
DESIGN-RULES.md         חוקי עריכה: עיצוב, RTL, יושרת תוכן
```

## איך מוסיפים נושא חדש

1. להעתיק עמוד נושא קיים כתבנית. `08-memory-graphs.html` הוא הנקי ביותר.
2. לשמור על מבנה הסעיפים: `why` → `terms` → `how` → הדגמה → `do` → `traps` →
   `decide` → `faq` → `sources` → בלוק `מידע חסר`.
   **כל `<h2>` חייב `id`** — ה-TOC ואינדקס החיפוש נבנים ממנו.
3. להוסיף **רשומה אחת** למערך `topics` ב-`assets/site-data.js`:

   ```js
   {
     id: 'my-topic', file: '10-my-topic.html', level: 'l2', num: '10',
     title: 'הכותרת',
     answer: 'התשובה בשלוש שורות, לפני כל הסבר.',
     read: '9 דקות', needs: 'claude-md',      // needs = id של נושא קודם, או null
     tags: ['term', 'term']
   }
   ```

4. להוסיף את העמוד לניווט ב-`<header>` ולרשימת ה-footer, אם הוא נושא מרכזי.
5. להריץ `node tools/build-index.mjs`.

## אינדקס החיפוש

```bash
node tools/build-index.mjs           # מרענן את assets/search-index.js
node tools/build-index.mjs --check   # בדיקה בלבד; יוצא 1 אם האינדקס מיושן
```

הסקריפט קורא רק את מה שבתוך `<main>` בכל עמוד, ומייצר רשומה ל-`<h1>` ולכל
`<h2 id>`. מונחי המילון, פריטי הרדאר וארגז הכלים **אינם** באינדקס הזה — `app.js`
מוסיף אותם בזמן ריצה מ-`window.SITE`, כדי שלא יהיו שני מקורות אמת לאותה רשומה.

## נקודות שכדאי לדעת לפני עריכה

- **אסור `fetch()`.** Chrome חוסם קריאת קבצים מקומיים, וכל האתר בנוי סביב זה.
  דאטה חדשה נטענת כ-`<script>` שמגדיר משתנה גלובלי.
- **אסור ערך גלם ב-CSS.** כל צבע וריווח הוא טוקן בראש `styles.css`.
- **RTL עם תכונות לוגיות בלבד** — כולל רדיוסים. היוצא מן הכלל היחיד הוא גרדיאנטים,
  שאין להם תמיכה בכיוון לוגי; שם כותבים `270deg` עם הערה.
- **קישור שלא אומת נשאר `url: ''`.** הוא יופיע לבד בעמוד המקורות תחת "קישורים
  להשלמה". אין להשלים כתובות מהזיכרון.

הפירוט המלא — כולל המלכודות שנשרפנו בהן וחוקי יושרת התוכן — נמצא ב-
[DESIGN-RULES.md](DESIGN-RULES.md). כדאי לקרוא אותו לפני עריכה ראשונה.

## מצב

עודכן 22.09.2026. מה שהוכח ומה שלא — מתועד במלואו ב-
[capabilities.html](capabilities.html). הפערים הפתוחים מרוכזים ב-
[sources.html](sources.html) ובבלוקי `מידע חסר` בתחתית כל עמוד נושא.
"# AgentAI" 
"# AgentAI" 
