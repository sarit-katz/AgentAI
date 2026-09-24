/* ============================================================
   app.js - התנהגות גלובלית: theme, ניווט, חיפוש, אקורדיונים,
   העתקה, תוכן עניינים, checklist עם התקדמות.
   בלי תלויות. בלי fetch - הכל עובד גם ב-file://
   ============================================================ */
(function () {
  'use strict';

  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* מצב פרטי */ } }
  };

  /* ---------- 1. Theme ---------- */
  function initTheme() {
    // בהיר הוא ברירת המחדל של האתר, גם כשהמערכת מוגדרת כהה - הערכה הבהירה היא
    // השפה החזותית של האתר. כהה נכנס רק אם נבחר מפורשות. שתיהן נבדקו לניגודיות.
    var saved = LS.get('kb-theme', null);
    apply(saved === 'dark');

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-theme-toggle]');
      if (!btn) return;
      var next = document.documentElement.getAttribute('data-theme') !== 'dark';
      apply(next);
      LS.set('kb-theme', next ? 'dark' : 'light');
    });

    function apply(isDark) {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      var labels = document.querySelectorAll('[data-theme-toggle]');
      for (var i = 0; i < labels.length; i++) {
        labels[i].textContent = isDark ? 'בהיר' : 'כהה';
        labels[i].setAttribute('aria-label', isDark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה');
      }
    }
  }

  /* ---------- 2. ניווט ---------- */
  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('.nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    // סימון העמוד הנוכחי
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var links = document.querySelectorAll('.nav a');
    for (var i = 0; i < links.length; i++) {
      var href = (links[i].getAttribute('href') || '').split('/').pop().toLowerCase();
      if (href === here) links[i].setAttribute('aria-current', 'page');
    }
  }

  /* ---------- 3. העתקת קוד ---------- */
  function initCopy() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.copy');
      if (!btn) return;
      var box = btn.closest('.code');
      var pre = box && box.querySelector('pre');
      if (!pre) return;
      var text = pre.innerText;
      var done = function () {
        var old = btn.textContent;
        btn.textContent = 'הועתק';
        btn.classList.add('is-done');
        setTimeout(function () { btn.textContent = old; btn.classList.remove('is-done'); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }

      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (err) { btn.textContent = 'העתקה נכשלה'; }
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------- 4. FAQ ---------- */
  function initFaq() {
    document.addEventListener('click', function (e) {
      var q = e.target.closest('.faq-q');
      if (!q) return;
      q.setAttribute('aria-expanded', q.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    });
  }

  /* ---------- 5. תוכן עניינים + scrollspy ---------- */
  function initToc() {
    var toc = document.querySelector('[data-toc]');
    if (!toc) return;
    var heads = document.querySelectorAll('main h2[id]');
    if (!heads.length) { toc.remove(); return; }

    var ol = document.createElement('ol');
    var map = {};
    for (var i = 0; i < heads.length; i++) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + heads[i].id;
      a.textContent = heads[i].getAttribute('data-short') || heads[i].textContent.trim();
      li.appendChild(a);
      ol.appendChild(li);
      map[heads[i].id] = a;
    }
    toc.appendChild(ol);

    if (!('IntersectionObserver' in window)) return;
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) {
          if (current) current.classList.remove('is-active');
          current = map[entries[j].target.id];
          if (current) current.classList.add('is-active');
        }
      }
    }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
    for (var k = 0; k < heads.length; k++) io.observe(heads[k]);
  }

  /* ---------- 6. checklist עם התקדמות ---------- */
  function initChecklists() {
    var hosts = document.querySelectorAll('[data-checklist]');
    if (!hosts.length || !window.SITE) return;

    for (var i = 0; i < hosts.length; i++) {
      (function (host) {
        var key = host.getAttribute('data-checklist');
        var items = (window.SITE.checklists || {})[key] || [];
        if (!items.length) return;
        var saved = LS.get('kb-check-' + key, '').split(',');

        var bar = document.createElement('div');
        bar.className = 'progress';
        bar.innerHTML = '<span class="progress__val" data-val>0%</span><div class="progress__bar"><i style="inline-size:0"></i></div>';

        var list = document.createElement('div');
        for (var n = 0; n < items.length; n++) {
          var label = document.createElement('label');
          label.className = 'task';
          var cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.value = String(n);
          if (saved.indexOf(String(n)) > -1) cb.checked = true;
          var sp = document.createElement('span');
          sp.textContent = items[n];
          label.appendChild(cb);
          label.appendChild(sp);
          list.appendChild(label);
        }
        host.appendChild(list);
        host.appendChild(bar);

        var fill = bar.querySelector('i');
        var val = bar.querySelector('[data-val]');
        function sync() {
          var boxes = list.querySelectorAll('input');
          var on = [];
          for (var m = 0; m < boxes.length; m++) if (boxes[m].checked) on.push(boxes[m].value);
          var pct = Math.round((on.length / boxes.length) * 100);
          fill.style.inlineSize = pct + '%';
          val.textContent = pct + '%';
          LS.set('kb-check-' + key, on.join(','));
          var badge = document.querySelector('[data-progress-badge="' + key + '"]');
          if (badge) badge.textContent = on.length + '/' + boxes.length;
        }
        list.addEventListener('change', sync);
        sync();
      })(hosts[i]);
    }
  }

  /* ---------- 7. חיפוש ---------- */
  function initSearch() {
    var panel = document.querySelector('[data-search]');
    if (!panel) return;
    var input = panel.querySelector('.search__input');
    var results = panel.querySelector('.search__results');
    var items = buildIndex();
    var sel = -1;

    function buildIndex() {
      var out = (window.SEARCH_INDEX || []).slice();
      var S = window.SITE;
      if (S) {
        (S.glossary || []).forEach(function (g) {
          out.push({ title: g.term + (g.he ? ' - ' + g.he : ''), page: 'glossary.html', hash: '#g-' + slug(g.term), kind: 'מילון', text: g.def });
        });
        (S.radar || []).forEach(function (r) {
          out.push({ title: r.name, page: r.page, hash: '#radar', kind: 'במעקב', text: r.what + ' ' + r.why });
        });
        (S.toolCategories || []).forEach(function (c) {
          (c.items || []).forEach(function (t) {
            out.push({ title: t.name, page: '05-toolbox.html', hash: '#' + c.id, kind: 'ארגז כלים', text: t.what });
          });
        });
      }
      return out;
    }

    function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9֐-׿]+/g, '-').replace(/^-|-$/g, ''); }

    function open() {
      panel.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      input.value = '';
      render('');
      input.focus();
    }
    function close() {
      panel.classList.remove('is-open');
      document.body.style.overflow = '';
      sel = -1;
    }

    function render(q) {
      q = q.trim();
      results.innerHTML = '';
      sel = -1;
      if (q.length < 2) {
        results.innerHTML = '<div class="search__empty">הקלידו שתי אותיות לפחות. החיפוש עובר על כל עמודי האתר, על המילון ועל ארגז הכלים.</div>';
        return;
      }
      var needle = q.toLowerCase();
      var hits = [];
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var t = (it.title || '').toLowerCase();
        var x = (it.text || '').toLowerCase();
        var score = 0;
        if (t.indexOf(needle) > -1) score += 10;
        if (x.indexOf(needle) > -1) score += 3;
        if (score) hits.push({ it: it, score: score });
      }
      hits.sort(function (a, b) { return b.score - a.score; });
      if (!hits.length) {
        results.innerHTML = '<div class="search__empty">לא נמצא כלום עבור "' + esc(q) + '".</div>';
        return;
      }
      hits.slice(0, 24).forEach(function (h) {
        var a = document.createElement('a');
        a.href = h.it.page + (h.it.hash || '');
        a.innerHTML = '<span class="r-title">' + mark(h.it.title, q) + '</span>' +
          '<span class="r-ctx">' + (h.it.kind ? '<span class="mono mono-dim">' + esc(h.it.kind) + '</span> · ' : '') +
          mark(snippet(h.it.text || '', q), q) + '</span>';
        results.appendChild(a);
      });
    }

    function snippet(text, q) {
      var i = text.toLowerCase().indexOf(q.toLowerCase());
      if (i < 0) return text.slice(0, 120);
      var s = Math.max(0, i - 45);
      return (s > 0 ? '…' : '') + text.slice(s, s + 150) + (s + 150 < text.length ? '…' : '');
    }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function mark(s, q) {
      var e = esc(s);
      try {
        return e.replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>');
      } catch (err) { return e; }
    }

    function move(d) {
      var links = results.querySelectorAll('a');
      if (!links.length) return;
      if (sel > -1) links[sel].classList.remove('is-sel');
      sel = (sel + d + links.length) % links.length;
      links[sel].classList.add('is-sel');
      links[sel].scrollIntoView({ block: 'nearest' });
    }

    input.addEventListener('input', function () { render(input.value); });

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-search-open]')) { e.preventDefault(); open(); }
      else if (e.target.closest('.search__veil')) close();
    });

    document.addEventListener('keydown', function (e) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if (!panel.classList.contains('is-open')) {
        if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
          e.preventDefault(); open();
        }
        return;
      }
      if (e.key === 'Escape') { close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') {
        var links = results.querySelectorAll('a');
        if (sel > -1 && links[sel]) { location.href = links[sel].getAttribute('href'); }
        else if (links.length) { location.href = links[0].getAttribute('href'); }
      }
    });
  }

  /* ---------- 8. הרצה ---------- */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  initTheme(); // מוקדם, כדי למנוע הבהוב
  ready(function () {
    initNav();
    initCopy();
    initFaq();
    initToc();
    initChecklists();
    initSearch();
    var y = document.querySelector('[data-year]');
    if (y) y.textContent = new Date().getFullYear();
  });
})();
