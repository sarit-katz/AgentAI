#!/usr/bin/env node
/* ============================================================
   build-index.mjs - מרענן את assets/search-index.js מתוך ה-HTML.

   למה סקריפט ולא כתיבה ידנית: אינדקס חיפוש שמתחזקים ביד
   מתיישן בשקט. אחרי כל עריכת תוכן מריצים:

     node tools/build-index.mjs            כתיבה
     node tools/build-index.mjs --check    בדיקה בלבד (יוצא 1 אם שונה)

   בלי תלויות, בלי npm install. Node 18 ומעלה.
   הסורק קורא רק את מה שבתוך <main>, ולכן ניווט, footer
   ודיאלוג החיפוש לא נכנסים לאינדקס.

   מה לא נכנס כאן: מונחי המילון, הרדאר וארגז הכלים. אותם
   app.js מוסיף בזמן ריצה ישירות מ-window.SITE, כדי שלא
   יהיו שני מקורות אמת לאותה רשומה.
   ============================================================ */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'search-index.js');
const CHECK = process.argv.includes('--check');

const SECTION_MAX = 600;

/* ---------- HTML → טקסט ---------- */
function toText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '-')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function clip(s, n) {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const sp = cut.lastIndexOf(' ');
  return (sp > n * 0.6 ? cut.slice(0, sp) : cut) + '…';
}

/* ---------- תיוג העמוד ---------- */
function kindOf(file) {
  const num = file.match(/^(\d\d)-/);
  if (num) return 'נושא ' + num[1];
  if (file === 'index.html') return 'דף הבית';
  return 'רוחבי';
}

/* ---------- סריקת עמוד אחד ---------- */
function scan(file) {
  const src = readFileSync(join(ROOT, file), 'utf8');
  const main = (src.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || ['', ''])[1];
  if (!main) return [];

  const kind = kindOf(file);
  const h1 = toText((main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || ['', ''])[1]);
  const answer = toText((main.match(/<div class="answer"[^>]*>([\s\S]*?)<\/div>/i) || ['', ''])[1]);
  const lead = toText((main.match(/<p class="hero__lead"[^>]*>([\s\S]*?)<\/p>/i) || ['', ''])[1]);

  const rows = [];
  if (h1) {
    rows.push({ title: h1, page: file, hash: '', kind: kind, text: clip(answer || lead, SECTION_MAX) });
  }

  // כל h2 שיש לו id הוא יעד קישור, ולכן גם רשומה באינדקס
  const heads = [];
  const re = /<h2\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/gi;
  let m;
  while ((m = re.exec(main)) !== null) {
    heads.push({ id: m[1], title: toText(m[2]), start: m.index, from: m.index + m[0].length });
  }
  heads.forEach((h, i) => {
    const end = i + 1 < heads.length ? heads[i + 1].start : main.length;
    const body = main.slice(h.from, end);
    rows.push({
      title: h.title,
      page: file,
      hash: '#' + h.id,
      kind: kind + ' · ' + (h1 || file),
      text: clip(toText(body), SECTION_MAX)
    });
  });

  return rows;
}

/* ---------- הרכבה ---------- */
const files = readdirSync(ROOT)
  .filter((f) => f.endsWith('.html'))
  .sort((a, b) => {
    // index קודם, אחר כך הנושאים לפי מספר, ואחר כך הרוחביים
    const rank = (f) => (f === 'index.html' ? 0 : /^\d\d-/.test(f) ? 1 : 2);
    return rank(a) - rank(b) || a.localeCompare(b, 'en');
  });

const rows = [];
for (const f of files) {
  const got = scan(f);
  if (!got.length) console.warn('אזהרה: לא נמצא תוכן ב-' + f);
  rows.push(...got);
}

const body = rows.map((r) => '  ' + JSON.stringify(r)).join(',\n');
const out =
  '/* ============================================================\n' +
  '   search-index.js - נוצר אוטומטית. אל תערכו ביד.\n' +
  '   מחדשים עם: node tools/build-index.mjs\n' +
  '   מונחי המילון, הרדאר וארגז הכלים נוספים בזמן ריצה\n' +
  '   מ-window.SITE (ראו app.js), ולכן אינם כאן.\n' +
  '   ============================================================ */\n' +
  'window.SEARCH_INDEX = [\n' +
  body +
  '\n];\n';

if (CHECK) {
  const cur = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (cur === out) {
    console.log('האינדקס מעודכן. ' + rows.length + ' רשומות מ-' + files.length + ' עמודים.');
    process.exit(0);
  }
  console.error('האינדקס לא מעודכן. הריצו: node tools/build-index.mjs');
  process.exit(1);
}

writeFileSync(OUT, out, 'utf8');
console.log('נכתב ' + OUT);
console.log(rows.length + ' רשומות מ-' + files.length + ' עמודים.');
