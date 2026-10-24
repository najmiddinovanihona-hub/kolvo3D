// Kolvo free 3D laboratory: a room with a reagent shelf, a test-tube rack, a beaker and a flask on tripods, spirit lamps and a
// Bunsen burner. Click a bottle (or pick from the catalogue) to read about it, then click a vessel to add it; heat, flame-test,
// pour from one vessel into another, or wash up. The chemistry is lab.js's engine run separately for every vessel.
// window.PTROOM.mount(host, { lang, light, THREE, orbit }, onExit); setCtx(); unmount()
(function () {
  'use strict';
  const S = {
    uz: { title: '3D laboratoriya — erkin tajriba', back: 'Oddiy rejim', catalog: 'Katalog', heat: 'Qizdirish', unheat: 'Qizdirishni to\'xtatish', flame: 'Alangaga tutish', pour: 'Boshqa idishga quyish', wash: 'Idishni yuvish', cancel: 'Bekor qilish',
      hintStart: 'Javondagi shishani yoki katalogdagi moddani tanlang.', hintReagent: 'Endi idishni bosing — {x} unga qo\'shiladi.', hintVessel: 'Javondan modda tanlang yoki pastdagi amallardan birini bajaring.', hintPour: 'Qaysi idishga quyamiz? Idishni bosing.',
      empty: 'Idish bo\'sh', contents: 'Tarkibi', temp: 'Harorat', cls: 'Sinfi', ions: 'Ionlari', sol: 'Eruvchanligi', colour: 'Rangi', hazards: 'Xavfi', none: 'Maxsus xavfi yo\'q (lekin ehtiyot bo\'ling)', find: 'Modda qidirish…',
      vessels: ['1-probirka', '2-probirka', '3-probirka', '4-probirka', 'Kimyoviy stakan', 'Konussimon kolba'], medium: { acid: 'kislotali', base: 'ishqoriy', neutral: 'neytral', none: '—' },
      groups: { acid: 'Kislotalar', base: 'Asoslar', salt: 'Tuzlar', metal: 'Metallar', ind: 'Indikatorlar', other: 'Boshqalar' }, danger: 'XAVF!', ionic: 'Qisqa ionli', selected: 'Tanlangan modda', drag: 'Aylantirish: sudrang · Yaqinlashtirish: g\'ildirak',
      fMain: 'Asosiy', fColour: 'Rangli', fDanger: 'Xavfli', fFind: 'Javondan qidirish', fCount: 'ta modda', selfPour: 'Idishni o\'ziga quyib bo\'lmaydi.', nothingToPour: 'Bu idish bo\'sh — quyadigan narsa yo\'q.' },
    en: { title: '3D laboratory — free experiment', back: 'Simple mode', catalog: 'Catalogue', heat: 'Heat', unheat: 'Stop heating', flame: 'Flame test', pour: 'Pour into another vessel', wash: 'Wash the vessel', cancel: 'Cancel',
      hintStart: 'Pick a bottle on the shelf or a substance in the catalogue.', hintReagent: 'Now click a vessel — {x} will be added to it.', hintVessel: 'Pick a substance on the shelf or use one of the actions below.', hintPour: 'Which vessel do we pour into? Click it.',
      empty: 'The vessel is empty', contents: 'Contents', temp: 'Temperature', cls: 'Class', ions: 'Ions', sol: 'Solubility', colour: 'Colour', hazards: 'Hazards', none: 'No special hazard (still be careful)', find: 'Find a substance…',
      vessels: ['Test tube 1', 'Test tube 2', 'Test tube 3', 'Test tube 4', 'Beaker', 'Conical flask'], medium: { acid: 'acidic', base: 'alkaline', neutral: 'neutral', none: '—' },
      groups: { acid: 'Acids', base: 'Bases', salt: 'Salts', metal: 'Metals', ind: 'Indicators', other: 'Others' }, danger: 'DANGER!', ionic: 'Short ionic', selected: 'Selected substance', drag: 'Rotate: drag · Zoom: wheel',
      fMain: 'Main', fColour: 'Coloured', fDanger: 'Hazardous', fFind: 'Search the shelf', fCount: 'substances', selfPour: 'A vessel cannot be poured into itself.', nothingToPour: 'This vessel is empty — nothing to pour.' },
    ru: { title: '3D лаборатория — свободный опыт', back: 'Простой режим', catalog: 'Каталог', heat: 'Нагреть', unheat: 'Прекратить нагрев', flame: 'Внести в пламя', pour: 'Перелить в другой сосуд', wash: 'Вымыть сосуд', cancel: 'Отмена',
      hintStart: 'Выберите склянку на полке или вещество в каталоге.', hintReagent: 'Теперь щёлкните по сосуду — туда добавится {x}.', hintVessel: 'Выберите вещество на полке или одно из действий ниже.', hintPour: 'В какой сосуд переливаем? Щёлкните по нему.',
      empty: 'Сосуд пуст', contents: 'Содержимое', temp: 'Температура', cls: 'Класс', ions: 'Ионы', sol: 'Растворимость', colour: 'Цвет', hazards: 'Опасность', none: 'Особой опасности нет (но будьте осторожны)', find: 'Найти вещество…',
      vessels: ['Пробирка 1', 'Пробирка 2', 'Пробирка 3', 'Пробирка 4', 'Химический стакан', 'Коническая колба'], medium: { acid: 'кислая', base: 'щелочная', neutral: 'нейтральная', none: '—' },
      groups: { acid: 'Кислоты', base: 'Основания', salt: 'Соли', metal: 'Металлы', ind: 'Индикаторы', other: 'Другие' }, danger: 'ОПАСНО!', ionic: 'Сокращённое ионное', selected: 'Выбранное вещество', drag: 'Вращение: перетащите · Зум: колесо',
      fMain: 'Основные', fColour: 'Цветные', fDanger: 'Опасные', fFind: 'Поиск на полке', fCount: 'веществ', selfPour: 'Нельзя перелить сосуд сам в себя.', nothingToPour: 'Сосуд пуст — переливать нечего.' }
  };
  const SHELF = ['HCl', 'H2SO4', 'HNO3', 'CH3COOH', 'NaOH', 'KOH', 'Ca(OH)2', 'NH4OH', 'H2O', 'H2O2', 'H2O2c', 'php', 'litmus', 'mo', 'NaCl', 'BaCl2', 'AgNO3', 'CuSO4', 'FeCl3', 'FeSO4',
    'KI', 'Pb(NO3)2', 'Na2CO3', 'Na2SO4', 'Na2S', 'KSCN', 'KMnO4', 'AlCl3', 'NH4Cl', 'ZnSO4', 'C3H5(OH)3', 'C6H12O6', 'Na', 'K', 'Li', 'Ca', 'Mg', 'Zn', 'Fe', 'Cu', 'CaCO3', 'MnO2', 'KMnO4s', 'NH4NO3'];
  let THREE, E, host, ctx, T, onExit, renderer, scene, cam, controls, fx, raf = 0, tick = 0, alive = false;
  const lin = (c) => new THREE.Color(c).convertSRGBToLinear();
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const L = () => ({ uz: 0, en: 1, ru: 2 }[ctx.lang] || 0);
  let M = {}, vessels = [], bottles = [], sel = { reagent: null, vessel: null, mode: null }, anim = null, lamps = {}, burner = null, alertT = 0;

  // ---------- shared pieces ----------
  function mats() {
    M = {
      glass: new THREE.MeshPhysicalMaterial({ color: lin('#f4fbff'), roughness: 0.02, transparent: true, opacity: 0.07, clearcoat: 1, envMapIntensity: 1.3, side: THREE.DoubleSide, depthWrite: false }),
      steel: new THREE.MeshStandardMaterial({ color: lin('#c3cad2'), metalness: 0.95, roughness: 0.3 }), dark: new THREE.MeshStandardMaterial({ color: lin('#3c4249'), metalness: 0.7, roughness: 0.45 }),
      wood: new THREE.MeshStandardMaterial({ color: lin('#9a6a3a'), roughness: 0.65 }), brass: new THREE.MeshStandardMaterial({ color: lin('#c9a24a'), metalness: 0.9, roughness: 0.3 })
    };
  }
  // real reagent bottles: brown glass for light-sensitive solutions, the substance's true colour inside, a paper label with a class stripe
  const AMBER = ['HNO3', 'AgNO3', 'KMnO4', 'H2O2', 'H2O2c', 'KI', 'I2', 'HI', 'HBr', 'NaBr', 'KBr', 'litmus', 'mo', 'php'];
  const CLS = { acid: '#c8322f', base: '#2a62c4', salt: '#2b8a57', metal: '#5f6a76', ind: '#7d46c4', other: '#b07a1e' };
  const METCOL = { Cu: '#b8622a', Fe: '#7d838b', Zn: '#a3abb4', Mg: '#d6dbe0', Al: '#cdd3d9', Na: '#d9d3c0', K: '#d2cab6', Li: '#c9c9c1', Ca: '#cfcfc6' };
  let colourCache = {};
  // the colour a substance really has, or null when it is colourless / white
  function trueColour(id) {
    if (colourCache[id] !== undefined) return colourCache[id]; const d = E.describe(id), h = d && d.colourHex; let out = null;
    if (h) { const c = new THREE.Color(h), mx = Math.max(c.r, c.g, c.b), mn = Math.min(c.r, c.g, c.b); if (mx - mn > 0.12 || mx < 0.55) out = h; }
    return (colourCache[id] = out);
  }
  function labelTex(id) {
    const r = E.reagents().find((x) => x.id === id) || {}, cv = document.createElement('canvas'); cv.width = 256; cv.height = 192; const g = cv.getContext('2d');
    const pg = g.createLinearGradient(0, 0, 0, 192); pg.addColorStop(0, '#f1ebda'); pg.addColorStop(1, '#e2d9c2'); g.fillStyle = pg; g.fillRect(0, 0, 256, 192);
    for (let i = 0; i < 700; i++) { g.fillStyle = 'rgba(90,70,40,' + (Math.random() * 0.06) + ')'; g.fillRect(Math.random() * 256, Math.random() * 192, 1.5, 1.5); }
    g.fillStyle = CLS[r.t] || CLS.other; g.fillRect(0, 0, 256, 30); g.fillStyle = '#fff'; g.font = '600 15px Space Grotesk, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText((T.groups[r.t] || '').toUpperCase(), 128, 16);
    g.fillStyle = '#17171a'; g.font = 'bold 40px IBM Plex Mono, monospace'; g.fillText(E.disp(id).replace(/<[^>]+>/g, ''), 128, 78, 236);
    g.fillStyle = '#4a4740'; g.font = '17px Space Grotesk, sans-serif'; const nm = r.n ? r.n[L()] : ''; g.fillText(nm.length > 26 ? nm.slice(0, 25) + '…' : nm, 128, 120, 240);
    g.strokeStyle = 'rgba(60,50,30,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(20, 142); g.lineTo(236, 142); g.stroke();
    g.fillStyle = '#6d685c'; g.font = '13px IBM Plex Mono, monospace'; g.fillText(r.t === 'metal' ? 'Kolvo · 99.9%' : r.solid ? 'Kolvo · ч.д.а. · 250 g' : 'Kolvo · 0.1 M · 500 ml', 128, 164);
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
  }
  const lathe = (pts, n) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), n || 40);
  function makeBottle(id) {
    const kind = E.actKind(id), r0 = E.reagents().find((x) => x.id === id) || {}, g = new THREE.Group(), tc = trueColour(id), amber = AMBER.includes(id);
    const glassM = new THREE.MeshPhysicalMaterial({ color: lin(amber ? '#8a4a12' : '#f2f8fa'), roughness: 0.06, transparent: true, opacity: amber ? 0.62 : 0.08, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: amber ? 1.8 : 1.1, depthWrite: false, side: THREE.DoubleSide });
    const label = (rad, h, y) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, h, 32, 1, true, -0.8, 1.6), new THREE.MeshStandardMaterial({ map: labelTex(id), roughness: 0.9 })); m.position.y = y; g.add(m); };
    if (kind === 'pour' || kind === 'drops') {
      const small = kind === 'drops', r = small ? 0.2 : 0.29, h = small ? 0.62 : 0.95;
      const prof = [[0.001, 0], [r - 0.03, 0], [r, 0.03], [r, h], [r * 0.9, h + 0.07], [r * 0.5, h + 0.17], [r * 0.4, h + 0.2], [r * 0.4, h + 0.3], [r * 0.46, h + 0.32]];
      g.add(new THREE.Mesh(lathe(prof), glassM));
      // the liquid inside, a little below the shoulder, with a flat surface
      const fill = h * 0.72, lq = new THREE.Mesh(lathe([[0.001, 0.015], [r - 0.025, 0.015], [r - 0.012, 0.04], [r - 0.012, fill], [0.001, fill]], 32),
        new THREE.MeshPhysicalMaterial({ color: lin(tc || '#e9f2f6'), transparent: true, opacity: tc ? 0.86 : 0.14, roughness: 0.1, clearcoat: 0.6, depthWrite: false }));
      lq.renderOrder = 1; g.add(lq);
      if (small) { // dropper: glass pipette in a black rubber bulb
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.5, r * 0.5, 0.1, 20), new THREE.MeshStandardMaterial({ color: lin('#1c1c1f'), roughness: 0.55 })); cap.position.y = h + 0.33; g.add(cap);
        const bulb = new THREE.Mesh(lathe([[0.001, 0], [0.075, 0], [0.085, 0.08], [0.07, 0.2], [0.001, 0.24]], 20), new THREE.MeshStandardMaterial({ color: lin('#2a2224'), roughness: 0.7 })); bulb.position.y = h + 0.38; g.add(bulb);
      } else if (r0.t === 'acid') { // ground-glass stopper
        const st = new THREE.Mesh(lathe([[0.001, 0], [r * 0.38, 0], [r * 0.42, 0.12], [r * 0.3, 0.16], [r * 0.3, 0.2], [r * 0.75, 0.22], [r * 0.75, 0.3], [0.001, 0.31]], 24), glassM); st.position.y = h + 0.24; g.add(st);
      } else { const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.5, r * 0.5, 0.16, 24), new THREE.MeshStandardMaterial({ color: lin('#232327'), roughness: 0.6 })); cap.position.y = h + 0.36; g.add(cap); }
      label(r + 0.006, h * 0.5, h * 0.45);
    } else { // wide-mouth jar for powders and metals
      const r = 0.31, h = 0.66, oil = ['Na', 'K', 'Li', 'Ca'].includes(id);
      g.add(new THREE.Mesh(lathe([[0.001, 0], [r - 0.03, 0], [r, 0.03], [r, h], [r * 0.92, h + 0.05], [r * 0.92, h + 0.1]]), glassM));
      const col = kind === 'metal' ? METCOL[id] || '#999' : tc || E.actColour(id) || '#efefe8', fillH = kind === 'metal' ? 0 : h * 0.55;
      if (fillH) { // packed powder or crystals with a lumpy top
        const body = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.015, r - 0.015, fillH, 28), new THREE.MeshStandardMaterial({ color: lin(col), roughness: 0.95 })); body.position.y = fillH / 2 + 0.015; g.add(body);
        const top = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: lin(col), roughness: 0.8 }), 70), d = new THREE.Object3D();
        for (let i = 0; i < 70; i++) { const a = rnd(i * 3 + id.length) * 6.283, rr = (r - 0.04) * Math.sqrt(rnd(i * 5 + 1)); d.position.set(Math.cos(a) * rr, fillH + 0.015 + rnd(i * 7) * 0.025, Math.sin(a) * rr); d.rotation.set(i, i * 2, i * 3); d.scale.setScalar(0.018 + rnd(i * 11) * 0.02); d.updateMatrix(); top.setMatrixAt(i, d.matrix); }
        g.add(top);
      } else {
        if (oil) { const o = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.015, r - 0.015, h * 0.7, 28), new THREE.MeshPhysicalMaterial({ color: lin('#e8cf7a'), transparent: true, opacity: 0.35, roughness: 0.05, depthWrite: false })); o.position.y = h * 0.36; g.add(o); }
        const mm = new THREE.MeshStandardMaterial({ color: lin(col), metalness: oil ? 0.35 : 0.85, roughness: oil ? 0.55 : 0.32 });
        for (let i = 0; i < (id === 'Mg' ? 1 : 7); i++) {
          const m = id === 'Mg' ? new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.012, 6, 60, 6.283 * 3), mm) : id === 'Fe' ? new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.4, 8), mm)
            : new THREE.Mesh(oil ? new THREE.BoxGeometry(0.11, 0.08, 0.09) : new THREE.IcosahedronGeometry(0.055, 1), mm);
          if (id === 'Mg') { m.rotation.x = Math.PI / 2; m.scale.z = 4; m.position.y = 0.2; } else { m.position.set((rnd(i * 3 + 1) - 0.5) * 0.36, 0.06 + rnd(i * 5) * 0.12, (rnd(i * 7 + 2) - 0.5) * 0.36); m.rotation.set(i, i * 1.3, i * 0.7); }
          g.add(m);
        }
      }
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.96, r * 0.96, 0.13, 32), new THREE.MeshStandardMaterial({ color: lin('#1f1f23'), roughness: 0.55 })); lid.position.y = h + 0.16; g.add(lid);
      label(r + 0.006, 0.3, 0.36);
    }
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.userData.rid = id; } }); g.userData.rid = id; return g;
  }
  // ---------- the shelf: a filter by class / colour / hazard and a search decide which bottles stand on it ----------
  let filt = 'main', query = '', page = 0;
  const PER = 44;
  function shelfList() {
    const all = E.reagents(), qq = query.toLowerCase().replace(/['‘’ʻ]/g, '');
    if (qq) return all.filter((r) => (r.id + ' ' + r.n.join(' ')).toLowerCase().replace(/['‘’ʻ]/g, '').includes(qq)).map((r) => r.id);
    if (filt === 'main') return SHELF.filter((id) => all.some((r) => r.id === id));
    if (filt === 'colour') return all.filter((r) => trueColour(r.id) && r.t !== 'metal').map((r) => r.id);
    if (filt === 'danger') return all.filter((r) => { const d = E.describe(r.id); return d && d.hazards.length; }).map((r) => r.id);
    if (filt === 'salt') return all.filter((r) => r.t === 'salt' || r.t === 'other').map((r) => r.id);
    return all.filter((r) => r.t === filt).map((r) => r.id);
  }
  function fillShelf() {
    bottles.forEach((b) => { scene.remove(b); b.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); if (o.material.map) o.material.map.dispose(); } }); }); bottles = [];
    const list = shelfList(), pages = Math.max(1, Math.ceil(list.length / PER)); page = Math.min(page, pages - 1);
    list.slice(page * PER, page * PER + PER).forEach((id, i) => { const row = Math.floor(i / 22), col = i % 22, b = makeBottle(id); b.position.set(-8.0 + col * 0.76, row ? 5.62 : 3.62, -3.0); b.userData.y0 = b.position.y; if (id === sel.reagent) b.position.y += 0.18; scene.add(b); bottles.push(b); });
    const info = host && host.querySelector('.rm-f-info'); if (info) info.innerHTML = '<b>' + list.length + '</b> ' + T.fCount + (pages > 1 ? ' · <button data-pg="-1">‹</button> ' + (page + 1) + '/' + pages + ' <button data-pg="1">›</button>' : '');
    host && host.querySelectorAll('.rm-f button[data-f]').forEach((b) => { const on = !query && b.dataset.f === filt; b.style.background = on ? b.dataset.c : 'rgba(10,14,28,.66)'; b.style.color = on ? '#fff' : '#dfe6f5'; });
  }
  function spiritLamp() { const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.LatheGeometry([[0.001, 0], [0.5, 0], [0.56, 0.06], [0.58, 0.34], [0.44, 0.62], [0.16, 0.7], [0.15, 0.76]].map(([a, b]) => new THREE.Vector2(a, b)), 40), new THREE.MeshPhysicalMaterial({ color: lin('#e8f4ff'), transparent: true, opacity: 0.3, roughness: 0.05, clearcoat: 1, envMapIntensity: 2.5, depthWrite: false }));
    const alc = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.5, 0.28, 32), new THREE.MeshPhysicalMaterial({ color: lin('#cfe4ff'), transparent: true, opacity: 0.4 })); alc.position.y = 0.15;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.12, 20), M.steel); cap.position.y = 0.82; const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.14, 10), new THREE.MeshStandardMaterial({ color: lin('#efe2c4') })); wick.position.y = 0.94;
    const fl = new THREE.Group(), fo = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.55, 20, 1, true), new THREE.MeshBasicMaterial({ color: lin('#ffa040'), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    const fi = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.26, 16, 1, true), new THREE.MeshBasicMaterial({ color: lin('#5ab8ff'), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    fo.position.y = 0.27; fi.position.y = 0.13; fl.add(fo, fi); fl.position.y = 1.0; fl.visible = false; const light = new THREE.PointLight(0xff9a40, 0, 5, 2); light.position.y = 1.3;
    g.add(body, alc, cap, wick, fl, light); body.castShadow = cap.castShadow = true; g.userData = { flame: fl, light }; return g; }

  // ---------- vessels: a lathe profile with the bottom at local y = 0 ----------
  function profile(kind) {
    if (kind === 'tube') { const R = 0.3, H = 3.0, p = []; for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI / 2; p.push([Math.max(0.001, Math.cos(a) * R), R + Math.sin(a) * R]); } p.push([R, H], [R + 0.04, H + 0.03], [R + 0.04, H + 0.08], [R - 0.01, H + 0.09]);
      return { pts: p, H, innerR: (y) => (y >= R ? R : Math.sqrt(Math.max(0, R * R - (R - y) * (R - y)))) }; }
    if (kind === 'beaker') { const R = 0.95, H = 2.3; return { pts: [[0.001, 0], [R - 0.05, 0], [R, 0.06], [R, H], [R + 0.08, H + 0.06], [R + 0.08, H + 0.1], [R - 0.01, H + 0.11]], H, innerR: () => R - 0.01 }; }
    const R = 1.0, N = 0.27, Hc = 1.9, H = 2.7; return { pts: [[0.001, 0], [R - 0.06, 0], [R, 0.08], [R - 0.02, 0.2], [N, Hc], [N, H], [N + 0.06, H + 0.04], [N + 0.06, H + 0.1], [N - 0.01, H + 0.11]], H, innerR: (y) => (y < 0.2 ? R - 0.02 : y < Hc ? R - 0.02 - (R - 0.02 - N) * (y - 0.2) / (Hc - 0.2) : N) };
  }
  // liquid level for a volume (8 pours fill about 80% of the vessel), from the vessel's own cross-section
  function levelFor(v, vol) { if (vol <= 0) return 0; const P = v.prof, steps = 200, dy = P.H / steps; if (!v.cum) { v.cum = [0]; for (let i = 1; i <= steps; i++) v.cum.push(v.cum[i - 1] + Math.PI * Math.pow(P.innerR((i - 0.5) * dy), 2) * dy); }
    const target = Math.min(0.92, (vol / 8) * 0.8 + 0.03) * v.cum[steps]; let i = 1; while (i < steps && v.cum[i] < target) i++; return i * dy; }
  function makeVessel(i, kind, x, z, y) {
    const v = { i, kind, home: new THREE.Vector3(x, y, z), g: new THREE.Group(), prof: profile(kind), s: E.fresh(), parts: {}, key: {} };
    v.glass = new THREE.Mesh(new THREE.LatheGeometry(v.prof.pts.map(([a, b]) => new THREE.Vector2(a + 0.02, b)), 64), M.glass); v.glass.renderOrder = 5; v.glass.userData.vessel = i; v.g.add(v.glass);
    // a brighter lip and base so the thin glass reads as an outline
    const rimM = new THREE.MeshPhysicalMaterial({ color: lin('#ffffff'), transparent: true, opacity: 0.45, roughness: 0.05, clearcoat: 1, depthWrite: false }), top = v.prof.pts[v.prof.pts.length - 3];
    const lip = new THREE.Mesh(new THREE.TorusGeometry(top[0] + 0.02, 0.025, 8, 48), rimM); lip.rotation.x = Math.PI / 2; lip.position.y = top[1]; v.g.add(lip);
    if (kind !== 'tube') { const foot = new THREE.Mesh(new THREE.TorusGeometry(v.prof.innerR(0.05) + 0.02, 0.02, 8, 48), rimM); foot.rotation.x = Math.PI / 2; foot.position.y = 0.04; v.g.add(foot); }
    v.hit = new THREE.Mesh(new THREE.CylinderGeometry(v.prof.innerR(v.prof.H) + 0.25, kind === 'tube' ? 0.4 : 1.1, v.prof.H + 0.3, 12), new THREE.MeshBasicMaterial({ visible: false })); v.hit.position.y = v.prof.H / 2; v.hit.userData.vessel = i; v.g.add(v.hit);
    v.content = new THREE.Group(); v.g.add(v.content); v.g.position.copy(v.home); scene.add(v.g); return v; }
  const liqGeo = (v, level, inset) => { const P = v.prof, pts = []; const n = 60; for (let k = 0; k <= n; k++) { const y = level * k / n; pts.push(new THREE.Vector2(Math.max(0.001, P.innerR(y) - inset), y)); }
    const r = P.innerR(level) - inset; pts.push(new THREE.Vector2(r * 0.7, level - 0.015), new THREE.Vector2(0.001, level - 0.03)); return new THREE.LatheGeometry(pts, 48); };
  const dummy = () => new THREE.Object3D();
  // keep a vessel's 3D contents in step with its chemistry
  function syncVessel(v, now) {
    const vm = E.vm(v.s); if (!vm) return; v.vm = vm; const P = v.prof, level = levelFor(v, vm.vol), surf = vm.vol > 0 ? level : 0.1;
    v.glass.visible = v.content.visible = !vm.broken;
    // liquid
    const lk = level.toFixed(3) + (vm.boil ? Math.round(now / 90) : '');
    if (vm.vol > 0) { if (v.key.liq !== lk) { v.key.liq = lk; if (v.parts.liq) { v.content.remove(v.parts.liq); v.parts.liq.geometry.dispose(); }
      v.parts.liq = new THREE.Mesh(liqGeo(v, level + (vm.boil ? Math.sin(now / 80) * 0.01 : 0), 0.004), v.parts.liqMat || (v.parts.liqMat = new THREE.MeshPhysicalMaterial({ transparent: true, roughness: 0.05, clearcoat: 1, envMapIntensity: 1.4, side: THREE.DoubleSide, depthWrite: false }))); v.parts.liq.renderOrder = 2; v.content.add(v.parts.liq); }
      v.parts.liqMat.color.copy(lin(vm.liqCol || '#cfe6ff')); v.parts.liqMat.opacity = vm.liqCol ? vm.liqOp : 0.22; }
    else if (v.parts.liq) { v.content.remove(v.parts.liq); v.parts.liq = null; v.key.liq = ''; }
    // precipitates settle into a heap that follows the bottom
    const pk = vm.ppts.map((p) => p.f + p.tex).join('|'); if (v.key.ppt !== pk) { v.key.ppt = pk; (v.parts.ppt || []).forEach((m) => v.content.remove(m)); v.parts.ppt = vm.ppts.map((p) => {
      const geo = p.tex === 'cryst' ? new THREE.OctahedronGeometry(1, 0) : p.tex === 'curdy' ? new THREE.DodecahedronGeometry(1, 0) : new THREE.IcosahedronGeometry(1, p.tex === 'gel' || p.tex === 'floc' ? 1 : 0);
      const mat = p.tex === 'gel' ? new THREE.MeshPhysicalMaterial({ color: lin(p.color), transparent: true, opacity: 0.55, roughness: 0.2, depthWrite: false }) : p.tex === 'cryst' ? new THREE.MeshPhysicalMaterial({ color: lin(p.color), metalness: 0.35, roughness: 0.15, clearcoat: 1 }) : new THREE.MeshStandardMaterial({ color: lin(p.color), roughness: 0.85 });
      const m = new THREE.InstancedMesh(geo, mat, 420); m.frustumCulled = false; m.renderOrder = 3; v.content.add(m); return m; }); }
    const wide = P.innerR(0.5) > 0.5, d = dummy(); let base = 0;
    vm.ppts.forEach((p, pi) => { const m = v.parts.ppt[pi]; if (!m) return; const n = Math.min(420, Math.round((wide ? 160 : 70) + p.n * (wide ? 260 : 210))), age = Math.min(1, p.age / 3.2), e = 1 - Math.pow(1 - age, 2), heapH = Math.min(wide ? 0.6 : 1.2, (wide ? 0.06 : 0.1) + p.n * (wide ? 0.12 : 0.36)), sz = (p.tex === 'gel' ? 0.05 : p.tex === 'floc' ? 0.04 : p.tex === 'curdy' ? 0.035 : 0.022) * (wide ? 1.2 : 0.85);
      m.count = n; for (let i = 0; i < n; i++) { const h = base + rnd(i + pi * 999) * heapH, rr = P.innerR(h + 0.02) * 0.92 * Math.sqrt(rnd(i * 3 + pi)), a = rnd(i * 7 + pi) * 6.283;
        const fy = 0.08 + rnd(i * 11 + pi) * Math.max(0.1, level - 0.12), fr = P.innerR(fy) * 0.9 * Math.sqrt(rnd(i * 13 + pi)), fa = a + now / 1800 * (rnd(i) - 0.5);
        d.position.set(Math.cos(fa) * fr * (1 - e) + Math.cos(a) * rr * e, Math.min(fy * (1 - e) + (h + 0.02) * e, Math.max(0.05, level - 0.02)), Math.sin(fa) * fr * (1 - e) + Math.sin(a) * rr * e);
        d.rotation.set(i, i * 1.7, i * 0.3); d.scale.setScalar(sz * (0.6 + rnd(i + 17) * 0.9)); d.updateMatrix(); m.setMatrixAt(i, d.matrix); }
      m.instanceMatrix.needsUpdate = true; base += heapH * e * 0.85; });
    // cloudiness of a fresh precipitate
    const fresh = vm.ppts.find((p) => p.age < 3.2);
    if (fresh && vm.vol > 0) { if (!v.parts.cloud) { v.parts.cloud = new THREE.Mesh(liqGeo(v, level, 0.01), new THREE.MeshStandardMaterial({ transparent: true, depthWrite: false })); v.parts.cloud.renderOrder = 2; v.content.add(v.parts.cloud); }
      v.parts.cloud.material.color.copy(lin(fresh.color)); v.parts.cloud.material.opacity = 0.6 * (1 - fresh.age / 3.2); }
    else if (v.parts.cloud) { v.content.remove(v.parts.cloud); v.parts.cloud = null; }
    // crystals, powders, bubbles share instanced pools
    if (!v.parts.bits) { v.parts.bits = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshPhysicalMaterial({ roughness: 0.4, clearcoat: 0.6 }), 260); v.parts.bits.frustumCulled = false; v.content.add(v.parts.bits);
      v.parts.bub = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, roughness: 0, clearcoat: 1, envMapIntensity: 3, depthWrite: false }), 140); v.parts.bub.frustumCulled = false; v.parts.bub.renderOrder = 4; v.content.add(v.parts.bub); }
    const col = new THREE.Color(); let bi = 0; [[vm.crystals, 0.05, 0.04], [vm.powders, 0.03, 0.02]].forEach(([list, s0, s1], li) => list.forEach((c, k) => { const n = c.big ? 8 : Math.min(110, Math.round(40 + (c.n || 1) * 60));
      for (let i = 0; i < n && bi < 260; i++, bi++) { const y = 0.03 + rnd(i + k * 77 + li * 5) * (c.big ? 0.22 : 0.25), rr = P.innerR(y + 0.02) * 0.85 * Math.sqrt(rnd(i * 5 + k + li)), a = rnd(i * 3 + k) * 6.283;
        d.position.set(Math.cos(a) * rr, y, Math.sin(a) * rr); d.rotation.set(i, i * 2, 0); d.scale.setScalar(c.big ? 0.09 + rnd(i) * 0.04 : s0 * (0.5 + rnd(i + 9)) + (li ? 0 : 0)); d.updateMatrix(); v.parts.bits.setMatrixAt(bi, d.matrix); v.parts.bits.setColorAt(bi, col.copy(lin(c.color))); } }));
    v.parts.bits.count = bi; v.parts.bits.instanceMatrix.needsUpdate = true; if (v.parts.bits.instanceColor) v.parts.bits.instanceColor.needsUpdate = true;
    let ub = 0; if (vm.vol > 0 && (vm.gas > 0 || vm.boil)) { const nG = Math.round(vm.gas * 70), nB = vm.boil ? 40 : 0;
      for (let i = 0; i < nG + nB && ub < 140; i++, ub++) { const big = i >= nG, t = ((now / 1000) * (big ? 1.6 : 0.9 + rnd(i) * 0.5) + rnd(i + 5)) % 1, rr = P.innerR(0.1) * 0.7 * Math.sqrt(rnd(i + 2)), a = rnd(i + 4) * 6.283, y0 = vm.metals.length ? 0.15 + rnd(i + 8) * 0.4 : 0.06;
        d.position.set(Math.cos(a) * rr + Math.sin(t * 9 + i) * 0.02, Math.min(y0 + t * (level - y0), level - 0.02), Math.sin(a) * rr); d.rotation.set(0, 0, 0); d.scale.setScalar((big ? 0.03 + rnd(i) * 0.04 : 0.01 + rnd(i) * 0.02) * (0.6 + t * 0.6)); d.updateMatrix(); v.parts.bub.setMatrixAt(ub, d.matrix); } }
    v.parts.bub.count = ub; v.parts.bub.instanceMatrix.needsUpdate = true;
    // metal pieces, coated where the liquid touched them
    const mk = vm.metals.map((m) => m.f + (m.dep || '')).join('|') + ':' + level.toFixed(2);
    if (v.key.met !== mk) { v.key.met = mk; if (v.parts.met) v.content.remove(v.parts.met); const g = new THREE.Group(); v.parts.met = g; v.content.add(g);
      vm.metals.forEach((m, k) => { const mat = new THREE.MeshStandardMaterial({ color: lin(m.dep && level > 0.2 ? m.dep : { Fe: '#8b9198', Cu: '#c46a2c', Zn: '#9aa3ad', Mg: '#dfe3e8', Al: '#d3d9df', Na: '#e8e4d4', K: '#e0d8c8', Li: '#d8d8d0', Ca: '#d8d8d2' }[m.f] || '#aaa'), metalness: 0.85, roughness: 0.35 });
        const mesh = m.f === 'Fe' ? new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, Math.min(P.H * 0.8, 2.6), 12), mat) : m.f === 'Mg' ? new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.012), mat) : new THREE.Mesh(new THREE.IcosahedronGeometry(m.f === 'Cu' ? 0.09 : 0.11, 1), mat);
        mesh.position.set((k - 0.5) * 0.12, m.f === 'Fe' ? Math.min(P.H * 0.4, 1.3) + 0.05 : m.f === 'Mg' ? 0.72 : 0.1, 0); if (['Na', 'K', 'Li', 'Ca'].includes(m.f)) mesh.userData.float = true; g.add(mesh); }); }
    if (v.parts.met) v.parts.met.children.forEach((o) => { if (o.userData.float && vm.naBall && vm.vol > 0) { o.position.set(Math.sin(now / 160) * P.innerR(level) * 0.6, level + 0.03, Math.cos(now / 210) * P.innerR(level) * 0.3); } });
    // silver mirror
    if (vm.mirror && !v.parts.mirror) { v.parts.mirror = new THREE.Mesh(new THREE.LatheGeometry(P.pts.slice(0, -4).map(([a, b]) => new THREE.Vector2(a + 0.005, b)), 48), new THREE.MeshStandardMaterial({ color: lin('#e6eaee'), metalness: 1, roughness: 0.06, side: THREE.DoubleSide })); v.content.add(v.parts.mirror); }
    if (!vm.mirror && v.parts.mirror) { v.content.remove(v.parts.mirror); v.parts.mirror = null; }
    // events: fire, pops, foam, explosions
    (vm.events || []).forEach((e) => { const k = e.type + e.t0; v.seen = v.seen || new Set(); if (v.seen.has(k)) return; v.seen.add(k); const w = v.g.position.clone();
      fx && fx.spawn(e, new THREE.Vector3(w.x, w.y + (e.type === 'bright' ? 0.3 : e.type === 'explosion' ? P.H * 0.4 : e.type === 'foam' ? P.H + 0.1 : Math.max(surf, 0.4)), w.z), { scale: v.kind === 'tube' ? 1 : 1.4 });
      if (['explosion', 'fire', 'pop', 'bright'].includes(e.type)) showAlert(v); });
    // vapour above the mouth
    if (!v.parts.puffs) { v.parts.puffs = []; const tx = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 2, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); })();
      for (let i = 0; i < 12; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, opacity: 0, depthWrite: false })); scene.add(sp); v.parts.puffs.push(sp); } }
    const vap = vm.cloud || (vm.boil ? '#ffffff' : null), mw = v.g.position;
    v.parts.puffs.forEach((sp, i) => { if (!vap || vm.broken) { sp.material.opacity = 0; return; } const t = ((now / 2600) + i / 12) % 1; sp.material.color.copy(lin(vap));
      sp.position.set(mw.x + Math.sin(i * 1.7 + t * 3) * (0.2 + t * 0.5), mw.y + P.H + t * 2.2, mw.z + 0.1); const s = 0.35 + t * 1.1; sp.scale.set(s, s, 1); sp.material.opacity = 0.42 * Math.sin(t * Math.PI); });
  }

  // ---------- the hand that adds a reagent ----------
  function startAdd(v, id, from) {
    const kind = E.actKind(id), col = E.actColour(id), tool = new THREE.Group();
    if (kind === 'pour' || kind === 'drops') { const b = makeBottle(id); b.scale.setScalar(kind === 'drops' ? 1 : 0.9); tool.add(b); }
    else if (kind === 'powder') { const h = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.035, 0.1), M.steel); h.position.x = 1.0; const sp = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.steel); const heap = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: lin(col) })); heap.name = 'heap'; tool.add(h, sp, heap); }
    else { [-1, 1].forEach((s) => { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.5, 0.05), M.steel); arm.position.set(s * 0.05, 0.75, 0); arm.name = 'arm' + s; tool.add(arm); }); const piece = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 1), new THREE.MeshStandardMaterial({ color: lin('#c8c8c8'), metalness: 0.8, roughness: 0.3 })); piece.name = 'piece'; tool.add(piece); }
    tool.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(tool);
    anim = { v, id, kind, col, tool, from: from.clone(), t0: performance.now(), dur: 2300, added: false, falls: [] };
  }
  function stepAnim(now) {
    const a = anim; if (!a) return; const p = Math.min(1, (now - a.t0) / a.dur), ease = (x) => x * x * (3 - 2 * x), lerp = (u, w, t) => u + (w - u) * t;
    const inP = ease(Math.min(1, p / 0.3)), outP = ease(Math.max(0, (p - 0.8) / 0.2)), k = inP * (1 - outP), mouth = a.v.g.position.clone().add(new THREE.Vector3(0, a.v.prof.H, 0)), surf = a.v.g.position.y + Math.max(0.1, levelFor(a.v, a.v.s.vol));
    const at = (off) => new THREE.Vector3(lerp(a.from.x, mouth.x + off.x, k), lerp(a.from.y, mouth.y + off.y, k), lerp(a.from.z, mouth.z + off.z, k));
    if (a.stream) { scene.remove(a.stream); a.stream.geometry.dispose(); a.stream = null; }
    if (a.kind === 'pour') { a.tool.position.copy(at(new THREE.Vector3(0.55, 1.05, 0))); a.tool.rotation.z = lerp(0, 2.05, k);
      if (p > 0.32 && p < 0.8) { const m = new THREE.Vector3(0, 1.32, 0); a.tool.localToWorld(m); const pts = [m.clone(), new THREE.Vector3((m.x + mouth.x) / 2, m.y - 0.15, mouth.z), new THREE.Vector3(mouth.x + 0.02, mouth.y - 0.1, mouth.z), new THREE.Vector3(mouth.x + 0.01, surf, mouth.z)];
        a.stream = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.028, 8, false), new THREE.MeshPhysicalMaterial({ color: lin(a.col), transparent: true, opacity: 0.75, clearcoat: 1, depthWrite: false })); a.stream.renderOrder = 3; scene.add(a.stream); } }
    else if (a.kind === 'drops') { a.tool.position.copy(at(new THREE.Vector3(0, 0.25, 0))); a.tool.rotation.z = 0;
      if (p > 0.35 && p < 0.8 && a.falls.length < 3 && (p - 0.35) > a.falls.length * 0.13) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshPhysicalMaterial({ color: lin(a.col), transparent: true, opacity: 0.85 })); d.position.copy(mouth); scene.add(d); a.falls.push({ m: d, vy: 0 }); } }
    else if (a.kind === 'powder') { a.tool.position.copy(at(new THREE.Vector3(0.05, 0.3, 0))); a.tool.rotation.z = -(p > 0.35 && p < 0.8 ? 0.55 : 0) * k; a.tool.getObjectByName('heap').visible = p < 0.55;
      if (p > 0.4 && p < 0.8 && Math.random() < 0.7) { const d = new THREE.Mesh(new THREE.IcosahedronGeometry(0.02, 0), new THREE.MeshStandardMaterial({ color: lin(a.col) })); d.position.copy(mouth).add(new THREE.Vector3((Math.random() - 0.5) * 0.1, 0.2, (Math.random() - 0.5) * 0.1)); scene.add(d); a.falls.push({ m: d, vy: 0 }); } }
    else { a.tool.position.copy(at(new THREE.Vector3(0, 0.2, 0))); const open = p > 0.45; ['-1', '1'].forEach((s) => { a.tool.getObjectByName('arm' + s).position.x = (open ? 0.09 : 0.05) * +s; });
      const pc = a.tool.getObjectByName('piece'); if (open && pc && pc.parent === a.tool) { const w = new THREE.Vector3(); pc.getWorldPosition(w); a.tool.remove(pc); pc.position.copy(w); scene.add(pc); a.falls.push({ m: pc, vy: 0 }); } }
    a.falls.forEach((f) => { f.vy -= 0.012; f.m.position.y = Math.max(surf, f.m.position.y + f.vy); if (f.m.position.y <= surf + 1e-3) { scene.remove(f.m); f.done = true; } }); a.falls = a.falls.filter((f) => !f.done);
    if (!a.added && p >= 0.8) { a.added = true; E.add(a.v.s, a.id); sel.vessel = a.v; dropReagent(); }
    if (p >= 1) { scene.remove(a.tool); a.falls.forEach((f) => scene.remove(f.m)); if (a.stream) scene.remove(a.stream); anim = null; }
  }

  // ---------- the room ----------
  function buildScene(el) {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'; el.appendChild(renderer.domElement);
    scene = new THREE.Scene(); cam = new THREE.PerspectiveCamera(36, 1, 0.1, 120);
    const env = new THREE.Scene(); env.add(new THREE.Mesh(new THREE.BoxGeometry(40, 40, 40), new THREE.MeshBasicMaterial({ color: 0x23272f, side: THREE.BackSide })));
    [[0, 15, 2, 20, 0xffffff], [-15, 5, 6, 10, 0xd6e8ff], [15, 6, -2, 10, 0xfff0dc], [0, 5, 16, 12, 0xffffff]].forEach(([x, y, z, s, c]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(s, s * 0.55), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); p.position.set(x, y, z); p.lookAt(0, 3, 0); env.add(p); });
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(env, 0.03).texture;
    scene.add(new THREE.HemisphereLight(0xeaf2ff, 0x2a2e36, 0.55)); const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(6, 13, 9); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -10, right: 10, top: 10, bottom: -3 }); key.shadow.bias = -0.0004; scene.add(key); const rim = new THREE.DirectionalLight(0xa8ccff, 0.5); rim.position.set(-7, 6, -6); scene.add(rim);
    const light = !!ctx.light; const bench = new THREE.Mesh(new THREE.BoxGeometry(30, 0.4, 9), new THREE.MeshStandardMaterial({ color: lin(light ? '#d4d9df' : '#262a31'), roughness: 0.55 })); bench.position.set(0, -0.2, 0.5); bench.receiveShadow = true; scene.add(bench);
    const tcv = document.createElement('canvas'); tcv.width = tcv.height = 256; const tg = tcv.getContext('2d'); tg.fillStyle = light ? '#eef1f4' : '#1b1f27'; tg.fillRect(0, 0, 256, 256); tg.strokeStyle = light ? '#cfd5dc' : '#2b313b'; tg.lineWidth = 4; for (let i = 0; i <= 4; i++) { tg.beginPath(); tg.moveTo(i * 64, 0); tg.lineTo(i * 64, 256); tg.stroke(); tg.beginPath(); tg.moveTo(0, i * 64); tg.lineTo(256, i * 64); tg.stroke(); }
    const wt = new THREE.CanvasTexture(tcv); wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(10, 5); wt.encoding = THREE.sRGBEncoding; const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 15), new THREE.MeshStandardMaterial({ map: wt, roughness: 0.8 })); wall.position.set(0, 6.5, -3.6); wall.receiveShadow = true; scene.add(wall);
    // the shelf with labelled bottles
    [3.55, 5.55].forEach((y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(17, 0.12, 1.0), M.wood); b.position.set(0, y, -3.0); b.castShadow = b.receiveShadow = true; scene.add(b); });
    fillShelf();
    // the test-tube rack, two tripods with lamps, the central lamp for tubes, the burner
    const rack = new THREE.Group(); const rb = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 1.0), M.wood); rb.position.y = 0.06; const rt = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 1.0), M.wood); rt.position.y = 1.6; [-1.75, 1.75].forEach((x) => { const s = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.6, 1.0), M.wood); s.position.set(x, 0.8, 0); rack.add(s); });
    rack.add(rb, rt); rack.position.set(-5.0, 0, 0.6); rack.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); scene.add(rack);
    const tripod = (x) => { const g = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.04, 10, 48), M.dark); ring.rotation.x = Math.PI / 2; ring.position.y = 1.62; g.add(ring);
      for (let i = 0; i < 3; i++) { const a = i * 2.094; const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.75, 8), M.dark); leg.position.set(Math.cos(a) * 0.95, 0.82, Math.sin(a) * 0.95); leg.rotation.set(Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12); g.add(leg); }
      const gauze = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.02, 1.9), new THREE.MeshStandardMaterial({ color: lin('#8a9098'), metalness: 0.6, roughness: 0.6, transparent: true, opacity: 0.85 })); gauze.position.y = 1.66; g.add(gauze); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.025, 32), new THREE.MeshStandardMaterial({ color: lin('#e3ddd0'), roughness: 0.9 })); c.position.y = 1.67; g.add(c);
      g.position.set(x, 0, 0.6); g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(g); };
    tripod(1.2); tripod(4.2);
    lamps.center = spiritLamp(); lamps.center.position.set(-1.6, 0, 0.6); scene.add(lamps.center); lamps.b = spiritLamp(); lamps.b.position.set(1.2, 0, 0.6); scene.add(lamps.b); lamps.f = spiritLamp(); lamps.f.position.set(4.2, 0, 0.6); scene.add(lamps.f);
    const holder = new THREE.Group(); const hr = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 6, 16), M.steel); hr.position.set(-2.6, 3, -0.2); const hb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.06), M.steel); hb.position.set(-2.4, 4.6, -0.1); const hbase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 1.1), M.dark); hbase.position.set(-2.4, 0.06, -0.2);
    holder.add(hr, hb, hbase); holder.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(holder);
    burner = new THREE.Group(); const bb = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.14, 32), M.dark); bb.position.y = 0.07; const bt = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.4, 20), M.brass); bt.position.y = 0.84;
    const bf = new THREE.Mesh(new THREE.ConeGeometry(0.17, 1.1, 24, 1, true), new THREE.MeshBasicMaterial({ color: lin('#4da6ff'), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); bf.position.y = 2.1; const bl = new THREE.PointLight(0x7fb8ff, 0.6, 4, 2); bl.position.y = 2.1;
    burner.add(bb, bt, bf, bl); burner.position.set(7.0, 0, 0.6); bb.castShadow = bt.castShadow = true; burner.userData = { flame: bf, light: bl }; scene.add(burner);
    // the vessels
    const tubeX = [-6.2, -5.4, -4.6, -3.8]; tubeX.forEach((x, i) => vessels.push(makeVessel(i, 'tube', x, 0.6, 0.14)));
    vessels.push(makeVessel(4, 'beaker', 1.2, 0.6, 1.69)); vessels.push(makeVessel(5, 'flask', 4.2, 0.6, 1.69));
    // selection marker
    const mk = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.6, 48), new THREE.MeshBasicMaterial({ color: lin('#2ecc96'), transparent: true, opacity: 0.8, side: THREE.DoubleSide })); mk.rotation.x = -Math.PI / 2; mk.visible = false; mk.name = 'marker'; scene.add(mk);
    fx = window.PTLABFX ? window.PTLABFX(THREE, scene) : null;
    controls = ctx.orbit ? ctx.orbit(cam, renderer.domElement) : null;
  }
  function place() { const w = renderer.domElement.clientWidth || 800, h = renderer.domElement.clientHeight || 500; cam.aspect = w / h; cam.updateProjectionMatrix(); renderer.setSize(w, h, false);
    const d = 15.5 * Math.max(1, Math.pow(1.45 / Math.max(0.4, cam.aspect), 0.8)); cam.position.set(0.3, 4.6 + 0.12 * d, d); if (controls) { controls.target.set(0.3, 2.6, 0); controls.sync(); } cam.lookAt(0.3, 2.6, 0); }

  // ---------- actions ----------
  const vesselName = (v) => T.vessels[v.i];
  function heatToggle(v) {
    const on = !v.s.heated;
    if (v.kind === 'tube' && on) vessels.filter((o) => o.kind === 'tube' && o !== v && o.s.heated).forEach((o) => { E.heat(o.s); o.target = o.home.clone(); });
    E.heat(v.s); if (v.kind === 'tube') v.target = on ? new THREE.Vector3(-1.6, 1.55, 0.6) : v.home.clone(); renderCard(); toolbar(); }
  function flameTest(v) { E.flame(v.s); renderCard(); }
  function wash(v) { v.s = E.fresh(); v.seen = new Set(); v.key = {}; Object.values(v.parts).forEach((p) => { if (p && p.isObject3D) v.content.remove(p); }); (v.parts.ppt || []).forEach((m) => v.content.remove(m)); (v.parts.puffs || []).forEach((s) => scene.remove(s)); v.parts = {}; v.target = v.home.clone(); renderCard(); toolbar(); }
  function pourInto(a, b) {
    if (a === b) return hint(T.selfPour); if (!a.s.vol && !a.s.solids.length) return hint(T.nothingToPour);
    // the source vessel lifts over the target, tilts and empties, then goes home
    a.pour = { to: b, t0: performance.now(), dur: 2600, done: false }; sel.mode = null; toolbar();
  }
  function stepPour(v, now) {
    const P = v.pour; if (!P) return; const p = Math.min(1, (now - P.t0) / P.dur), ease = (x) => x * x * (3 - 2 * x), k = ease(Math.min(1, p / 0.3)) * (1 - ease(Math.max(0, (p - 0.8) / 0.2)));
    const over = P.to.g.position.clone().add(new THREE.Vector3(0.45 + v.prof.innerR(v.prof.H) * 0.5, P.to.prof.H + 0.9, 0)); v.g.position.lerpVectors(v.home, over, k); v.g.rotation.z = 1.9 * k;
    if (v.stream) { scene.remove(v.stream); v.stream = null; }
    if (p > 0.32 && p < 0.8) { const m = new THREE.Vector3(0, v.prof.H, 0); v.g.localToWorld(m); const tm = P.to.g.position.clone().add(new THREE.Vector3(0, P.to.prof.H, 0)), surf = P.to.g.position.y + Math.max(0.1, levelFor(P.to, P.to.s.vol)), c = (v.vm && v.vm.liqCol) || '#cfe6ff';
      v.stream = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([m, new THREE.Vector3((m.x + tm.x) / 2, m.y - 0.1, tm.z), new THREE.Vector3(tm.x, tm.y - 0.1, tm.z), new THREE.Vector3(tm.x, surf, tm.z)]), 30, 0.03, 8, false), new THREE.MeshPhysicalMaterial({ color: lin(c), transparent: true, opacity: 0.7, depthWrite: false })); scene.add(v.stream); }
    if (!P.done && p >= 0.8) { P.done = true; E.mix(v.s, P.to.s); const keepHeat = false; v.s = E.fresh(); v.key = {}; sel.vessel = P.to; renderCard(); }
    if (p >= 1) { v.pour = null; v.g.rotation.z = 0; v.g.position.copy(v.target || v.home); }
  }

  // ---------- HTML overlay: hint, card, toolbar, catalogue, danger alert ----------
  function hint(t) { const h = host.querySelector('.rm-hint'); if (h) h.textContent = t; }
  function renderCard() {
    const c = host.querySelector('.rm-card'); if (!c) return;
    if (sel.reagent) { c.style.display = 'block'; const d = E.describe(sel.reagent); if (!d) return; hint(T.hintReagent.replace('{x}', d.name));
      c.innerHTML = '<div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">' + T.selected + '</div><div style="display:flex;align-items:center;gap:10px;margin-top:6px"><span style="width:22px;height:34px;border-radius:5px 5px 8px 8px;background:' + (d.colourHex || '#dfe8f2') + ';box-shadow:0 0 12px ' + (d.colourHex || '#dfe8f2') + '88;border:1px solid var(--line)"></span>'
        + '<div><div style="font:700 22px IBM Plex Mono,monospace;color:var(--text)">' + esc(d.formula) + '</div><div style="font-size:14px;font-weight:600;color:var(--body)">' + esc(d.name) + '</div></div></div>'
        + [[T.cls, d.cls], [T.ions, d.ions], [T.sol, d.sol], [T.colour, d.colour]].filter((r) => r[1]).map((r) => '<div style="display:flex;justify-content:space-between;gap:10px;margin-top:8px;font-size:13px"><span style="color:var(--muted)">' + r[0] + '</span><b style="color:var(--text);text-align:right">' + esc(r[1]) + '</b></div>').join('')
        + '<div style="margin-top:12px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">⚠️ ' + T.hazards + '</div>' + (d.hazards.length ? d.hazards.map((h) => '<div style="margin-top:5px;padding:6px 9px;border-radius:8px;background:rgba(255,93,110,.1);border:1px solid rgba(255,93,110,.35);font-size:12.5px;color:var(--body)">' + esc(h) + '</div>').join('') : '<div style="margin-top:5px;font-size:12.5px;color:var(--muted)">' + T.none + '</div>');
      return; }
    c.style.display = 'block';
    const v = sel.vessel; if (!v) { hint(T.hintStart); c.innerHTML = ''; c.style.display = 'none'; return; } hint(sel.mode === 'pour' ? T.hintPour : T.hintVessel);
    const md = E.medium(v.s), items = v.s.sol.filter((x) => x.f !== 'H2O').map((x) => E.disp(x.f)).concat(v.s.solids.map((s) => E.disp(s.f) + (s.kind === 'ppt' ? '↓' : '')));
    const logs = v.s.log.filter((e) => !e.muted).slice(0, 5);
    c.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><b style="font-size:17px;color:var(--text)">' + esc(vesselName(v)) + '</b><span style="font:12px IBM Plex Mono,monospace;color:var(--muted)">🌡️ ' + Math.round(v.s.temp) + ' °C</span></div>'
      + '<div style="margin-top:6px;font-size:13px;color:var(--body)"><span style="color:var(--muted)">' + T.contents + ':</span> ' + (items.length ? esc(items.join(' · ')) : T.empty) + (md.k !== 'none' ? ' · pH ≈ ' + md.ph + ' (' + T.medium[md.k] + ')' : '') + '</div>'
      + logs.map((e) => '<div style="margin-top:8px;padding:8px 10px;border-radius:10px;background:' + (e.icon === '💥' ? 'rgba(255,93,110,.12)' : 'var(--panel)') + ';border:1px solid ' + (e.icon === '💥' ? 'rgba(255,93,110,.45)' : 'var(--line)') + '"><div style="font-size:13px;font-weight:700;color:var(--text)">' + e.icon + ' ' + e.title + '</div>'
        + (e.eq ? '<div style="margin-top:4px;font:600 13px IBM Plex Mono,monospace;color:var(--green);overflow-x:auto;white-space:nowrap">' + e.eq + '</div>' : '') + (e.ion ? '<div style="margin-top:3px;font:12px IBM Plex Mono,monospace;color:var(--body)">' + T.ionic + ': ' + e.ion + '</div>' : '')
        + (e.note ? '<div style="margin-top:4px;font-size:12px;color:var(--body)">' + e.note + '</div>' : '') + '</div>').join('');
  }
  function toolbar() {
    const b = host.querySelector('.rm-tools'); if (!b) return; const v = sel.vessel, dis = !v;
    const btn = (k, t, c) => '<button data-a="' + k + '"' + (dis && !['cat', 'back', 'cancel'].includes(k) ? ' disabled' : '') + ' style="padding:9px 12px;border-radius:10px;border:1px solid ' + (c || 'var(--line)') + ';background:var(--btn);color:var(--text);font:600 13px Space Grotesk,sans-serif;cursor:pointer;opacity:' + (dis && !['cat', 'back', 'cancel'].includes(k) ? 0.45 : 1) + '">' + t + '</button>';
    b.innerHTML = btn('cat', '📚 ' + T.catalog, 'rgba(77,210,255,.5)') + btn('heat', '🔥 ' + (v && v.s.heated ? T.unheat : T.heat), 'rgba(255,138,58,.5)') + btn('flame', '🕯️ ' + T.flame) + btn('pour', '🫗 ' + T.pour) + btn('wash', '🧽 ' + T.wash)
      + (sel.reagent || sel.mode ? btn('cancel', '✋ ' + T.cancel) : '') + btn('back', '↩ ' + T.back);
  }
  function showAlert(v) { const a = host.querySelector('.rm-alert'), e = v.s.log.find((x) => !x.muted && (x.icon === '💥' || x.icon === '🔥' || x.icon === '✨')); if (!a || !e) return;
    a.innerHTML = '<b>⚠️ ' + T.danger + '</b> ' + e.title + (e.note ? '<div style="margin-top:4px;font-size:12.5px;font-weight:500">' + e.note + '</div>' : ''); a.style.opacity = 1; a.style.transform = 'translate(-50%,0)'; alertT = performance.now(); }
  function catalogue(q) {
    const list = host.querySelector('.rm-cat-list'); if (!list) return; const all = E.reagents(), qq = (q || '').toLowerCase().replace(/['‘’ʻ]/g, '');
    const match = (r) => !qq || (r.id + ' ' + r.n.join(' ')).toLowerCase().replace(/['‘’ʻ]/g, '').includes(qq);
    list.innerHTML = ['acid', 'base', 'salt', 'metal', 'ind', 'other'].map((t) => { const items = all.filter((r) => r.t === t && match(r)); if (!items.length) return '';
      return '<details' + (qq || t !== 'salt' ? ' open' : '') + ' style="margin-bottom:8px"><summary style="cursor:pointer;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">' + T.groups[t] + ' · ' + items.length + '</summary><div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px">'
        + items.map((r) => '<button data-r="' + r.id + '" title="' + esc(r.n[L()]) + '" style="padding:5px 8px;border-radius:8px;border:1px solid var(--line);background:var(--btn);color:var(--text);font:600 12px IBM Plex Mono,monospace;cursor:pointer">' + (r.t === 'ind' ? esc(r.n[L()]) : E.disp(r.id)) + '</button>').join('') + '</div></details>'; }).join(''); }
  function dropReagent() { sel.reagent = null; bottles.forEach((x) => { if (x.userData.y0 != null) x.position.y = x.userData.y0; }); renderCard(); toolbar(); }
  function chooseReagent(id) { sel.reagent = id; sel.mode = null; renderCard(); toolbar(); bottles.forEach((b) => { b.position.y = (b.userData.y0 = b.userData.y0 == null ? b.position.y : b.userData.y0) + (b.userData.rid === id ? 0.18 : 0); }); }
  function onPick(obj) {
    if (anim) return; let o = obj; while (o && o.userData.rid == null && o.userData.vessel == null && o.parent) o = o.parent;
    if (!o) return; if (o.userData.rid != null && o.userData.vessel == null) return chooseReagent(o.userData.rid);
    const v = vessels[o.userData.vessel]; if (!v || v.pour) return;
    if (sel.mode === 'pour' && sel.vessel) { pourInto(sel.vessel, v); return; }
    if (sel.reagent) { if (v.s.broken) { sel.vessel = v; renderCard(); return; } const b = bottles.find((x) => x.userData.rid === sel.reagent); const from = b ? b.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.6, 0.6)) : new THREE.Vector3(-8, 7, 2); sel.vessel = v; startAdd(v, sel.reagent, from); toolbar(); return; }
    sel.vessel = v; renderCard(); toolbar(); }

  // ---------- mount ----------
  function build() {
    host.innerHTML = '<style>@media (max-width:640px){.rm{min-height:78vh!important}.rm-card{left:12px!important;width:auto!important;top:auto!important;bottom:160px;max-height:34%!important}.rm-hint{max-width:none!important;right:12px}.rm-cat{width:auto!important;right:12px}}</style><div class="rm" style="position:relative;width:100%;height:100%;min-height:520px;overflow:hidden;background:radial-gradient(900px 600px at 50% 30%,#2a3350,#0b0f1c 75%)">'
      + '<div class="rm-3d" style="position:absolute;inset:0"></div>'
      + '<div class="rm-hint" style="position:absolute;left:14px;top:12px;max-width:min(560px,70%);padding:8px 12px;border-radius:10px;background:rgba(10,14,28,.72);border:1px solid rgba(255,255,255,.12);color:#e9eef8;font:600 13px Space Grotesk,sans-serif;backdrop-filter:blur(6px)"></div>'
      + '<div class="rm-card" style="display:none;position:absolute;right:12px;top:96px;max-height:calc(100% - 210px);width:min(340px,44%);box-sizing:border-box;overflow:auto;padding:12px 14px;border-radius:14px;background:' + (ctx.light ? 'rgba(255,255,255,.96)' : 'rgba(16,21,38,.94)') + ';backdrop-filter:blur(8px);border:1px solid var(--line);box-shadow:0 10px 30px rgba(0,0,0,.3)"></div>'
      + '<div class="rm-cat" style="display:none;position:absolute;left:12px;top:96px;bottom:110px;width:min(330px,46%);box-sizing:border-box;overflow:auto;padding:12px;border-radius:14px;background:' + (ctx.light ? 'rgba(255,255,255,.96)' : 'rgba(16,21,38,.94)') + ';backdrop-filter:blur(8px);border:1px solid var(--line);box-shadow:0 10px 30px rgba(0,0,0,.3)"><input class="rm-q" placeholder="' + T.find + '" style="width:100%;box-sizing:border-box;margin-bottom:10px;background:var(--input);border:1px solid var(--line);border-radius:10px;color:var(--text);font:13px Space Grotesk,sans-serif;padding:8px 11px;outline:none"><div class="rm-cat-list"></div></div>'
      + '<div class="rm-tools" style="position:absolute;left:12px;right:12px;bottom:12px;display:flex;flex-wrap:wrap;gap:6px;justify-content:center"></div>'
      + '<div class="rm-alert" style="position:absolute;left:50%;bottom:118px;z-index:3;transform:translate(-50%,-10px);opacity:0;transition:.4s;max-width:min(560px,80%);padding:10px 14px;border-radius:12px;background:rgba(200,30,40,.92);color:#fff;font:700 14px Space Grotesk,sans-serif;box-shadow:0 10px 30px rgba(200,30,40,.4);pointer-events:none"></div>'
      + '<div class="rm-f" style="position:absolute;left:12px;top:54px;right:12px;display:flex;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;gap:5px;align-items:center;padding-bottom:2px">'
      + [['main', '⭐ ' + T.fMain, '#3b4a6b'], ['acid', T.groups.acid, CLS.acid], ['base', T.groups.base, CLS.base], ['salt', T.groups.salt, CLS.salt], ['metal', T.groups.metal, CLS.metal], ['ind', T.groups.ind, CLS.ind], ['colour', '🎨 ' + T.fColour, '#c2410c'], ['danger', '⚠️ ' + T.fDanger, '#b91c1c']]
        .map(([k, t, c]) => '<button data-f="' + k + '" data-c="' + c + '" style="flex:0 0 auto;display:flex;align-items:center;gap:5px;padding:5px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(10,14,28,.66);color:#dfe6f5;font:600 12px Space Grotesk,sans-serif;cursor:pointer;backdrop-filter:blur(6px)"><span style="width:9px;height:9px;border-radius:50%;background:' + c + '"></span>' + t + '</button>').join('')
      + '<input class="rm-fq" placeholder="🔎 ' + T.fFind + '" style="flex:0 0 150px;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(10,14,28,.66);color:#eef2fa;font:12px Space Grotesk,sans-serif;outline:none">'
      + '<span class="rm-f-info" style="flex:0 0 auto;white-space:nowrap;font:12px Space Grotesk,sans-serif;color:#cfd8ea"></span></div>'
      + '<style>.rm-f-info button{border:1px solid rgba(255,255,255,.2);background:rgba(10,14,28,.7);color:#fff;border-radius:6px;padding:1px 7px;cursor:pointer}@media (max-width:640px){.rm-f{right:12px!important}}</style></div>';
    buildScene(host.querySelector('.rm-3d'));
    const ro = new ResizeObserver(place); ro.observe(host.querySelector('.rm-3d')); host._ro = ro; place();
    let down = null; renderer.domElement.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
    renderer.domElement.addEventListener('pointerup', (e) => { if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return; const r = renderer.domElement.getBoundingClientRect(), m = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      const rc = new THREE.Raycaster(); rc.setFromCamera(m, cam); const hits = rc.intersectObjects([...bottles, ...vessels.map((v) => v.hit)], true); if (hits.length) onPick(hits[0].object); });
    host.querySelector('.rm-tools').addEventListener('click', (e) => { const b = e.target.closest('button[data-a]'); if (!b || b.disabled) return; const a = b.dataset.a, v = sel.vessel;
      if (a === 'back') return onExit && onExit(); if (a === 'cat') { const c = host.querySelector('.rm-cat'); c.style.display = c.style.display === 'none' ? 'block' : 'none'; catalogue(host.querySelector('.rm-q').value); return; }
      if (a === 'cancel') { sel.mode = null; dropReagent(); return; }
      if (!v) return; if (a === 'heat') heatToggle(v); if (a === 'flame') flameTest(v); if (a === 'wash') wash(v); if (a === 'pour') { sel.reagent = null; sel.mode = 'pour'; renderCard(); toolbar(); } });
    host.querySelector('.rm-cat-list').addEventListener('click', (e) => { const b = e.target.closest('button[data-r]'); if (b) { chooseReagent(b.dataset.r); host.querySelector('.rm-cat').style.display = 'none'; } });
    host.querySelector('.rm-q').addEventListener('input', (e) => catalogue(e.target.value));
    host.querySelector('.rm-f').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.f) { filt = b.dataset.f; query = ''; page = 0; host.querySelector('.rm-fq').value = ''; } if (b.dataset.pg) page += +b.dataset.pg; fillShelf(); });
    let qt = 0; host.querySelector('.rm-fq').addEventListener('input', (e) => { clearTimeout(qt); qt = setTimeout(() => { query = e.target.value.trim(); page = 0; fillShelf(); }, 250); });

    renderCard(); toolbar();
    let last = performance.now();
    const frame = (now) => { if (!alive) return; raf = requestAnimationFrame(frame); try { draw(now); } catch (e) { console.error('labroom', e); } };
    const draw = (now) => { const dt = Math.min(0.05, (now - last) / 1000); last = now;
      vessels.forEach((v) => { if (!v.pour && v.target) v.g.position.lerp(v.target, 0.08); stepPour(v, now); syncVessel(v, Date.now()); });
      stepAnim(now);
      // lamps: the central one serves the tube being heated, the others their tripods
      const tubeHot = vessels.some((v) => v.kind === 'tube' && v.s.heated); [[lamps.center, tubeHot], [lamps.b, vessels[4].s.heated], [lamps.f, vessels[5].s.heated]].forEach(([l, on]) => { l.userData.flame.visible = on; l.userData.light.intensity = on ? 1.3 + Math.sin(now / 60) * 0.25 : 0; if (on) { const s = 1 + Math.sin(now / 55 + l.id) * 0.07; l.userData.flame.scale.set(1 / s, s, 1 / s); } });
      const ft = vessels.map((v) => v.vm && v.vm.flameTest).find(Boolean); burner.userData.flame.material.color.copy(lin(ft || '#4da6ff')); burner.userData.flame.material.opacity = ft ? 0.8 : 0.5; burner.userData.light.color.copy(lin(ft || '#7fb8ff')); burner.userData.light.intensity = ft ? 1.6 : 0.6; burner.userData.flame.scale.y = 1 + Math.sin(now / 45) * 0.05;
      const mk = scene.getObjectByName('marker'); if (sel.vessel) { mk.visible = true; const p = sel.vessel.g.position; mk.position.set(p.x, 0.02, p.z); const r = sel.vessel.kind === 'tube' ? 0.5 : 1.15; mk.scale.setScalar(r / 0.55); mk.material.opacity = 0.55 + Math.sin(now / 250) * 0.25; } else mk.visible = false;
      if (alertT && now - alertT > 6500) { const a = host.querySelector('.rm-alert'); if (a) { a.style.opacity = 0; a.style.transform = 'translate(-50%,-10px)'; } alertT = 0; }
      const sh = fx ? fx.update(now, dt) : 0; if (controls) controls.update(); if (sh > 0.002) { cam.position.x += (Math.random() - 0.5) * sh; cam.position.y += (Math.random() - 0.5) * sh; }
      renderer.render(scene, cam); };
    raf = requestAnimationFrame(frame);
    // chemistry clock: every vessel heats, boils and reacts on its own
    let lt = Date.now(); tick = setInterval(() => { const t = Date.now(), dt = Math.min(0.5, (t - lt) / 1000); lt = t; let ch = false; vessels.forEach((v) => { const n = v.s.log.length; E.step(v.s, dt); if (v.s.broken && v.s.heated) { E.heat(v.s); if (v === sel.vessel) toolbar(); } if (v.s.log.length !== n && v === sel.vessel) ch = true; }); if (ch && !sel.reagent) renderCard(); if (sel.vessel && !sel.reagent) { const tEl = host.querySelector('.rm-card span'); if (tEl) tEl.textContent = '🌡️ ' + Math.round(sel.vessel.s.temp) + ' °C'; } }, 150);
  }
  window.PTROOM = {
    mount(h, c, exit) { THREE = c.THREE; E = window.PTLAB.engine; host = h; ctx = c; onExit = exit; T = S[c.lang] || S.uz; E.setLang(c.lang); mats(); vessels = []; bottles = []; colourCache = {}; filt = 'main'; query = ''; page = 0; sel = { reagent: null, vessel: null, mode: null }; anim = null; alive = true; build(); },
    setCtx(c) { ctx = Object.assign(ctx || {}, c); T = S[ctx.lang] || S.uz; E.setLang(ctx.lang); if (host) { colourCache = {}; renderCard(); toolbar(); fillShelf(); } },
    // for testing: choose a reagent and click a vessel, or run an action on a vessel
    _pick(rid, vi) { if (rid) chooseReagent(rid); if (vi != null) onPick(vessels[vi].hit); }, _vessels: () => vessels,
    unmount() { alive = false; cancelAnimationFrame(raf); clearInterval(tick); if (host && host._ro) host._ro.disconnect(); if (fx) fx.clear(); if (renderer) { renderer.dispose(); try { renderer.forceContextLoss(); } catch (e) {} } renderer = null; scene = null; if (host) host.innerHTML = ''; host = null; }
  };
})();
