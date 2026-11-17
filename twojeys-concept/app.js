(() => {
  'use strict';

  /* ---------- Data (placeholder catalog) ---------- */
  const FREE_SHIP = 100;
  const RING = ['50', '52', '54', '56', '58', '60', '62', '64'];
  const CHAIN = ['45 cm', '50 cm', '55 cm', '60 cm'];
  const WRIST = ['S', 'M', 'L'];
  const ONE = ['One size'];
  const METAL = { silver: '925 Silver', gold: '18k Gold plated', black: 'Oxidized silver' };
  const CATS = [
    { id: 'rings', name: 'Rings', art: 'signet' },
    { id: 'necklaces', name: 'Necklaces', art: 'pendant' },
    { id: 'bracelets', name: 'Bracelets', art: 'cuff' },
    { id: 'earrings', name: 'Earrings', art: 'hoops' },
  ];
  const PRODUCTS = [
    { id: 'drifter', name: 'Drifter Signet', cat: 'rings', art: 'signet', price: 85, metals: ['silver', 'gold'], sizes: RING, badge: 'Bestseller', desc: 'A heavy flat-top signet with a hand-cut star. The one that started it.' },
    { id: 'sunset', name: 'Sunset Chain', cat: 'necklaces', art: 'chain', price: 110, metals: ['silver', 'gold'], sizes: CHAIN, badge: 'New', desc: 'Flat curb links that sit close to the collarbone and catch the last light.' },
    { id: 'openroad', name: 'Open Road Cuff', cat: 'bracelets', art: 'cuff', price: 90, metals: ['silver', 'gold', 'black'], sizes: WRIST, desc: 'A solid open cuff, bent by hand. Squeeze to fit, forget it is there.' },
    { id: 'nomad', name: 'Nomad Tag', cat: 'necklaces', art: 'tag', price: 120, metals: ['silver', 'black'], sizes: CHAIN, badge: 'Bestseller', desc: 'A blank tag on a rope chain. Leave it clean or let the road write on it.' },
    { id: 'route', name: 'Route Band', cat: 'rings', art: 'band', price: 65, metals: ['silver', 'gold', 'black'], sizes: RING, desc: 'A wide, plain band with soft edges. Stacks with everything.' },
    { id: 'afterhours', name: 'Afterhours Hoops', cat: 'earrings', art: 'hoops', price: 55, metals: ['silver', 'gold'], sizes: ONE, desc: 'Thick hinged hoops, sold as a pair. Sleep in them.' },
    { id: 'twinstar', name: 'Twin Star Signet', cat: 'rings', art: 'dstar', price: 95, metals: ['silver', 'gold'], sizes: RING, badge: 'New', desc: 'Two stars, side by side, pressed deep into a wide face.' },
    { id: 'milemarker', name: 'Mile Marker Bracelet', cat: 'bracelets', art: 'bracelet', price: 105, metals: ['silver', 'gold'], sizes: WRIST, desc: 'Chunky cable links with a hidden box clasp. Gets better with knocks.' },
    { id: 'lowtide', name: 'Lowtide Pendant', cat: 'necklaces', art: 'pendant', price: 98, metals: ['silver', 'gold'], sizes: CHAIN, desc: 'A worn coin pendant with a star at the centre, on a fine curb chain.' },
    { id: 'midnight', name: 'Midnight Band', cat: 'rings', art: 'band', price: 70, metals: ['black', 'silver'], sizes: RING, desc: 'The Route Band, oxidized until almost black. Wears back to silver at the edges.' },
    { id: 'stardust', name: 'Stardust Studs', cat: 'earrings', art: 'studs', price: 45, metals: ['silver', 'gold'], sizes: ONE, desc: 'Small four-point stars with screw backs. Sold as a pair.' },
    { id: 'coastline', name: 'Coastline Chain', cat: 'necklaces', art: 'chain', price: 135, metals: ['silver', 'black'], sizes: CHAIN, desc: 'Our heaviest chain. Wide links, long drop, a proper weight on the neck.' },
  ];
  const POSTS = [
    { t: 'Route 66, again', k: 'Road notes', bg: 'linear-gradient(160deg,#f2a65a 0%,#d1495b 45%,#2e1f47 100%)' },
    { t: 'Inside the workshop', k: 'Craft', bg: 'linear-gradient(200deg,#cfcfcf 0%,#6f6f6f 50%,#141414 100%)' },
    { t: 'Dawn patrol', k: 'Surf', bg: 'linear-gradient(170deg,#bfe3e0 0%,#3a7ca5 50%,#0b2545 100%)' },
    { t: 'How to stack rings', k: 'Guide', bg: 'linear-gradient(150deg,#e9d8a6 0%,#b08a3c 55%,#3b2a12 100%)' },
    { t: 'Barcelona after dark', k: 'City', bg: 'linear-gradient(190deg,#ff5a1f 0%,#7a1f3d 50%,#0b0b0b 100%)' },
  ];
  const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

  /* ---------- Helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = n => '€' + n.toFixed(0);
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };

  /* ---------- Jewelry illustrations ---------- */
  const GRAD = {
    silver: ['#ffffff', '#9c9c9c', '#f1f1f1', '#6c6c6c'],
    gold: ['#fbeeb9', '#b98a2c', '#f6de94', '#86601a'],
    black: ['#6a6a6a', '#171717', '#4a4a4a', '#070707'],
  };
  let uid = 0;
  const star = (cx, cy, r) => {
    const k = r * 0.3;
    return `M${cx} ${cy - r}L${cx + k} ${cy - k}L${cx + r} ${cy}L${cx + k} ${cy + k}L${cx} ${cy + r}L${cx - k} ${cy + k}L${cx - r} ${cy}L${cx - k} ${cy - k}Z`;
  };
  function art(type, metal = 'silver') {
    const g = GRAD[metal], id = 'm' + (++uid), u = `url(#${id})`;
    const ink = metal === 'black' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.5)';
    const hi = 'rgba(255,255,255,.55)';
    const chain = (w, dash) => `<path d="M38 26Q100 194 162 26" fill="none" stroke="${u}" stroke-width="${w}" stroke-dasharray="${dash}" stroke-linecap="round"/>`;
    const shapes = {
      band: `<ellipse cx="100" cy="102" rx="54" ry="60" fill="none" stroke="${u}" stroke-width="20"/>
             <ellipse cx="100" cy="102" rx="62" ry="68" fill="none" stroke="${hi}" stroke-width="1"/>
             <ellipse cx="100" cy="102" rx="45" ry="51" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1"/>`,
      signet: `<ellipse cx="100" cy="118" rx="46" ry="50" fill="none" stroke="${u}" stroke-width="11"/>
               <rect x="62" y="38" width="76" height="50" rx="16" fill="${u}"/>
               <rect x="62.5" y="38.5" width="75" height="49" rx="15.5" fill="none" stroke="${hi}"/>
               <path d="${star(100, 63, 15)}" fill="${ink}"/>`,
      dstar: `<ellipse cx="100" cy="118" rx="46" ry="50" fill="none" stroke="${u}" stroke-width="11"/>
              <rect x="54" y="40" width="92" height="46" rx="14" fill="${u}"/>
              <rect x="54.5" y="40.5" width="91" height="45" rx="13.5" fill="none" stroke="${hi}"/>
              <path d="${star(82, 63, 12)}${star(118, 63, 12)}" fill="${ink}"/>`,
      chain: chain(7, '11 4'),
      tag: `${chain(3.5, '1 5')}<rect x="87" y="110" width="26" height="46" rx="5" fill="${u}"/>
            <rect x="87.5" y="110.5" width="25" height="45" rx="4.5" fill="none" stroke="${hi}"/><circle cx="100" cy="119" r="2.6" fill="${ink}"/>`,
      pendant: `${chain(3, '6 3')}<circle cx="100" cy="130" r="21" fill="${u}"/><circle cx="100" cy="130" r="20.5" fill="none" stroke="${hi}"/>
                <circle cx="100" cy="130" r="15" fill="none" stroke="${ink}" stroke-width=".8"/><path d="${star(100, 130, 10)}" fill="${ink}"/>`,
      bracelet: `<ellipse cx="100" cy="100" rx="66" ry="44" fill="none" stroke="${u}" stroke-width="11" stroke-dasharray="15 5" stroke-linecap="round"/>`,
      cuff: `<path d="M56 146A62 62 0 1 1 144 146" fill="none" stroke="${u}" stroke-width="17" stroke-linecap="round"/>
             <path d="M49 140A70 70 0 0 1 100 30" fill="none" stroke="${hi}" stroke-width="1.2" stroke-linecap="round"/>`,
      hoops: `<circle cx="66" cy="96" r="28" fill="none" stroke="${u}" stroke-width="9"/><circle cx="134" cy="108" r="28" fill="none" stroke="${u}" stroke-width="9"/>
              <circle cx="66" cy="96" r="32.5" fill="none" stroke="${hi}" stroke-width=".8"/><circle cx="134" cy="108" r="32.5" fill="none" stroke="${hi}" stroke-width=".8"/>`,
      studs: `<path d="${star(66, 94, 24)}${star(134, 108, 24)}" fill="${u}" stroke="${hi}" stroke-width=".8"/>`,
    };
    return `<svg class="art" viewBox="0 0 200 200" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${g[0]}"/><stop offset=".38" stop-color="${g[1]}"/><stop offset=".62" stop-color="${g[2]}"/><stop offset="1" stop-color="${g[3]}"/>
      </linearGradient></defs>
      <ellipse cx="100" cy="186" rx="52" ry="5" fill="rgba(0,0,0,.14)"/>${shapes[type]}</svg>`;
  }
  const heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z"/></svg>';
  const xIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  /* ---------- State ---------- */
  const state = {
    cat: 'all', metal: 'all', sort: 'featured', wishOnly: false,
    cart: store.get('tj_cart', []).filter(l => byId[l.id]),
    wish: new Set(store.get('tj_wish', []).filter(id => byId[id])),
    shown: {}, // product id -> finish currently shown on its card
  };

  /* ---------- Static bits ---------- */
  const notices = ['Free shipping over €' + FREE_SHIP, 'Solid 925 sterling silver', 'One free size exchange', '30 day returns', 'Dispatched in 24h'];
  $('#ticker').innerHTML = [...notices, ...notices, ...notices, ...notices].map(n => `<span>${n}</span>`).join('');
  const words = ['Freedom', '✦', 'Adventure', '✦', 'Individuality', '✦', 'No plan', '✦'];
  $('#band').innerHTML = [...words, ...words, ...words, ...words].map(w => `<span>${w}</span>`).join('');
  $('#heroArt').innerHTML = art('signet', 'silver');
  $('#cats').innerHTML = CATS.map(c => `
    <button class="cat rv" data-cat="${c.id}">${art(c.art)}<b>${c.name}</b>
      <small>${PRODUCTS.filter(p => p.cat === c.id).length} pieces</small></button>`).join('');
  $('#rail').innerHTML = POSTS.map(p => `
    <a class="post" href="#journal"><div class="post__img"><i style="background:${p.bg}"></i><b>${p.t}</b></div><p>${p.k} · 4 min read</p></a>`).join('');

  /* ---------- Shop ---------- */
  const chip = (group, val, label, dot) =>
    `<button class="chip" data-${group}="${val}" aria-pressed="${state[group] === val}">${dot ? `<i class="dot dot--${val}"></i>` : ''}${label}</button>`;
  function renderChips() {
    $('#catChips').innerHTML = chip('cat', 'all', 'All') + CATS.map(c => chip('cat', c.id, c.name)).join('');
    $('#metalChips').innerHTML = ['silver', 'gold', 'black'].map(m => chip('metal', m, m === 'black' ? 'Oxidized' : m, true)).join('');
  }
  function visible() {
    let list = PRODUCTS.filter(p =>
      (state.cat === 'all' || p.cat === state.cat) &&
      (state.metal === 'all' || p.metals.includes(state.metal)) &&
      (!state.wishOnly || state.wish.has(p.id)));
    if (state.sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (state.sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (state.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }
  function cardHTML(p) {
    const metal = state.shown[p.id] || p.metals[0];
    return `<article class="card" data-id="${p.id}">
      <button class="card__media" data-open="${p.id}" aria-label="View ${p.name}">
        ${p.badge ? `<span class="badge ${p.badge === 'New' ? 'badge--hot' : ''}">${p.badge}</span>` : ''}${art(p.art, metal)}
      </button>
      <button class="icon-btn card__wish" data-wish="${p.id}" aria-pressed="${state.wish.has(p.id)}" aria-label="Save ${p.name}">${heart}</button>
      <button class="card__add" data-open="${p.id}">${p.sizes.length > 1 ? 'Choose size' : 'Quick add'}</button>
      <div class="card__info">
        <div><div class="card__name">${p.name}</div><div class="card__meta">${METAL[metal]}</div>
          <div class="swatches">${p.metals.map(m => `<button data-swatch="${m}" aria-pressed="${m === metal}" aria-label="${METAL[m]}"><i class="dot dot--${m}"></i></button>`).join('')}</div>
        </div>
        <div class="card__price">${money(p.price)}</div>
      </div></article>`;
  }
  function renderGrid() {
    const list = visible();
    $('#grid').innerHTML = list.map(cardHTML).join('');
    $('#empty').hidden = list.length > 0;
    $('#shopCount').textContent = `${list.length} ${list.length === 1 ? 'piece' : 'pieces'}`;
    $('#shopTitle').textContent = state.wishOnly ? 'Saved pieces' : state.cat === 'all' ? 'All pieces' : CATS.find(c => c.id === state.cat).name;
    renderChips();
  }
  function setCat(cat) { state.cat = cat; state.wishOnly = false; renderGrid(); }

  $('#catChips').addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (b) setCat(b.dataset.cat); });
  $('#metalChips').addEventListener('click', e => {
    const b = e.target.closest('[data-metal]'); if (!b) return;
    state.metal = state.metal === b.dataset.metal ? 'all' : b.dataset.metal;
    if (state.metal !== 'all') PRODUCTS.forEach(p => { if (p.metals.includes(state.metal)) state.shown[p.id] = state.metal; });
    renderGrid();
  });
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; renderGrid(); });
  $('#resetFilters').addEventListener('click', () => { state.metal = 'all'; setCat('all'); });
  $('#cats').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    setCat(b.dataset.cat); $('#shop').scrollIntoView();
  });
  $('#nav').addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a) return;
    if (a.dataset.cat) setCat(a.dataset.cat);
    toggleMenu(false);
  });

  // Card interactions (grid + search results share the same markup)
  document.addEventListener('click', e => {
    const sw = e.target.closest('[data-swatch]');
    if (sw) {
      const card = sw.closest('.card'), p = byId[card.dataset.id];
      state.shown[p.id] = sw.dataset.swatch;
      card.outerHTML = cardHTML(p);
      return;
    }
    const w = e.target.closest('[data-wish]');
    if (w) { toggleWish(w.dataset.wish); return; }
    const o = e.target.closest('[data-open]');
    if (o) {
      const p = byId[o.dataset.open];
      const metal = state.shown[p.id] || p.metals[0];
      if (o.classList.contains('card__add') && p.sizes.length === 1) addToCart(p.id, metal, p.sizes[0]);
      else openPdp(p.id, metal);
    }
  });

  /* ---------- Wishlist ---------- */
  function toggleWish(id) {
    state.wish.has(id) ? state.wish.delete(id) : state.wish.add(id);
    store.set('tj_wish', [...state.wish]);
    $$(`[data-wish="${id}"]`).forEach(b => b.setAttribute('aria-pressed', state.wish.has(id)));
    renderCounts();
    if (state.wishOnly) renderGrid();
  }
  $('#wishBtn').addEventListener('click', () => {
    if (!state.wish.size) return toast('Nothing saved yet. Tap a heart to keep a piece.');
    state.wishOnly = true; state.cat = 'all'; state.metal = 'all'; renderGrid(); $('#shop').scrollIntoView();
  });

  /* ---------- Cart ---------- */
  const cartQty = () => state.cart.reduce((n, l) => n + l.qty, 0);
  const cartTotal = () => state.cart.reduce((n, l) => n + l.qty * byId[l.id].price, 0);
  function renderCounts() {
    const q = cartQty(), c = $('#cartCount'), w = $('#wishCount');
    c.textContent = q; c.hidden = !q;
    w.textContent = state.wish.size; w.hidden = !state.wish.size;
    $('#cartBtn').setAttribute('aria-label', `Open bag, ${q} ${q === 1 ? 'item' : 'items'}`);
  }
  function renderCart() {
    store.set('tj_cart', state.cart);
    const total = cartTotal(), q = cartQty(), left = FREE_SHIP - total;
    $('#drawerCount').textContent = q ? `(${q})` : '';
    $('#subtotal').textContent = money(total);
    $('#shipMsg').innerHTML = !q ? `Free shipping on orders over ${money(FREE_SHIP)}.`
      : left > 0 ? `You're <b>${money(left)}</b> away from free shipping.` : 'You\'ve unlocked <b>free shipping</b>.';
    $('#shipFill').style.width = Math.min(100, (total / FREE_SHIP) * 100) + '%';
    $('#checkout').disabled = !q;
    $('#checkout').style.opacity = q ? 1 : .4;
    $('#cartItems').innerHTML = q ? state.cart.map((l, i) => {
      const p = byId[l.id];
      return `<div class="line">
        <div class="line__img">${art(p.art, l.metal)}</div>
        <div><div class="line__name">${p.name}</div><div class="line__meta">${METAL[l.metal]} · ${l.size}</div>
          <div class="qty"><button data-q="${i}" data-d="-1" aria-label="Decrease quantity">−</button><span>${l.qty}</span><button data-q="${i}" data-d="1" aria-label="Increase quantity">+</button></div></div>
        <div class="line__right"><span>${money(p.price * l.qty)}</span><button class="line__rm" data-rm="${i}">Remove</button></div>
      </div>`;
    }).join('') : `<div class="drawer__empty"><b>Nothing here yet</b>Your bag is waiting for its first piece.<br><button class="btn btn--dark" data-shop>Start shopping</button></div>`;
    renderCounts();
  }
  function addToCart(id, metal, size) {
    const line = state.cart.find(l => l.id === id && l.metal === metal && l.size === size);
    line ? line.qty++ : state.cart.push({ id, metal, size, qty: 1 });
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
  function openPdp(id, metal, size = null) {
    const p = byId[id];
    if (p.sizes.length === 1) size = p.sizes[0];
    const sizeLabel = p.cat === 'rings' ? 'Ring size (EU)' : p.cat === 'necklaces' ? 'Length' : 'Size';
    pdp.innerHTML = `<div class="pdp__wrap">
      <button class="icon-btn pdp__close" data-close aria-label="Close">${xIcon}</button>
      <div class="pdp__media">${p.badge ? `<span class="badge ${p.badge === 'New' ? 'badge--hot' : ''}">${p.badge}</span>` : ''}${art(p.art, metal)}</div>
      <div class="pdp__body">
        <p class="eyebrow eyebrow--dark">${CATS.find(c => c.id === p.cat).name}</p>
        <h2 id="pdpName">${p.name}</h2>
        <p class="pdp__price">${money(p.price)}</p>
        <p class="pdp__desc">${p.desc}</p>
        <div class="opt"><div class="opt__label"><span>Finish</span><b>${METAL[metal]}</b></div>
          <div class="opt__row">${p.metals.map(m => `<button class="size" data-m="${m}" aria-pressed="${m === metal}"><i class="dot dot--${m}" style="display:inline-block;vertical-align:-1px;margin-right:6px"></i>${METAL[m]}</button>`).join('')}</div></div>
        ${p.sizes.length > 1 ? `<div class="opt"><div class="opt__label"><span>${sizeLabel}</span><b>${size || 'Select'}</b></div>
          <div class="opt__row">${p.sizes.map(s => `<button class="size" data-s="${s}" aria-pressed="${s === size}">${s}</button>`).join('')}</div></div>` : ''}
        <div class="pdp__buy">
          <button class="btn btn--dark btn--full" data-buy>${size ? `Add to bag · ${money(p.price)}` : 'Select a size'}</button>
          <div class="pdp__perks"><span>✦ Free shipping over ${money(FREE_SHIP)}</span><span>✦ Free size exchange</span><span>✦ 30 day returns</span></div>
        </div>
        <div class="pdp__acc">
          <details><summary>Materials &amp; care</summary><p>${metal === 'gold' ? '925 sterling silver with 18k gold plating.' : metal === 'black' ? '925 sterling silver, oxidized by hand.' : 'Solid 925 sterling silver.'} Keep it dry when you can, wipe with the cloth in the box when it dulls.</p></details>
          <details><summary>Shipping &amp; returns</summary><p>Dispatched within 24 hours. Return or exchange within 30 days, unworn, in the original box.</p></details>
        </div>
      </div></div>`;
    pdp.onclick = e => {
      if (e.target === pdp || e.target.closest('[data-close]')) return pdp.close();
      const m = e.target.closest('[data-m]'), s = e.target.closest('[data-s]');
      if (m) { state.shown[id] = m.dataset.m; return openPdp(id, m.dataset.m, size); }
      if (s) return openPdp(id, metal, s.dataset.s);
      if (e.target.closest('[data-buy]')) {
        if (!size) { toast('Pick a size first.'); $('[data-s]', pdp)?.focus(); return; }
        addToCart(id, metal, size);
      }
    };
    if (!pdp.open) pdp.showModal();
    (size && p.sizes.length > 1 ? $('[data-buy]', pdp) : $('[data-close]', pdp)).focus();
  }
  pdp.addEventListener('close', () => renderGrid());

  /* ---------- Search ---------- */
  const search = $('#search'), sInput = $('#searchInput');
  function renderSearch() {
    const q = sInput.value.trim().toLowerCase();
    const hits = q ? PRODUCTS.filter(p => `${p.name} ${p.cat} ${p.desc} ${p.metals.join(' ')}`.toLowerCase().includes(q)) : PRODUCTS.filter(p => p.badge);
    $('#searchResults').innerHTML = `<p class="search__hint">${q ? `${hits.length} result${hits.length === 1 ? '' : 's'} for “${q.replace(/[<>&]/g, '')}”` : 'Trending now'}</p>` + hits.map(cardHTML).join('');
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

  const rail = $('#rail');
  $('#jPrev').addEventListener('click', () => rail.scrollBy({ left: -440, behavior: 'smooth' }));
  $('#jNext').addEventListener('click', () => rail.scrollBy({ left: 440, behavior: 'smooth' }));

  $('#clubForm').addEventListener('submit', e => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('#email').value.trim());
    $('#clubMsg').textContent = ok ? 'You\'re in. Check your inbox for the code.' : 'That email doesn\'t look right.';
    if (ok) e.target.reset();
  });

  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 2800);
  }

  /* ---------- Init ---------- */
  renderGrid(); renderCart();
  $$('.story__lead, .story__body, .craft article, .club h2, .shop__head').forEach(el => el.classList.add('rv'));
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12 });
  $$('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
})();
