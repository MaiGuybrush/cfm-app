/**
 * CIM Portal 共用邏輯：狀態、篩選、分組、常用收藏。
 * 資料在 portal-data.js；index-route / index-directory / index-stripes 只負責畫面。
 */
window.CimCore = (function () {
  const C = window.CIM_PORTAL_CONFIG;
  const KEY = 'CIM_PORTAL_FAVORITES';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const st = { role: 'ai', fab: 'ALL', q: '', aiView: 'scenario', favs: load() };
  const subs = [];

  const ROLES = [...C.roles, { id: 'fav', name: '我的常用', desc: '你釘選的系統，記在這台電腦的瀏覽器裡。' }];
  const role = id => ROLES.find(r => r.id === id);
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const has = (s, f) => s.fabs.includes('ALL') || s.fabs.includes(f);
  const isFav = id => st.favs.includes(id);
  const fabName = f => (f === 'ALL' ? '全廠' : f);

  const inRole = (s, r) => r === 'all' || (r === 'fav' ? isFav(s.id) : s.roles.includes(r));
  const visible = s => {
    if (st.fab !== 'ALL' && !has(s, st.fab)) return false;
    const q = st.q.toLowerCase();
    return !q || [s.name, s.title, s.code, s.desc].some(t => (t || '').toLowerCase().includes(q));
  };
  const count = r => C.systems.filter(s => inRole(s, r) && visible(s)).length;

  /** 目前角色下、符合篩選的系統，依情境分組。flat=true 代表沒有子分組。 */
  function groups() {
    const list = C.systems.filter(s => inRole(s, st.role) && visible(s));
    let gs;
    if (st.role === 'ai') {
      const [defs, key] = st.aiView === 'scenario' ? [C.aiViews.scenarios, 'scenario'] : [C.aiViews.technologies, 'tech'];
      gs = defs.map(g => ({ ...g, systems: list.filter(s => s.aiMeta && s.aiMeta[key] === g.id) }));
    } else if (C.contextGroups[st.role]) {
      gs = C.contextGroups[st.role].map(g => ({ ...g, systems: list.filter(s => s.contexts && s.contexts[st.role] === g.id) }));
    } else {
      gs = [{ name: role(st.role).name, flat: true, systems: list }];
    }
    return gs.filter(g => g.systems.length);
  }
  const total = () => groups().reduce((n, g) => n + g.systems.length, 0);

  /** 空狀態文字（已 escape，可直接放進 HTML）。 */
  function emptyMsg() {
    if (st.q) return `沒有符合「${esc(st.q)}」的系統。換個關鍵字，或取消廠別篩選。`;
    if (st.role === 'fav' && st.fab === 'ALL') return '還沒有常用系統。點系統旁的星號，常用系統會集中在這裡。';
    return '這個廠別下沒有這類系統。取消廠別篩選就能看到全部。';
  }

  function set(p) {
    Object.assign(st, p);
    // 搜尋在目前角色找不到時，自動擴大到全部系統
    if ('q' in p && st.q && !count(st.role) && count('all')) st.role = 'all';
    subs.forEach(f => f());
  }

  function toggleFav(id) {
    const i = st.favs.indexOf(id);
    if (i < 0) st.favs.push(id); else st.favs.splice(i, 1);
    try { localStorage.setItem(KEY, JSON.stringify(st.favs)); } catch (e) { /* 無痕模式：本次有效即可 */ }
    subs.forEach(f => f());
  }

  /** 重繪後把鍵盤焦點還給同一個 [data-k] 元素。 */
  function keepFocus(fn) {
    const a = document.activeElement;
    const k = a && a.closest && a.closest('[data-k]');
    const key = k && k.dataset.k;
    fn();
    if (key) { const el = document.querySelector('[data-k="' + key + '"]'); if (el) el.focus(); }
  }
  function mount(render) {
    const run = () => keepFocus(() => render(st));
    subs.push(run);
    run();
  }

  function bindSearch(input) {
    input.addEventListener('input', () => set({ q: input.value.trim() }));
    input.addEventListener('keydown', e => { if (e.key === 'Escape') { input.value = ''; set({ q: '' }); } });
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); input.focus(); input.select();
      }
    });
  }

  /** 系統圖示：先放首字母，官方圖示載入成功才蓋上去。 */
  const icon = s => `<span class="ico"><b>${esc((s.name || '?').trim().charAt(0).toUpperCase())}</b>${s.icon ? `<img src="${esc(s.icon)}" alt="" loading="lazy" onerror="this.remove()">` : ''}</span>`;
  const star = on => `<svg width="18" height="18" viewBox="0 0 24 24" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  const starBtn = s => `<button class="star" data-star="${esc(s.id)}" data-k="s-${esc(s.id)}" aria-pressed="${isFav(s.id)}" aria-label="${isFav(s.id) ? '取消常用' : '加入常用'}：${esc(s.name)}">${star(isFav(s.id))}</button>`;

  return { C, st, ROLES, role, esc, has, isFav, fabName, count, groups, total, emptyMsg, set, toggleFav, mount, bindSearch, icon, star, starBtn };
})();
