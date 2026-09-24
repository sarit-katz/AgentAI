/* ============================================================
   demos.js — רכיבי ההדגמה החיים.
   כל רכיב מופעל רק אם ה-host שלו קיים בעמוד, כך שהקובץ
   אחד ומשותף לכל העמודים. בלי תלויות, בלי fetch.

   שקיפות: אין כאן אף מחיר בדולרים. כל המחשבון עובד
   ביחידות של "טוקנים שנקראו", כי מחירון אמיתי לא נכתב
   מהזיכרון. המקדמים שהמשתמשת יכולה לשנות מסומנים בעמוד.
   ============================================================ */
(function () {
  'use strict';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function svgEl(tag, attrs) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    return n;
  }
  function fmt(n) {
    n = Math.round(n);
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function fmtK(n) {
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'M';
    return fmt(n) + 'K';
  }

  /* ==========================================================
     1. מחשבון כלכלת קונטקסט
     ========================================================== */
  function initCost() {
    var host = $('[data-demo-cost]');
    if (!host) return;

    var state = {
      turns: 40,
      base: 14,      // K טוקנים: system prompt + CLAUDE.md + קבצים מצורפים
      perTurn: 2.5,  // K טוקנים שנוספים בכל turn (בקשה + תשובה + פלט כלים)
      cache: true,
      cacheFactor: 0.10, // מקדם קריאה מהמטמון ביחס לקריאה מלאה
      clearAt: 0     // 0 = בלי /clear
    };

    var chart, readout;

    host.innerHTML = '';

    var row = el('div', 'ctrl-row');
    row.appendChild(range('turns', 'מספר turns בשיחה', 4, 60, 1, function (v) { return v; }));
    row.appendChild(range('base', 'קונטקסט קבוע (system + CLAUDE.md)', 2, 60, 1, function (v) { return v + 'K'; }));
    row.appendChild(range('perTurn', 'תוספת לכל turn', 0.5, 8, 0.5, function (v) { return v + 'K'; }));
    row.appendChild(range('clearAt', 'clear/ בטורן', 0, 59, 1, function (v) { return v === 0 ? 'ללא' : '#' + v; }));
    host.appendChild(row);

    var sw = el('div', 'flow');
    sw.style.marginTop = '1.25rem';
    var lab = el('label', 'switch');
    var cb = el('input');
    cb.type = 'checkbox';
    cb.id = 'cost-cache';
    cb.name = cb.id;
    cb.checked = state.cache;
    lab.appendChild(cb);
    lab.appendChild(el('span', null, 'prompt caching פעיל'));
    cb.addEventListener('change', function () { state.cache = cb.checked; render(); });
    sw.appendChild(lab);

    var lab2 = el('label', 'switch');
    lab2.style.marginInlineStart = '1.5rem';
    lab2.appendChild(el('span', null, 'מקדם קריאה מהמטמון'));
    var num = el('input');
    num.type = 'number';
    num.id = 'cost-cache-factor';
    num.name = num.id;
    num.min = '0.02'; num.max = '1'; num.step = '0.01';
    num.value = String(state.cacheFactor);
    num.style.inlineSize = '5.5rem';
    num.setAttribute('aria-label', 'מקדם קריאה מהמטמון ביחס לקריאה מלאה');
    num.addEventListener('input', function () {
      var v = parseFloat(num.value);
      if (!isNaN(v) && v > 0 && v <= 1) { state.cacheFactor = v; render(); }
    });
    lab2.appendChild(num);
    sw.appendChild(lab2);
    host.appendChild(sw);

    chart = svgEl('svg', { 'class': 'chart', viewBox: '0 0 640 220', role: 'img' });
    chart.setAttribute('aria-label', 'גרף עמודות: כמה טוקנים נקראים בכל turn');
    var chartWrap = el('div');
    chartWrap.style.marginTop = '1.75rem';
    chartWrap.appendChild(chart);
    var legend = el('div', 'legend');
    legend.innerHTML = '<span><i style="background:var(--forest)"></i>לפני ה-<code>/clear</code></span>' +
      '<span><i style="background:var(--brass)"></i>אחרי ה-<code>/clear</code></span>' +
      '<span>ציר Y: טוקנים שנקראו ב-turn · ציר X: מספר ה-turn</span>';
    chartWrap.appendChild(legend);
    host.appendChild(chartWrap);

    readout = el('div', 'readout');
    host.appendChild(readout);

    function range(key, label, min, max, step, fmtVal) {
      var l = el('label', 'ctrl');
      var head = el('span');
      head.appendChild(el('span', null, label));
      var b = el('b', null, fmtVal(state[key]));
      head.appendChild(b);
      l.appendChild(head);
      var i = el('input');
      i.type = 'range';
      i.id = 'cost-' + key;
      i.name = i.id;
      i.min = String(min); i.max = String(max); i.step = String(step);
      i.value = String(state[key]);
      i.addEventListener('input', function () {
        state[key] = parseFloat(i.value);
        if (key === 'turns' && state.clearAt >= state.turns) state.clearAt = 0;
        b.textContent = fmtVal(state[key]);
        render();
      });
      l.appendChild(i);
      return l;
    }

    /* טוקנים שנקראים ב-turn אחד, לפי הקונטקסט שקדם לו */
    function series(useClear) {
      var out = [];
      var ctx = state.base;                       // K
      for (var t = 1; t <= state.turns; t++) {
        if (useClear && state.clearAt && t === state.clearAt) ctx = state.base;
        var fresh = state.perTurn;
        var read = state.cache ? ctx * state.cacheFactor + fresh : ctx + fresh;
        out.push({ turn: t, read: read, reset: useClear && state.clearAt && t >= state.clearAt });
        ctx = ctx + state.perTurn;
      }
      return out;
    }

    function sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i].read; return s; }

    function render() {
      var withClear = series(true);
      var without = series(false);
      var totalW = sum(withClear), totalN = sum(without);

      /* גרף */
      while (chart.firstChild) chart.removeChild(chart.firstChild);
      /* RTL: turn 1 בימין, תוויות ציר Y בימין מחוץ לאזור העמודות */
      var W = 640, H = 220, labelW = 46, padL = 10, padT = 12, padB = 26;
      var plotR = W - labelW, iw = plotR - padL, ih = H - padT - padB;
      var maxV = 0;
      for (var i = 0; i < without.length; i++) maxV = Math.max(maxV, without[i].read);
      maxV = Math.max(maxV, 1);

      for (var g = 0; g <= 2; g++) {
        var y = padT + ih - (ih * g / 2);
        chart.appendChild(svgEl('line', { 'class': g === 0 ? 'ax' : 'gl', x1: padL, y1: y, x2: plotR, y2: y }));
        var ty = svgEl('text', { x: plotR + 6, y: y + 3, 'text-anchor': 'start' });
        ty.textContent = fmtK(maxV * g / 2);
        chart.appendChild(ty);
      }

      var n = withClear.length;
      var bw = iw / n;
      for (var j = 0; j < n; j++) {
        var d = withClear[j];
        var h = Math.max(1, (d.read / maxV) * ih);
        var x = plotR - (j + 1) * bw + bw * 0.16;
        chart.appendChild(svgEl('rect', {
          'class': d.reset ? 'bar bar--after' : 'bar',
          x: x, y: padT + ih - h, width: Math.max(1, bw * 0.68), height: h
        }));
        if (j === 0 || (j + 1) % 10 === 0) {
          var tx = svgEl('text', { x: x + bw * 0.34, y: H - 8, 'text-anchor': 'middle' });
          tx.textContent = String(d.turn);
          chart.appendChild(tx);
        }
      }

      /* מדדים */
      var saved = totalN > 0 ? (1 - totalW / totalN) * 100 : 0;
      var lastRead = withClear[n - 1].read;
      var firstRead = withClear[0].read;
      readout.innerHTML = '';
      readout.appendChild(stat('טוקנים שנקראו בכל השיחה', fmtK(totalW), ''));
      readout.appendChild(stat('turn ' + n + ' לבדו', fmtK(lastRead),
        lastRead > firstRead * 1.05 ? 'up' : ''));
      readout.appendChild(stat('פי כמה מ-turn 1', (lastRead / firstRead).toFixed(1) + '×',
        lastRead / firstRead > 1.5 ? 'up' : ''));
      readout.appendChild(stat('חיסכון מה-clear/', state.clearAt ? saved.toFixed(0) + '%' : '—',
        state.clearAt ? 'down' : ''));
    }

    function stat(label, value, cls) {
      var d = el('div');
      d.appendChild(el('span', null, label));
      var b = el('b', cls || null, value);
      d.appendChild(b);
      return d;
    }

    render();
  }

  /* ==========================================================
     2. גרף context rot — סכמטי במוצהר
     ========================================================== */
  function initRot() {
    var host = $('[data-demo-rot]');
    if (!host) return;
    var W = 640, H = 230, padL = 52, padR = 16, padT = 16, padB = 40;
    var iw = W - padL - padR, ih = H - padT - padB;

    var svg = svgEl('svg', { 'class': 'chart', viewBox: '0 0 ' + W + ' ' + H, role: 'img' });
    svg.setAttribute('aria-label', 'תרשים סכמטי: ביצועי המודל יורדים כשאורך ה-input גדל, והירידה מתחילה לפני הגבול המוצהר של חלון הקונטקסט.');

    // צירים
    svg.appendChild(svgEl('line', { 'class': 'ax', x1: padL, y1: padT + ih, x2: W - padR, y2: padT + ih }));
    svg.appendChild(svgEl('line', { 'class': 'ax', x1: W - padR, y1: padT, x2: W - padR, y2: padT + ih }));

    // תוויות ציר Y (איכותיות בלבד — אין כאן מספרים)
    var yTop = svgEl('text', { x: W - padR - 8, y: padT + 10, 'text-anchor': 'end' });
    yTop.textContent = 'accuracy: high';
    svg.appendChild(yTop);
    var yBot = svgEl('text', { x: W - padR - 8, y: padT + ih - 6, 'text-anchor': 'end' });
    yBot.textContent = 'accuracy: low';
    svg.appendChild(yBot);

    // עקומה — RTL: input קצר בימין, ארוך בשמאל
    var pts = [[0, .04], [.12, .07], [.26, .13], [.4, .24], [.55, .42], [.7, .6], [.85, .76], [1, .88]];
    var dPath = '';
    for (var i = 0; i < pts.length; i++) {
      var x = W - padR - pts[i][0] * iw;
      var y = padT + pts[i][1] * ih;
      dPath += (i ? ' L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    svg.appendChild(svgEl('path', { 'class': 'ln', d: dPath }));

    // הגבול המוצהר של החלון — הרבה אחרי תחילת הירידה
    var xLimit = W - padR - 0.9 * iw;
    svg.appendChild(svgEl('line', { 'class': 'gl', x1: xLimit, y1: padT, x2: xLimit, y2: padT + ih, 'stroke-dasharray': '4 4' }));
    var lt = svgEl('text', { x: xLimit + 6, y: padT + 10, 'text-anchor': 'start' });
    lt.textContent = 'declared window limit';
    svg.appendChild(lt);

    // נקודה שבה הירידה מתחילה
    var xStart = W - padR - 0.26 * iw;
    svg.appendChild(svgEl('circle', { 'class': 'dot', cx: xStart, cy: padT + 0.13 * ih, r: 4 }));
    var st = svgEl('text', { x: xStart - 6, y: padT + 0.13 * ih - 10, 'text-anchor': 'end' });
    st.textContent = 'drop starts here';
    svg.appendChild(st);

    var xl = svgEl('text', { x: padL, y: H - 10, 'text-anchor': 'start' });
    xl.textContent = '← input length grows';
    svg.appendChild(xl);

    host.innerHTML = '';
    host.appendChild(svg);
    var lg = el('div', 'legend');
    lg.innerHTML = '<span><i style="background:var(--brass)"></i>ביצועי המודל (סכמטי)</span>' +
      '<span>אין כאן נקודות דאטה. הצורה בלבד — לפי המחקר המצוטט מתחת לתרשים.</span>';
    host.appendChild(lg);
  }

  /* ==========================================================
     3. דיאגרמת multi-agent
     ========================================================== */
  var AGENT_NODES = [
    {
      id: 'mail', label: 'Mail', title: 'סאב-אייג\'נט דואר',
      role: 'לקרוא את תיבת הדואר ולסמן מה דורש תשובה היום.',
      ctxIn: 'חוקי עדיפות מ-constitution.md · חיבור Gmail דרך MCP · חלון זמן (24 שעות אחרונות)',
      ctxOut: 'רשימת פריטים: ממי, מה נדרש, עד מתי. בלי גוף ההודעות.'
    },
    {
      id: 'cal', label: 'Calendar', title: 'סאב-אייג\'נט לוח שנה',
      role: 'לזהות התנגשויות, פגישות בלי הכנה, וחלונות זמן פנויים.',
      ctxIn: 'היומן · העדיפויות מ-constitution.md · כמה זמן הכנה כל סוג פגישה דורשת',
      ctxOut: 'שלוש עד חמש שורות: מה בסיכון היום, ומה החלון שנשאר לעבודה עמוקה.'
    },
    {
      id: 'tasks', label: 'Tasks', title: 'סאב-אייג\'נט משימות',
      role: 'להצליב את מה שפתוח מול מה שבאמת דחוף.',
      ctxIn: 'מערכת המשימות · מה נדחה בעבר ולא קרה כלום (מגיע מ-memory/)',
      ctxOut: 'המשימות שצריכות להיכנס להיום, ולמה דווקא הן.'
    },
    {
      id: 'web', label: 'Web', title: 'סאב-אייג\'נט מקורות חוץ',
      role: 'לסרוק את מה שהשתנה בחוץ ורלוונטי לתחום.',
      ctxIn: 'תחומי עניין מוגדרים · חיפוש · המקורות שהוגדרו כאמינים',
      ctxOut: 'עד שלושה פריטים עם למה זה משנה לך. השאר נזרק.'
    },
    {
      id: 'custom', label: 'Custom', title: 'סאב-אייג\'נט מקורות פרטיים',
      role: 'המקורות שהם רק שלך: CRM, Stripe, אפליקציות פנימיות.',
      ctxIn: 'חיבור MCP למערכת · הגדרה מה נחשב חריג בכל מקור',
      ctxOut: 'חריגות בלבד: מה יצא מהטווח הרגיל, ומאז מתי.'
    },
    {
      id: 'synth', label: 'Synthesizer', title: 'האייג\'נט המאחד', synth: true,
      role: 'מקבל את חמשת הפלטים ומייצר מהם תדריך אחד מתועדף — לא חמישה סיכומים.',
      ctxIn: 'הפלטים של כל הסאב-אייג\'נטים · constitution.md · SKILL.md שמגדיר איך לאחד ולהעביר',
      ctxOut: 'תדריך אחד: מה קורה, מה דורש החלטה שלך, ומה הוא מוכן לשלוח בעצמו.'
    },
    {
      id: 'out', label: 'Delivery', title: 'מסירה',
      role: 'שולח את התדריך לאן שאת קוראת בפועל.',
      ctxIn: 'התדריך המוגמר · יעד המסירה (מייל, Slack, Notion)',
      ctxOut: 'פריט אחד במקום חמישה-עשר טאבים פתוחים.'
    }
  ];

  function initAgents() {
    var host = $('[data-demo-agents]');
    if (!host) return;
    var noteHost = $('[data-demo-agents-note]');

    var W = 640, H = 300;
    var svg = svgEl('svg', { 'class': 'diagram', viewBox: '0 0 ' + W + ' ' + H, role: 'group' });
    svg.setAttribute('aria-label', 'דיאגרמה: חמישה סאב-אייג\'נטים במקביל, אייג\'נט מאחד, ומסירה');

    // RTL: המקורות בימין, המסירה בשמאל
    var srcX = W - 150, synthX = 250, outX = 40;
    var boxW = 120, boxH = 34;
    var ys = [16, 68, 120, 172, 224];
    var edges = [];

    for (var i = 0; i < 5; i++) {
      edges.push(svgEl('path', {
        'class': 'edge', 'data-edge': AGENT_NODES[i].id,
        d: 'M' + srcX + ' ' + (ys[i] + boxH / 2) + ' C' + (srcX - 50) + ' ' + (ys[i] + boxH / 2) +
           ', ' + (synthX + boxW + 50) + ' ' + (H / 2 - 14) + ', ' + (synthX + boxW) + ' ' + (H / 2 - 14)
      }));
    }
    edges.push(svgEl('path', {
      'class': 'edge', 'data-edge': 'out',
      d: 'M' + synthX + ' ' + (H / 2 - 14) + ' L' + (outX + boxW) + ' ' + (H / 2 - 14)
    }));
    edges.forEach(function (e) { svg.appendChild(e); });

    function node(nd, x, y, w, h) {
      var g = svgEl('g', { 'class': 'node' + (nd.synth ? ' node--synth' : ''), 'data-node': nd.id, tabindex: '0', role: 'button' });
      g.setAttribute('aria-label', nd.title);
      g.appendChild(svgEl('rect', { x: x, y: y, width: w, height: h }));
      var t = svgEl('text', { x: x + w / 2, y: y + h / 2 + 4, 'text-anchor': 'middle', direction: 'ltr' });
      t.textContent = nd.label;
      g.appendChild(t);
      svg.appendChild(g);
      return g;
    }

    for (var j = 0; j < 5; j++) node(AGENT_NODES[j], srcX, ys[j], boxW, boxH);
    node(AGENT_NODES[5], synthX, H / 2 - 14 - boxH / 2, boxW, boxH);
    node(AGENT_NODES[6], outX, H / 2 - 14 - boxH / 2, boxW, boxH);

    var pl = svgEl('text', { x: srcX + boxW + 10, y: 12, 'class': 'nlabel', 'text-anchor': 'start' });
    pl.textContent = 'in parallel';
    svg.appendChild(pl);

    host.innerHTML = '';
    host.appendChild(svg);

    function select(id) {
      var nd = null;
      AGENT_NODES.forEach(function (n) { if (n.id === id) nd = n; });
      if (!nd || !noteHost) return;
      svg.querySelectorAll('.node').forEach(function (n) {
        n.classList.toggle('is-sel', n.getAttribute('data-node') === id);
      });
      svg.querySelectorAll('.edge').forEach(function (e) {
        e.classList.toggle('is-lit', e.getAttribute('data-edge') === id || (id === 'synth'));
      });
      noteHost.innerHTML = '';
      noteHost.appendChild(el('span', 'label', nd.title));
      var dl = el('dl', 'facts');
      dl.style.marginTop = '.5rem';
      [['התפקיד', nd.role], ['מה נכנס לקונטקסט שלו', nd.ctxIn], ['מה חוזר לראשי', nd.ctxOut]]
        .forEach(function (p) {
          var dt = el('dt', null, p[0]);
          var dd = el('dd', null, p[1]);
          dd.style.fontFamily = 'var(--font-sans)';
          dd.style.fontSize = '1rem';
          dd.style.direction = 'rtl';
          dd.style.textAlign = 'start';
          dl.appendChild(dt); dl.appendChild(dd);
        });
      noteHost.appendChild(dl);
    }

    svg.addEventListener('click', function (e) {
      var g = e.target.closest('.node');
      if (g) select(g.getAttribute('data-node'));
    });
    svg.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var g = e.target.closest('.node');
      if (g) { e.preventDefault(); select(g.getAttribute('data-node')); }
    });
    select('mail');
  }

  /* ==========================================================
     4. דיאל אוטונומיה
     ========================================================== */
  var DIAL = [
    {
      when: 'שבוע 01', title: 'הכל מחכה לאישור',
      alone: ['לקרוא, לאסוף, לאחד', 'לייצר את התדריך'],
      waits: ['כל תשובה למייל', 'כל שינוי ביומן', 'כל פעולה במערכת חיצונית'],
      why: 'בשבוע הראשון את לא בודקת אם הוא מדויק — את בודקת מה הוא היה עושה. בשביל זה צריך לראות את הטיוטה.'
    },
    {
      when: 'שבועות 02—04', title: 'הפעולות הזולות משתחררות',
      alone: ['לשלוח את התדריך לבד', 'לתייג ולארכב דואר לפי הכללים', 'לחסום זמן הכנה ביומן'],
      waits: ['כל תשובה שיוצאת לאדם חיצוני', 'כל פעולה עם השפעה כספית'],
      why: 'הקריטריון הוא לא "כמה זה חוסך" אלא "כמה יקר לבטל". תיוג דואר אפשר לבטל בקליק.'
    },
    {
      when: 'חודש 02', title: 'טיוטות מוכנות מראש',
      alone: ['לנסח תשובות ולהשאיר אותן בטיוטה', 'לתזמן פגישות פנימיות', 'לעדכן סטטוס משימות'],
      waits: ['שליחה לגורם חיצוני', 'התחייבות לתאריך מול לקוח'],
      why: 'מכאן ההרווח האמיתי: את לא כותבת מאפס, את מאשרת או מתקנת.'
    },
    {
      when: 'חודש 03', title: 'קטגוריות שלמות רצות לבד',
      alone: ['תשובות שגרתיות מסוג מוגדר', 'תיאום פנימי מלא', 'מעקב ותזכורות אוטומטיות'],
      waits: ['מה שחדש, מה שחריג, ומה שנוגע בכסף או בהתחייבות'],
      why: 'הגרסה של חודש שלישי טובה יותר לא כי המודל השתפר, אלא כי היא ראתה איך את מחליטה.'
    }
  ];

  function initDial() {
    var host = $('[data-demo-dial]');
    if (!host) return;
    host.innerHTML = '';

    var state = { i: 0 };
    var l = el('label', 'ctrl');
    var head = el('span');
    head.appendChild(el('span', null, 'כמה זמן האייג\'נט רץ אצלך'));
    var b = el('b', null, DIAL[0].when);
    head.appendChild(b);
    l.appendChild(head);
    var input = el('input');
    input.type = 'range';
    input.id = 'dial-stage';
    input.name = input.id;
    input.min = '0'; input.max = String(DIAL.length - 1); input.step = '1'; input.value = '0';
    input.setAttribute('aria-label', 'שלב האוטונומיה');
    l.appendChild(input);
    host.appendChild(l);

    var out = el('div');
    out.style.marginTop = '1.5rem';
    host.appendChild(out);

    input.addEventListener('input', function () { state.i = parseInt(input.value, 10); render(); });

    function render() {
      var d = DIAL[state.i];
      b.textContent = d.when;
      out.innerHTML = '';
      var h = el('h4', null, d.title);
      h.style.fontFamily = 'var(--font-disp)';
      h.style.fontWeight = '760';
      h.style.fontSize = '1.2rem';
      h.style.margin = '0 0 1.1rem';
      out.appendChild(h);

      var g = el('div', 'grid grid-2');
      g.appendChild(col('רץ לבד', d.alone, 'var(--forest)'));
      g.appendChild(col('מחכה לאישור שלך', d.waits, 'var(--warn)'));
      out.appendChild(g);

      var p = el('p', 'source-note hairline-top', d.why);
      p.style.marginTop = '1.35rem';
      out.appendChild(p);
    }

    function col(title, items, color) {
      var d = el('div');
      var t = el('p', 'label', title);
      t.style.color = color;
      d.appendChild(t);
      var ul = el('ul');
      ul.style.listStyle = 'none';
      ul.style.padding = '0';
      ul.style.margin = '.6rem 0 0';
      items.forEach(function (s) {
        var li = el('li', null, s);
        li.style.borderTop = '1px solid var(--line-soft)';
        li.style.padding = '.5rem 0';
        li.style.color = 'var(--ink-dim)';
        li.style.fontSize = '1rem';
        ul.appendChild(li);
      });
      d.appendChild(ul);
      return d;
    }

    render();
  }

  /* ==========================================================
     5. עץ תיקיות נפתח
     ========================================================== */
  var TREES = {
    chief: {
      label: 'chief-of-staff/',
      note: 'התיקייה שמריצה את האייג\'נט האישי. מבנה משעמם — וזה בדיוק מה שהופך אותו לניתן לשחזור.',
      items: [
        { n: 'CLAUDE.md', d: 'טוען את ההוראות אוטומטית בכל session. הוראות בלבד — לא נהלים.' },
        { n: 'constitution.md', d: 'התפקיד שלך, העדיפויות, פרטי הארגון, ומה להתעלם ממנו. בלי הקובץ הזה הפלט גנרי.' },
        {
          n: '.claude/skills/', dir: true, d: 'כאן גרים הנהלים: איך אוספים, איך מאחדים, איך מוסרים.',
          items: [
            { n: 'chief-of-staff/SKILL.md', d: 'ההוראה המרכזית: אילו סאב-אייג\'נטים להריץ, באיזה סדר, ומה הפורמט של התדריך.' },
            { n: 'triage/SKILL.md', d: 'איך מחליטים מה דחוף. זה נוהל עם שלבים, ולכן הוא skill ולא CLAUDE.md.' }
          ]
        },
        {
          n: '.claude/agents/', dir: true, d: 'הגדרה נפרדת לכל סאב-אייג\'נט: תפקיד אחד, כלים מוגבלים, ולפעמים מודל זול יותר.',
          items: [
            { n: 'mail.md', d: 'קורא דואר, מחזיר רשימת פריטים. אין לו הרשאת כתיבה.' },
            { n: 'calendar.md', d: 'מזהה התנגשויות וחלונות זמן.' },
            { n: 'synthesizer.md', d: 'האייג\'נט היחיד שרואה את כל הפלטים. הוא לא אוסף — הוא מתעדף.' }
          ]
        },
        {
          n: 'memory/', dir: true, d: 'מה שהוא למד עליך: מה את מדלגת עליו שוב ושוב, מה תמיד מקבל תשובה מיד.',
          items: [
            { n: 'preferences.md', d: 'החלטות חוזרות שהפכו לכלל.' },
            { n: 'skipped.md', d: 'מה הוצע ולא נעשה. זה מה שמייצר את השיפור בחודש השלישי.' }
          ]
        },
        { n: 'briefings/', dir: true, d: 'הפלטים עצמם, לפי תאריך. שימושי כדי להשוות איך התדריך השתפר.' }
      ]
    },
    brain: {
      label: 'brain/',
      note: 'המוח הארגוני יושב ב-repository נפרד, והפרויקטים מצרפים אותו כ-submodule.',
      items: [
        { n: 'CORE.md', d: 'ring 0 — הקובץ היחיד שנטען בכל session של כל אייג\'נט. אצלנו 85 שורות אחרי חודשים. כדי להוסיף שורה צריך להוציא שורה.' },
        { n: 'MANIFEST.yaml', d: 'חוזה הטעינה: לכל קובץ — איזה ring, מתי נטען (load_when), ומה חסוי.' },
        {
          n: 'company/', dir: true, d: 'עובדות: מה אתם מוכרים, למי, ובאילו תנאים.',
          items: [
            { n: 'identity.md', d: 'איך אתם נשמעים, מה אתם ומה אתם לא. מתוך איך שאתם מתארים את עצמכם בקול, ועוד שני קטעים אמיתיים כדוגמת טון.' },
            { n: 'offering.md', d: 'מה נמכר בפועל, לפי תחום — מעשר ההצעות האחרונות, לא מהקטלוג התיאורטי.' },
            { n: 'icp.md', d: 'מי לקוח טוב ומי לא. השדה שאף אחד לא כותב ושווה יותר מהשאר: את מי דחינו, ולמה.' },
            { n: 'pricing.md', d: 'ring 1, confidential. נטען רק בהצעת מחיר, הנחה או נגוציאציה. לעולם לא בתוכן פומבי.' }
          ]
        },
        { n: 'decisions/', dir: true, d: 'למה בחרנו כך. לא משנים אחורה — מוסיפים החלטה חדשה שמחליפה.' },
        { n: 'playbooks/', dir: true, d: 'מודלים: איך דבר מסוים נעשה אצלנו.' },
        { n: 'examples/', dir: true, d: 'תוצרים אמיתיים שעבדו. ring 2 בדרך כלל — נחפשים, לא נטענים.' },
        {
          n: 'validators/', dir: true, d: 'כללי כתיבה שהפכו להרצה. שני סקריפטי Node בלי תלויות.',
          items: [
            { n: 'brand-lint.mjs', d: 'בודק איך נכתב. במצב --diff קורא unified diff מ-stdin ובודק רק שורות שנוספו — כך אפשר לאמץ אותו על repo עם אלפי שורות קיימות.' },
            { n: 'freshness.mjs', d: 'בודק מה פג. עדיף בתזמון ולא בכל push: עובדה שהתיישנה היא סיבה להזכיר למישהו, לא להפיל build.' },
            { n: 'rules.mjs', d: 'הכללים עצמם. אלה שבטמפלייט הם נקודת התחלה, לא תקן — מחליפים אותם בשלכם.' }
          ]
        }
      ]
    }
  };

  function initTree() {
    var hosts = document.querySelectorAll('[data-tree]');
    if (!hosts.length) return;
    Array.prototype.forEach.call(hosts, function (host) {
      var data = TREES[host.getAttribute('data-tree')];
      if (!data) return;
      var noteHost = document.querySelector('[data-tree-note="' + host.getAttribute('data-tree') + '"]');

      host.innerHTML = '';
      var root = el('ul');
      var rootLi = el('li');
      var rootSpan = el('span', 'dir', data.label);
      rootLi.appendChild(rootSpan);
      rootLi.appendChild(build(data.items));
      root.appendChild(rootLi);
      host.appendChild(root);

      function build(items) {
        var ul = el('ul');
        items.forEach(function (it) {
          var li = el('li');
          var btn = el('button', it.dir ? 'dir' : null, it.n);
          btn.type = 'button';
          btn.addEventListener('click', function () {
            host.querySelectorAll('button').forEach(function (b) { b.classList.remove('is-sel'); });
            btn.classList.add('is-sel');
            show(it);
          });
          li.appendChild(btn);
          if (it.items) li.appendChild(build(it.items));
          ul.appendChild(li);
        });
        return ul;
      }

      function show(it) {
        if (!noteHost) return;
        noteHost.innerHTML = '';
        var lb = el('span', 'label');
        lb.textContent = it.n;
        lb.setAttribute('dir', 'ltr');
        lb.style.fontFamily = 'var(--font-mono)';
        lb.style.fontSize = '.72rem';
        noteHost.appendChild(lb);
        noteHost.appendChild(el('p', null, it.d));
      }

      show({ n: data.label, d: data.note });
    });
  }

  /* ==========================================================
     6. סימולטור טבעות טעינה
     ========================================================== */
  var BRAIN_FILES = [
    { path: 'CORE.md', ring: 0, when: [], note: 'נטען תמיד' },
    { path: 'company/identity.md', ring: 1, when: ['proposal', 'content', 'reply'] },
    { path: 'company/offering.md', ring: 1, when: ['proposal', 'reply'] },
    { path: 'company/icp.md', ring: 1, when: ['proposal', 'negotiation'] },
    { path: 'company/pricing.md', ring: 1, when: ['proposal', 'negotiation'], confidential: true },
    { path: 'playbooks/proposal.md', ring: 1, when: ['proposal'] },
    { path: 'playbooks/editorial.md', ring: 1, when: ['content'] },
    { path: 'decisions/2026-pricing-model.md', ring: 2, when: [] },
    { path: 'examples/won-proposal-2026-03.md', ring: 2, when: [] }
  ];

  var BRAIN_TASKS = [
    { id: 'proposal', label: 'כתיבת הצעת מחיר', external: false },
    { id: 'negotiation', label: 'מענה ללקוח בנגוציאציה', external: false },
    { id: 'content', label: 'כתיבת מאמר לבלוג', external: false },
    { id: 'reply', label: 'תוכן פומבי / פלט לצד שלישי', external: true }
  ];

  function initRings() {
    var host = $('[data-demo-rings]');
    if (!host) return;
    host.innerHTML = '';

    var state = { task: 'proposal' };

    var l = el('label', 'ctrl');
    var head = el('span');
    head.appendChild(el('span', null, 'המשימה שעל הפרק'));
    l.appendChild(head);
    var sel = el('select');
    sel.setAttribute('aria-label', 'בחירת משימה');
    sel.id = 'brain-task';
    sel.name = 'brain-task';
    BRAIN_TASKS.forEach(function (t) {
      var o = el('option', null, t.label);
      o.value = t.id;
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () { state.task = sel.value; render(); });
    l.appendChild(sel);
    host.appendChild(l);

    var list = el('div', 'rings');
    host.appendChild(list);
    var readout = el('div', 'readout');
    host.appendChild(readout);

    function render() {
      var task = null;
      BRAIN_TASKS.forEach(function (t) { if (t.id === state.task) task = t; });
      list.innerHTML = '';
      var loaded = 0, blocked = 0, skipped = 0;

      BRAIN_FILES.forEach(function (f) {
        var on = f.ring === 0 || (f.ring === 1 && f.when.indexOf(state.task) > -1);
        var isBlocked = false;
        if (on && f.confidential && task.external) { on = false; isBlocked = true; }

        var row = el('div', 'ring-file' + (isBlocked ? ' is-blocked' : on ? ' is-on' : ' is-off'));
        row.appendChild(el('b', null, f.path));
        var st;
        if (isBlocked) st = 'חסום · never_in: output to third parties';
        else if (f.ring === 0) st = 'ring 0 · נטען תמיד';
        else if (on) st = 'ring 1 · load_when: ' + state.task;
        else if (f.ring === 1) st = 'ring 1 · לא רלוונטי למשימה';
        else st = 'ring 2 · לא נטען, נחפש';
        row.appendChild(el('span', 'st', st));
        list.appendChild(row);

        if (isBlocked) blocked++;
        else if (on) loaded++;
        else skipped++;
      });

      readout.innerHTML = '';
      readout.appendChild(stat('קבצים שנטענו', String(loaded), 'down'));
      readout.appendChild(stat('נשארו בחוץ', String(skipped), ''));
      readout.appendChild(stat('נחסמו במפורש', String(blocked), blocked ? 'up' : ''));
      readout.appendChild(stat('מתוך סך הקבצים', String(BRAIN_FILES.length), ''));

      function stat(label, value, cls) {
        var d = el('div');
        d.appendChild(el('span', null, label));
        d.appendChild(el('b', cls || null, value));
        return d;
      }
    }

    render();
  }

  /* ==========================================================
     07. ארגז הכלים — 40 התוספות, עם סינון לפי קטגוריה וחיפוש
     המקור הוא SITE.toolCategories. url ריק = קישור להשלמה,
     וזה נאמר במפורש ליד הפריט במקום להמציא כתובת.
     ========================================================== */
  function initToolbox() {
    var host = document.querySelector('[data-toolbox]');
    if (!host || !window.SITE) return;
    var cats = window.SITE.toolCategories || [];
    var state = { cat: 'all', q: '' };

    var bar = el('div', 'ctrl-row tool-bar');
    var pills = el('div', 'tool-pills');
    var all = [{ id: 'all', title: 'הכל', mono: 'ALL 40' }].concat(cats);
    all.forEach(function (c) {
      var b = el('button', 'btn-ghost', c.title);
      b.type = 'button';
      b.setAttribute('data-cat', c.id);
      b.setAttribute('aria-pressed', c.id === 'all' ? 'true' : 'false');
      b.addEventListener('click', function () {
        state.cat = c.id;
        pills.querySelectorAll('button').forEach(function (x) {
          x.setAttribute('aria-pressed', x.getAttribute('data-cat') === c.id ? 'true' : 'false');
        });
        render();
      });
      pills.appendChild(b);
    });
    bar.appendChild(pills);

    var fw = el('div', 'ctrl tool-find');
    var lb = el('label', 'label', 'סינון בשם או בתיאור');
    var inp = document.createElement('input');
    inp.type = 'search';
    inp.className = 'tool-input';
    inp.setAttribute('placeholder', 'memory, MCP, skills…');
    lb.setAttribute('for', 'tool-q');
    inp.id = 'tool-q';
    inp.addEventListener('input', function () { state.q = inp.value.trim().toLowerCase(); render(); });
    fw.appendChild(lb);
    fw.appendChild(inp);
    bar.appendChild(fw);

    var out = el('div', 'tool-out');
    var count = el('p', 'source-note hairline-top');

    host.innerHTML = '';
    host.appendChild(bar);
    host.appendChild(out);
    host.appendChild(count);

    function match(item) {
      if (!state.q) return true;
      return (item.name + ' ' + item.what).toLowerCase().indexOf(state.q) !== -1;
    }

    function render() {
      out.innerHTML = '';
      var shown = 0, missing = 0;
      cats.forEach(function (c) {
        if (state.cat !== 'all' && state.cat !== c.id) return;
        var items = c.items.filter(match);
        if (!items.length) return;

        var group = el('section', 'tool-group');
        group.id = 'cat-' + c.id;
        var head = el('div', 'tool-group__head');
        var h = el('h3', null, c.title);
        head.appendChild(h);
        var m = el('span', 'mono mono-dim', c.mono);
        m.setAttribute('dir', 'ltr');
        head.appendChild(m);
        group.appendChild(head);
        group.appendChild(el('p', 'tool-group__note', c.note));

        var list = el('ol', 'tool-list');
        items.forEach(function (it) {
          shown++;
          var li = el('li', 'tool');
          var n = el('span', 'tool__n', it.n < 10 ? '0' + it.n : String(it.n));
          n.setAttribute('dir', 'ltr');
          li.appendChild(n);
          var body = el('div');
          var nm = el('b', null, it.name);
          nm.setAttribute('dir', 'ltr');
          body.appendChild(nm);
          body.appendChild(el('span', null, it.what));
          if (!it.url) {
            missing++;
            body.appendChild(el('span', 'tool__gap', 'קישור להשלמה'));
          } else {
            var a = document.createElement('a');
            a.className = 'lat';
            a.href = it.url;
            a.target = '_blank';
            a.rel = 'noopener';
            a.textContent = it.url.replace(/^https?:\/\//, '');
            body.appendChild(a);
          }
          li.appendChild(body);
          list.appendChild(li);
        });
        group.appendChild(list);
        out.appendChild(group);
      });

      if (!shown) {
        out.appendChild(el('p', 'muted', 'אין פריט שתואם את הסינון. נסי מילה אחרת.'));
        count.textContent = '';
        return;
      }
      count.textContent = 'מוצגים ' + shown + ' פריטים' +
        (missing ? ' · ' + missing + ' מהם ממתינים להשלמת קישור' : '') + '.';
    }

    render();
  }

  /* ==========================================================
     08. מכ"ם — מה נכנס למעקב ומה המצב שלו
     ========================================================== */
  function initRadar() {
    var host = document.querySelector('[data-radar]');
    if (!host || !window.SITE) return;
    var only = host.getAttribute('data-radar');
    var rows = (window.SITE.radar || []).filter(function (r) {
      return !only || only === 'all' || r.page === only;
    });
    if (!rows.length) return;

    host.innerHTML = '';
    rows.forEach(function (r) {
      var card = el('div', 'radar');
      var head = el('div', 'radar__head');
      var nm = el('b', null, r.name);
      nm.setAttribute('dir', 'ltr');
      head.appendChild(nm);
      var st = el('span', 'tag ' + (r.status === 'unverified' ? 'tag--gap' : 'tag--l2'),
        r.status === 'unverified' ? 'טרם נבדק' : 'בבחינה');
      head.appendChild(st);
      card.appendChild(head);
      card.appendChild(el('p', null, r.what));
      var why = el('p', 'source-note hairline-top', r.why);
      card.appendChild(why);
      host.appendChild(card);
    });
  }

  /* ==========================================================
     9. ספריות מומלצות
     נגזר מ-window.SITE.libraries. כל כתובת, רישיון ופקודה שם
     אומתו מול ה-README של ה-repo — ולכן אין כאן שום מחרוזת
     שנכתבה מהזיכרון. פקודות ההתקנה מוגשות ב-.code, כדי
     שכפתור ההעתקה של app.js יעבוד עליהן בלי קוד נוסף.
     ========================================================== */
  function initLibs() {
    var host = $('[data-libs]');
    if (!host || !window.SITE) return;
    var rows = window.SITE.libraries || [];
    if (!rows.length) return;

    host.innerHTML = '';
    var list = el('div', 'lib-list');

    rows.forEach(function (r) {
      var card = el('article', 'lib');

      var head = el('div', 'lib__head');
      var nm = el('b', null, r.name);
      nm.setAttribute('dir', 'ltr');
      head.appendChild(nm);
      head.appendChild(el('span', 'tag tag--l1', r.cat));
      card.appendChild(head);

      var meta = el('div', 'lib__meta');
      if (r.license) meta.appendChild(el('span', 'tag lat', r.license));
      if (r.state) meta.appendChild(el('span', 'tag', r.state));
      (r.tags || []).forEach(function (t) { meta.appendChild(el('span', 'tag lat', t)); });
      card.appendChild(meta);

      card.appendChild(el('p', null, r.what));

      if ((r.install || []).length) card.appendChild(wrapCmds(r.install));

      if (r.why) card.appendChild(el('p', 'lib__why', r.why));
      if (r.note) card.appendChild(el('p', 'source-note', r.note));

      var links = el('div', 'lib__meta');
      if (r.url) links.appendChild(link(r.url, shortUrl(r.url)));
      if (r.site) links.appendChild(link(r.site, shortUrl(r.site)));
      if (links.childNodes.length) card.appendChild(links);

      list.appendChild(card);
    });

    host.appendChild(list);

    function wrapCmds(install) {
      var box = el('div', 'lib__cmds');
      install.forEach(function (i) {
        var code = el('div', 'code');
        var h = el('div', 'code__head');
        h.appendChild(el('span', 'code__label', i.label));
        var btn = el('button', 'copy', 'העתקה');
        btn.type = 'button';
        h.appendChild(btn);
        code.appendChild(h);
        var pre = el('pre');
        pre.appendChild(el('code', null, (i.cmd || []).join('\n')));
        code.appendChild(pre);
        box.appendChild(code);
      });
      return box;
    }
    function link(href, txt) {
      var a = el('a', 'lat lib__link', txt);
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener';
      return a;
    }
    function shortUrl(u) {
      return u.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
  }

  /* ==========================================================
     10. מילון מונחים
     נגזר מ-window.SITE.glossary. ה-slug חייב להיות זהה לזה של
     app.js, כי החיפוש מקשר ל-glossary.html#g-<slug>.
     ========================================================== */
  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9֐-׿]+/g, '-').replace(/^-|-$/g, '');
  }

  function initGlossary() {
    var host = $('[data-glossary]');
    if (!host || !window.SITE) return;
    var rows = (window.SITE.glossary || []).slice();
    if (!rows.length) return;

    // מיפוי נושא → קובץ וכותרת, כדי שכל מונח יוביל לעמוד שמסביר אותו
    var topics = {};
    (window.SITE.topics || []).forEach(function (t) { topics[t.id] = t; });

    rows.sort(function (a, b) {
      return String(a.term).toLowerCase().localeCompare(String(b.term).toLowerCase(), 'en');
    });

    host.innerHTML = '';

    var bar = el('div', 'gloss-bar');
    var fw = el('div', 'ctrl');
    var lb = el('label', 'label', 'סינון במונח, בתרגום או בהגדרה');
    lb.setAttribute('for', 'gloss-q');
    var inp = document.createElement('input');
    inp.type = 'search';
    inp.className = 'tool-input';
    inp.id = 'gloss-q';
    inp.setAttribute('placeholder', 'context, ring, MCP…');
    fw.appendChild(lb);
    fw.appendChild(inp);
    bar.appendChild(fw);
    // התווית בעברית נשארת מחוץ לספן ה-mono, כי לפונט ה-mono אין גליפים עבריים
    var countWrap = el('span', 'label label--dim');
    countWrap.appendChild(document.createTextNode('מוצגים '));
    var count = el('span', 'gloss-count');
    countWrap.appendChild(count);
    countWrap.appendChild(document.createTextNode(' מונחים'));
    bar.appendChild(countWrap);
    host.appendChild(bar);

    var out = el('div');
    host.appendChild(out);

    inp.addEventListener('input', function () { render(inp.value.trim().toLowerCase()); });

    function render(q) {
      out.innerHTML = '';
      var shown = 0, letter = null, group = null, list = null;

      rows.forEach(function (g) {
        if (q && (g.term + ' ' + (g.he || '') + ' ' + g.def).toLowerCase().indexOf(q) === -1) return;
        shown++;

        var ch = firstChar(g.term);
        if (ch !== letter) {
          letter = ch;
          group = el('section', 'gloss-group');
          group.appendChild(el('p', 'gloss-letter', ch));
          list = el('div', 'gloss-list');
          group.appendChild(list);
          out.appendChild(group);
        }

        var row = el('div', 'gloss');
        row.id = 'g-' + slug(g.term);

        var left = el('div');
        var nm = el('b', null, g.term);
        nm.setAttribute('dir', 'ltr');
        left.appendChild(nm);
        if (g.he) left.appendChild(el('span', 'label label--dim gloss__he', g.he));
        row.appendChild(left);

        var right = el('div');
        right.appendChild(el('p', null, g.def));
        var t = topics[g.topic];
        if (t) {
          var a = el('a', 'gloss__go', 'נושא ' + t.num + ' · ' + t.title + ' →');
          a.href = t.file;
          right.appendChild(a);
        }
        row.appendChild(right);
        list.appendChild(row);
      });

      if (!shown) {
        out.appendChild(el('p', 'muted', 'אין מונח שתואם את הסינון. נסי מילה אחרת.'));
        countWrap.hidden = true;
        return;
      }
      countWrap.hidden = false;
      count.textContent = shown + ' / ' + rows.length;
      highlight();
    }

    function firstChar(term) {
      var c = String(term).charAt(0);
      if (/[a-zA-Z]/.test(c)) return c.toUpperCase();
      if (/[֐-׿]/.test(c)) return c;
      return '#';
    }

    // סימון היעד שהגיעו אליו מהחיפוש או מקישור חיצוני
    function highlight() {
      var h = location.hash;
      if (!h || h.indexOf('#g-') !== 0) return;
      var target = document.getElementById(h.slice(1));
      if (!target) return;
      var prev = out.querySelector('.is-target');
      if (prev) prev.classList.remove('is-target');
      target.classList.add('is-target');
    }

    render('');
    if (location.hash.indexOf('#g-') === 0) {
      var t0 = document.getElementById(location.hash.slice(1));
      if (t0) t0.scrollIntoView({ block: 'center' });
    }
    window.addEventListener('hashchange', highlight);
  }

  /* ==========================================================
     11. מקורות
     מפריד בין מקור עם כתובת מאומתת לבין כתובת שחסרה. כתובת
     ריקה מוצגת כפער מסומן — ולא מומצאת.
     ========================================================== */
  function initSources() {
    var hosts = document.querySelectorAll('[data-sources]');
    if (!hosts.length || !window.SITE) return;
    var all = window.SITE.sources || [];
    if (!all.length) return;

    Array.prototype.forEach.call(hosts, function (host) {
      var want = host.getAttribute('data-sources'); // linked | gaps | all
      var rows = all.filter(function (s) {
        if (want === 'linked') return !!s.url;
        if (want === 'gaps') return !s.url;
        return true;
      });

      host.innerHTML = '';
      if (!rows.length) {
        host.appendChild(el('p', 'muted', 'אין פריטים בקטגוריה הזאת.'));
        return;
      }

      rows.forEach(function (s) {
        var row = el('div', 'src');
        var head = el('div', 'src__head');
        head.appendChild(el('b', null, s.title));
        if (s.who) head.appendChild(el('span', 'tag', s.who));
        if (!s.url) head.appendChild(el('span', 'tag tag--gap', 'קישור להשלמה'));
        row.appendChild(head);
        if (s.note) row.appendChild(el('p', null, s.note));
        if (s.url) {
          var a = el('a', 'lat', s.url.replace(/^https?:\/\//, '').replace(/\/$/, ''));
          a.href = s.url;
          a.target = '_blank';
          a.rel = 'noopener';
          row.appendChild(a);
        }
        host.appendChild(row);
      });

      var badge = document.querySelector('[data-sources-count="' + want + '"]');
      if (badge) badge.textContent = rows.length + ' / ' + all.length;
    });
  }

  /* ==========================================================
     הרצה
     ========================================================== */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    initCost();
    initRot();
    initAgents();
    initDial();
    initTree();
    initRings();
    initToolbox();
    initRadar();
    initLibs();
    initGlossary();
    initSources();
  });
})();
