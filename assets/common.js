/* 공개 사이트와 관리자 페이지가 함께 쓰는 도구 */
(function (w) {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // 리치 텍스트에서 허용하는 태그와 속성만 남깁니다
  const ALLOWED = { P: [], BR: [], B: [], STRONG: [], I: [], EM: [], U: [], H3: [], H4: [], UL: [], OL: [], LI: [], BLOCKQUOTE: [], A: ['href'], IMG: ['src', 'alt', 'data-pending'], DIV: [] };
  function safeUrl(u, isImg) {
    u = String(u || '').trim();
    if (/^(https?:|mailto:|#|\.{0,2}\/|uploads\/|blob:)/i.test(u)) return u;
    if (/^pending:/.test(u)) return u;
    if (isImg && /^data:image\//i.test(u)) return u;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) return u; // 상대 경로
    return '';
  }
  function sanitize(html, keepPending) {
    const doc = new DOMParser().parseFromString('<div>' + (html || '') + '</div>', 'text/html');
    const root = doc.body.firstChild;
    (function walk(node) {
      [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 3) return;
        if (ch.nodeType !== 1) { ch.remove(); return; }
        const tag = ch.tagName;
        if (!ALLOWED[tag]) {
          if (/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|svg|SVG|MATH)$/.test(tag)) { ch.remove(); return; }
          walk(ch); ch.replaceWith(...ch.childNodes); return;
        }
        [...ch.attributes].forEach(a => {
          const name = a.name.toLowerCase();
          if (!ALLOWED[tag].includes(name) || (name === 'data-pending' && !keepPending)) ch.removeAttribute(a.name);
        });
        if (tag === 'A') {
          const h = safeUrl(ch.getAttribute('href'));
          if (h) { ch.setAttribute('href', h); if (/^https?:/.test(h)) { ch.setAttribute('target', '_blank'); ch.setAttribute('rel', 'noopener'); } }
          else ch.removeAttribute('href');
        }
        if (tag === 'IMG') {
          const s = safeUrl(ch.getAttribute('src'), true);
          if (s) ch.setAttribute('src', s); else ch.remove();
          ch.setAttribute('loading', 'lazy');
        }
        if (tag === 'DIV') { const p = doc.createElement('p'); p.append(...ch.childNodes); ch.replaceWith(p); walk(p); return; }
        walk(ch);
      });
    })(root);
    return root.innerHTML;
  }

  // data/content.js 를 <script>로 불러옵니다 (파일을 직접 열어도 동작)
  function loadContentScript(src) {
    return new Promise((res, rej) => {
      delete w.PORTFOLIO_CONTENT;
      const s = document.createElement('script');
      s.src = (src || 'data/content.js') + '?v=' + Date.now();
      s.onload = () => { s.remove(); w.PORTFOLIO_CONTENT ? res(w.PORTFOLIO_CONTENT) : rej(new Error('내용이 비어 있어요')); };
      s.onerror = () => { s.remove(); rej(new Error('data/content.js 를 불러오지 못했어요')); };
      document.head.appendChild(s);
    });
  }

  // content.js 텍스트 <-> 객체
  const PREFIX = 'window.PORTFOLIO_CONTENT = ';
  const toScript = obj => PREFIX + JSON.stringify(obj, null, 2) + ';\n';
  const fromScript = txt => {
    const i = txt.indexOf('{'), j = txt.lastIndexOf('}');
    return JSON.parse(txt.slice(i, j + 1));
  };

  w.PF = { esc, sanitize, safeUrl, loadContentScript, toScript, fromScript };
})(window);
