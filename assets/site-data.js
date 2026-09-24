/* ============================================================
   site-data.js - נקודת ההרחבה של האתר.
   נטען כ-<script> רגיל (ולא ב-fetch) כדי שהאתר יעבוד גם ב-file://
   נושא חדש = עמוד HTML מהתבנית + רשומה אחת ב-SITE.topics.
   שדה url ריק = קישור שצריך להשלים. אין כאן כתובות מנוחשות.
   ============================================================ */
window.SITE = {
  updated: '2026-09-22',

  levels: [
    {
      id: 'l1', num: '01', title: 'יסודות',
      sub: 'לעבוד נכון עם אייג\'נט קודינג',
      desc: 'שתי היכולות שכל השאר נשען עליהן: לנהל את הקונטקסט של האייג\'נט, ולנהל את מה שאת מבקשת ממנו. מי שמדלג לכאן מקבל פלט בינוני ומשלם עליו יותר.',
      time: '~25 דקות קריאה'
    },
    {
      id: 'l2', num: '02', title: 'בונים מערכות',
      sub: 'מאייג\'נט בודד למערכת אייג\'נטים',
      desc: 'מכאן זה הופך לארכיטקטורה: כמה אייג\'נטים מתמחים במקביל, אחד שמאחד, וגבול ברור בין מה שרץ לבד לבין מה שמחכה לאישור שלך.',
      time: '~35 דקות קריאה'
    },
    {
      id: 'l3', num: '03', title: 'רמה ארגונית',
      sub: 'ידע משותף לבני אדם ולאייג\'נטים',
      desc: 'כשאותן עובדות נדרשות בארבעה repos, שני אייג\'נטים ועובד חדש, הבעיה משנה צורה: היא הופכת להנדסת קונטקסט בקנה מידה ארגוני.',
      time: '~30 דקות קריאה'
    }
  ],

  topics: [
    {
      id: 'claude-md', file: '01-claude-md.html', level: 'l1', num: '01',
      title: 'תכנון, קונטקסט נקי ואימות',
      answer: 'הכוח עבר מהביצוע לתכנון ולאימות. קובץ הוראות קצר, מצב תכנון לכל משימה מורכבת, סאב-אייג\'נטים שמחזיקים את הקונטקסט הראשי נקי, ובודק נפרד שלא ראה את השיחה.',
      read: '11 דקות', needs: null,
      tags: ['CLAUDE.md', 'plan mode', 'subagents', 'verification']
    },
    {
      id: 'context-economy', file: '02-context-economy.html', level: 'l1', num: '02',
      title: 'כלכלת קונטקסט: איך החיוב עובד ומה מוזיל אותו',
      answer: 'שום דבר לא נשמר בצד השרת בין turns. כל turn שולח מחדש את כל השיחה, ולכן turn 40 משלם על קריאה חוזרת של 39 שלפניו. ההודעה שלך היא הדבר הקטן שם.',
      read: '13 דקות', needs: 'claude-md',
      tags: ['tokens', 'cache', 'context rot', '/clear']
    },
    {
      id: 'agent-architecture', file: '03-agent-architecture.html', level: 'l2', num: '03',
      title: 'ארכיטקטורת multi-agent: בניית chief-of-staff',
      answer: 'לא אייג\'נט אחד שעושה הכל, אלא סאב-אייג\'נט לכל מקור עם תפקיד צר אחד, שרצים במקביל, ואייג\'נט אחד שמאחד את הפלט לתדריך אחד מתועדף. האוטונומיה היא דיאל, לא מפסק.',
      read: '14 דקות', needs: 'claude-md',
      tags: ['multi-agent', 'synthesizer', 'MCP', 'cron']
    },
    {
      id: 'runtimes', file: '04-runtimes.html', level: 'l2', num: '04',
      title: 'Agent runtimes: Hermes Agent ו-nanoclaw',
      answer: 'Runtime הוא מה שמריץ את האייג\'נט בפועל: זיכרון, MCP, סאב-אייג\'נטים, דפדפן והתנהגות multi-agent במקום אחד. במקום להרכיב את כל אלה לבד, בוחרים runtime - וזו החלטה ארכיטקטונית שקשה להחליף אחר כך.',
      read: '10 דקות', needs: 'agent-architecture',
      tags: ['runtime', 'Hermes Agent', 'nanoclaw', 'multi-agent']
    },
    {
      id: 'toolbox', file: '05-toolbox.html', level: 'l2', num: '05',
      title: 'ארגז הכלים: 40 תוספות ל-Claude Code',
      answer: 'חמש קטגוריות: workflows, skills, שמירת קונטקסט, חיבור כלים, ופרומפטים ושימוש. הכלל היחיד שחוזר: אחד בכל פעם, על משימה אמיתית, לפני שמוסיפים את הבא.',
      read: '9 דקות', needs: 'claude-md',
      tags: ['skills', 'MCP', 'plugins', 'memory']
    },
    {
      id: 'artemis', file: '06-artemis.html', level: 'l2', num: '06',
      title: 'ARTEMIS: אייג\'נטים עם ידיים על מובייל',
      answer: 'Google פתחה בקוד פתוח כלי שמאפשר לאייג\'נט להפעיל טלפון אמיתי כמו אדם: רואה מסך, מזהה אלמנטים, מקיש, גולל, מאמת תוצאה ומדווח. מתחבר לאייג\'נט שלך דרך MCP.',
      read: '8 דקות', needs: 'agent-architecture',
      tags: ['ARTEMIS', 'MCP', 'QA', 'Android']
    },
    {
      id: 'company-brain', file: '07-company-brain.html', level: 'l3', num: '07',
      title: 'Company Brain: מוח ארגוני עם חוזה טעינה',
      answer: 'CLAUDE.md פותר קונטקסט לפרויקט אחד. מוח ארגוני הוא מקור ידע אחד, מנוהל בגרסאות, עם חוזה שמכריז מה נכנס לקונטקסט ומתי, ו-validators שהופכים כללי כתיבה לבדיקה שרצה.',
      read: '16 דקות', needs: 'context-economy',
      tags: ['rings', 'MANIFEST.yaml', 'validators', 'RAG']
    },
    {
      id: 'memory-graphs', file: '08-memory-graphs.html', level: 'l3', num: '08',
      title: 'זיכרון ארגוני וגרפי ידע: Cognee, Graphiti ו-Graphify',
      answer: 'מוח ארגוני בקבצים נותן דטרמיניזם. גרף ידע נותן קשרים ותנועה בזמן. Cognee בונה זיכרון וגרף ומחבר דרך MCP; Graphiti מוסיף את ציר הזמן - מה היה נכון מתי; Graphify עושה את אותו דבר על הקוד והמסמכים, בפרסינג AST מקומי. שלושתם משלימים את ה-brain, לא מחליפים אותו.',
      read: '13 דקות', needs: 'company-brain',
      tags: ['Cognee', 'Graphiti', 'Graphify', 'knowledge graph', 'MCP']
    },
    {
      id: 'ontology', file: '09-ontology.html', level: 'l3', num: '09',
      title: 'Fabric Ontology: הארגון כגרף שאייג\'נט מבין',
      answer: 'רכיב ב-Microsoft Fabric שממפה ישויות וקשרים בעסק - מי מדבר עם מי, מי אחראי על מה, איך מתקבלות החלטות. לא רק מה יש בטבלאות, אלא איך המידע קשור.',
      read: '7 דקות', needs: 'company-brain',
      tags: ['Fabric', 'Ontology', 'IQ layer', 'Rayfin']
    }
  ],

  /* פרויקטים שנכנסו למעקב אחרי רשימת ה-40. status: 'assessing' = נבחן, טרם הופעל. */
  radar: [
    {
      name: 'Cognee', page: '08-memory-graphs.html', status: 'assessing',
      what: 'מנוע זיכרון בקוד פתוח שבונה גרף ידע מהדאטה שלך ומגיש אותו לאייג\'נט דרך MCP.',
      why: 'זו הגרסה הגרפית של אותה בעיה שה-Company Brain פותר בקבצים: להביא לאייג\'נט את הידע הארגוני, ולא רק את הקוד.'
    },
    {
      name: 'Graphiti', page: '08-memory-graphs.html', status: 'assessing',
      what: 'Temporal Knowledge Graph לאייג\'נטים - גרף שמחזיק גם את ציר הזמן: מה היה נכון, מתי, ומה השתנה.',
      why: 'חזק במיוחד לזיכרון ארגוני, כי עובדות בארגון לא נכונות לנצח - הן נכונות עד שמשהו השתנה.'
    },
    {
      name: 'Graphify', page: '08-memory-graphs.html', status: 'assessing',
      what: 'Skill שהופך codebase שלם - כולל docs, סכמות SQL, קונפיגים ו-PDF - לגרף ידע שאפשר לתחקר, בפרסינג AST מקומי ובלי vector store.',
      why: 'זו השכבה שעונה על «מה יש בקוד ובמסמכים שלנו ואיך זה מחובר». פרויקט נפרד מ-Graphiti, למרות דמיון השם.'
    },
    {
      name: 'Hermes Agent', page: '04-runtimes.html', status: 'assessing',
      what: 'Agent runtime עם זיכרון, MCP, סאב-אייג\'נטים, דפדפן והתנהגות multi-agent.',
      why: 'מומנטום חזק כרגע, ומרכז ברכיב אחד את מה שאנחנו מרכיבים ידנית מכמה חלקים.'
    },
    {
      name: 'nanoclaw', page: '04-runtimes.html', status: 'unverified',
      what: 'נכנס למעקב, טרם נבדק לעומק.',
      why: 'צריך בדיקה: מה ה-runtime הזה עושה, מה הרישיון, ומה הבגרות שלו.'
    }
  ],

  /* checklist לפי רמה - נשמר ב-localStorage */
  checklists: {
    l1: [
      'הגדרתי CLAUDE.md עם הוראות בלבד, בלי workflows',
      'נכנסתי ל-plan mode בכל משימה של שלושה צעדים ומעלה',
      'העברתי מחקר ובדיקות לסאב-אייג\'נט נפרד',
      'הרצתי /context בשיחה טרייה כדי לראות מה נטען בכלל',
      'הגדרתי compact instructions - מה לשמור כשמצמצמים',
      'קבעתי model ו-effort בתחילת השיחה ולא באמצע'
    ],
    l2: [
      'ציירתי את חלוקת הסאב-אייג\'נטים לפני שכתבתי שורת קוד',
      'כתבתי constitution.md עם תפקיד, עדיפויות ומה להתעלם ממנו',
      'חיברתי לפחות שני מקורות אמיתיים דרך MCP',
      'קראתי את הטיוטה הראשונה לפני שמשהו יצא לדרך',
      'הגדרתי מה רץ לבד ומה מחכה לאישור - קטגוריה בכל פעם',
      'תזמנתי הרצה אוטומטית רק אחרי שההרצות הידניות הוכיחו את עצמן'
    ],
    l3: [
      'CORE.md קצר, ולכל שורה חדשה בו הוצאתי שורה אחרת',
      'כל קובץ עובדות נושא verified_on ו-review_every',
      'MANIFEST.yaml מכריז ring ו-load_when לכל קובץ',
      'מה שחסוי מסומן confidential ו-never_in',
      'validators רצים בקומיט, ו-freshness רץ בתזמון ולא בכל push',
      'עברתי את מבחן השיחה הטרייה: פלט שמיש בניסיון הראשון'
    ]
  },

  /* 40 התוספות. השמות והתיאורים כפי שהגיעו. url ריק = להשלים. */
  toolCategories: [
    {
      id: 'workflow', title: 'בניית workflow', mono: 'BUILD A WORKFLOW',
      note: 'מסגרות עבודה שלמות: תכנון, בנייה, בדיקה, וקואורדינציה בין אייג\'נטים.',
      items: [
        { n: 1, name: 'learn-claude-code', what: 'להבין איך אייג\'נטים עובדים', url: '' },
        { n: 2, name: 'karpathy-skills', what: 'לצמצם טעויות קוד נפוצות', url: '' },
        { n: 3, name: 'superpowers', what: 'לתכנן, לבנות ולבדוק', url: '' },
        { n: 4, name: 'ponytail', what: 'לשמור על הקוד פשוט', url: '' },
        { n: 5, name: 'gstack', what: 'להוסיף workflows של תכנון וביקורת', url: '' },
        { n: 6, name: 'ECC', what: 'להוסיף skills, memory ובדיקות', url: '' },
        { n: 7, name: 'oh-my-claudecode', what: 'לתאם צוותי אייג\'נטים', url: '' },
        { n: 8, name: 'Archon', what: 'לבנות workflows חוזרים לקידוד', url: '' }
      ]
    },
    {
      id: 'skills', title: 'הוספת skills', mono: 'ADD SKILLS',
      note: 'ספריות skills ואייג\'נטים מתמחים - כולל הרשמיות של Anthropic.',
      items: [
        { n: 9, name: 'taste-skill', what: 'לשפר את העיצוב', url: '' },
        { n: 10, name: 'anthropics skills', what: 'לעיין ב-skills הרשמיים', url: '' },
        { n: 11, name: 'mattpocock skills', what: 'להוסיף skills הנדסיים', url: '' },
        { n: 12, name: 'wshobson agents', what: 'למצוא אייג\'נטים מתמחים', url: '' },
        { n: 13, name: 'claude-plugins', what: 'לעיין בפלאגינים הרשמיים', url: '' },
        { n: 14, name: 'addyosmani skills', what: 'להוסיף בדיקות הנדסיות', url: '' },
        { n: 15, name: 'ui-ux-pro-max', what: 'הנחיות עיצוב ממשק', url: '' },
        { n: 16, name: 'awesome-claude-skills', what: 'למצוא skills נוספים', url: '' }
      ]
    },
    {
      id: 'context', title: 'שמירת קונטקסט', mono: 'KEEP THE CONTEXT',
      note: 'זיכרון, מיפוי קוד, והעברת הקשר בין sessions - הקטגוריה שמשפיעה ישירות על עלות ואיכות.',
      items: [
        { n: 17, name: 'planning-with-files', what: 'לשמור תכניות בקבצים', url: '' },
        { n: 18, name: 'claude-mem', what: 'להעביר קונטקסט בין sessions', url: '' },
        { n: 19, name: 'codegraph', what: 'למפות את הקשרים בקוד', url: '' },
        { n: 20, name: 'graphify', what: 'לחבר קוד ומסמכים', url: 'https://github.com/Graphify-Labs/graphify' },
        { n: 21, name: 'repomix', what: 'לארוז repo לקובץ אחד', url: '' },
        { n: 22, name: 'agentmemory', what: 'זיכרון מתמשך לאייג\'נטים', url: '' },
        { n: 23, name: 'beads', what: 'לעקוב אחרי עבודה בין sessions', url: '' }
      ]
    },
    {
      id: 'tools', title: 'חיבור כלים', mono: 'CONNECT TOOLS',
      note: 'MCP servers וחיבורים למערכות אמיתיות. כאן נמצא הגשר בין האייג\'נט לעבודה שלך.',
      items: [
        { n: 24, name: 'multica', what: 'להקצות issues לאייג\'נטים', url: '' },
        { n: 25, name: 'firecrawl', what: 'להפוך אתרים לטקסט שמיש', url: '' },
        { n: 26, name: 'cc-switch', what: 'לנהל את הגדרות כלי הקידוד', url: '' },
        { n: 27, name: 'context7', what: 'לשלוף תיעוד קוד עדכני', url: '' },
        { n: 28, name: 'vibe-kanban', what: 'לנהל משימות אייג\'נטים על לוח', url: '' },
        { n: 29, name: 'github-mcp', what: 'לעבוד עם GitHub מתוך Claude', url: '' },
        { n: 30, name: 'playwright-mcp', what: 'לתת ל-Claude דפדפן', url: '' },
        { n: 31, name: 'serena', what: 'למצוא ולערוך קוד רלוונטי', url: '' },
        { n: 32, name: 'claude-code-router', what: 'לנתב בקשות בין מודלים', url: '' },
        { n: 33, name: 'awesome-mcp-servers', what: 'למצוא חיבורים נוספים', url: '' }
      ]
    },
    {
      id: 'prompts', title: 'פרומפטים ושימוש', mono: 'PROMPTS & USAGE',
      note: 'ניטור שימוש, צמצום פלט, ולמידה מפרומפטים של כלים אחרים.',
      items: [
        { n: 34, name: 'system-prompts-ai', what: 'ללמוד פרומפטים של כלי AI', url: '' },
        { n: 35, name: 'best-practice', what: 'לקרוא practices של Claude Code', url: '' },
        { n: 36, name: 'codex-plugin-cc', what: 'להוסיף ביקורות Codex בתוך Claude', url: '' },
        { n: 37, name: 'claude-hud', what: 'לראות את השימוש ב-session', url: '' },
        { n: 38, name: 'rtk', what: 'לקצר פלט של פקודות', url: '' },
        { n: 39, name: 'headroom', what: 'לדחוס את מה שהמודל קורא', url: '' },
        { n: 40, name: 'caveman', what: 'לקבל תשובות קצרות בהרבה', url: '' }
      ]
    }
  ],

  /* ספריות מומלצות. כל שורה כאן אומתה מול ה-README של ה-repo ב-22.09.2026:
     כתובת, רישיון ופקודות ההתקנה הן ציטוט, לא זיכרון. מה שלא אומת - לא נכתב. */
  libraries: [
    {
      name: "ui-ux-pro-max",
      url: "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill",
      site: "https://uupm.cc/",
      license: "MIT",
      cat: "עיצוב ו-UI",
      state: "בשימוש באתר הזה",
      what: "Skill עיצוב שמכניס לאייג'נט מערכת עיצוב שלמה. לפי דיווח ה-repo: 79 סגנונות UI, 192 פלטות צבע, 74 שילובי גופנים, 119 הנחיות UX ו-192 חוקי הסקה לפי תחום.",
      why: "מה שהוא באמת מוסיף הוא לא ספרייה אלא checklist לפני מסירה: להגדיר טוקנים לפני שכותבים קוד, בלי אימוג'ים כאייקונים, ניגודיות 4.5:1, focus states נראים, כיבוד prefers-reduced-motion, ובדיקה ב-375 / 768 / 1024 / 1440. האתר הזה נבדק מול הרשימה הזאת לפני מסירה.",
      install: [
        { label: "Claude Code", cmd: ["/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill"] },
        { label: "CLI", cmd: ["npm install -g ui-ux-pro-max-cli", "uipro init --ai claude"] }
      ],
      tags: ["skill", "design system", "a11y"],
      note: "סקריפטי החיפוש דורשים Python 3, שאינו מותקן על המכונה הזאת - ולכן עבדתי לפי הכללים ולא לפי הסקריפטים. המספרים הם דיווח ה-repo, לא מדידה שלנו."
    },
    {
      name: "planning-with-files",
      url: "https://github.com/OthmanAdi/planning-with-files",
      site: "",
      license: "MIT",
      cat: "תכנון וקונטקסט",
      state: "לא הורץ אצלנו",
      what: "Skill שמחזיק את התכנון בקבצים על הדיסק - task_plan.md, findings.md ו-progress.md - במקום בתוך השיחה.",
      why: "זו התשובה המעשית ל-context rot ול-/clear: התכנית שורדת איפוס קונטקסט, compaction, קריסה וסגירת טרמינל. משימות מקבילות מקבלות תיקייה מבודדת בצורה .planning/YYYY-MM-DD-slug/ עם אותם שלושה קבצים, כך ששתי משימות לא דורכות זו על זו.",
      install: [
        { label: "Claude Code", cmd: ["/plugin marketplace add OthmanAdi/planning-with-files", "/plugin install planning-with-files@planning-with-files"] },
        { label: "Agent Skills · 60+ agents", cmd: ["npx skills add OthmanAdi/planning-with-files --skill planning-with-files -g"] }
      ],
      tags: ["skill", "planning", "memory"],
      note: "לפי ה-repo: עובד ב-19+ פלטפורמות ובאמצעות תקן Agent Skills ביותר מ-60 אייג'נטים. שלושת הקבצים ב-gitignore כברירת מחדל."
    },
    {
      name: "cognee",
      url: "https://github.com/topoteretes/cognee",
      site: "",
      license: "Apache-2.0",
      cat: "זיכרון וגרף ידע",
      state: "בהערכה",
      what: "פלטפורמת זיכרון בקוד פתוח שממירה מסמכים, קוד ושיחות לגרף ידע self-hosted, שהאייג'נט מחפש בו ומאחזר ממנו בין שיחות.",
      why: "זו הגרסה הגרפית של מה שהמוח הארגוני עושה בקבצים. חושף MCP server, ולכן נכנס לאייג'נט הקיים כחיבור ולא ככתיבה מחדש.",
      install: [
        { label: "Python", cmd: ["uv pip install \"cognee[gliner]\""] }
      ],
      tags: ["memory", "knowledge graph", "MCP"],
      note: "self-hosted, ולכן גם באחריותך: בסיס נתונים, גרסאות ותחזוקה. ראי נושא 08."
    },
    {
      name: "graphiti-core",
      url: "https://github.com/getzep/graphiti",
      site: "",
      license: "Apache-2.0",
      cat: "זיכרון וגרף ידע",
      state: "בהערכה",
      what: "Framework לגרפי קונטקסט טמפורליים לאייג'נטים: כל עובדה מוחזקת עם חלון תוקף דו-זמני, ועם provenance שמחזיר אותה לאפיזודת המקור.",
      why: "עובדות בארגון לא נכונות לנצח - הן נכונות עד שמשהו משתנה. זה הרכיב היחיד ברשימה שמודל הנתונים שלו מכיר בזה, וזה בדיוק מה שחסר בזיכרון ארגוני. תמיכה ב-Neo4j, FalkorDB ו-Amazon Neptune.",
      install: [
        { label: "Python", cmd: ["pip install graphiti-core"] }
      ],
      tags: ["memory", "temporal graph", "MCP"],
      note: "ה-repo כולל תיקיית mcp_server. Kuzu מסומן deprecated. 31,076 כוכבים לפי GitHub API ב-22.09.2026. ראי נושא 08."
    },
    {
      name: "graphify",
      url: "https://github.com/Graphify-Labs/graphify",
      site: "https://www.graphify.com",
      license: "Apache-2.0",
      cat: "זיכרון וגרף ידע",
      state: "לא הורץ אצלנו",
      what: "Skill שממפה codebase שלם - קוד, docs, סכמות SQL, קונפיגים, PDF ותמונות - לגרף ידע שאפשר לתחקר. הפרסינג הוא AST מקומי ודטרמיניסטי, כל קשת בגרף מגיעה עם הסבר, ואין vector store.",
      why: "זה ההפך מאחזור וקטורי על הקוד: לא «מה דומה» אלא «מה קורא למה, ומה יישבר אם אשנה את זה». בחפיפה זו בדיוק השאלה של מי שמקבל repo שלא הוא כתב. עובד כ-skill ב-Claude Code, Cursor, Codex ו-Gemini CLI, וגם כ-MCP server.",
      install: [
        { label: "Python", cmd: ["pip install graphifyy", "graphify install"] },
        { label: "MCP · stdio", cmd: ["graphify ./raw --mcp"] }
      ],
      tags: ["skill", "knowledge graph", "AST", "MCP"],
      note: "דורש Claude Code ו-Python 3.10+. פרויקט נפרד מ-graphiti של getzep, למרות דמיון השם. בהתקנה הידנית שב-README מופיעה כתובת אחרת (safishamsi/graphify) - כנראה הבעלים הקודם."
    }
  ],

  glossary: [
    { term: 'plan mode', he: 'מצב תכנון', def: 'מצב שבו האייג\'נט חוקר וכותב תכנית בלי לגעת בקבצים. ברירת המחדל לכל משימה של שלושה צעדים ומעלה.', topic: 'claude-md' },
    { term: 'CLAUDE.md', he: '', def: 'קובץ ההוראות שנטען לכל session בפרויקט. הוראות בלבד - workflows שייכים ל-skills.', topic: 'claude-md' },
    { term: 'subagent', he: 'סאב-אייג\'נט', def: 'אייג\'נט משני עם משימה אחת צרה. הערך העיקרי שלו אינו חלוקת עבודה אלא שמירת הקונטקסט הראשי נקי - רק התשובה חוזרת.', topic: 'claude-md' },
    { term: 'verification', he: 'אימות', def: 'בדיקה של התוצר בידי אייג\'נט אחר, שלא ראה את השיחה המלאה אלא קונטקסט נקודתי. לפי בוריס צ\'רני, הדבר שהכי לא עושים נכון.', topic: 'claude-md' },
    { term: 'turn', he: 'תור', def: 'סבב אחד של בקשה ותשובה. כל turn שולח מחדש את כל השיחה שלפניו - שם נמצאת העלות.', topic: 'context-economy' },
    { term: 'context window', he: 'חלון קונטקסט', def: 'כמות הטוקנים שהמודל קורא בבקשה אחת. גדול אינו שם נרדף לטוב.', topic: 'context-economy' },
    { term: 'context rot', he: 'ריקבון קונטקסט', def: 'ירידה בביצועי המודל כשה-input מתארך, גם במשימות פשוטות, ולפני שמגיעים לגבול המוצהר של החלון.', topic: 'context-economy' },
    { term: 'prompt caching', he: 'מטמון פרומפט', def: 'שמירת קידומת השיחה בצד הספק לזמן מוגבל, כדי לא לשלם מחיר מלא על קריאה חוזרת. המטמון מוקצה לפי מודל ולפי effort.', topic: 'context-economy' },
    { term: '/clear', he: '', def: 'איפוס השיחה. מה שהיה לפניו מפסיק להישלח. הפקודה הזולה ביותר שיש.', topic: 'context-economy' },
    { term: '/compact', he: '', def: 'צמצום השיחה לתקציר. הזמן הנכון: סוף שלב, או לפני הפסקה.', topic: 'context-economy' },
    { term: 'effort', he: 'רמת מאמץ', def: 'כמה המודל חושב לפני שהוא עונה. מוגדר בתחילת השיחה - המטמון מוקצה גם לפיו.', topic: 'context-economy' },
    { term: 'MCP', he: 'Model Context Protocol', def: 'פרוטוקול שמחבר אייג\'נט לכלים ומקורות חיצוניים. כל server פתוח צורך קונטקסט, גם כשלא משתמשים בו.', topic: 'agent-architecture' },
    { term: 'synthesizer agent', he: 'אייג\'נט מאחד', def: 'האייג\'נט שמקבל את הפלט של כל הסאב-אייג\'נטים ומייצר ממנו תדריך אחד מתועדף.', topic: 'agent-architecture' },
    { term: 'autonomy dial', he: 'דיאל אוטונומיה', def: 'התפיסה שאוטונומיה אינה מפסק אלא דיאל: בשבוע הראשון כמעט הכל מחכה לאישור, ואחר כך משתחררת קטגוריה אחת בכל פעם.', topic: 'agent-architecture' },
    { term: 'constitution.md', he: '', def: 'קובץ שמחזיק תפקיד, עדיפויות, פרטי הארגון ומה להתעלם ממנו. בלעדיו מקבלים פלט גנרי.', topic: 'agent-architecture' },
    { term: 'skill', he: '', def: 'חבילת הוראות למשימה מסוימת, שנטענת כשהיא רלוונטית. שם מקומם של workflows, בניגוד ל-CLAUDE.md.', topic: 'toolbox' },
    { term: 'accessibility tree', he: 'עץ נגישות', def: 'המבנה הסמנטי שמערכת ההפעלה חושפת לכלי נגישות. ARTEMIS משלב אותו עם OCR ו-vision כדי לזהות אלמנטים על המסך.', topic: 'artemis' },
    { term: 'AndroidWorld', he: '', def: 'מבחן השוואתי (benchmark) למשימות על מכשיר Android, שעליו Google מדווחת על 99%+ השלמת משימות.', topic: 'artemis' },
    { term: 'ring 0 / 1 / 2', he: 'טבעות טעינה', def: 'ring 0 נטען תמיד, ring 1 נטען לפי המשימה, ring 2 לא נטען אלא נחפש. זו התשובה המעשית ל-context rot.', topic: 'company-brain' },
    { term: 'MANIFEST.yaml', he: '', def: 'חוזה הטעינה: מכריז לכל קובץ מה ה-ring שלו, מתי הוא נטען (load_when), ומה חסוי.', topic: 'company-brain' },
    { term: 'validator', he: 'מאמת', def: 'סקריפט שהופך כלל כתיבה לבדיקה שרצה. "לכתוב טוב" אינו כלל. "לא להשתמש בקו מפריד ארוך" הוא כלל.', topic: 'company-brain' },
    { term: 'freshness', he: 'טריות', def: 'תאריך אימות לכל עובדה. אחרי שהתאריך עובר, התוכן חוזר להיות השערה שצריך לבדוק, לא אמת שבונים עליה הצעת מחיר.', topic: 'company-brain' },
    { term: 'RAG', he: 'אחזור מוגבר', def: 'שליפת מסמכים ממסד וקטורי לפי דמיון סמנטי. מחזיר את המסמך שנכון-כנראה; חוזה טעינה מחזיר את המסמך שהוכרז.', topic: 'company-brain' },
    { term: 'Ontology', he: 'אונטולוגיה', def: 'שכבה שממפה ישויות וקשרים בארגון: מי מדבר עם מי, מי אחראי על מה, ואיך מתקבלות החלטות.', topic: 'ontology' },
    { term: 'agent runtime', he: 'סביבת ריצה לאייג\'נט', def: 'השכבה שמריצה את האייג\'נט בפועל: לופ ההרצה, זיכרון, חיבור כלים, סאב-אייג\'נטים ודפדפן. בחירת runtime היא החלטה ארכיטקטונית, לא בחירת ספרייה.', topic: 'runtimes' },
    { term: 'knowledge graph', he: 'גרף ידע', def: 'ייצוג של ישויות והקשרים ביניהן, במקום טקסט חופשי או טבלאות. מאפשר לשאול "מה מחובר למה" ולא רק "מה דומה למה".', topic: 'memory-graphs' },
    { term: 'temporal knowledge graph', he: 'גרף ידע עם ציר זמן', def: 'גרף ידע שמחזיק גם מתי כל עובדה הייתה נכונה. מאפשר להבדיל בין "זה השתנה" לבין "זה היה לא נכון מהתחלה".', topic: 'memory-graphs' },
    { term: 'AST', he: 'עץ תחביר מופשט', def: 'הייצוג המבני של קוד אחרי פרסינג - פונקציות, קריאות, ייבואים - במקום טקסט חופשי. פרסינג AST הוא דטרמיניסטי: אותו קובץ מחזיר אותו גרף, בלי מודל באמצע שמנחש.', topic: 'memory-graphs' },
    { term: 'organizational memory', he: 'זיכרון ארגוני', def: 'הידע שהארגון מחזיק מעבר לראש של אדם אחד: החלטות, הקשרים, ומה שנוסה ולא עבד. זה מה שנשבר כשאדם עובר תפקיד.', topic: 'memory-graphs' }
  ],

  sources: [
    { title: 'Claude Code prompt library', who: 'Anthropic', url: 'https://code.claude.com/docs/en/prompt-library', note: 'ספריית פרומפטים רשמית.' },
    { title: 'company-brain-template', who: 'Castaldo Solutions', url: 'https://github.com/Castaldo-Solutions/company-brain-template', note: 'שלד המוח הארגוני, רישיון MIT: markdown ושני סקריפטי Node בלי תלויות.' },
    { title: 'Context Rot: How Increasing Input Tokens Impacts LLM Performance', who: 'Chroma, 14.7.2025', url: '', note: '18 מודלים, כולל Claude 4, GPT-4.1 ו-Gemini 2.5. קישור להשלמה.' },
    { title: 'תיעוד החיוב של Claude Code', who: 'Anthropic', url: '', note: 'המקור ל-21 המנופים. קישור מדויק להשלמה.' },
    { title: 'ראיון עם בוריס צ\'רני, אוגוסט', who: 'Boris Cherny', url: '', note: 'המשפט על verification. קישור להשלמה.' },
    { title: 'ARTEMIS', who: 'Google', url: '', note: 'הכלי בקוד פתוח והמדדים המדווחים. כתובת ה-repo להשלמה.' },
    { title: 'Microsoft Fabric - Ontology ושכבת IQ', who: 'Microsoft', url: '', note: 'תיעוד הרכיב. קישור להשלמה.' },
    { title: 'הקלטת בנייה של Company Brain ב-Fabric', who: 'עם Aleksi Partanen', url: '', note: 'סרטון YouTube. קישור להשלמה.' },
    { title: 'cognee', who: 'topoteretes · Apache-2.0', url: 'https://github.com/topoteretes/cognee', note: 'פלטפורמת זיכרון וגרף ידע self-hosted, חושפת MCP server. אומת מול ה-README.' },
    { title: 'graphiti', who: 'getzep · Apache-2.0', url: 'https://github.com/getzep/graphiti', note: 'גרף קונטקסט טמפורלי עם חלונות תוקף דו-זמניים; כולל mcp_server. 31,076 כוכבים לפי GitHub API ב-22.09.2026 - כלומר 31.1K שנמסר, אומת.' },
    { title: 'graphify', who: 'Graphify-Labs · Apache-2.0', url: 'https://github.com/Graphify-Labs/graphify', note: 'גרף ידע מקוד וממסמכים בפרסינג AST מקומי, בלי vector store; skill ו-MCP server. פרויקט נפרד מ-graphiti. 120,433 כוכבים לפי GitHub API ב-22.09.2026.' },
    { title: 'ui-ux-pro-max-skill', who: 'nextlevelbuilder · MIT', url: 'https://github.com/nextlevelbuilder/ui-ux-pro-max-skill', note: 'ה-checklist שלו הוא הבסיס לבדיקות העיצוב לפני מסירה באתר הזה: טוקנים, ניגודיות, focus states וארבעה רוחבי מסך. אתר הפרויקט: uupm.cc' },
    { title: 'planning-with-files', who: 'OthmanAdi · MIT', url: 'https://github.com/OthmanAdi/planning-with-files', note: 'תכנון מתמשך בקבצים: task_plan.md, findings.md, progress.md.' },
    { title: 'Hermes Agent', who: 'קוד פתוח', url: '', note: 'Agent runtime. כתובת repo, רישיון ותיעוד להשלמה.' },
    { title: 'nanoclaw', who: 'קוד פתוח', url: '', note: 'נכנס למעקב, טרם נבדק. כל הפרטים להשלמה.' }
  ]
};
