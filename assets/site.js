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
      <a class="ptile" href="#project-${i + 1}" data-project="${i}" aria-label="${esc(p.title)} 상세 보기" aria-haspopup="dialog" aria-controls="detail">
        <div class="pt-cover">
          ${ph(p.cover, i, p.cover ? p.title : '프로젝트 이미지')}
          <span class="pt-open" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
        </div>
        <div class="pt-body"><b>${esc(p.title)}</b><span>${esc([p.kicker, p.summary].filter(Boolean).join(' · '))}</span></div>
      </a>`).join('');
    // 사용 가능 도구: 분류별로 묶고, 도구 앞에 아이콘(올린 이미지 또는 첫 글자 배지)
    const skItems = filled(sk.items).filter(x => (x.name || '').trim()), cats = [];
    skItems.forEach(x => { const t = (x.cat || '').trim() || '기타'; let g = cats.find(g => g.t === t); if (!g) cats.push(g = { t, items: [] }); g.items.push(x); });
    const hue = s => [...s].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 360, 7);
    const toolIcon = x => x.icon ? `<img class="ti ti-img" src="${esc(PF.safeUrl(x.icon, true))}" alt="" width="34" height="34" loading="lazy" decoding="async">` : `<span class="ti ti-mono" style="--h:${hue(x.name)}" aria-hidden="true">${esc([...x.name.trim()][0].toUpperCase())}</span>`;
    // 분류 4개까지는 한 줄, 5개 이상은 3열로 여러 줄(마지막 줄 빈칸은 마지막 분류가 채움)
    const tCols = cats.length > 4 ? 3 : Math.max(cats.length, 1), tRem = cats.length % tCols;
    const skills = cats.map((g, i) => `<div class="tcat"${tRem && i === cats.length - 1 ? ` style="grid-column:span ${tCols - tRem + 1}"` : ''}><div class="tcat-h">${esc(g.t)}</div><ul class="tlist">${g.items.map(x => `<li>${toolIcon(x)}<span>${esc(x.name)}</span></li>`).join('')}</ul></div>`).join('');
    const facts = filled(ab.facts).map(f => `<dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd>`).join('');
    const links = filled(ct.links).filter(l => l.url).map(l => `<a href="${esc(PF.safeUrl(l.url))}" target="_blank" rel="noopener">${esc(l.label || l.url)}</a>`).join('');

    $('#sheet').innerHTML = `
      <div class="corner"></div>
      <div class="cols" aria-hidden="true">${'ABCDEFGH'.split('').map(c => `<span>${c}</span>`).join('')}</div>
      ${R()}
      <section class="hero" id="intro" data-f="${esc(s.formula || '=기획(재미, 근거, 숫자)')}" data-ref="A1">
        <div class="hero-inner${s.photo ? ' has-photo' : ''}"><div class="hero-text">
          <h1>${esc(s.headline || s.name || '').replace(/\n/g, '<br>')}</h1>
          ${s.intro ? `<p>${esc(s.intro)}</p>` : ''}
          <div class="sum">${filled(s.stats).map(x => `<div><b>${esc(x.value)}</b>${esc(x.label)}</div>`).join('')}</div>
        </div>${s.photo ? `<figure class="hero-photo"><img src="${esc(s.photo)}" alt="${esc(s.name || '')} 사진"></figure>` : ''}</div>
      </section>
      ${R()}
      <section class="about-intro" id="story" data-f="=기획(재미, 전달, 검증)" data-ref="A2" data-tab="intro" aria-labelledby="story-title">
        <h2 class="cell sec-head" id="story-title">소개</h2><div class="rich">${sanitize(ab.body)}</div>
      </section>
      ${R()}
      <div class="cell sec-head" id="projects" data-f="=FILTER(프로젝트, 완성=TRUE)" data-ref="A3"><h2>프로젝트</h2></div>
      ${R()}
      <div class="ptiles">${tiles}</div>
      ${R()}
      <div class="cell sec-head" id="skills" data-f="=COUNTA(사용가능도구)" data-ref="A5"><h2>사용 가능 도구</h2>${sk.note ? `<small>${esc(sk.note)}</small>` : ''}<a class="tool-credits" href="assets/tool-logos/credits.html" target="_blank" rel="noopener">로고 출처</a></div>
      ${R()}
      <div class="tools" style="--n:${tCols}">${skills}</div>
      ${R()}
      <div class="profile-grid">
        <section class="profile-facts" id="about" data-f="=CONCAT(학력, 교육, 관심장르)" data-ref="A7" aria-labelledby="facts-title">
          <h2 class="cell sec-head" id="facts-title">이력</h2>
          <div class="profile-body"><dl>${facts}</dl></div>
        </section>
        <section class="contact" id="contact" data-f="=HYPERLINK(&quot;mailto:${esc(ct.email || '')}&quot;)" data-ref="E7" aria-labelledby="contact-title">
          <h2 class="cell sec-head" id="contact-title">연락</h2>
          <div class="profile-body">
            ${ct.email ? `<a class="mail" href="mailto:${esc(ct.email)}">${esc(ct.email)}</a>` : ''}
            ${ct.note ? `<p>${esc(ct.note)}</p>` : ''}
            ${links ? `<div class="links">${links}</div>` : ''}
          </div>
        </section>
      </div>`;
    $('#val').textContent = s.formula || '';
    watchSections();
  }

  // 스크롤 위치에 맞춰 수식 입력줄과 시트 탭을 바꿉니다
  function watchSections() {
    const secs = [...document.querySelectorAll('[data-f]')];
    const tabs = [...document.querySelectorAll('#tabs a')];
    const activate = section => {
      $('#val').textContent = section.dataset.f;
      $('#ref').textContent = section.dataset.ref;
      const id = section.dataset.tab || section.id;
      tabs.forEach(t => t.classList.toggle('on', t.hash === '#' + id));
    };
    const updateFromScroll = () => {
      const positions = secs.map(section => ({ section, top: section.getBoundingClientRect().top }));
      const passed = positions.filter(p => p.top <= innerHeight * .4);
      const atBottom = scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
      const current = atBottom ? positions[positions.length - 1] : passed[passed.length - 1] || positions[0];
      const candidates = atBottom
        ? positions.filter(p => p.top < innerHeight - 48 && p.section.getBoundingClientRect().bottom > 96)
        : positions.filter(p => Math.abs(p.top - current.top) < 1);
      const selected = candidates.find(p => '#' + p.section.id === location.hash) || current;
      activate(selected.section);
    };
    let framePending = false;
    window.addEventListener('scroll', () => {
      if (framePending) return;
      framePending = true;
      requestAnimationFrame(() => {
        framePending = false;
        updateFromScroll();
      });
    }, { passive: true });
    window.addEventListener('resize', updateFromScroll);
    updateFromScroll();
    tabs.forEach(t => t.addEventListener('click', () => {
      const section = secs.find(s => '#' + s.id === t.hash);
      if (section) activate(section);
    }));
    window.addEventListener('hashchange', () => {
      const section = secs.find(s => '#' + s.id === location.hash);
      if (section) activate(section);
    });
  }

  /* ----- 프로젝트 상세 ----- */
  // 동영상: 유튜브·비메오·구글 드라이브 링크는 플레이어로, 파일 주소는 video 태그로
  function videoHTML(u) {
    u = String(u || '').trim();
    if (!u) return '';
    const frame = src => `<div class="d-video"><iframe src="${esc(src)}" title="프로젝트 영상" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>`;
    let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,})/);
    if (m) return frame('https://www.youtube-nocookie.com/embed/' + m[1]);
    m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return frame('https://player.vimeo.com/video/' + m[1]);
    m = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (m) return frame('https://drive.google.com/file/d/' + m[1] + '/preview');
    const s = PF.safeUrl(u);
    return s ? `<div class="d-video"><video src="${esc(s)}" controls playsinline preload="metadata"></video></div>` : '';
  }
  const box = $('#detail');
  let cur = -1, lastFocus = null;
  function detailHTML(i) {
    const ps = C.projects, p = ps[i], n = (i + 1) % ps.length, np = ps[n];
    const sec = (title, inner) => inner ? `<div class="d-sec"><h3>${title}</h3>${inner}</div>` : '';
    const rich = h => (h && h.replace(/<[^>]*>/g, '').trim() || /<img/i.test(h || '')) ? `<div class="rich">${sanitize(h)}</div>` : '';
    const meta = filled(p.meta), tasks = filled(p.tasks), sys = filled(p.systems), res = filled(p.results), gal = filled(p.gallery), files = filled(p.files);
    const video = videoHTML(p.video);
    // 영상이 없으면 첫 갤러리 이미지를 상세 상단에 표시합니다.
    const leadImage = video ? '' : PF.safeUrl(gal.shift(), true);
    const taskImage = p.taskImage || {}, taskImageSrc = PF.safeUrl(taskImage.src, true);
    const taskFigure = taskImageSrc ? `${taskImage.title ? `<h4 class="d-task-heading">${esc(taskImage.title)}</h4>` : ''}<figure class="d-task-image"><a href="${esc(taskImageSrc)}" target="_blank" rel="noopener" aria-label="${esc(taskImage.caption || '담당 업무 이미지')} 원본 보기"><img src="${esc(taskImageSrc)}" alt="${esc(taskImage.alt || '')}" loading="lazy" decoding="async"></a>${taskImage.caption ? `<figcaption>${esc(taskImage.caption)}</figcaption>` : ''}</figure>` : '';
    const scenarioSamples = filled(p.scenarioSamples).filter(x => PF.safeUrl(x.src, true));
    const scenarioSection = scenarioSamples.length ? `<section class="d-scenarios" aria-labelledby="scenario-title"><h4 id="scenario-title">최미나 루트 시나리오 작성</h4><div class="d-scenario-grid">${scenarioSamples.map(x => `<figure><a href="${esc(PF.safeUrl(x.url) || PF.safeUrl(x.src, true))}" target="_blank" rel="noopener" aria-label="최미나 ${esc(x.label)} 시나리오 원문 보기"><img src="${esc(PF.safeUrl(x.src, true))}" alt="${esc(x.alt)}" width="420" height="480" loading="lazy" decoding="async"></a><figcaption>${esc(x.label)}</figcaption></figure>`).join('')}</div>${p.scenarioDetail ? `<div class="d-task-detail">${rich(p.scenarioDetail)}</div>` : ''}</section>` : '';
    const backgroundSamples = filled(p.backgroundSamples).filter(x => PF.safeUrl(x.src, true));
    const backgroundSection = backgroundSamples.length ? `<section class="d-backgrounds" aria-labelledby="background-title"><h4 id="background-title">배경 이미지 제작</h4><div class="d-background-grid">${backgroundSamples.map(x => `<figure><a href="${esc(PF.safeUrl(x.src, true))}" target="_blank" rel="noopener" aria-label="${esc(x.character)} ${esc(x.place)} 이미지 원본 보기"><img src="${esc(PF.safeUrl(x.src, true))}" alt="${esc(x.alt)}" width="1200" height="960" loading="lazy" decoding="async"></a><figcaption><b>${esc(x.character)}</b><span>${esc(x.place)}</span></figcaption></figure>`).join('')}</div>${p.backgroundDetail ? `<div class="d-task-detail">${rich(p.backgroundDetail)}</div>` : ''}</section>` : '';
    const csvSamples = filled(p.csvSamples).filter(x => PF.safeUrl(x.src, true));
    const csvSection = csvSamples.length ? `<section class="d-csv" aria-labelledby="csv-title"><h4 id="csv-title">시나리오 CSV 변환 및 사운드 데이터 입력</h4><div class="d-csv-grid">${csvSamples.map(x => `<figure><a href="${esc(PF.safeUrl(x.src, true))}" target="_blank" rel="noopener" aria-label="최미나 ${esc(x.label)} 데이터 캡처 원본 보기"><img src="${esc(PF.safeUrl(x.src, true))}" alt="${esc(x.alt)}" width="${esc(x.width)}" height="${esc(x.height)}" loading="lazy" decoding="async"></a><figcaption><b>${esc(x.label)}</b><span>${esc(x.scene)}</span></figcaption></figure>`).join('')}</div>${p.csvDetail ? `<div class="d-task-detail">${rich(p.csvDetail)}</div>` : ''}</section>` : '';
    const qaSection = p.qaDetail ? `<section class="d-qa" aria-labelledby="qa-title"><h4 id="qa-title">선택지 및 연출 QA</h4><div class="d-task-detail">${rich(p.qaDetail)}</div></section>` : '';
    return `
    <div class="d-bar"><button class="d-btn" data-close>목록으로</button>
      ${ps.length > 1 ? `<div class="d-nav"><span class="d-count">${i + 1} / ${ps.length}</span>
      <button class="d-btn" data-go="${(i + ps.length - 1) % ps.length}">이전</button>
      <button class="d-btn" data-go="${n}">다음</button></div>` : ''}</div>
    <article class="d-in">
      ${video || (leadImage ? `<a class="d-image" href="${esc(leadImage)}" target="_blank" rel="noopener" aria-label="${esc(p.title)} 이미지 원본 보기"><img src="${esc(leadImage)}" alt="${esc(p.title)} 대표 이미지" decoding="async"></a>` : '')}
      ${p.kicker ? `<div class="d-kicker">${esc(p.kicker)}</div>` : ''}
      <h2 class="d-title" id="d-title">${esc(p.title)}</h2>
      ${p.lead ? `<p class="d-lead">${esc(p.lead)}</p>` : ''}
      ${meta.length ? `<dl class="d-meta" style="--n:${Math.min(meta.length, 5)}">${meta.map(m => `<div><dt>${esc(m.label)}</dt><dd>${esc(m.value)}</dd></div>`).join('')}</dl>` : ''}
      <div class="d-grid"${files.length ? '' : ' style="grid-template-columns:1fr"'}><div>
        ${sec('기획 의도', rich(p.intent))}
        ${sec('담당 업무', taskFigure + (p.taskDetail ? `<div class="d-task-detail">${rich(p.taskDetail)}</div>` : '') + scenarioSection + backgroundSection + csvSection + qaSection + (tasks.length ? `<ul>${tasks.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''))}
        ${sec('핵심 시스템', sys.length ? `<div class="d-sys">${sys.map(x => `<div><b>${esc(x.title)}</b><span>${esc(x.desc)}</span></div>`).join('')}</div>` : '')}
        ${sec('결과', res.length ? `<div class="d-nums">${res.map(x => `<div><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join('')}</div>` : '')}
        ${p.aiUsage != null ? `<div class="d-sec d-ai-usage"><h3>AI 활용</h3>${rich(p.aiUsage)}</div>` : ''}
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

