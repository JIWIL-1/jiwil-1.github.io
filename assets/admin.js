/* 관리자 페이지: 내용 편집, 이미지·파일 첨부, 미리보기, GitHub 저장 */
(function () {
  'use strict';
  const { esc, sanitize } = PF;
  const $ = s => document.querySelector(s);

  /* ---------- 상태 ---------- */
  let C = null;            // 편집 중인 내용
  let saved = '';          // 마지막으로 저장(불러온) 내용의 JSON
  let view = 'site';       // 현재 화면
  const blobs = {};        // 대기 중인 파일 id -> blob URL
  const DRAFT = 'portfolio-draft', CFG = 'portfolio-github';

  /* ---------- DOM 도우미 ---------- */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    kids.flat().forEach(c => c != null && c !== false && el.append(c.nodeType ? c : document.createTextNode(c)));
    return el;
  }

  /* ---------- 대기 파일 저장소 (IndexedDB) ---------- */
  const idb = (() => {
    let dbp;
    const db = () => dbp || (dbp = new Promise((res, rej) => {
      const r = indexedDB.open('portfolio-admin', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('files');
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    }));
    const tx = async (mode, fn) => { const d = await db(); return new Promise((res, rej) => { const t = d.transaction('files', mode); const q = fn(t.objectStore('files')); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }); };
    return {
      put: (k, v) => tx('readwrite', s => s.put(v, k)),
      get: k => tx('readonly', s => s.get(k)),
      del: k => tx('readwrite', s => s.delete(k)),
      keys: () => tx('readonly', s => s.getAllKeys()),
    };
  })();
  async function addPending(file) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    await idb.put(id, { blob: file, name: file.name, type: file.type });
    blobs[id] = URL.createObjectURL(file);
    return id;
  }
  async function restorePending() {
    try {
      for (const k of await idb.keys()) { const v = await idb.get(k); if (v && v.blob) blobs[k] = URL.createObjectURL(v.blob); }
    } catch (e) { console.warn(e); }
  }
  const resolve = src => { const m = /^pending:(\w+)$/.exec(src || ''); return m ? (blobs[m[1]] || '') : (src || ''); };
  const pendingIds = obj => [...new Set((JSON.stringify(obj).match(/pending:(\w+)/g) || []).map(s => s.slice(8)))];

  /* ---------- GitHub ---------- */
  function cfg() {
    let c = {}; try { c = JSON.parse(localStorage.getItem(CFG) || sessionStorage.getItem(CFG) || '{}'); } catch (e) {}
    if (!c.owner && /\.github\.io$/.test(location.hostname)) {
      c.owner = location.hostname.split('.')[0];
      const seg = location.pathname.split('/').filter(Boolean);
      c.repo = seg.length && !/\.html$/.test(seg[0]) ? seg[0] : location.hostname;
    }
    c.branch = c.branch || 'main';
    return c;
  }
  const connected = () => { const c = cfg(); return !!(c.owner && c.repo && c.token); };
  async function gh(method, path, body) {
    const c = cfg();
    const r = await fetch(`https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}${path}`, {
      method, headers: { Authorization: 'Bearer ' + c.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined, cache: 'no-store'
    });
    if (r.status === 404 && method === 'GET') return null;
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const why = { 401: '토큰이 맞지 않거나 만료됐어요.', 403: '토큰에 이 저장소의 쓰기 권한이 없어요.', 404: '저장소를 찾지 못했어요. 아이디와 저장소 이름을 확인해 주세요.', 409: '다른 곳에서 먼저 수정됐어요. 새로고침 후 다시 저장해 주세요.', 422: '파일이 너무 크거나 형식이 맞지 않아요.' }[r.status];
      throw new Error((why || 'GitHub 요청이 실패했어요.') + ` (${r.status}${data.message ? ': ' + data.message : ''})`);
    }
    return data;
  }
  const filePath = p => '/contents/' + p.split('/').map(encodeURIComponent).join('/');
  async function ghGet(path) { return gh('GET', filePath(path) + '?ref=' + encodeURIComponent(cfg().branch)); }
  async function ghPut(path, b64, message, sha) { return gh('PUT', filePath(path), { message, content: b64, branch: cfg().branch, ...(sha ? { sha } : {}) }); }
  const utf8b64 = s => { const b = new TextEncoder().encode(s); let out = ''; for (let i = 0; i < b.length; i += 0x8000) out += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(out); };
  const b64utf8 = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g, '')), c => c.charCodeAt(0)));
  const blobB64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(blob); });
  const blobDataUrl = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });

  /* ---------- 상태 표시 ---------- */
  function status(text, cls) { const s = $('#status'); s.textContent = text; s.className = 'status ' + (cls || ''); }
  function banner(html, cls, actions) {
    const b = $('#banner'); b.className = 'banner ' + (cls || ''); b.innerHTML = '<span>' + html + '</span>'; b.hidden = false;
    (actions || []).forEach(([label, fn]) => b.append(h('button', { type: 'button', onclick: fn }, label)));
    b.append(h('button', { type: 'button', onclick: () => { b.hidden = true; }, 'aria-label': '알림 닫기' }, '닫기'));
  }
  const isDirty = () => JSON.stringify(C) !== saved;
  let draftTimer;
  function changed() {
    status(isDirty() ? '저장하지 않은 수정 있음' : '저장된 상태', isDirty() ? 'dirty' : 'ok');
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      try { if (isDirty()) localStorage.setItem(DRAFT, JSON.stringify({ content: C, base: saved, time: Date.now() })); else localStorage.removeItem(DRAFT); } catch (e) { console.warn(e); }
    }, 400);
  }
  function updateSaveBtn() { $('#btn-save').textContent = connected() ? 'GitHub에 저장' : '파일로 내보내기'; }

  /* ---------- 입력 컴포넌트 ---------- */
  function text(obj, key, label, o = {}) {
    const id = 'f' + Math.random().toString(36).slice(2, 8);
    const input = h(o.multi ? 'textarea' : 'input', { id, type: o.multi ? null : (o.type || 'text'), placeholder: o.ph || '', rows: o.rows });
    input.value = obj[key] ?? '';
    input.addEventListener('input', () => { obj[key] = o.type === 'number' ? (input.value === '' ? '' : +input.value) : input.value; changed(); o.onchange && o.onchange(); });
    return h('div', { class: 'field' }, label ? h('label', { for: id }, label) : null, input, o.hint ? h('div', { class: 'hint' }, o.hint) : null);
  }
  const ctrl = (arr, i, rerender) => h('div', { class: 'ctrl' },
    h('button', { type: 'button', title: '위로', 'aria-label': '위로', disabled: i === 0, onclick: () => { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; changed(); rerender(); } }, '↑'),
    h('button', { type: 'button', title: '아래로', 'aria-label': '아래로', disabled: i === arr.length - 1, onclick: () => { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; changed(); rerender(); } }, '↓'),
    h('button', { type: 'button', class: 'del', title: '삭제', 'aria-label': '삭제', onclick: () => { arr.splice(i, 1); changed(); rerender(); } }, '✕'));

  // 문자열 목록
  function strList(arr, label, ph, hint) {
    const box = h('div', { class: 'list' });
    const draw = () => {
      box.replaceChildren(...arr.map((v, i) => {
        const inp = h('input', { type: 'text', placeholder: ph, 'aria-label': label + ' ' + (i + 1) }); inp.value = v;
        inp.addEventListener('input', () => { arr[i] = inp.value; changed(); });
        return h('div', { class: 'item-row', style: 'grid-template-columns:1fr auto' }, inp, ctrl(arr, i, draw));
      }), h('button', { type: 'button', class: 'btn small add-row', onclick: () => { arr.push(''); changed(); draw(); box.querySelector('.item-row:last-of-type input')?.focus(); } }, '+ 항목 추가'));
    };
    draw();
    return h('div', { class: 'field' }, h('div', { class: 'label' }, label), box, hint ? h('div', { class: 'hint' }, hint) : null);
  }
  // 객체 목록 (예: [{label, value}])
  function objList(arr, label, fields, blank, hint) {
    const box = h('div', { class: 'list' });
    const cols = fields.map(f => f.w || '1fr').join(' ') + ' auto';
    const draw = () => {
      box.replaceChildren(...arr.map((v, i) => h('div', { class: 'item-row row', style: 'grid-template-columns:' + cols },
        ...fields.map(f => {
          const inp = h('input', { type: f.type || 'text', placeholder: f.ph || f.label, 'aria-label': f.label, min: f.min, max: f.max }); inp.value = v[f.key] ?? '';
          inp.addEventListener('input', () => { v[f.key] = f.type === 'number' ? +inp.value : inp.value; changed(); });
          return inp;
        }), ctrl(arr, i, draw))),
        h('button', { type: 'button', class: 'btn small add-row', onclick: () => { arr.push(JSON.parse(JSON.stringify(blank))); changed(); draw(); } }, '+ 항목 추가'));
    };
    draw();
    return h('div', { class: 'field' }, h('div', { class: 'label' }, label), box, hint ? h('div', { class: 'hint' }, hint) : null);
  }

  // 파일 고르기
  function pick(accept, multiple) {
    return new Promise(res => {
      const inp = h('input', { type: 'file', accept, multiple, style: 'display:none' });
      inp.addEventListener('change', () => { res([...inp.files]); inp.remove(); });
      document.body.append(inp); inp.click();
    });
  }
  const tooBig = f => { if (f.size > 25 * 1024 * 1024) { banner(`"${esc(f.name)}" 파일이 25MB보다 커요. 용량을 줄이거나 외부 링크(구글 드라이브 등)로 넣어 주세요.`, 'err'); return true; } return false; };

  // 이미지 하나
  function imageField(obj, key, label, hint) {
    const wrap = h('div', { class: 'field' });
    const draw = () => {
      const src = resolve(obj[key]);
      const thumb = h('div', { class: 'thumb', style: src ? `background-image:url("${src}")` : '' }, src ? '' : '이미지 없음');
      const url = h('input', { type: 'text', placeholder: '또는 이미지 주소(https://...) 붙여넣기', 'aria-label': label + ' 주소' });
      url.value = /^pending:/.test(obj[key] || '') ? '' : (obj[key] || '');
      url.addEventListener('change', () => { obj[key] = url.value.trim(); changed(); draw(); });
      wrap.replaceChildren(h('div', { class: 'label' }, label),
        h('div', { class: 'img-field' }, thumb, h('div', { class: 'btns' },
          h('button', { type: 'button', class: 'btn small', onclick: async () => { const [f] = await pick('image/*'); if (!f || tooBig(f)) return; obj[key] = 'pending:' + await addPending(f); changed(); draw(); } }, src ? '이미지 바꾸기' : '이미지 올리기'),
          src ? h('button', { type: 'button', class: 'btn small danger', onclick: () => { obj[key] = ''; changed(); draw(); } }, '이미지 빼기') : null,
          url)),
        hint ? h('div', { class: 'hint' }, hint) : null);
    };
    draw();
    return wrap;
  }
  // 이미지 여러 장
  function galleryField(arr, label, hint) {
    const wrap = h('div', { class: 'field' });
    const add = async files => { for (const f of files) { if (!f.type.startsWith('image/') || tooBig(f)) continue; arr.push('pending:' + await addPending(f)); } changed(); draw(); };
    const draw = () => {
      const drop = h('div', { class: 'drop', tabindex: 0, role: 'button', onclick: async () => add(await pick('image/*', true)), onkeydown: async e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); add(await pick('image/*', true)); } } }, '+ 이미지 추가\n(끌어다 놓아도 돼요)');
      drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
      drop.addEventListener('dragleave', () => drop.classList.remove('over'));
      drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('over'); add([...e.dataTransfer.files]); });
      wrap.replaceChildren(h('div', { class: 'label' }, label),
        h('div', { class: 'gallery' }, ...arr.map((s, i) => h('div', { class: 'g' }, h('div', { class: 'thumb', style: `background-image:url("${resolve(s)}")` }), ctrl(arr, i, draw))), drop),
        hint ? h('div', { class: 'hint' }, hint) : null);
    };
    draw();
    return wrap;
  }
  // 첨부 파일 목록
  function filesField(arr) {
    const box = h('div', { class: 'list' });
    const draw = () => {
      box.replaceChildren(...arr.map((f, i) => {
        const name = h('input', { type: 'text', placeholder: '파일 이름 (예: 시스템 기획서)', 'aria-label': '파일 이름' }); name.value = f.name || '';
        const info = h('input', { type: 'text', placeholder: '형식 (예: PDF · 24p)', 'aria-label': '파일 정보' }); info.value = f.info || '';
        const url = h('input', { type: 'text', placeholder: '올린 파일 또는 링크 주소', 'aria-label': '파일 주소' });
        url.value = /^pending:/.test(f.url || '') ? '올린 파일 (저장하면 업로드돼요)' : (f.url || '');
        url.readOnly = /^pending:/.test(f.url || '');
        name.addEventListener('input', () => { f.name = name.value; changed(); });
        info.addEventListener('input', () => { f.info = info.value; changed(); });
        url.addEventListener('input', () => { f.url = url.value.trim(); changed(); });
        const up = h('button', { type: 'button', class: 'btn small', onclick: async () => {
          const [file] = await pick(''); if (!file || tooBig(file)) return;
          f.url = 'pending:' + await addPending(file);
          if (!f.name) f.name = file.name.replace(/\.[^.]+$/, '');
          if (!f.info) f.info = (file.name.split('.').pop() || '').toUpperCase();
          changed(); draw();
        } }, '파일 올리기');
        return h('div', { class: 'item-row file-row' }, name, info, url, up, ctrl(arr, i, draw));
      }), h('button', { type: 'button', class: 'btn small add-row', onclick: () => { arr.push({ name: '', info: '', url: '' }); changed(); draw(); } }, '+ 파일 추가'));
    };
    draw();
    return h('div', { class: 'field' }, h('div', { class: 'label' }, '첨부 파일'), box,
      h('div', { class: 'hint' }, '기획서 PDF, 밸런스 시트, 영상 등을 올리거나 구글 드라이브·유튜브 링크를 넣을 수 있어요. 25MB가 넘는 파일은 링크로 넣어 주세요.'));
  }

  /* ---------- 리치 텍스트 에디터 ---------- */
  function toEditor(html) { // pending:ID -> blob URL
    const d = h('div', { html: sanitize(html, true) });
    d.querySelectorAll('img').forEach(img => { const m = /^pending:(\w+)$/.exec(img.getAttribute('src')); if (m) { img.dataset.pending = m[1]; img.src = blobs[m[1]] || ''; } });
    return d.innerHTML;
  }
  function fromEditor(el) { // blob URL -> pending:ID
    const d = el.cloneNode(true);
    d.querySelectorAll('img').forEach(img => { img.classList.remove('picked'); img.removeAttribute('class'); if (img.dataset.pending) img.setAttribute('src', 'pending:' + img.dataset.pending); });
    const out = sanitize(d.innerHTML, true);
    const plain = out.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
    return plain || /<img/i.test(out) ? out : '';
  }
  function rich(obj, key, label, hint, ph) {
    const ed = h('div', { class: 'rte', contenteditable: 'true', role: 'textbox', 'aria-multiline': 'true', 'aria-label': label, 'data-placeholder': ph || '내용을 입력하세요' });
    ed.innerHTML = toEditor(obj[key]);
    let range = null;
    const save = () => { const s = getSelection(); if (s.rangeCount && ed.contains(s.anchorNode)) range = s.getRangeAt(0).cloneRange(); };
    const restore = () => { ed.focus(); if (range) { const s = getSelection(); s.removeAllRanges(); s.addRange(range); } };
    const sync = () => { obj[key] = fromEditor(ed); changed(); };
    ['keyup', 'mouseup', 'input', 'blur'].forEach(ev => ed.addEventListener(ev, save));
    ed.addEventListener('input', sync);
    ed.addEventListener('paste', e => { // 붙여넣기는 서식 없이
      e.preventDefault();
      const t = (e.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, t);
    });
    ed.addEventListener('click', e => { ed.querySelectorAll('img.picked').forEach(i => i.classList.remove('picked')); if (e.target.tagName === 'IMG') e.target.classList.add('picked'); });
    ed.addEventListener('keydown', e => {
      const sel = ed.querySelector('img.picked');
      if (sel && (e.key === 'Backspace' || e.key === 'Delete')) { e.preventDefault(); sel.remove(); sync(); }
    });
    try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) {}
    const cmd = (c, v) => () => { restore(); document.execCommand(c, false, v); save(); sync(); };
    const B = (label, title, fn) => h('button', { type: 'button', title, 'aria-label': title, onmousedown: e => e.preventDefault(), onclick: fn }, label);
    const bar = h('div', { class: 'rte-bar', role: 'toolbar', 'aria-label': label + ' 서식' },
      B('본문', '본문 문단', cmd('formatBlock', '<p>')),
      B('소제목', '소제목', cmd('formatBlock', '<h3>')),
      B('작은 제목', '작은 제목', cmd('formatBlock', '<h4>')),
      h('span', { class: 'sep' }),
      B(h('b', {}, '굵게'), '굵게 (Ctrl+B)', cmd('bold')),
      B(h('i', {}, '기울임'), '기울임 (Ctrl+I)', cmd('italic')),
      B(h('u', {}, '밑줄'), '밑줄 (Ctrl+U)', cmd('underline')),
      h('span', { class: 'sep' }),
      B('• 목록', '글머리 목록', cmd('insertUnorderedList')),
      B('1. 목록', '번호 목록', cmd('insertOrderedList')),
      B('인용', '인용', cmd('formatBlock', '<blockquote>')),
      h('span', { class: 'sep' }),
      B('링크', '링크 넣기', () => {
        restore();
        const u = prompt('링크 주소를 입력하세요 (https://...)');
        if (u && PF.safeUrl(u)) { document.execCommand('createLink', false, u.trim()); sync(); }
      }),
      B('링크 빼기', '링크 빼기', cmd('unlink')),
      B('이미지', '이미지 넣기', async () => {
        const files = await pick('image/*', true);
        restore();
        for (const f of files) {
          if (tooBig(f)) continue;
          const id = await addPending(f);
          document.execCommand('insertHTML', false, `<img src="${blobs[id]}" data-pending="${id}" alt="">`);
        }
        save(); sync();
      }),
      h('span', { class: 'sep' }),
      B('서식 지우기', '서식 지우기', cmd('removeFormat')),
      B('되돌리기', '되돌리기 (Ctrl+Z)', cmd('undo')),
    );
    return h('div', { class: 'field' }, h('div', { class: 'label' }, label), h('div', { class: 'rte-wrap' }, bar, ed),
      h('div', { class: 'hint' }, hint || '이미지를 누르고 Delete 키를 누르면 지워져요. 다른 곳에서 복사한 글은 서식 없이 붙여져요.'));
  }

  /* ---------- 화면 ---------- */
  const group = (title, ...kids) => h('div', { class: 'group' }, title ? h('h4', {}, title) : null, ...kids);
  const pageHead = (title, desc) => [h('h2', {}, title), desc ? h('p', { class: 'desc' }, desc) : null];

  const views = {
    site: () => {
      const s = C.site;
      s.stats = s.stats || [];
      return [...pageHead('기본 정보', '첫 화면에 보이는 문구예요.'),
        group('첫 화면',
          text(s, 'name', '이름'),
          text(s, 'headline', '큰 제목', { multi: true, rows: 2, hint: '줄을 바꾸면 화면에서도 줄이 바뀌어요.' }),
          text(s, 'intro', '소개 문장', { multi: true, rows: 3 }),
          objList(s.stats, '요약 숫자', [{ key: 'value', label: '숫자', w: '120px' }, { key: 'label', label: '설명' }], { value: '', label: '' }, '3개 정도가 보기 좋아요.'),
          imageField(s, 'photo', '프로필 사진', '첫 화면 소개 글 오른쪽에 보여요. 세로 3:4 비율 사진이 잘 맞아요. 빼면 사진 없이 보여요.')),
        group('시트 꾸밈',
          text(s, 'docTitle', '맨 위 파일 이름', { hint: '예: 이준엽_게임기획_포트폴리오.xlsx' }),
          text(s, 'formula', '수식 입력줄 문구', { hint: '첫 화면에서 수식 입력줄에 보이는 글이에요. 예: =기획(재미, 근거, 숫자)' }))];
    },
    about: () => {
      const a = C.about; a.facts = a.facts || [];
      return [...pageHead('소개 · 이력', '소개 섹션의 글과 이력 표예요.'),
        group('', rich(a, 'body', '소개 글', null, '나를 소개하는 글을 써 주세요')),
        group('', objList(a.facts, '이력 표', [{ key: 'label', label: '항목', w: '160px', ph: '예: 학력' }, { key: 'value', label: '내용', ph: '예: OO대학교 게임공학과' }], { label: '', value: '' }))];
    },
    skills: () => {
      const k = C.skills; k.items = k.items || [];
      return [...pageHead('역량', '역량 표의 분야, 수준(0~100), 도구예요.'),
        group('', text(k, 'note', '표 옆 작은 설명'),
          objList(k.items, '역량 목록', [{ key: 'name', label: '분야' }, { key: 'level', label: '수준', type: 'number', w: '90px', min: 0, max: 100, ph: '0~100' }, { key: 'tools', label: '주로 쓰는 도구' }], { name: '', level: 70, tools: '' }))];
    },
    contact: () => {
      const c = C.contact; c.links = c.links || [];
      return [...pageHead('연락처', '맨 아래 연락 섹션이에요.'),
        group('', text(c, 'email', '이메일', { type: 'email' }), text(c, 'note', '안내 문구', { multi: true, rows: 2 }),
          objList(c.links, '링크', [{ key: 'label', label: '이름', w: '160px', ph: '예: GitHub' }, { key: 'url', label: '주소', ph: 'https://' }], { label: '', url: '' }))];
    },
    project: i => {
      const p = C.projects[i];
      ['meta', 'tasks', 'systems', 'results', 'gallery', 'files'].forEach(k => p[k] = p[k] || []);
      const title = h('h2', {}, p.title || '새 프로젝트');
      return [title, h('p', { class: 'desc' }, '메인 화면의 이미지 카드와, 카드를 눌렀을 때 열리는 상세 페이지 내용이에요.'),
        group('메인 카드',
          text(p, 'title', '프로젝트 이름', { onchange: () => { title.textContent = p.title || '새 프로젝트'; drawSide(); } }),
          h('div', { class: 'row', style: 'grid-template-columns:1fr 1fr' }, text(p, 'kicker', '분류 · 연도', { ph: '예: 팀 프로젝트 · 2025' }), text(p, 'summary', '카드 아래 짧은 설명', { ph: '예: 로그라이크 항해 생존 · 6개월' })),
          imageField(p, 'cover', '대표 이미지', '카드와 상세 페이지 맨 위에 쓰여요. 가로로 긴 이미지(16:10)가 잘 맞아요.')),
        group('상세 페이지 · 개요',
          text(p, 'lead', '한 줄 소개', { multi: true, rows: 2 }),
          objList(p.meta, '정보 칸', [{ key: 'label', label: '항목', w: '140px', ph: '예: 장르' }, { key: 'value', label: '내용' }], { label: '', value: '' }, '장르, 기간, 팀, 역할, 도구처럼 5칸까지가 한 줄에 보여요.')),
        group('상세 페이지 · 본문',
          rich(p, 'intent', '기획 의도'),
          strList(p.tasks, '담당 업무', '한 일을 한 줄씩'),
          objList(p.systems, '핵심 시스템', [{ key: 'title', label: '이름', w: '200px' }, { key: 'desc', label: '설명' }], { title: '', desc: '' }, '2개가 한 줄에 나란히 보여요.'),
          objList(p.results, '결과 숫자', [{ key: 'value', label: '숫자', w: '140px', ph: '예: +38%' }, { key: 'label', label: '설명' }], { value: '', label: '' }),
          rich(p, 'learned', '배운 점'),
          rich(p, 'body', '추가 내용 (자유롭게)', '기획서 일부, 플로우 차트 이미지, 회고 등 자유롭게 쓰는 칸이에요. 비워 두면 보이지 않아요.', '필요하면 자유롭게 써 주세요')),
        group('상세 페이지 · 이미지와 파일',
          galleryField(p.gallery, '스크린샷', '3장씩 한 줄로 보여요. 화살표로 순서를 바꿀 수 있어요.'),
          filesField(p.files)),
        group('프로젝트 관리',
          h('div', { class: 'actions' },
            h('button', { type: 'button', class: 'btn small', disabled: i === 0, onclick: () => { [C.projects[i - 1], C.projects[i]] = [C.projects[i], C.projects[i - 1]]; changed(); go('project', i - 1); } }, '앞으로 옮기기'),
            h('button', { type: 'button', class: 'btn small', disabled: i === C.projects.length - 1, onclick: () => { [C.projects[i + 1], C.projects[i]] = [C.projects[i], C.projects[i + 1]]; changed(); go('project', i + 1); } }, '뒤로 옮기기'),
            h('button', { type: 'button', class: 'btn small danger', onclick: () => { if (confirm(`"${p.title || '이 프로젝트'}"를 삭제할까요? 저장하기 전까지는 되돌릴 수 있어요.`)) { C.projects.splice(i, 1); changed(); go(C.projects.length ? 'project' : 'site', 0); } } }, '이 프로젝트 삭제')))];
    },
    settings: () => {
      const c = cfg();
      const st = { owner: c.owner || '', repo: c.repo || '', branch: c.branch || 'main', token: c.token || '', remember: c.remember !== false };
      const result = h('div', { class: 'hint' });
      const persist = () => {
        const v = JSON.stringify(st);
        localStorage.removeItem(CFG); sessionStorage.removeItem(CFG);
        (st.remember ? localStorage : sessionStorage).setItem(CFG, v);
        updateSaveBtn();
      };
      const field = (k, label, o) => { const f = text(st, k, label, o); f.querySelector('input').addEventListener('input', persist); return f; };
      const remember = h('input', { type: 'checkbox', id: 'remember' }); remember.checked = st.remember;
      remember.addEventListener('change', () => { st.remember = remember.checked; persist(); });
      const wrapNoDirty = el => el;
      return [...pageHead('GitHub 연결', '연결하면 "GitHub에 저장"을 눌렀을 때 사이트에 바로 반영돼요. 연결하지 않으면 content.js 파일을 내려받아 직접 올리면 돼요.'),
        group('저장소', wrapNoDirty(h('div', {},
          h('div', { class: 'row', style: 'grid-template-columns:1fr 1fr 140px' },
            field('owner', 'GitHub 아이디', { ph: '예: junyeop' }),
            field('repo', '저장소 이름', { ph: '예: junyeop.github.io' }),
            field('branch', '브랜치', { ph: 'main' })),
          field('token', '토큰', { type: 'password', ph: 'github_pat_...', hint: '토큰은 이 브라우저에만 저장되고, GitHub 외에는 어디에도 보내지 않아요.' }),
          h('label', { class: 'check', for: 'remember' }, remember, '이 브라우저에 기억하기 (공용 PC라면 끄세요. 끄면 창을 닫을 때 지워져요)'))),
          h('div', { class: 'actions', style: 'margin-top:14px' },
            h('button', { type: 'button', class: 'btn', onclick: async e => {
              const b = e.currentTarget; b.disabled = true; result.textContent = '확인 중…';
              try {
                const r = await gh('GET', '');
                if (!r) throw new Error('저장소를 찾지 못했어요. 아이디와 저장소 이름을 확인해 주세요.');
                result.textContent = r.permissions && r.permissions.push === false ? '연결은 됐지만 쓰기 권한이 없어요. 토큰 권한에서 Contents를 "Read and write"로 바꿔 주세요.' : `연결됐어요: ${r.full_name}`;
              } catch (err) { result.textContent = err.message; }
              b.disabled = false;
            } }, '연결 확인'),
            h('button', { type: 'button', class: 'btn', onclick: async () => { if (isDirty() && !confirm('저장하지 않은 수정 내용이 사라져요. GitHub에서 다시 불러올까요?')) return; await loadOriginal(true); go('settings'); } }, 'GitHub에서 다시 불러오기')),
          result),
        group('토큰 만드는 법',
          h('ol', { class: 'steps' },
            h('li', { html: 'GitHub에 로그인하고 <b>Settings → Developer settings → Personal access tokens → Fine-grained tokens</b>로 가요.' }),
            h('li', { html: '<b>Generate new token</b>을 누르고, 이름과 만료일(예: 1년)을 정해요.' }),
            h('li', { html: '<b>Repository access</b>에서 <b>Only select repositories</b>를 고르고 이 사이트 저장소만 선택해요.' }),
            h('li', { html: '<b>Permissions → Repository permissions → Contents</b>를 <b>Read and write</b>로 바꿔요.' }),
            h('li', { html: '만들어진 토큰(<code>github_pat_</code>로 시작)을 복사해 위 칸에 붙여넣어요.' })))];
    }
  };

  function drawSide() {
    const item = (label, v, i) => h('button', { type: 'button', class: 'item' + (view === v && (i == null || i === curIdx) ? ' on' : ''), onclick: () => go(v, i) }, label);
    $('#side').replaceChildren(
      h('h3', {}, '사이트'), item('기본 정보', 'site'), item('소개 · 이력', 'about'), item('역량', 'skills'), item('연락처', 'contact'),
      h('h3', {}, '프로젝트'), ...C.projects.map((p, i) => item(p.title || `프로젝트 ${i + 1}`, 'project', i)),
      h('button', { type: 'button', class: 'add', onclick: () => { C.projects.push(blankProject()); changed(); go('project', C.projects.length - 1); } }, '+ 프로젝트 추가'),
      h('h3', {}, '설정'), item('GitHub 연결', 'settings'));
  }
  let curIdx = 0;
  function go(v, i) {
    view = v; curIdx = i || 0;
    $('#panel').replaceChildren(...views[v](curIdx).filter(Boolean));
    drawSide(); window.scrollTo(0, 0);
  }
  const blankProject = () => ({ title: '새 프로젝트', kicker: '', summary: '', cover: '', lead: '', meta: [{ label: '장르', value: '' }, { label: '기간', value: '' }, { label: '팀', value: '' }, { label: '역할', value: '' }, { label: '도구', value: '' }], intent: '', tasks: [''], systems: [{ title: '', desc: '' }, { title: '', desc: '' }], results: [], learned: '', body: '', gallery: [], files: [] });
  function normalize(c) {
    c.site = c.site || {}; c.about = c.about || {}; c.skills = c.skills || {}; c.contact = c.contact || {}; c.projects = c.projects || [];
    return c;
  }

  /* ---------- 불러오기 ---------- */
  let remoteSha = null;
  async function loadOriginal(force) {
    status('불러오는 중…');
    let orig;
    try {
      if (connected()) {
        const f = await ghGet('data/content.js');
        if (!f) throw new Error('저장소에 data/content.js 가 없어요. 사이트 파일을 먼저 올려 주세요.');
        remoteSha = f.sha; orig = PF.fromScript(b64utf8(f.content));
      } else {
        orig = await PF.loadContentScript('data/content.js');
      }
    } catch (e) {
      banner('원본 내용을 불러오지 못했어요: ' + esc(e.message), 'err');
      if (!C) orig = normalize({});
      else { status('불러오기 실패'); return; }
    }
    orig = normalize(orig);
    saved = JSON.stringify(orig);
    let draft = null;
    try { draft = JSON.parse(localStorage.getItem(DRAFT) || 'null'); } catch (e) {}
    if (!force && draft && draft.content && JSON.stringify(draft.content) !== saved) {
      C = normalize(draft.content);
      banner('저장하지 않았던 수정 내용을 이어서 불러왔어요.' + (draft.base && draft.base !== saved ? ' (그 사이 사이트 내용이 바뀌었어요. 확인 후 저장해 주세요.)' : ''), '', [['원래 내용으로 되돌리기', () => { if (confirm('저장하지 않은 수정 내용을 버릴까요?')) { localStorage.removeItem(DRAFT); C = JSON.parse(saved); $('#banner').hidden = true; changed(); go(view, curIdx); } }]]);
    } else {
      if (force) localStorage.removeItem(DRAFT);
      C = JSON.parse(saved);
    }
    changed();
  }

  /* ---------- 미리보기 ---------- */
  $('#btn-preview').addEventListener('click', () => {
    const live = JSON.parse(JSON.stringify(C).replace(/pending:(\w+)/g, (m, id) => blobs[id] || ''));
    try { localStorage.setItem('portfolio-preview', JSON.stringify(live)); }
    catch (e) { banner('미리보기용 내용이 너무 커서 열 수 없어요.', 'err'); return; }
    const hash = view === 'project' ? '#project-' + (curIdx + 1) : '';
    window.open('index.html?preview=1' + hash, 'portfolio-preview');
  });

  /* ---------- 저장 ---------- */
  const stamp = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; };
  const safeName = n => { const ext = (n.match(/\.([a-z0-9]{1,8})$/i) || [, 'bin'])[1].toLowerCase(); const base = n.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'file'; return `${base}.${ext}`; };

  async function saveToGitHub() {
    const ids = pendingIds(C);
    const map = {};
    let n = 0;
    for (const id of ids) {
      const v = await idb.get(id);
      if (!v) throw new Error('올렸던 파일 하나를 찾지 못했어요. 그 이미지나 파일을 다시 올려 주세요.');
      status(`파일 올리는 중 (${++n}/${ids.length})…`);
      const path = `uploads/${stamp()}-${Math.random().toString(36).slice(2, 6)}-${safeName(v.name || 'file')}`;
      await ghPut(path, await blobB64(v.blob), `파일 추가: ${v.name || path}`);
      map[id] = path;
    }
    const next = JSON.parse(JSON.stringify(C).replace(/ data-pending=\\"\w+\\"/g, '').replace(/pending:(\w+)/g, (m, id) => map[id] || m));
    status('내용 저장 중…');
    const cur = await ghGet('data/content.js');
    if (cur && remoteSha && cur.sha !== remoteSha && !confirm('관리자 페이지를 연 뒤에 다른 곳에서 사이트 내용이 바뀌었어요. 지금 내용으로 덮어쓸까요?')) throw new Error('저장을 취소했어요.');
    const res = await ghPut('data/content.js', utf8b64(PF.toScript(next)), '포트폴리오 내용 수정', cur && cur.sha);
    remoteSha = res.content && res.content.sha;
    C = next; saved = JSON.stringify(C);
    for (const id of ids) { await idb.del(id).catch(() => {}); }
    localStorage.removeItem(DRAFT);
    changed(); go(view, curIdx);
    banner('저장했어요. GitHub Pages에 반영되기까지 보통 1~2분 걸려요.', 'ok');
  }
  async function exportFile() {
    const ids = pendingIds(C), map = {};
    let size = 0;
    for (const id of ids) { const v = await idb.get(id); if (v) { size += v.blob.size; map[id] = await blobDataUrl(v.blob); } }
    if (size > 5 * 1024 * 1024 && !confirm('올린 이미지·파일이 5MB가 넘어서 content.js 파일이 커져요. 그래도 내보낼까요? (GitHub 연결을 쓰면 파일이 따로 올라가서 가벼워요)')) return;
    const next = JSON.parse(JSON.stringify(C).replace(/ data-pending=\\"\w+\\"/g, '').replace(/pending:(\w+)/g, (m, id) => map[id] || ''));
    const a = h('a', { href: URL.createObjectURL(new Blob([PF.toScript(next)], { type: 'text/javascript' })), download: 'content.js' });
    document.body.append(a); a.click(); a.remove();
    banner('content.js 파일을 내려받았어요. 저장소의 <code>data/content.js</code>를 이 파일로 바꿔 올리면 사이트에 반영돼요. GitHub 연결을 해 두면 이 과정 없이 바로 저장돼요.', 'ok', [['GitHub 연결하기', () => go('settings')]]);
  }
  $('#btn-save').addEventListener('click', async e => {
    const b = e.currentTarget; b.disabled = true;
    try { connected() ? await saveToGitHub() : await exportFile(); }
    catch (err) { banner('저장하지 못했어요. ' + esc(err.message), 'err'); changed(); }
    b.disabled = false;
  });
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); $('#btn-save').click(); } });
  window.addEventListener('beforeunload', e => { if (C && isDirty()) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- 시작 ---------- */
  (async () => {
    updateSaveBtn();
    await restorePending();
    await loadOriginal(false);
    go('site');
    if (!connected() && $('#banner').hidden) banner('GitHub에 연결하면 저장 버튼 한 번으로 사이트에 바로 반영돼요.', '', [['연결 설정', () => go('settings')]]);
  })();
})();
