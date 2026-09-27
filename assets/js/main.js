(() => {
  const script = document.currentScript;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  /* ───────── Tabs ─────────
     Tabs labelled with an OS open for readers on that OS; choosing a tab
     selects the tab with the same label (or OS) in every tab group. */
  const ua = navigator.userAgent;
  const userOS = /Windows/.test(ua) ? 'windows' : /Mac/.test(ua) ? 'mac' : (/Linux|X11/.test(ua) && !/Android/.test(ua)) ? 'linux' : null;
  const groups = [...document.querySelectorAll('[data-tabs]')];
  let uid = 0;

  const tabsOf = root => [...root.querySelectorAll(':scope > .tabs > [data-tab]')];
  const panelsOf = root => [...root.querySelectorAll(':scope > [data-panel]')];

  function show(root, key) {
    tabsOf(root).forEach(t => {
      const on = t.dataset.tab === key;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
    });
    panelsOf(root).forEach(p => { p.hidden = p.dataset.panel !== key; });
  }

  function pick(root, pref) {
    const tabs = tabsOf(root);
    if (pref.label) {
      const t = tabs.find(t => t.dataset.label === pref.label);
      if (t) return t;
    }
    if (pref.os) {
      const exact = tabs.find(t => t.dataset.os === pref.os);
      if (exact) return exact;
      return tabs.find(t => (t.dataset.os || '').split(' ').includes(pref.os));
    }
    return null;
  }

  groups.forEach(root => {
    const tabs = tabsOf(root);
    const panels = panelsOf(root);
    tabs.forEach((t, i) => {
      const id = `tab-${++uid}`;
      t.id = id;
      const panel = panels.find(p => p.dataset.panel === t.dataset.tab);
      if (panel) { panel.id = `${id}-panel`; t.setAttribute('aria-controls', panel.id); panel.setAttribute('aria-labelledby', id); }
      t.addEventListener('click', () => {
        show(root, t.dataset.tab);
        const single = t.dataset.os && !t.dataset.os.includes(' ') ? t.dataset.os : null;
        const pref = { label: t.dataset.label, os: single };
        if (t.dataset.label) store.set('rfswift-tab', t.dataset.label);
        if (single) store.set('rfswift-os', single);
        groups.forEach(other => {
          if (other === root) return;
          const match = pick(other, pref);
          if (match) show(other, match.dataset.tab);
        });
      });
      t.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        next.focus(); next.click();
      });
    });
    const initial = pick(root, { label: store.get('rfswift-tab'), os: store.get('rfswift-os') || userOS })
      || tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
    if (initial) show(root, initial.dataset.tab);
  });

  /* ───────── Copy buttons ───────── */
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const code = btn.closest('.code').querySelector('code');
    const text = code.innerText.replace(/\n$/, '');
    const label = btn.querySelector('span');
    const done = ok => {
      if (!label) return;
      label.textContent = ok ? 'Copied' : 'Press Ctrl+C';
      setTimeout(() => { label.textContent = 'Copy'; }, 1600);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => done(true), () => done(false));
    else done(false);
  });

  /* ───────── Mobile menus ───────── */
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navLinks = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
    });
  }

  const sidebar = document.getElementById('docs-sidebar');
  const backdrop = document.querySelector('.sidebar-backdrop');
  const setSidebar = open => {
    if (!sidebar) return;
    sidebar.classList.toggle('open', open);
    if (backdrop) backdrop.hidden = !open;
    document.body.classList.toggle('no-scroll', open);
  };
  document.querySelectorAll('[data-sidebar-open]').forEach(b => b.addEventListener('click', () => setSidebar(true)));
  document.querySelectorAll('[data-sidebar-close]').forEach(b => b.addEventListener('click', () => setSidebar(false)));
  if (sidebar) {
    // Bring the current page into view inside the sidebar only (never scroll the page itself).
    const current = sidebar.querySelector('[aria-current=page]');
    if (current) {
      const top = current.getBoundingClientRect().top - sidebar.getBoundingClientRect().top;
      if (top > sidebar.clientHeight * 0.6) sidebar.scrollTop += top - sidebar.clientHeight / 2;
    }
  }

  /* ───────── Table filters (long tables such as the tool lists) ───────── */
  document.querySelectorAll('.prose .table-wrap').forEach(wrap => {
    const rows = [...wrap.querySelectorAll('tbody tr')];
    if (rows.length < 15) return;
    const box = document.createElement('label');
    box.className = 'table-filter';
    box.innerHTML = '<i class="ph ph-funnel-simple" aria-hidden="true"></i><input type="search" placeholder="Filter this table…" aria-label="Filter this table"><span></span>';
    const input = box.querySelector('input');
    const count = box.querySelector('span');
    const update = () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      rows.forEach(r => { const hit = !q || r.textContent.toLowerCase().includes(q); r.hidden = !hit; if (hit) shown++; });
      count.textContent = `${shown} of ${rows.length}`;
    };
    input.addEventListener('input', update);
    update();
    wrap.before(box);
  });

  /* ───────── On-page TOC highlighting ───────── */
  const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')].filter(a => a.getAttribute('href').length > 1);
  if (tocLinks.length) {
    const targets = tocLinks.map(a => document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)))).filter(Boolean);
    let ticking = false;
    const spy = () => {
      ticking = false;
      let active = targets[0];
      for (const h of targets) { if (h.getBoundingClientRect().top < 140) active = h; else break; }
      tocLinks.forEach(a => a.classList.toggle('active', active && a.getAttribute('href') === `#${active.id}`));
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
    spy();
  }

  /* ───────── Search ───────── */
  const dialog = document.getElementById('search-dialog');
  if (!dialog) return;
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const indexURL = script && script.dataset.searchIndex;
  let index = null, loading = null, hits = [], selected = 0, lastFocus = null;

  const suggestions = [
    ['Install RF Swift', '/docs/getting-started/'],
    ['Quick start', '/docs/quick-start/'],
    ['Tutorial: your first signal', '/docs/first-signal/'],
    ['Choose a toolbox', '/docs/guide/list-of-images/'],
    ['FAQ & troubleshooting', '/docs/faq/'],
    ['Command reference', '/docs/commands/']
  ];

  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function load() {
    if (index) return Promise.resolve(index);
    if (!loading) {
      loading = fetch(indexURL).then(r => r.json()).then(data => {
        index = data.map(r => ({ ...r, tl: r.t.toLowerCase(), hl: (r.h || '').toLowerCase(), cl: (r.c || '').toLowerCase() }));
        return index;
      }).catch(() => { loading = null; return []; });
    }
    return loading;
  }

  function snippet(text, words) {
    const lower = text.toLowerCase();
    let pos = -1;
    for (const w of words) { const p = lower.indexOf(w); if (p !== -1 && (pos === -1 || p < pos)) pos = p; }
    let start = Math.max(0, pos - 60);
    if (start > 0) { const sp = text.indexOf(' ', start); if (sp !== -1 && sp < pos) start = sp + 1; }
    let out = esc(text.slice(start, start + 200));
    for (const w of words) out = out.replace(new RegExp(`(${reEsc(esc(w))})`, 'gi'), '<mark>$1</mark>');
    return (start > 0 ? '… ' : '') + out;
  }

  function mark(text, words) {
    let out = esc(text);
    for (const w of words) out = out.replace(new RegExp(`(${reEsc(esc(w))})`, 'gi'), '<mark>$1</mark>');
    return out;
  }

  function search(q) {
    const query = q.trim().toLowerCase();
    const words = query.split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const scored = [];
    for (const r of index) {
      let score = 0;
      let ok = true;
      for (const w of words) {
        const inT = r.tl.includes(w), inH = r.hl.includes(w), inC = r.cl.includes(w);
        if (!inT && !inH && !inC) { ok = false; break; }
        if (inT) score += r.tl.startsWith(w) || r.tl.includes(` ${w}`) ? 14 : 10;
        if (inH) score += r.hl.startsWith(w) || r.hl.includes(` ${w}`) ? 10 : 7;
        if (inC) score += 1 + Math.min(r.cl.split(w).length - 1, 6) * 0.4;
      }
      if (!ok) continue;
      if (words.length > 1) {
        if (r.tl.includes(query)) score += 20;
        if (r.hl.includes(query)) score += 12;
        if (r.cl.includes(query)) score += 4;
      }
      if (!r.h && words.some(w => r.tl.includes(w))) score += 3;
      if (r.l === 'beginner') score += 1.5;
      score += ({ 'Start here': 2, 'Everyday use': 1.5, 'Platforms & engines': 1, 'Build & contribute': -1 })[r.g] || 0;
      scored.push({ r, score });
    }
    scored.sort((a, b) => b.score - a.score);
    const perPage = {};
    const out = [];
    for (const s of scored) {
      const page = s.r.u.split('#')[0];
      perPage[page] = (perPage[page] || 0) + 1;
      if (perPage[page] > 3) continue;
      out.push(s.r);
      if (out.length >= 24) break;
    }
    return { list: out, words };
  }

  function render() {
    const q = input.value;
    if (!q.trim()) {
      hits = suggestions.map(([t, u]) => ({ t, u }));
      results.innerHTML = '<div class="search-group">Popular pages</div>' + hits.map((h, i) =>
        `<a class="search-hit" role="option" href="${h.u}" data-i="${i}"><i class="ph ph-arrow-right"></i><span class="search-hit-text"><span class="search-hit-title">${esc(h.t)}</span></span></a>`).join('');
      select(0);
      return;
    }
    if (!index) { results.innerHTML = '<div class="search-empty">Loading the index…</div>'; load().then(render); return; }
    const { list, words } = search(q);
    hits = list;
    if (!list.length) {
      results.innerHTML = `<div class="search-empty">No results for “${esc(q)}”.<br>Try fewer or different words, or ask on <a href="https://discord.gg/NS3HayKrpA">Discord</a>.</div>`;
      return;
    }
    results.innerHTML = list.map((r, i) => {
      const title = r.h ? `${mark(r.t, words)} <span>› ${mark(r.h, words)}</span>` : mark(r.t, words);
      const text = r.c ? snippet(r.c, words) : esc(r.g || '');
      return `<a class="search-hit" role="option" href="${r.u}" data-i="${i}"><i class="ph ${r.h ? 'ph-hash' : 'ph-file-text'}"></i><span class="search-hit-text"><span class="search-hit-title">${title}</span><span class="search-hit-snippet">${text}</span></span></a>`;
    }).join('');
    select(0);
  }

  function select(i) {
    const items = [...results.querySelectorAll('.search-hit')];
    if (!items.length) return;
    selected = (i + items.length) % items.length;
    items.forEach((el, j) => el.setAttribute('aria-selected', j === selected));
    items[selected].scrollIntoView({ block: 'nearest' });
  }

  function open() {
    lastFocus = document.activeElement;
    dialog.hidden = false;
    document.body.classList.add('no-scroll');
    setSidebar(false);
    input.focus();
    input.select();
    render();
    load();
  }

  function close() {
    dialog.hidden = true;
    document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll('[data-search-open]').forEach(b => b.addEventListener('click', open));
  dialog.querySelectorAll('[data-search-close]').forEach(b => b.addEventListener('click', close));
  input.addEventListener('input', render);
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); select(selected + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); select(selected - 1); }
    else if (e.key === 'Enter') {
      const el = results.querySelector('.search-hit[aria-selected=true]');
      if (el) { e.preventDefault(); close(); location.href = el.getAttribute('href'); }
    }
  });
  results.addEventListener('mousemove', e => {
    const el = e.target.closest('.search-hit');
    if (el && Number(el.dataset.i) !== selected) select(Number(el.dataset.i));
  });
  results.addEventListener('click', e => { if (e.target.closest('.search-hit')) close(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!dialog.hidden) close();
      else if (sidebar && sidebar.classList.contains('open')) setSidebar(false);
      return;
    }
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
      e.preventDefault();
      if (dialog.hidden) open(); else close();
    }
  });
  if (/Mac/.test(ua)) document.querySelectorAll('.search-trigger kbd').forEach(k => { k.textContent = '⌘ K'; });
})();
