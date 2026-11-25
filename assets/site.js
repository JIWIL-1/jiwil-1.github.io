/* 공개 사이트: data/content.js 를 읽어 화면을 그립니다 */
(function () {
  const { esc, sanitize } = PF;
  const $ = s => document.querySelector(s);
  let C = null;

  // 이미지 칸: 이미지가 없으면 색 자리표시
  function ph(src, i, label, cls) {
    const k = 'p' + (i % 3);
    return src
      ? `<div class="ph ${cls || ''}"><img src="${esc(src)}" alt="${esc(label)}"></div>`
      : `<div class="ph empty ${k} ${cls || ''}" data-label="${esc(label)}"></div>`;
  }
  const filled = a => (a || []).filter(x => x && (typeof x === 'string' ? x.trim() : Object.values(x).some(v => String(v).trim())));

  function render() {
    const s = C.site || {}, ps = C.projects || [], sk = C.skills || {}, ab = C.about || {}, ct = C.contact || {};
    document.title = (s.name ? s.name + ' · ' : '') + '게임 기획 포트폴리오';
    $('#doc-title').textContent = s.docTitle || '포트폴리오';
    let row = 1;
    const R = () => `<div class="row-n">${row++}</div>`;
    const tiles = ps.map((p, i) => `
      <a class="ptile" href="#project-${i + 1}" data-project="${i}">
        <span class="ref">${String.fromCharCode(66 + (i % 3) * 2)}${3 + Math.floor(i / 3)}</span>
        ${ph(p.cover, i, p.cover ? p.title : '프로젝트 이미지')}
        <div class="pt-body"><b>${esc(p.title)}</b><span>${esc([p.kicker, p.summary].filter(Boolean).join(' · '))}</span></div>
      </a>`).join('');
    const skills = filled(sk.items).map(x => `
      <tr><td>${esc(x.name)}</td><td class="barcell"><i class="db" style="width:${Math.max(0, Math.min(100, +x.level || 0))}%"></i><span>${esc(x.level)}</span></td><td class="hide-m">${esc(x.tools)}</td></tr>`).join('');
    const facts = filled(ab.facts).map(f => `<dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd>`).join('');
    const links = filled(ct.links).filter(l => l.url).map(l => `<a href="${esc(PF.safeUrl(l.url))}" target="_blank" rel="noopener">${esc(l.label || l.url)}</a>`).join('');

    $('#sheet').innerHTML = `
      <div class="corner"></div>
      <div class="cols" aria-hidden="true">${'ABCDEFGH'.split('').map(c => `<span>${c}</span>`).join('')}</div>
      ${R()}
      <section class="hero" id="intro" data-f="${esc(s.formula || '=기획(재미, 근거, 숫자)')}" data-ref="A1">
        <div class="hero-inner">
          <h1>${esc(s.headline || s.name || '').replace(/\n/g, '<br>')}</h1>
          ${s.intro ? `<p>${esc(s.intro)}</p>` : ''}
          <div class="sum">${filled(s.stats).map(x => `<div><b>${esc(x.value)}</b>${esc(x.label)}</div>`).join('')}</div>
        </div>
      </section>
      ${R()}
      <div class="cell sec-head" id="projects" data-f="=FILTER(프로젝트, 완성=TRUE)" data-ref="A2"><h2>프로젝트</h2><small>이미지를 누르면 상세 내용이 열려요</small></div>
      ${R()}
      <div class="ptiles">${tiles}</div>
      ${R()}
      <div class="cell sec-head" id="skills" data-f="=AVERAGE(역량)" data-ref="A4"><h2>역량</h2>${sk.note ? `<small>${esc(sk.note)}</small>` : ''}</div>
      ${R()}
      <div class="wrap"><table class="skills"><thead><tr><th>분야</th><th>수준</th><th class="hide-m">주로 쓰는 도구</th></tr></thead><tbody>${skills}</tbody></table></div>
      ${R()}
      <div class="cell sec-head" id="about" data-f="=CONCAT(이력, 생각)" data-ref="A6"><h2>소개</h2></div>
      ${R()}
      <div class="about"><div class="rich">${sanitize(ab.body)}</div><div><dl>${facts}</dl></div></div>
      ${R()}
      <div class="contact" id="contact" data-f="=HYPERLINK(&quot;mailto:${esc(ct.email || '')}&quot;)" data-ref="A8">
        ${ct.email ? `<a class="mail" href="mailto:${esc(ct.email)}">${esc(ct.email)}</a>` : ''}
        ${ct.note ? `<p>${esc(ct.note)}</p>` : ''}
        ${links ? `<div class="links">${links}</div>` : ''}
      </div>`;
    $('#val').textContent = s.formula || '';
    watchSections();
  }

  // 스크롤 위치에 맞춰 수식 입력줄과 시트 탭을 바꿉니다
  function watchSections() {
    const secs = [...document.querySelectorAll('[data-f]')];
    const tabs = [...document.querySelectorAll('#tabs a')];
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const i = secs.indexOf(e.target);
      $('#val').textContent = e.target.dataset.f;
      $('#ref').textContent = e.target.dataset.ref;
      tabs.forEach((t, j) => t.classList.toggle('on', j === i));
    }), { rootMargin: '-40% 0px -55% 0px' });
    secs.forEach(s => io.observe(s));
  }

  /* ----- 프로젝트 상세 ----- */
  const box = $('#detail');
  let cur = -1, lastFocus = null;
  function detailHTML(i) {
    const ps = C.projects, p = ps[i], n = (i + 1) % ps.length, np = ps[n];
    const sec = (title, inner) => inner ? `<div class="d-sec"><h3>${title}</h3>${inner}</div>` : '';
    const rich = h => (h && h.replace(/<[^>]*>/g, '').trim() || /<img/i.test(h || '')) ? `<div class="rich">${sanitize(h)}</div>` : '';
    const meta = filled(p.meta), tasks = filled(p.tasks), sys = filled(p.systems), res = filled(p.results), gal = filled(p.gallery), files = filled(p.files);
    return `
    <div class="d-bar"><button class="d-btn" data-close>목록으로</button>
      ${ps.length > 1 ? `<div class="d-nav"><span class="d-count">${i + 1} / ${ps.length}</span>
      <button class="d-btn" data-go="${(i + ps.length - 1) % ps.length}">이전</button>
      <button class="d-btn" data-go="${n}">다음</button></div>` : ''}</div>
    <article class="d-in">
      ${ph(p.cover, i, p.cover ? p.title : '대표 이미지', 'd-hero')}
      ${p.kicker ? `<div class="d-kicker">${esc(p.kicker)}</div>` : ''}
      <h2 class="d-title" id="d-title">${esc(p.title)}</h2>
      ${p.lead ? `<p class="d-lead">${esc(p.lead)}</p>` : ''}
      ${meta.length ? `<dl class="d-meta" style="--n:${Math.min(meta.length, 5)}">${meta.map(m => `<div><dt>${esc(m.label)}</dt><dd>${esc(m.value)}</dd></div>`).join('')}</dl>` : ''}
      <div class="d-grid"${files.length ? '' : ' style="grid-template-columns:1fr"'}><div>
        ${sec('기획 의도', rich(p.intent))}
        ${sec('담당 업무', tasks.length ? `<ul>${tasks.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '')}
        ${sec('핵심 시스템', sys.length ? `<div class="d-sys">${sys.map(x => `<div><b>${esc(x.title)}</b><span>${esc(x.desc)}</span></div>`).join('')}</div>` : '')}
        ${sec('결과', res.length ? `<div class="d-nums">${res.map(x => `<div><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join('')}</div>` : '')}
        ${sec('배운 점', rich(p.learned))}
        ${rich(p.body) ? `<div class="d-sec">${rich(p.body)}</div>` : ''}
        ${sec('이미지', gal.length ? `<div class="d-gal">${gal.map((g, k) => `<a href="${esc(PF.safeUrl(g, true))}" target="_blank" rel="noopener">${ph(g, i, p.title + ' 이미지 ' + (k + 1))}</a>`).join('')}</div>` : '')}
      </div>
      ${files.length ? `<aside class="d-side"><div class="d-box"><h4>첨부 파일</h4>${files.map(f => f.url
        ? `<a class="d-file" href="${esc(PF.safeUrl(f.url))}" target="_blank" rel="noopener" download>${esc(f.name)}<small>${esc(f.info)}</small></a>`
        : `<div class="d-file">${esc(f.name)}<small>${esc(f.info)}</small></div>`).join('')}</div></aside>` : ''}
      </div>
      ${ps.length > 1 ? `<button class="d-next" data-go="${n}">${ph(np.cover, n, '다음 프로젝트')}<div><small>다음 프로젝트</small><b>${esc(np.title)}</b></div></button>` : ''}
    </article>`;
  }
  function open(i, push) {
    if (!C || !C.projects[i]) return;
    if (cur < 0) lastFocus = document.activeElement;
    cur = i; box.innerHTML = detailHTML(i); box.hidden = false;
    requestAnimationFrame(() => box.classList.add('open'));
    document.body.style.overflow = 'hidden'; box.scrollTop = 0;
    box.querySelector('[data-close]').focus();
    document.title = C.projects[i].title + ' · ' + (C.site.name || '포트폴리오');
    if (push !== false && location.hash !== '#project-' + (i + 1)) history.pushState(null, '', '#project-' + (i + 1));
  }
  function close(push) {
    if (cur < 0) return;
    cur = -1; box.classList.remove('open'); document.body.style.overflow = '';
    setTimeout(() => { if (cur < 0) box.hidden = true; }, 200);
    document.title = (C.site.name ? C.site.name + ' · ' : '') + '게임 기획 포트폴리오';
    if (push !== false && /^#project-/.test(location.hash)) history.pushState(null, '', location.pathname + location.search);
    if (lastFocus) lastFocus.focus();
  }
  function fromHash() {
    const m = location.hash.match(/^#project-(\d+)$/);
    if (m && C && C.projects[m[1] - 1]) open(+m[1] - 1, false); else close(false);
  }
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-project],[data-go],[data-close]');
    if (!t) return;
    e.preventDefault();
    if (t.hasAttribute('data-close')) close(); else open(+(t.dataset.project ?? t.dataset.go));
  });
  document.addEventListener('keydown', e => { if (cur >= 0 && e.key === 'Escape') close(); });
  window.addEventListener('popstate', fromHash);

  /* ----- 시작 ----- */
  const preview = new URLSearchParams(location.search).has('preview');
  (async () => {
    try {
      if (preview && localStorage.getItem('portfolio-preview')) {
        C = JSON.parse(localStorage.getItem('portfolio-preview'));
        const f = document.createElement('div'); f.className = 'preview-flag'; f.textContent = '미리보기 · 아직 저장되지 않은 내용'; document.body.appendChild(f);
      } else {
        C = await PF.loadContentScript('data/content.js');
      }
      C.projects = C.projects || [];
      render(); fromHash();
    } catch (err) {
      $('#loading').textContent = '내용을 불러오지 못했어요. (' + err.message + ')';
    }
  })();
})();
