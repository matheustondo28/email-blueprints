(() => {
  'use strict';

  /* ---------- Data ---------- */
  // window.TJ_CATALOG is generated from the live store's product feed (see README).
  const PRODUCTS = window.TJ_CATALOG || [];
  const FREE_SHIP = 75; // "Free Shipping to Spain over 75€"
  const LIVE = 'https://twojeys.com/products/';
  const PAGE = 16;
  const GROUPS = [
    { id: 'jewelry', name: 'Jewelry', img: 'ed-jewelry.webp' },
    { id: 'apparel', name: 'Apparel', img: 'ed-apparel.webp' },
    { id: 'headwear', name: 'Headwear', img: 'ed-headwear.webp' },
    { id: 'accessories', name: 'Accessories', img: 'ed-accessories.webp' },
  ];
  const STORES = [
    ['Barcelona · Rambla 42', 'Rambla de Catalunya, 42, Eixample, 08007 Barcelona', 'Mon-Sat 10am-9pm'],
    ['Barcelona · Canuda 24', 'Carrer de la Canuda, 24, Ciutat Vella, 08002 Barcelona', 'Mon-Sat 11am-9pm / Sun 12-8pm'],
    ['Barcelona · La Roca Village', 'La Roca Village, Local 18, 08430 Santa Agnès de Malanyanes', 'Mon-Sun 10am-9pm'],
    ['Madrid', 'Calle de Fuencarral, 71, Centro, 28004 Madrid', 'Mon-Sun 11am-9pm'],
    ['Valencia', 'Carrer del Comte de Salvatierra, 22, L\'Eixample, 46004 València', 'Mon-Sat 11am-9pm / Sun 12-8pm'],
    ['London · Regent Street', '310 Regent St., London W1B 3AU', 'Mon-Sat 11am-7pm / Sun 12-6pm'],
    ['London · Brewer Street', '21 Brewer St, London W1F 0RL', 'Mon-Sat 11am-7pm / Sun 12-6pm'],
    ['Paris', '72 Rue Vieille du Temple, 75003 Paris', 'Mon-Fri 11am-7pm / Sat 10:30am-8pm / Sun 12-7pm'],
    ['Amsterdam · Leidsestraat', 'Leidsestraat 28, 1017 PB Amsterdam', 'Tue-Sat 11am-7pm / Sun-Mon 12-7pm'],
    ['Amsterdam · Runstraat', 'Runstraat 31, 1016 GJ Amsterdam', 'Tue-Sat 11am-7pm / Sun-Mon 12-7pm'],
  ];
  const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

  /* ---------- Helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => '€' + (Number.isInteger(n) ? n : n.toFixed(2));
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };
  const findVar = (p, sel) => p.vars.find(v => v.o.every((x, i) => x === sel[i]));
  const key = (id, o) => id + '|' + o.join('|');
  const heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z"/></svg>';
  const xIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  /* ---------- State ---------- */
  const state = {
    group: 'all', sub: 'all', flag: 'all', sort: 'featured', wishOnly: false, shown: PAGE,
    cart: store.get('tj_cart2', []).filter(l => byId[l.id] && findVar(byId[l.id], l.o)),
    wish: new Set(store.get('tj_wish2', []).filter(id => byId[id])),
  };

  /* ---------- Static bits ---------- */
  const notices = ['Free shipping to Spain over 75€', 'Crafted in Barcelona', 'Recycled 925 sterling silver', '30 days to exchange', '3-year guarantee'];
  $('#ticker').innerHTML = [...notices, ...notices, ...notices, ...notices].map(n => `<span>${n}</span>`).join('');
  const words = ['Mediterranean cowboys', '✦', '2 stroke horses', '✦', 'Drifting mustangs', '✦', 'Shooting film', '✦', 'Crafting sterling silver', '✦'];
  $('#band').innerHTML = [...words, ...words, ...words, ...words].map(w => `<span>${w}</span>`).join('');
  $('#cats').innerHTML = GROUPS.map(g => `
    <button class="cat rv" data-group="${g.id}"><img src="img/${g.img}" alt="" loading="lazy"><b>${g.name}</b>
      <small>Shop now</small></button>`).join('');
  $('#storeList').innerHTML = STORES.map(s => `<li><b>${esc(s[0])}</b><span>${esc(s[1])}</span><small>${esc(s[2])}</small></li>`).join('');

  /* ---------- Shop ---------- */
  const chip = (attr, val, label, on) => `<button class="chip" data-${attr}="${esc(val)}" aria-pressed="${on}">${esc(label)}</button>`;
  function renderChips() {
    $('#catChips').innerHTML = chip('group', 'all', 'All', state.group === 'all') + GROUPS.map(g => chip('group', g.id, g.name, state.group === g.id)).join('');
    $('#flagChips').innerHTML = chip('flag', 'new', 'New ins', state.flag === 'new') + chip('flag', 'best', 'Best sellers', state.flag === 'best');
    const subs = state.group === 'all' ? [] : [...new Set(PRODUCTS.filter(p => p.group === state.group).map(p => p.sub))];
    $('#subChips').hidden = subs.length < 2;
    $('#subChips').innerHTML = chip('sub', 'all', 'See all', state.sub === 'all') + subs.map(s => chip('sub', s, s, state.sub === s)).join('');
  }
  function visible() {
    let list = PRODUCTS.filter(p =>
      (state.group === 'all' || p.group === state.group) &&
      (state.sub === 'all' || p.sub === state.sub) &&
      (state.flag === 'all' || p[state.flag]) &&
      (!state.wishOnly || state.wish.has(p.id)));
    if (state.flag === 'best' || (state.sort === 'featured' && state.group === 'all' && !state.wishOnly)) {
      // Best sellers first on the unfiltered view, in the store's own ranking.
      list = [...list].sort((a, b) => (a.best || 999) - (b.best || 999));
    }
    if (state.sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (state.sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (state.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }
  const badge = p => p.was ? `<span class="badge badge--hot">-${Math.round((1 - p.price / p.was) * 100)}%</span>`
    : p.new ? '<span class="badge badge--hot">New</span>' : p.best ? '<span class="badge">Best seller</span>' : '';
  const priceHTML = p => (p.was ? `<s>${money(p.was)}</s> ` : '') + money(p.price);
  function cardHTML(p) {
    return `<article class="card" data-id="${p.id}">
      <button class="card__media" data-open="${p.id}" aria-label="View ${esc(p.name)}">
        ${badge(p)}<img src="img/${p.imgs[0]}" alt="${esc(p.name)}" loading="lazy">
        ${p.imgs[1] ? `<img class="alt" src="img/${p.imgs[1]}" alt="" loading="lazy">` : ''}
      </button>
      <button class="icon-btn card__wish" data-wish="${p.id}" aria-pressed="${state.wish.has(p.id)}" aria-label="Save ${esc(p.name)}">${heart}</button>
      <button class="card__add" data-open="${p.id}" data-quick>${p.opts.length ? 'Choose options' : 'Quick add'}</button>
      <div class="card__info">
        <div><div class="card__name">${esc(p.name)}</div><div class="card__meta">${esc(p.sub)}</div></div>
        <div class="card__price">${priceHTML(p)}</div>
      </div></article>`;
  }
  function renderGrid() {
    const list = visible();
    $('#grid').innerHTML = list.slice(0, state.shown).map(cardHTML).join('');
    $('#empty').hidden = list.length > 0;
    $('#more').hidden = list.length <= state.shown;
    $('#more').textContent = `Show more (${Math.max(0, list.length - state.shown)})`;
    $('#shopCount').textContent = `${list.length} ${list.length === 1 ? 'product' : 'products'}`;
    $('#shopTitle').textContent = state.wishOnly ? 'Saved' : state.flag === 'new' ? 'New ins' : state.flag === 'best' ? 'Best sellers'
      : state.group === 'all' ? 'All products' : state.sub !== 'all' ? state.sub : GROUPS.find(g => g.id === state.group).name;
    renderChips();
  }
  function setFilter(patch) {
    Object.assign(state, { wishOnly: false, shown: PAGE }, patch);
    renderGrid();
  }

  $('#catChips').addEventListener('click', e => { const b = e.target.closest('[data-group]'); if (b) setFilter({ group: b.dataset.group, sub: 'all' }); });
  $('#subChips').addEventListener('click', e => { const b = e.target.closest('[data-sub]'); if (b) setFilter({ sub: b.dataset.sub }); });
  $('#flagChips').addEventListener('click', e => {
    const b = e.target.closest('[data-flag]'); if (b) setFilter({ flag: state.flag === b.dataset.flag ? 'all' : b.dataset.flag });
  });
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; renderGrid(); });
  $('#more').addEventListener('click', () => { state.shown += PAGE; renderGrid(); });
  $('#resetFilters').addEventListener('click', () => setFilter({ group: 'all', sub: 'all', flag: 'all' }));
  // Header nav, category tiles and footer links share data-group / data-flag.
  document.addEventListener('click', e => {
    const a = e.target.closest('.nav a, .cat, .footer__cols a[data-group]');
    if (!a) return;
    if (a.dataset.group) setFilter({ group: a.dataset.group, sub: 'all', flag: 'all' });
    else if (a.dataset.flag) setFilter({ group: 'all', sub: 'all', flag: a.dataset.flag });
    if (a.classList.contains('cat')) $('#shop').scrollIntoView();
    toggleMenu(false);
  });

  // Card interactions (grid + search results share the same markup)
  document.addEventListener('click', e => {
    const w = e.target.closest('[data-wish]');
    if (w) { toggleWish(w.dataset.wish); return; }
    const o = e.target.closest('[data-open]');
    if (!o) return;
    const p = byId[o.dataset.open];
    if ('quick' in o.dataset && !p.opts.length) addToCart(p.id, []);
    else openPdp(p.id);
  });

  /* ---------- Wishlist ---------- */
  function toggleWish(id) {
    state.wish.has(id) ? state.wish.delete(id) : state.wish.add(id);
    store.set('tj_wish2', [...state.wish]);
    $$(`[data-wish="${id}"]`).forEach(b => b.setAttribute('aria-pressed', state.wish.has(id)));
    renderCounts();
    if (state.wishOnly) renderGrid();
  }
  $('#wishBtn').addEventListener('click', () => {
    if (!state.wish.size) return toast('Nothing saved yet. Tap a heart to keep a piece.');
    setFilter({ group: 'all', sub: 'all', flag: 'all', wishOnly: true }); $('#shop').scrollIntoView();
  });

  /* ---------- Cart ---------- */
  const linePrice = l => findVar(byId[l.id], l.o).p;
  const cartQty = () => state.cart.reduce((n, l) => n + l.qty, 0);
  const cartTotal = () => state.cart.reduce((n, l) => n + l.qty * linePrice(l), 0);
  function renderCounts() {
    const q = cartQty(), c = $('#cartCount'), w = $('#wishCount');
    c.textContent = q; c.hidden = !q;
    w.textContent = state.wish.size; w.hidden = !state.wish.size;
    $('#cartBtn').setAttribute('aria-label', `Open bag, ${q} ${q === 1 ? 'item' : 'items'}`);
  }
  function renderCart() {
    store.set('tj_cart2', state.cart);
    const total = cartTotal(), q = cartQty(), left = FREE_SHIP - total;
    $('#drawerCount').textContent = q ? `(${q})` : '';
    $('#subtotal').textContent = money(total);
    $('#shipMsg').innerHTML = !q ? `Free shipping to Spain over ${money(FREE_SHIP)}.`
      : left > 0 ? `<b>${money(left)}</b> away from free shipping to Spain.` : 'You\'ve unlocked <b>free shipping</b> to Spain.';
    $('#shipFill').style.width = Math.min(100, (total / FREE_SHIP) * 100) + '%';
    $('#checkout').disabled = !q;
    $('#checkout').style.opacity = q ? 1 : .4;
    $('#cartItems').innerHTML = q ? state.cart.map((l, i) => {
      const p = byId[l.id];
      return `<div class="line">
        <div class="line__img"><img src="img/${p.imgs[0]}" alt=""></div>
        <div><div class="line__name">${esc(p.name)}</div><div class="line__meta">${esc(l.o.join(' · ') || p.sub)}</div>
          <div class="qty"><button data-q="${i}" data-d="-1" aria-label="Decrease quantity">−</button><span>${l.qty}</span><button data-q="${i}" data-d="1" aria-label="Increase quantity">+</button></div></div>
        <div class="line__right"><span>${money(linePrice(l) * l.qty)}</span><button class="line__rm" data-rm="${i}">Remove</button></div>
      </div>`;
    }).join('') : `<div class="drawer__empty"><b>Nothing here yet</b>Your bag is waiting for its first piece.<br><button class="btn btn--dark" data-shop>Start shopping</button></div>`;
    renderCounts();
  }
  function addToCart(id, o) {
    const line = state.cart.find(l => key(l.id, l.o) === key(id, o));
    line ? line.qty++ : state.cart.push({ id, o, qty: 1 });
    renderCart(); openDrawer();
  }
  $('#cartItems').addEventListener('click', e => {
    const q = e.target.closest('[data-q]'), rm = e.target.closest('[data-rm]');
    if (q) { const l = state.cart[+q.dataset.q]; l.qty += +q.dataset.d; if (l.qty < 1) state.cart.splice(+q.dataset.q, 1); renderCart(); }
    if (rm) { state.cart.splice(+rm.dataset.rm, 1); renderCart(); }
    if (e.target.closest('[data-shop]')) { closeDrawer(); $('#shop').scrollIntoView(); }
  });
  $('#checkout').addEventListener('click', () => toast('This is a design concept. Checkout isn\'t connected.'));

  const drawer = $('#drawer'), scrim = $('#scrim');
  let lastFocus;
  function openDrawer() {
    if ($('#pdp').open) $('#pdp').close();
    closeSearch();
    lastFocus = document.activeElement;
    drawer.classList.add('is-open'); drawer.inert = false; drawer.setAttribute('aria-hidden', 'false');
    scrim.hidden = false; document.body.classList.add('lock');
    $('#drawerClose').focus();
  }
  function closeDrawer() {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open'); drawer.inert = true; drawer.setAttribute('aria-hidden', 'true');
    scrim.hidden = true; document.body.classList.remove('lock');
    lastFocus?.focus?.();
  }
  $('#cartBtn').addEventListener('click', openDrawer);
  $('#drawerClose').addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);

  /* ---------- Product dialog ---------- */
  const pdp = $('#pdp');
  // sel: chosen value per option (null = not chosen yet); img: gallery index
  function openPdp(id, sel, img = 0) {
    const p = byId[id];
    // Pre-select options that only have one value.
    sel = sel || p.opts.map(o => (o.values.length === 1 ? o.values[0] : null));
    const complete = sel.every(Boolean);
    const v = complete ? findVar(p, sel) : null;
    const price = v ? v.p : p.price;
    // A value is offered when some in-stock variant matches it plus the other current choices.
    const canPick = (i, val) => p.vars.some(x => x.a && x.o[i] === val && sel.every((s, j) => j === i || !s || x.o[j] === s));
    const missing = p.opts.find((o, i) => !sel[i]);
    const cta = !complete ? `Select ${missing.name.toLowerCase()}` : v && v.a ? `Add to bag · ${money(price)}` : 'Sold out';
    const isJewel = p.group === 'jewelry';
    pdp.innerHTML = `<div class="pdp__wrap">
      <button class="icon-btn pdp__close" data-close aria-label="Close">${xIcon}</button>
      <div class="pdp__media">${badge(p)}<img src="img/${p.imgs[img]}" alt="${esc(p.name)}">
        ${p.imgs.length > 1 ? `<div class="pdp__thumbs">${p.imgs.map((s, i) => `<button data-img="${i}" aria-pressed="${i === img}" aria-label="Photo ${i + 1}"><img src="img/${s}" alt=""></button>`).join('')}</div>` : ''}
      </div>
      <div class="pdp__body">
        <p class="eyebrow eyebrow--dark">${esc(p.sub)}</p>
        <h2 id="pdpName">${esc(p.name)}</h2>
        <p class="pdp__price">${p.was ? `<s>${money(p.was)}</s> ` : ''}${money(price)}</p>
        <p class="pdp__desc">${esc(p.desc).replace(/\n/g, '<br>')}</p>
        ${p.opts.map((o, i) => `<div class="opt"><div class="opt__label"><span>${esc(o.name)}</span><b>${esc(sel[i] || 'Select')}</b></div>
          <div class="opt__row">${o.values.map(val => `<button class="size" data-oi="${i}" data-val="${esc(val)}" aria-pressed="${val === sel[i]}" ${canPick(i, val) ? '' : 'disabled title="Sold out"'}>${esc(val)}</button>`).join('')}</div></div>`).join('')}
        <div class="pdp__buy">
          <button class="btn btn--dark btn--full" data-buy ${complete && !(v && v.a) ? 'disabled' : ''}>${cta}</button>
          <div class="pdp__perks"><span>✦ Free shipping to Spain over ${money(FREE_SHIP)}</span><span>✦ 30 days to exchange</span><span>✦ 3-year guarantee</span></div>
        </div>
        <div class="pdp__acc">
          ${isJewel ? '<details><summary>Product care</summary><p>Store your jewelry in a TJ box or a cotton pouch, and take it off for sport and sleep. Pure silver pieces are fine under water; plated pieces can get wet but shouldn\'t be bathed in daily. Avoid the sea: salt deteriorates any jewelry.</p></details>' : ''}
          <details><summary>Shipping &amp; returns</summary><p>Spain: 2 to 4 business days, free over €75. Europe: 6 to 8 business days. Rest of the world: 8 to 10. Exchanges within 30 days, returns within 14 calendar days.</p></details>
        </div>
        <a class="link pdp__live" href="${LIVE + p.id}" target="_blank" rel="noopener">View on twojeys.com</a>
      </div></div>`;
    pdp.onclick = e => {
      if (e.target === pdp || e.target.closest('[data-close]')) return pdp.close();
      const t = e.target.closest('[data-img]'), s = e.target.closest('[data-oi]');
      if (t) return openPdp(id, sel, +t.dataset.img);
      if (s) { const next = [...sel]; next[+s.dataset.oi] = s.dataset.val; return openPdp(id, next, img); }
      if (e.target.closest('[data-buy]')) {
        if (!complete) { toast(`Pick a ${missing.name.toLowerCase()} first.`); return; }
        addToCart(id, sel);
      }
    };
    if (!pdp.open) pdp.showModal();
    (complete && v && v.a ? $('[data-buy]', pdp) : $('[data-close]', pdp)).focus();
  }

  /* ---------- Search ---------- */
  const search = $('#search'), sInput = $('#searchInput');
  function renderSearch() {
    const q = sInput.value.trim().toLowerCase();
    const hits = q ? PRODUCTS.filter(p => `${p.name} ${p.sub} ${p.group} ${p.desc}`.toLowerCase().includes(q))
      : PRODUCTS.filter(p => p.best).sort((a, b) => a.best - b.best).slice(0, 8);
    $('#searchResults').innerHTML = `<p class="search__hint">${q ? `${hits.length} result${hits.length === 1 ? '' : 's'} for “${esc(q)}”` : 'Best sellers'}</p>` + hits.slice(0, 24).map(cardHTML).join('');
  }
  function openSearch() { search.hidden = false; document.body.classList.add('lock'); sInput.value = ''; renderSearch(); sInput.focus(); }
  function closeSearch() { if (search.hidden) return; search.hidden = true; document.body.classList.remove('lock'); }
  $('#searchBtn').addEventListener('click', openSearch);
  $('#searchClose').addEventListener('click', () => { closeSearch(); $('#searchBtn').focus(); });
  sInput.addEventListener('input', renderSearch);
  $('#searchResults').addEventListener('click', e => { if (e.target.closest('[data-open]')) closeSearch(); }, true);

  /* ---------- Menu, header, misc ---------- */
  const menuBtn = $('#menuBtn'), nav = $('#nav');
  function toggleMenu(open = !nav.classList.contains('is-open')) {
    if (!open && !nav.classList.contains('is-open')) return;
    nav.classList.toggle('is-open', open); menuBtn.setAttribute('aria-expanded', open);
    document.body.classList.toggle('lock', open);
  }
  menuBtn.addEventListener('click', () => toggleMenu());
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    closeDrawer(); closeSearch(); toggleMenu(false);
  });

  const header = $('#header'), hero = $('.hero');
  new IntersectionObserver(([en]) => header.classList.toggle('is-light', !en.isIntersecting), { rootMargin: '-70px 0px 0px 0px' }).observe(hero);

  $('#clubForm').addEventListener('submit', e => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('#email').value.trim());
    $('#clubMsg').textContent = ok ? 'You\'re in. (Concept only: nothing was sent.)' : 'That email doesn\'t look right.';
    if (ok) e.target.reset();
  });

  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 2800);
  }

  /* ---------- Init ---------- */
  renderGrid(); renderCart();
  $$('.story__lead, .story__body, .craft article, .club h2, .shop__head, .stores__wrap').forEach(el => el.classList.add('rv'));
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .08 });
  $$('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
})();
