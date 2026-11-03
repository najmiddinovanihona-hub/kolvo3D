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
      glass: new THREE.MeshPhysicalMaterial({ color: lin('#cfdde6'), roughness: 0.03, transparent: true, opacity: 0.2, clearcoat: 1, envMapIntensity: 2.6, side: THREE.DoubleSide, depthWrite: false }),
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
        new THREE.MeshPhysicalMaterial({ color: lin(tc || '#e9f2f6'), emissive: tc ? lin(tc).multiplyScalar(0.14) : new THREE.Color(0), transparent: true, opacity: tc ? 0.86 : 0.14, roughness: 0.1, clearcoat: 0.6, depthWrite: false }));
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
    fo.position.y = 0.27; fi.position.y = 0.13; fl.add(fo, fi); const fg = glowSprite('#ffa24a', 1.3, 0.5); fg.position.y = 0.25; fl.add(fg); fl.position.y = 1.0; fl.visible = false; const light = new THREE.PointLight(0xff9a40, 0, 5, 2); light.position.y = 1.3;
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
    const rimM = new THREE.MeshPhysicalMaterial({ color: lin('#b9c7d0'), transparent: true, opacity: 0.75, roughness: 0.05, clearcoat: 1, depthWrite: false }), top = v.prof.pts[v.prof.pts.length - 3];
    const lip = new THREE.Mesh(new THREE.TorusGeometry(top[0] + 0.02, 0.025, 8, 48), rimM); lip.rotation.x = Math.PI / 2; lip.position.y = top[1]; v.g.add(lip);
    if (kind !== 'tube') { const foot = new THREE.Mesh(new THREE.TorusGeometry(v.prof.innerR(0.05) + 0.02, 0.02, 8, 48), rimM); foot.rotation.x = Math.PI / 2; foot.position.y = 0.04; v.g.add(foot);
      const gm = new THREE.MeshBasicMaterial({ map: gradTex(kind), transparent: true, depthWrite: false, side: THREE.DoubleSide }), geo = kind === 'beaker' ? new THREE.CylinderGeometry(1.0, 1.0, 1.7, 32, 1, true, -0.6, 1.2) : new THREE.CylinderGeometry(0.58, 0.99, 1.0, 32, 1, true, -0.6, 1.2);
      const gr = new THREE.Mesh(geo, gm); gr.position.y = kind === 'beaker' ? 0.95 : 0.75; gr.renderOrder = 6; v.g.add(gr); }
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
      v.parts.liqMat.color.copy(lin(vm.liqCol || '#cfe6ff')); v.parts.liqMat.opacity = vm.liqCol ? Math.min(0.95, vm.liqOp + 0.08) : 0.22; v.parts.liqMat.emissive.copy(v.parts.liqMat.color).multiplyScalar(vm.liqCol ? 0.16 : 0); }
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
    if (!a.added && p >= 0.8) { a.added = true; E.add(a.v.s, a.id); sel.vessel = a.v; dropReagent(); guideEvent('add', a.id, a.v); }
    if (p >= 1) { scene.remove(a.tool); a.falls.forEach((f) => scene.remove(f.m)); if (a.stream) scene.remove(a.stream); anim = null; }
  }

  // ---------- the room ----------
  // ---------- props that make the room feel lived-in ----------
  let glowTx = null;
  function glowSprite(col, size, op) { if (!glowTx) { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); glowTx = new THREE.CanvasTexture(cv); }
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTx, color: lin(col), transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.set(size, size, 1); return sp; }
  const shade = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };
  function stick(a, b, r, mat) { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 10), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; }
  function microscope() {
    const g = new THREE.Group(), wht = new THREE.MeshPhysicalMaterial({ color: lin('#f3f5f7'), roughness: 0.32, clearcoat: 0.7 }), blk = new THREE.MeshStandardMaterial({ color: lin('#17191d'), roughness: 0.4, metalness: 0.3 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.24, 1.7), wht); base.position.y = 0.12; g.add(base);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.2, -0.6), new THREE.Vector3(0, 1.4, -0.68), new THREE.Vector3(0, 2.2, -0.45), new THREE.Vector3(0, 2.45, -0.1)]), 30, 0.2, 14, false), wht));
    const stage = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.08, 0.95), blk); stage.position.set(0, 1.05, 0.05); g.add(stage);
    const cond = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.3, 20), blk); cond.position.set(0, 0.85, 0.08); g.add(cond);
    const lamp = new THREE.Mesh(new THREE.CircleGeometry(0.12, 20), new THREE.MeshBasicMaterial({ color: lin('#fff6d8') })); lamp.rotation.x = -Math.PI / 2; lamp.position.set(0, 0.245, 0.08); g.add(lamp);
    [-1, 1].forEach((sd) => { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.12, 24), blk); k.rotation.z = Math.PI / 2; k.position.set(sd * 0.3, 1.0, -0.55); g.add(k); const k2 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 20), blk); k2.rotation.z = Math.PI / 2; k2.position.set(sd * 0.42, 1.0, -0.55); g.add(k2); });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.38, 0.75), wht); head.position.set(0, 2.45, 0.05); g.add(head);
    const tur = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.14, 24), blk); tur.position.set(0, 2.18, 0.15); g.add(tur);
    [[0, '#d23b3b'], [2.1, '#e3b52c'], [4.2, '#2f6fd6']].forEach(([a, c]) => { const o = new THREE.Group(), body = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.42, 16), M.steel), ring = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.04, 16), new THREE.MeshStandardMaterial({ color: lin(c) })); ring.position.y = 0.06; o.add(body, ring);
      o.position.set(Math.sin(a) * 0.14, 1.96, 0.15 + Math.cos(a) * 0.14); o.rotation.set(Math.cos(a) * 0.2, 0, -Math.sin(a) * 0.2); g.add(o); });
    [-0.13, 0.13].forEach((x) => { const e = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.6, 20), blk); e.position.set(x, 2.82, -0.2); e.rotation.x = -0.55; g.add(e); const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.06, 20), M.dark); cap.position.set(x, 3.07, -0.36); cap.rotation.x = -0.55; g.add(cap); });
    return shade(g);
  }
  function goggles() {
    const g = new THREE.Group(), R = 0.78, blue = new THREE.MeshStandardMaterial({ color: lin('#1f3f9e'), roughness: 0.4 }), arc = (a0, a1, y, r) => { const pts = []; for (let i = 0; i <= 24; i++) { const a = a0 + (a1 - a0) * i / 24; pts.push(new THREE.Vector3(Math.sin(a) * R, y, Math.cos(a) * R)); } return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r, 8, false), blue); };
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.44, 40, 1, true, -1.1, 2.2), new THREE.MeshPhysicalMaterial({ color: lin('#eef6ff'), transparent: true, opacity: 0.25, roughness: 0.04, clearcoat: 1, envMapIntensity: 2.5, side: THREE.DoubleSide, depthWrite: false }));
    g.add(lens, arc(-1.1, 1.1, 0.22, 0.03), arc(-1.1, 1.1, -0.22, 0.03), arc(1.1, 6.283 - 1.1, 0, 0.025));
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.06), blue); bridge.position.set(0, -0.2, R); g.add(bridge); return shade(g);
  }
  function molecule() {
    const g = new THREE.Group(), C = new THREE.MeshPhysicalMaterial({ color: lin('#16181c'), roughness: 0.18, clearcoat: 1 }), H = new THREE.MeshPhysicalMaterial({ color: lin('#f4f4f2'), roughness: 0.25, clearcoat: 1 }), bond = new THREE.MeshStandardMaterial({ color: lin('#d9dce0'), roughness: 0.4 });
    const cs = []; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; cs.push(new THREE.Vector3(Math.cos(a) * 0.5, (i % 2 ? 0.14 : -0.14), Math.sin(a) * 0.5)); }
    cs.forEach((p, i) => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), C); s.position.copy(p); g.add(s); g.add(stick(p, cs[(i + 1) % 6], 0.03, bond));
      const out = p.clone().setY(0).normalize(); [new THREE.Vector3(0, p.y > 0 ? 1 : -1, 0).multiplyScalar(0.36), out.clone().multiplyScalar(0.36).setY(p.y > 0 ? -0.12 : 0.12)].forEach((d) => { const q = p.clone().add(d); const h = new THREE.Mesh(new THREE.SphereGeometry(0.085, 20, 14), H); h.position.copy(q); g.add(h); g.add(stick(p, q, 0.022, bond)); }); });
    return shade(g);
  }
  function plant() {
    const g = new THREE.Group(), pot = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.55, 28), new THREE.MeshPhysicalMaterial({ color: lin('#f2f2ef'), roughness: 0.3, clearcoat: 0.5 })); pot.position.y = 0.275; g.add(pot);
    const soil = new THREE.Mesh(new THREE.CircleGeometry(0.31, 24), new THREE.MeshStandardMaterial({ color: lin('#3b2a1e'), roughness: 1 })); soil.rotation.x = -Math.PI / 2; soil.position.y = 0.52; g.add(soil);
    const n = 70, leaves = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, side: THREE.DoubleSide }), n), d = new THREE.Object3D(), col = new THREE.Color();
    for (let i = 0; i < n; i++) { const a = rnd(i * 7 + 3) * 6.283, trail = i % 5 === 0, r = trail ? 0.38 + rnd(i) * 0.15 : rnd(i * 3) * 0.32, y = trail ? 0.55 - rnd(i * 5) * 0.6 : 0.6 + rnd(i * 11) * 0.55;
      d.position.set(Math.cos(a) * r, y, Math.sin(a) * r); d.rotation.set(rnd(i) * 1.2 - 0.6, a, rnd(i * 2) * 1.4 - 0.7); d.scale.set(0.14, 0.022, 0.085); d.updateMatrix(); leaves.setMatrixAt(i, d.matrix); leaves.setColorAt(i, col.setHSL(0.3 + rnd(i * 13) * 0.05, 0.55, 0.22 + rnd(i * 17) * 0.16).convertSRGBToLinear()); }
    g.add(leaves); return shade(g);
  }
  // a neon atom on the back wall: the Kolvo emblem glowing blue
  function neonAtom() {
    const g = new THREE.Group(), neon = new THREE.MeshBasicMaterial({ color: lin('#9fe3ff') });
    [0, 1.047, 2.094].forEach((r) => { const t = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.055, 10, 90), neon); t.scale.y = 0.38; const w = new THREE.Group(); w.add(t); w.rotation.z = r; g.add(w); });
    const nuc = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), neon); g.add(nuc); const glow = glowSprite('#3aa8ff', 6.0, 0.8); glow.position.z = 0.1; g.add(glow);
    const l = new THREE.PointLight(0x4cb4ff, 0.9, 9, 2); l.position.z = 0.8; g.add(l); return g;
  }
  // printed graduations on the beaker and the flask
  function gradTex(kind) { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const g = cv.getContext('2d'); g.strokeStyle = g.fillStyle = 'rgba(248,251,255,.95)'; g.shadowColor = 'rgba(0,30,60,.5)'; g.shadowBlur = 2; g.font = 'bold 22px IBM Plex Mono, monospace'; g.lineWidth = 3;
    const vals = kind === 'beaker' ? [50, 100, 150, 200, 250] : [50, 100, 150, 200]; vals.forEach((v, i) => { const y = 236 - (i + 1) * (kind === 'beaker' ? 42 : 52); g.beginPath(); g.moveTo(96, y); g.lineTo(150, y); g.stroke(); g.fillText(String(v), 156, y + 8); g.beginPath(); g.moveTo(110, y + (kind === 'beaker' ? 21 : 26)); g.lineTo(136, y + (kind === 'beaker' ? 21 : 26)); g.stroke(); });
    g.font = '18px IBM Plex Mono, monospace'; g.fillText('ml', 112, 236); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t; }
  // ---------- the room: back and side walls, floor, ceiling with light panels, a window, a bench with cabinets ----------
  const RX = 9.5, RZ0 = -3.6, RZ1 = 13, FLOOR = -6, CEIL = 14;
  function canvasTex(w, h, draw, rx, ry) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx || 1, ry || 1); return t; }
  const speckle = (g, w, h, n, a, dark) => { for (let i = 0; i < n; i++) { g.fillStyle = (dark ? 'rgba(0,0,0,' : 'rgba(255,255,255,') + (Math.random() * a) + ')'; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 1.5, 1 + Math.random() * 1.5); } };
  // glossy white ceramic tiles with grout and a soft bevel
  const tileTex = (rx, ry) => canvasTex(512, 512, (g) => { g.fillStyle = '#aab2ba'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const x = i * 128 + 3, y = j * 128 + 3, v = 196 + Math.floor(Math.random() * 10); const gr = g.createLinearGradient(x, y, x + 122, y + 122); gr.addColorStop(0, 'rgb(' + (v + 4) + ',' + (v + 10) + ',' + (v + 18) + ')'); gr.addColorStop(1, 'rgb(' + (v - 14) + ',' + (v - 8) + ',' + (v) + ')'); g.fillStyle = gr; g.fillRect(x, y, 122, 122); }
    speckle(g, 512, 512, 1500, 0.05, true); }, rx, ry);
  const paintTex = (col, rx, ry) => canvasTex(256, 256, (g) => { g.fillStyle = col; g.fillRect(0, 0, 256, 256); speckle(g, 256, 256, 3000, 0.035, true); speckle(g, 256, 256, 2000, 0.04); }, rx, ry);
  function buildRoom() {
    const tileM = new THREE.MeshStandardMaterial({ map: tileTex(6, 2.4), roughness: 0.22, envMapIntensity: 0.9 }), tileS = new THREE.MeshStandardMaterial({ map: tileTex(4.5, 2.4), roughness: 0.22, envMapIntensity: 0.9 });
    const paint = new THREE.MeshStandardMaterial({ map: paintTex('#7d93b4', 4, 2), roughness: 0.92 }), add = (m, x, y, z, ry, rec) => { m.position.set(x, y, z); if (ry) m.rotation.y = ry; m.receiveShadow = rec !== false; scene.add(m); return m; };
    const W = RX * 2, D = RZ1 - RZ0, TILE_TOP = 7.6;
    // back wall: tiles to above the shelves, paint above
    add(new THREE.Mesh(new THREE.PlaneGeometry(W, TILE_TOP - FLOOR), tileM), 0, (TILE_TOP + FLOOR) / 2, RZ0);
    add(new THREE.Mesh(new THREE.PlaneGeometry(W, CEIL - TILE_TOP), paint), 0, (CEIL + TILE_TOP) / 2, RZ0);
    // side walls, each tiled to the same height
    [-1, 1].forEach((sd) => { add(new THREE.Mesh(new THREE.PlaneGeometry(D, TILE_TOP - FLOOR), tileS), sd * RX, (TILE_TOP + FLOOR) / 2, (RZ0 + RZ1) / 2, -sd * Math.PI / 2);
      add(new THREE.Mesh(new THREE.PlaneGeometry(D, CEIL - TILE_TOP), paint), sd * RX, (CEIL + TILE_TOP) / 2, (RZ0 + RZ1) / 2, -sd * Math.PI / 2);
      const trim = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, D), new THREE.MeshStandardMaterial({ color: lin('#9aa3ab'), metalness: 0.6, roughness: 0.35 })); add(trim, sd * (RX - 0.04), TILE_TOP, (RZ0 + RZ1) / 2); });
    const btrim = new THREE.Mesh(new THREE.BoxGeometry(W, 0.14, 0.08), new THREE.MeshStandardMaterial({ color: lin('#9aa3ab'), metalness: 0.6, roughness: 0.35 })); add(btrim, 0, TILE_TOP, RZ0 + 0.04);
    // floor: large grey vinyl tiles
    const floorT = canvasTex(512, 512, (g) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const v = 128 + ((i + j) % 2) * 9 + Math.floor(Math.random() * 6); g.fillStyle = 'rgb(' + v + ',' + (v + 4) + ',' + (v + 9) + ')'; g.fillRect(i * 256, j * 256, 256, 256); }
      speckle(g, 512, 512, 9000, 0.14, true); speckle(g, 512, 512, 5000, 0.1); g.strokeStyle = 'rgba(40,44,50,.6)'; g.lineWidth = 2; for (let k = 0; k <= 2; k++) { g.beginPath(); g.moveTo(k * 256, 0); g.lineTo(k * 256, 512); g.stroke(); g.beginPath(); g.moveTo(0, k * 256); g.lineTo(512, k * 256); g.stroke(); } }, W / 4, D / 4);
    const floor = add(new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: floorT, roughness: 0.38, envMapIntensity: 0.7 })), 0, FLOOR, (RZ0 + RZ1) / 2); floor.rotation.x = -Math.PI / 2;
    // ceiling with LED panels and their lights
    const ceil = add(new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: lin('#b9c6d6'), roughness: 0.95 })), 0, CEIL, (RZ0 + RZ1) / 2); ceil.rotation.x = Math.PI / 2;
    const panelM = new THREE.MeshBasicMaterial({ color: 0xffffff }), frameM = new THREE.MeshStandardMaterial({ color: lin('#b8bec4'), metalness: 0.5, roughness: 0.4 });
    [[-5.5, 1], [5.5, 1], [-5.5, 8], [5.5, 8]].forEach(([x, z]) => { const f = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 1.8), frameM); f.position.set(x, CEIL - 0.04, z); scene.add(f); const pnl = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.6), panelM); pnl.rotation.x = Math.PI / 2; pnl.position.set(x, CEIL - 0.09, z); scene.add(pnl); });
    // the window on the left wall: daylight sky, frame and sill
    const sky = canvasTex(256, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#9fcbf2'); gr.addColorStop(0.62, '#e6f2fb'); gr.addColorStop(0.63, '#b9c7a6'); gr.addColorStop(1, '#8ea37a'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(Math.random() * 256, 30 + Math.random() * 80, 30 + Math.random() * 30, 8 + Math.random() * 6, 0, 0, 6.3); g.fill(); }
      for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(70,95,60,' + (0.5 + Math.random() * 0.4) + ')'; const x = Math.random() * 256; g.beginPath(); g.ellipse(x, 165 + Math.random() * 10, 12 + Math.random() * 14, 18 + Math.random() * 14, 0, 0, 6.3); g.fill(); } });
    const WY = 6.4, WZ = 2.2, WW = 6.4, WH = 4.6, win = new THREE.Mesh(new THREE.PlaneGeometry(WW, WH), new THREE.MeshBasicMaterial({ map: sky })); win.rotation.y = Math.PI / 2; win.position.set(-RX + 0.02, WY, WZ); scene.add(win);
    const wf = new THREE.MeshStandardMaterial({ color: lin('#f2f3f4'), roughness: 0.5 });
    [[0, WH / 2, WW + 0.3, 0.18], [0, -WH / 2, WW + 0.3, 0.18], [0, 0, WW, 0.1]].forEach(([dz, dy, len, th]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.22, th, len), wf); b.position.set(-RX + 0.1, WY + dy, WZ + dz); b.castShadow = true; scene.add(b); });
    [-WW / 2, 0, WW / 2].forEach((dz) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.22, WH, dz ? 0.18 : 0.1), wf); b.position.set(-RX + 0.1, WY, WZ + dz); b.castShadow = true; scene.add(b); });
    const sill = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, WW + 0.6), wf); sill.position.set(-RX + 0.3, WY - WH / 2 - 0.12, WZ); scene.add(sill);
    // the bench: dark epoxy worktop on cabinets with doors and steel handles
    const topT = canvasTex(512, 512, (g) => { g.fillStyle = '#23272c'; g.fillRect(0, 0, 512, 512); speckle(g, 512, 512, 6000, 0.08); speckle(g, 512, 512, 4000, 0.25, true); }, 6, 2);
    const top = new THREE.Mesh(new THREE.BoxGeometry(W - 0.02, 0.4, 7.2), new THREE.MeshStandardMaterial({ map: topT, roughness: 0.3, envMapIntensity: 1.1 })); top.position.set(0, -0.2, 0.3); top.receiveShadow = true; scene.add(top);
    const lowEnd = Math.min(window.innerWidth, window.innerHeight) < 600 || /Mobi|Android/i.test(navigator.userAgent);
    if (THREE.Reflector && !lowEnd) { const pr = Math.min(window.devicePixelRatio || 1, 1.5), mir = new THREE.Reflector(new THREE.PlaneGeometry(W - 0.02, 7.2), { color: 0x9aa2ab, textureWidth: Math.round(window.innerWidth * pr * 0.7), textureHeight: Math.round(window.innerHeight * pr * 0.7), clipBias: 0.003 });
      mir.rotation.x = -Math.PI / 2; mir.position.set(0, 0.002, 0.3); scene.add(mir);
      const gloss = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.02, 7.2), new THREE.MeshStandardMaterial({ map: topT, roughness: 0.2, transparent: true, opacity: 0.55, envMapIntensity: 1.2, depthWrite: false })); gloss.rotation.x = -Math.PI / 2; gloss.position.set(0, 0.004, 0.3); gloss.receiveShadow = true; gloss.renderOrder = 1; scene.add(gloss); }
    const lam = new THREE.MeshPhysicalMaterial({ color: lin('#e9edf2'), roughness: 0.35, clearcoat: 0.4 }), body = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, -FLOOR - 1.2, 6.6), new THREE.MeshStandardMaterial({ color: lin('#9ea5ad'), roughness: 0.7 }));
    body.position.set(0, (FLOOR + 0.8) / 2 - 0.2, 0.15); scene.add(body); const plinth = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 0.8, 6.4), new THREE.MeshStandardMaterial({ color: lin('#2b2f35'), roughness: 0.8 })); plinth.position.set(0, FLOOR + 0.4, 0.05); scene.add(plinth);
    const hM = new THREE.MeshStandardMaterial({ color: lin('#dfe3e7'), metalness: 0.95, roughness: 0.22 }), nD = 8, dw = (W - 0.6) / nD, dh = -FLOOR - 1.5, frontZ = 0.15 + 3.3;
    for (let i = 0; i < nD; i++) { const x = -W / 2 + 0.3 + dw * (i + 0.5); const door = new THREE.Mesh(new THREE.BoxGeometry(dw - 0.08, i % 4 === 0 ? dh * 0.3 - 0.06 : dh, 0.1), lam); door.position.set(x, i % 4 === 0 ? -0.55 - dh * 0.15 : -0.55 - dh / 2, frontZ); door.castShadow = door.receiveShadow = true; scene.add(door);
      if (i % 4 === 0) [1, 2].forEach((k) => { const dr = new THREE.Mesh(new THREE.BoxGeometry(dw - 0.08, dh * 0.35 - 0.06, 0.1), lam); dr.position.set(x, -0.55 - dh * 0.3 - dh * 0.35 * (k - 0.5), frontZ); scene.add(dr); const hd = new THREE.Mesh(new THREE.BoxGeometry(dw * 0.5, 0.06, 0.08), hM); hd.position.set(x, dr.position.y + dh * 0.12, frontZ + 0.09); scene.add(hd); });
      const h = new THREE.Mesh(new THREE.BoxGeometry(dw * 0.5, 0.06, 0.08), hM); h.position.set(x, i % 4 === 0 ? -0.55 - dh * 0.06 : -0.9, frontZ + 0.09); scene.add(h); }
    // a sink with a gooseneck tap at the left end of the bench
    const sinkM = new THREE.MeshStandardMaterial({ color: lin('#c9ced3'), metalness: 0.9, roughness: 0.28 });
    const basin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 1.7), new THREE.MeshStandardMaterial({ color: lin('#8e959c'), metalness: 0.9, roughness: 0.35 })); basin.position.set(-7.9, 0.02, 0.3); scene.add(basin);
    [[0, 0.85, 2.1, 0.12], [0, -0.85, 2.1, 0.12]].forEach(([dx, dz, l]) => { const r = new THREE.Mesh(new THREE.BoxGeometry(l, 0.08, 0.12), sinkM); r.position.set(-7.9 + dx, 0.04, 0.3 + dz); scene.add(r); });
    [-1, 1].forEach((sd) => { const r = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 1.8), sinkM); r.position.set(-7.9 + sd * 1.0, 0.04, 0.3); scene.add(r); });
    const tap = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-7.9, 0, -0.9), new THREE.Vector3(-7.9, 1.9, -0.9), new THREE.Vector3(-7.9, 2.4, -0.4), new THREE.Vector3(-7.9, 2.0, 0.15), new THREE.Vector3(-7.9, 1.6, 0.2)]), 40, 0.06, 12, false), sinkM); tap.castShadow = true; scene.add(tap);
    [-0.4, 0.4].forEach((dx) => { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.25, 16), sinkM); k.position.set(-7.9 + dx, 0.12, -0.9); scene.add(k); const w = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.07), new THREE.MeshStandardMaterial({ color: lin(dx < 0 ? '#d23b3b' : '#2f6fd6') })); w.position.set(-7.9 + dx, 0.27, -0.9); scene.add(w); });
    // shelf brackets
    [-8.0, -2.7, 2.7, 8.0].forEach((x) => [3.55, 5.55].forEach((y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.9), new THREE.MeshStandardMaterial({ color: lin('#4a4f56'), metalness: 0.6, roughness: 0.4 })); b.position.set(x, y - 0.3, -3.05); b.castShadow = true; scene.add(b); }));
    // right wall: a periodic table poster, an eyewash sign and a fire extinguisher
    const SYM = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
    const pos = (z) => { if (z === 1) return [0, 0]; if (z === 2) return [0, 17]; const P = [[3, 10, 1], [11, 18, 2]]; for (const [a, b, r] of P) if (z >= a && z <= b) { const k = z - a; return [r, k < 2 ? k : k + 10]; }
      for (const [a, r] of [[19, 3], [37, 4]]) if (z >= a && z < a + 18) return [r, z - a]; for (const [a, r, fr] of [[55, 5, 8], [87, 6, 9]]) { if (z < a + 2 && z >= a) return [r, z - a]; if (z >= a + 2 && z <= a + 16) return [fr, z - a - 2 + 2]; if (z > a + 16 && z < a + 32) return [r, z - a - 14]; } return [0, 0]; };
    const blockCol = (z, c, r) => (r >= 8 ? '#7fc98f' : c < 2 || z === 2 ? '#f08a7e' : c >= 12 ? '#f3cf6a' : '#83b6ea');
    const pt = canvasTex(1024, 640, (g) => { g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, 1024, 640); g.fillStyle = '#1d2a44'; g.font = 'bold 40px Space Grotesk, sans-serif'; g.textAlign = 'center'; g.fillText(['Kimyoviy elementlar davriy jadvali', 'Periodic Table of the Elements', 'Периодическая система элементов'][L()], 512, 56);
      const cw = 52, ch = 56, ox = 44, oy = 84; SYM.forEach((sy, i) => { const z = i + 1, [r, c] = pos(z), y = oy + r * ch + (r >= 8 ? 14 : 0); g.fillStyle = blockCol(z, c, r); g.fillRect(ox + c * cw + 2, y + 2, cw - 4, ch - 4); g.fillStyle = '#16202e'; g.font = 'bold 22px IBM Plex Mono, monospace'; g.fillText(sy, ox + c * cw + cw / 2, y + 38); g.font = '11px IBM Plex Mono, monospace'; g.fillText(z, ox + c * cw + cw / 2, y + 15); }); });
    const poster = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4.0), new THREE.MeshStandardMaterial({ map: pt, roughness: 0.75 })); poster.rotation.y = -Math.PI / 2; poster.position.set(RX - 0.03, 10.2, 2.4); scene.add(poster);
    const pf = new THREE.Mesh(new THREE.BoxGeometry(0.06, 4.2, 6.6), new THREE.MeshStandardMaterial({ color: lin('#30353c'), roughness: 0.5 })); pf.position.set(RX - 0.01, 10.2, 2.4); scene.add(pf);
    const sign = canvasTex(256, 256, (g) => { g.fillStyle = '#119a4a'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#fff'; g.lineWidth = 10; g.strokeRect(14, 14, 228, 228); g.fillStyle = '#fff'; g.font = 'bold 120px sans-serif'; g.textAlign = 'center'; g.fillText('+', 128, 150); g.font = 'bold 26px Space Grotesk, sans-serif'; g.fillText(['KO‘Z YUVISH', 'EYE WASH', 'ПРОМЫВКА ГЛАЗ'][L()], 128, 220); });
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), new THREE.MeshStandardMaterial({ map: sign, roughness: 0.6 })); sg.rotation.y = -Math.PI / 2; sg.position.set(RX - 0.03, 5.6, 6.8); scene.add(sg);
    const ext = new THREE.Group(), red = new THREE.MeshStandardMaterial({ color: lin('#c4211d'), roughness: 0.35, metalness: 0.2 }); const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 2.6, 28), red); cyl.position.y = 1.3; const domeE = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 12, 0, 6.3, 0, Math.PI / 2), red); domeE.position.y = 2.6;
    const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 12), M.dark); valve.position.y = 3.05; const hose = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 3.1, 0), new THREE.Vector3(-0.3, 3.0, 0.3), new THREE.Vector3(-0.5, 1.8, 0.45), new THREE.Vector3(-0.45, 0.9, 0.4)]), 24, 0.05, 8, false), M.dark);
    ext.add(cyl, domeE, valve, hose); ext.traverse((o) => { if (o.isMesh) o.castShadow = true; }); ext.position.set(RX - 0.6, FLOOR + 0.6, 8.6); scene.add(ext);
    // a wall clock over the shelves, showing the real time
    const face = canvasTex(256, 256, (g) => { g.fillStyle = '#fbfbf8'; g.beginPath(); g.arc(128, 128, 124, 0, 6.3); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 10; g.stroke(); g.fillStyle = '#222'; for (let i = 0; i < 60; i++) { const a = i / 60 * 6.283, r0 = i % 5 ? 108 : 96; g.save(); g.translate(128, 128); g.rotate(a); g.fillRect(-(i % 5 ? 1.5 : 4), -114, i % 5 ? 3 : 8, 114 - r0); g.restore(); } });
    const clock = new THREE.Group(); const cf = new THREE.Mesh(new THREE.CircleGeometry(0.95, 48), new THREE.MeshStandardMaterial({ map: face, roughness: 0.4 })); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.97, 0.07, 10, 48), M.dark); clock.add(cf, rim);
    const hand = (len, w, col) => { const g = new THREE.Group(), m = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.02), new THREE.MeshBasicMaterial({ color: lin(col) })); m.position.y = len / 2 - 0.08; g.add(m); g.position.z = 0.03; clock.add(g); return g; };
    const neo = neonAtom(); neo.position.set(-0.6, 9.4, RZ0 + 0.1); neo.scale.setScalar(0.8); scene.add(neo);
    const mic = microscope(); mic.position.set(8.4, 0, -0.2); mic.rotation.y = -0.35; scene.add(mic);
    const gog = goggles(); gog.position.set(-5.3, 0.24, 2.75); gog.rotation.y = 0.4; scene.add(gog);
    const mol = molecule(); mol.position.set(-1.6, 0.6, 2.85); mol.rotation.set(0.35, 0.4, 0.2); scene.add(mol);
    const petri = new THREE.Group(), pm = new THREE.MeshPhysicalMaterial({ color: lin('#eef6ff'), transparent: true, opacity: 0.3, roughness: 0.03, clearcoat: 1, envMapIntensity: 2.5, side: THREE.DoubleSide, depthWrite: false });
    [[0.55, 0.1, 0.05], [0.58, 0.08, 0.11]].forEach(([r, h, y]) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 40, 1, true), pm); c.position.y = y; petri.add(c); const b = new THREE.Mesh(new THREE.CircleGeometry(r, 40), pm); b.rotation.x = -Math.PI / 2; b.position.y = y + (y > 0.08 ? h / 2 : -h / 2); petri.add(b); });
    petri.position.set(2.75, 0.02, 2.7); scene.add(petri);
    const p1 = plant(); p1.position.set(-RX + 0.4, WY - WH / 2 - 0.07, WZ + 2.0); scene.add(p1); const p2 = plant(); p2.scale.setScalar(1.3); p2.position.set(-8.9, 0, -2.6); scene.add(p2);
    clockHands = [hand(0.5, 0.07, '#1b1b1b'), hand(0.78, 0.045, '#1b1b1b'), hand(0.84, 0.018, '#d22')]; clock.position.set(5.6, 10.9, RZ0 + 0.06); scene.add(clock);
  }
  let clockHands = null;
  function tickClock() { if (!clockHands) return; const d = new Date(), s = d.getSeconds() + d.getMilliseconds() / 1000, m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60; [h / 12, m / 60, s / 60].forEach((f, i) => { clockHands[i].rotation.z = -f * Math.PI * 2; }); }
  function buildScene(el) {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.72;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'; el.appendChild(renderer.domElement);
    scene = new THREE.Scene(); cam = new THREE.PerspectiveCamera(40, 1, 0.1, 120);
    const env = new THREE.Scene(); env.add(new THREE.Mesh(new THREE.BoxGeometry(30, 22, 30), new THREE.MeshBasicMaterial({ color: 0x46566c, side: THREE.BackSide })));
    [[-5, 10.5, 0, 4, 1.6, 'c'], [5, 10.5, 0, 4, 1.6, 'c'], [-5, 10.5, 8, 4, 1.6, 'c'], [5, 10.5, 8, 4, 1.6, 'c'], [-14.5, 2, 4, 6, 4.6, 'w']].forEach(([x, y, z, w, h, k]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: k === 'w' ? 0xdff0ff : 0xffffff, side: THREE.DoubleSide })); p.position.set(x, y, z); if (k === 'c') p.rotation.x = Math.PI / 2; else p.rotation.y = Math.PI / 2; env.add(p); });
    const floorEnv = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({ color: 0x4a4f56, side: THREE.DoubleSide })); floorEnv.rotation.x = Math.PI / 2; floorEnv.position.y = -10.9; env.add(floorEnv);
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(env, 0.04).texture; scene.background = new THREE.Color(lin('#1a1d22')); scene.fog = new THREE.Fog(lin('#6f86a8').getHex(), 32, 90);
    // ceiling panels light the room from above; the window adds cool daylight from the left
    scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x3c4656, 0.36));
    const key = new THREE.DirectionalLight(0xf0f5ff, 1.0); key.position.set(3, 13.5, 6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -8, near: 1, far: 40 }); key.shadow.bias = -0.0004; key.shadow.radius = 4; scene.add(key);
    const day = new THREE.DirectionalLight(0xdbeaff, 0.55); day.position.set(-22, 9, 5); day.castShadow = true; day.shadow.mapSize.set(1024, 1024); Object.assign(day.shadow.camera, { left: -10, right: 10, top: 10, bottom: -6, near: 1, far: 50 }); day.shadow.bias = -0.0006; scene.add(day);
    [[-5.5, 1], [5.5, 1], [-5.5, 8], [5.5, 8]].forEach(([x, z]) => { const l = new THREE.PointLight(0xfff6ec, 0.32, 26, 2); l.position.set(x, 13.4, z); scene.add(l); });
    buildRoom();
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
    const bg = glowSprite('#4da6ff', 1.6, 0.45); bg.position.y = 2.0; burner.add(bb, bt, bf, bl, bg); burner.position.set(6.5, 0, 0.6); bb.castShadow = bt.castShadow = true; burner.userData = { flame: bf, light: bl, glow: bg }; scene.add(burner);
    // the vessels
    const tubeX = [-6.2, -5.4, -4.6, -3.8]; tubeX.forEach((x, i) => vessels.push(makeVessel(i, 'tube', x, 0.6, 0.14)));
    vessels.push(makeVessel(4, 'beaker', 1.2, 0.6, 1.69)); vessels.push(makeVessel(5, 'flask', 4.2, 0.6, 1.69));
    // selection marker
    const mk = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.6, 48), new THREE.MeshBasicMaterial({ color: lin('#2ecc96'), transparent: true, opacity: 0.8, side: THREE.DoubleSide })); mk.rotation.x = -Math.PI / 2; mk.visible = false; mk.name = 'marker'; scene.add(mk);
    fx = window.PTLABFX ? window.PTLABFX(THREE, scene) : null;
    controls = ctx.orbit ? ctx.orbit(cam, renderer.domElement) : null; if (controls) { controls.minDistance = 5; controls.maxDistance = 34; }
  }
  function place() { const w = renderer.domElement.clientWidth || 800, h = renderer.domElement.clientHeight || 500; cam.aspect = w / h; cam.updateProjectionMatrix(); renderer.setSize(w, h, false);
    const d = 19 * Math.max(1, Math.pow(1.6 / Math.max(0.4, cam.aspect), 0.8)); cam.position.set(0, 5 + 0.1 * d, d); if (controls) { controls.target.set(0, 3.0, 0); controls.sync(); } cam.lookAt(0, 3.0, 0); }

  // ---------- actions ----------
  const vesselName = (v) => T.vessels[v.i];
  function heatToggle(v) {
    const on = !v.s.heated;
    if (v.kind === 'tube' && on) vessels.filter((o) => o.kind === 'tube' && o !== v && o.s.heated).forEach((o) => { E.heat(o.s); o.target = o.home.clone(); });
    E.heat(v.s); if (v.kind === 'tube') v.target = on ? new THREE.Vector3(-1.6, 1.55, 0.6) : v.home.clone(); renderCard(); toolbar(); if (on) guideEvent('heat', v); }
  function flameTest(v) { E.flame(v.s); renderCard(); guideEvent('flame', v); }
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
    if (!P.done && p >= 0.8) { P.done = true; E.mix(v.s, P.to.s); const keepHeat = false; v.s = E.fresh(); v.key = {}; sel.vessel = P.to; renderCard(); guideEvent('pour', v, P.to); }
    if (p >= 1) { v.pour = null; v.g.rotation.z = 0; v.g.position.copy(v.target || v.home); }
  }

  // ---------- the guide: a first-visit tour and step-by-step experiments with 3D pointers ----------
  // a quest's steps: ['add', reagent, slot] · ['heat', slot] · ['flame', slot] · ['pour', from, to]; slots A/B are test tubes, C the beaker, D the flask
  const QUESTS = [
    { id: 'blue', icon: '🔵', lvl: 1, steps: [['add', 'CuSO4', 'A'], ['add', 'NaOH', 'A']],
      t: ['Ko‘k cho‘kma hosil qilish', 'Make a blue precipitate', 'Получить синий осадок'], see: ['Ikki tiniq eritmadan quyuq ko‘k “bulut” paydo bo‘ladi', 'Two clear solutions give a deep blue cloud', 'Из двух прозрачных растворов выпадает синее “облако”'],
      why: ['Mis ionlari gidroksid ionlari bilan birikib, suvda erimaydigan mis(II) gidroksidni hosil qildi: Cu²⁺ + 2OH⁻ → Cu(OH)₂↓', 'Copper ions joined hydroxide ions and formed insoluble copper(II) hydroxide: Cu²⁺ + 2OH⁻ → Cu(OH)₂↓', 'Ионы меди соединились с гидроксид-ионами и образовали нерастворимый гидроксид меди(II): Cu²⁺ + 2OH⁻ → Cu(OH)₂↓'] },
    { id: 'ind', icon: '🌸', lvl: 1, steps: [['add', 'NaOH', 'A'], ['add', 'php', 'A'], ['add', 'HCl', 'A']],
      t: ['Indikator rangini o‘zgartirish', 'Change an indicator’s colour', 'Изменить цвет индикатора'], see: ['Ishqor pushti rangga bo‘yaladi, kislota qo‘shilganda rang yo‘qoladi', 'The alkali turns pink, then the acid takes the colour away', 'Щёлочь окрашивается в малиновый, кислота обесцвечивает её'],
      why: ['Fenolftalein faqat ishqoriy muhitda pushti. Kislota ishqorni neytrallaydi (H⁺ + OH⁻ → H₂O), muhit neytral bo‘lgach rang yo‘qoladi.', 'Phenolphthalein is pink only in alkali. The acid neutralises it (H⁺ + OH⁻ → H₂O), so the colour fades.', 'Фенолфталеин малиновый только в щелочной среде. Кислота нейтрализует щёлочь (H⁺ + OH⁻ → H₂O), и окраска исчезает.'] },
    { id: 'white', icon: '⚪', lvl: 1, steps: [['add', 'AgNO3', 'A'], ['add', 'NaCl', 'A']],
      t: ['Oq “pishloqsimon” cho‘kma', 'A white curdy precipitate', 'Белый творожистый осадок'], see: ['Oq ipir-ipir cho‘kma tushadi — bu xlorid ionini aniqlash usuli', 'A white curdy solid appears — the test for chloride', 'Выпадает белый творожистый осадок — качественная реакция на хлорид'],
      why: ['Kumush ionlari xlorid ionlari bilan erimaydigan kumush xloridni beradi: Ag⁺ + Cl⁻ → AgCl↓', 'Silver ions and chloride ions form insoluble silver chloride: Ag⁺ + Cl⁻ → AgCl↓', 'Ионы серебра и хлорид-ионы дают нерастворимый хлорид серебра: Ag⁺ + Cl⁻ → AgCl↓'] },
    { id: 'gas', icon: '🫧', lvl: 1, steps: [['add', 'Na2CO3', 'A'], ['add', 'HCl', 'A']],
      t: ['Gaz pufakchalari chiqarish', 'Make gas bubbles', 'Получить пузырьки газа'], see: ['Eritma “qaynayotgandek” ko‘piradi — karbonat angidrid ajraladi', 'The solution fizzes as carbon dioxide escapes', 'Раствор вскипает — выделяется углекислый газ'],
      why: ['Kislota karbonatni parchalaydi: CO₃²⁻ + 2H⁺ → CO₂↑ + H₂O. Bu soda va sirka qo‘shilganda ham ko‘rinadi.', 'The acid breaks down the carbonate: CO₃²⁻ + 2H⁺ → CO₂↑ + H₂O — the same fizz as soda with vinegar.', 'Кислота разрушает карбонат: CO₃²⁻ + 2H⁺ → CO₂↑ + H₂O — как сода с уксусом.'] },
    { id: 'flame', icon: '🕯️', lvl: 1, steps: [['add', 'NaCl', 'A'], ['flame', 'A']],
      t: ['Alanga rangini sinash', 'A flame test', 'Окрашивание пламени'], see: ['Gorelka alangasi yorqin sariq rangga kiradi', 'The burner flame turns bright yellow', 'Пламя горелки становится ярко-жёлтым'],
      why: ['Natriy atomlari qizib, sariq nur chiqaradi. Har bir metall alangani o‘z rangiga bo‘yaydi: K — binafsha, Cu — yashil, Ca — g‘isht-qizil.', 'Hot sodium atoms give off yellow light. Each metal has its own flame colour: K violet, Cu green, Ca brick red.', 'Нагретые атомы натрия испускают жёлтый свет. У каждого металла свой цвет: K — фиолетовый, Cu — зелёный, Ca — кирпично-красный.'] },
    { id: 'heat', icon: '🔥', lvl: 2, steps: [['add', 'CuSO4', 'A'], ['add', 'NaOH', 'A'], ['heat', 'A']],
      t: ['Qizdirib qora modda olish', 'Heat it to a black solid', 'Нагреванием получить чёрное вещество'], see: ['Ko‘k cho‘kma qizdirilganda asta-sekin qorayadi', 'The blue precipitate slowly turns black as it heats', 'Синий осадок при нагревании постепенно чернеет'],
      why: ['Mis(II) gidroksid qizdirilganda parchalanadi: Cu(OH)₂ → CuO + H₂O. Mis(II) oksid — qora modda. Bir oz kuting — rang o‘zgarishi ko‘rinadi.', 'Copper(II) hydroxide decomposes on heating: Cu(OH)₂ → CuO + H₂O, and copper(II) oxide is black. Wait a little to see it.', 'Гидроксид меди(II) при нагревании разлагается: Cu(OH)₂ → CuO + H₂O; оксид меди(II) чёрный. Подождите немного.'] },
    { id: 'pour', icon: '🫗', lvl: 2, steps: [['add', 'FeCl3', 'A'], ['add', 'NaOH', 'B'], ['pour', 'A', 'B']],
      t: ['Idishdan idishga quyish', 'Pour one vessel into another', 'Перелить один сосуд в другой'], see: ['Sariq va tiniq eritma qo‘shilib, qo‘ng‘ir cho‘kma beradi', 'A yellow and a clear solution meet and give a brown solid', 'Жёлтый и прозрачный растворы дают бурый осадок'],
      why: ['Temir(III) ionlari gidroksid bilan qo‘ng‘ir temir(III) gidroksid hosil qiladi: Fe³⁺ + 3OH⁻ → Fe(OH)₃↓', 'Iron(III) ions and hydroxide form brown iron(III) hydroxide: Fe³⁺ + 3OH⁻ → Fe(OH)₃↓', 'Ионы железа(III) с гидроксидом дают бурый гидроксид железа(III): Fe³⁺ + 3OH⁻ → Fe(OH)₃↓'] },
    { id: 'k', icon: '💥', lvl: 3, steps: [['add', 'H2O', 'C'], ['add', 'php', 'C'], ['add', 'K', 'C']],
      t: ['Kaliy va suv (xavfli!)', 'Potassium and water (dangerous!)', 'Калий и вода (опасно!)'], see: ['Kaliy suvda yugurib, binafsha alanga bilan yonadi, suv pushti rangga kiradi', 'Potassium skates on the water, burns with a violet flame, and the water turns pink', 'Калий бегает по воде, горит фиолетовым пламенем, вода краснеет'],
      why: ['Kaliy suv bilan shiddatli reaksiyaga kirishadi: 2K + 2H₂O → 2KOH + H₂↑. Ajralgan issiqlik vodorodni yondiradi, hosil bo‘lgan ishqor fenolftaleinni pushti qiladi. Haqiqiy laboratoriyada buni faqat o‘qituvchi ko‘rsatadi!', 'Potassium reacts violently: 2K + 2H₂O → 2KOH + H₂↑. The heat ignites the hydrogen, and the alkali turns phenolphthalein pink. In a real lab only a teacher demonstrates this!', 'Калий бурно реагирует: 2K + 2H₂O → 2KOH + H₂↑. Теплота поджигает водород, щёлочь окрашивает фенолфталеин. В настоящей лаборатории это показывает только учитель!'] },
    { id: 'foam', icon: '🧪', lvl: 3, steps: [['add', 'H2O2c', 'D'], ['add', 'KI', 'D']],
      t: ['“Fil tish pastasi”', '“Elephant toothpaste”', '“Зубная паста для слона”'], see: ['Kolbadan ko‘pik ustuni otilib chiqadi', 'A column of foam shoots out of the flask', 'Из колбы вырывается столб пены'],
      why: ['Yodid ionlari vodorod peroksidning parchalanishini tezlashtiradi (katalizator): 2H₂O₂ → 2H₂O + O₂↑. Kislorod juda tez ajralib, ko‘pik hosil qiladi.', 'Iodide ions speed up the breakdown of hydrogen peroxide (a catalyst): 2H₂O₂ → 2H₂O + O₂↑. The oxygen rushes out as foam.', 'Иодид-ионы ускоряют разложение пероксида водорода (катализатор): 2H₂O₂ → 2H₂O + O₂↑. Кислород быстро выделяется в виде пены.'] }
  ];
  const G = {
    uz: { ideas: 'Nima qilsam bo‘ladi?', help: 'Yordam', pickTitle: 'Tajriba tanlang', pickSub: 'Birini bosing — har qadamni ko‘rsatib boraman.', lvl: ['', 'oson', 'o‘rta', 'xavfli'], done: 'bajarildi', step: 'qadam', stop: 'To‘xtatish',
      sBottle: 'Javondan <b>{x}</b> shishasini bosing — yashil o‘q ko‘rsatib turibdi.', sVessel: 'Endi <b>{v}</b>ni bosing — modda unga solinadi.', sSel: 'Avval <b>{v}</b>ni bosing.', sHeat: 'Pastdagi <b>🔥 Qizdirish</b> tugmasini bosing.', sFlame: 'Pastdagi <b>🕯️ Alangaga tutish</b> tugmasini bosing.',
      sPour: 'Pastdagi <b>🫗 Boshqa idishga quyish</b> tugmasini bosing.', sPourTo: 'Endi <b>{v}</b>ni bosing — aralashma unga quyiladi.', see: 'Nima ko‘rasiz', why: 'Nega shunday bo‘ldi?', bravo: 'Ajoyib! Tajriba bajarildi', next: 'Keyingi tajriba', list: 'Ro‘yxat', close: 'Yopish', washed: '{v} tozalandi.',
      tour: [['🥽', 'Xush kelibsiz, 3D laboratoriyaga!', 'Bu yerda haqiqiy laboratoriyadagidek o‘zingiz tajriba o‘tkazasiz: javondagi moddalarni idishlarga solasiz, qizdirasiz, aralashtirasiz va nima bo‘lishini ko‘rasiz.'],
        ['🧴', 'Qanday ishlaydi?', '<b>1.</b> Javondagi shishani bosing — modda haqida ma’lumot chiqadi.<br><b>2.</b> So‘ng probirka, stakan yoki kolbani bosing — modda unga solinadi.<br><b>3.</b> Pastdagi tugmalar: qizdirish, alangaga tutish, quyish, yuvish.<br><b>4.</b> Sichqoncha bilan sudrab aylantiring, g‘ildirak bilan yaqinlashtiring.'],
        ['💡', 'Nimadan boshlay?', 'Tayyor tajribalardan birini tanlang — ilova har qadamda qaysi shisha va qaysi idishni bosish kerakligini ko‘rsatib boradi. Istalgan payt <b>💡 Nima qilsam bo‘ladi?</b> tugmasini bosing.']],
      tNext: 'Keyingisi', tStart: 'Birinchi tajribani boshlash', tSkip: 'O‘zim harakat qilaman' },
    en: { ideas: 'What can I do?', help: 'Help', pickTitle: 'Choose an experiment', pickSub: 'Click one — I will show every step.', lvl: ['', 'easy', 'medium', 'dangerous'], done: 'done', step: 'step', stop: 'Stop',
      sBottle: 'Click the <b>{x}</b> bottle on the shelf — the green arrow points at it.', sVessel: 'Now click <b>{v}</b> — the substance goes into it.', sSel: 'First click <b>{v}</b>.', sHeat: 'Press <b>🔥 Heat</b> below.', sFlame: 'Press <b>🕯️ Flame test</b> below.',
      sPour: 'Press <b>🫗 Pour into another vessel</b> below.', sPourTo: 'Now click <b>{v}</b> — the mixture is poured into it.', see: 'What you will see', why: 'Why did it happen?', bravo: 'Well done! Experiment complete', next: 'Next experiment', list: 'List', close: 'Close', washed: '{v} was washed.',
      tour: [['🥽', 'Welcome to the 3D laboratory!', 'Here you run experiments yourself, like in a real lab: put substances from the shelf into vessels, heat and mix them, and watch what happens.'],
        ['🧴', 'How does it work?', '<b>1.</b> Click a bottle on the shelf to read about the substance.<br><b>2.</b> Then click a test tube, the beaker or the flask to add it.<br><b>3.</b> The buttons below heat, flame-test, pour and wash.<br><b>4.</b> Drag to rotate, use the wheel to zoom.'],
        ['💡', 'Where do I start?', 'Pick a ready experiment — the app shows which bottle and which vessel to click at every step. Press <b>💡 What can I do?</b> at any time.']],
      tNext: 'Next', tStart: 'Start the first experiment', tSkip: 'I’ll explore myself' },
    ru: { ideas: 'Что можно сделать?', help: 'Помощь', pickTitle: 'Выберите опыт', pickSub: 'Нажмите на любой — я покажу каждый шаг.', lvl: ['', 'легко', 'средне', 'опасно'], done: 'выполнено', step: 'шаг', stop: 'Остановить',
      sBottle: 'Нажмите склянку <b>{x}</b> на полке — на неё указывает зелёная стрелка.', sVessel: 'Теперь нажмите <b>{v}</b> — вещество попадёт туда.', sSel: 'Сначала нажмите <b>{v}</b>.', sHeat: 'Нажмите внизу <b>🔥 Нагреть</b>.', sFlame: 'Нажмите внизу <b>🕯️ Внести в пламя</b>.',
      sPour: 'Нажмите внизу <b>🫗 Перелить в другой сосуд</b>.', sPourTo: 'Теперь нажмите <b>{v}</b> — смесь перельётся туда.', see: 'Что вы увидите', why: 'Почему так получилось?', bravo: 'Отлично! Опыт выполнен', next: 'Следующий опыт', list: 'Список', close: 'Закрыть', washed: '{v} вымыт.',
      tour: [['🥽', 'Добро пожаловать в 3D лабораторию!', 'Здесь вы сами проводите опыты, как в настоящей лаборатории: берёте вещества с полки, наливаете в сосуды, нагреваете, смешиваете и смотрите, что произойдёт.'],
        ['🧴', 'Как это работает?', '<b>1.</b> Нажмите склянку на полке — появятся сведения о веществе.<br><b>2.</b> Затем нажмите пробирку, стакан или колбу — вещество попадёт туда.<br><b>3.</b> Кнопки внизу: нагреть, внести в пламя, перелить, вымыть.<br><b>4.</b> Перетаскивайте, чтобы вращать; колесо — масштаб.'],
        ['💡', 'С чего начать?', 'Выберите готовый опыт — приложение на каждом шаге покажет, какую склянку и какой сосуд нажать. Кнопка <b>💡 Что можно сделать?</b> доступна всегда.']],
      tNext: 'Далее', tStart: 'Начать первый опыт', tSkip: 'Разберусь сам' }
  };
  let guide = null, pointer = null;
  const GT = () => G[ctx.lang] || G.uz, fill = (t, o) => t.replace(/\{(\w)\}/g, (m, k) => o[k]);
  const doneSet = () => { try { return new Set(JSON.parse(localStorage.getItem('kv-room-done') || '[]')); } catch (e) { return new Set(); } };
  function markDone(id) { const d = doneSet(); d.add(id); try { localStorage.setItem('kv-room-done', JSON.stringify([...d])); } catch (e) {} }
  function questPanel(show) {
    const el = host.querySelector('.rm-quests'); if (!el) return; if (show === false || (show == null && el.style.display === 'block')) { el.style.display = 'none'; return; }
    host.querySelector('.rm-cat').style.display = 'none'; const g = GT(), d = doneSet(), li = L();
    el.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b style="font-size:16px;color:#eef2fa">💡 ' + g.pickTitle + '</b><button data-qx style="border:none;background:none;color:#aab6cc;font-size:18px;cursor:pointer">✕</button></div><div style="font-size:12.5px;color:#aab6cc;margin:4px 0 10px">' + g.pickSub + '</div>'
      + QUESTS.map((q) => '<button data-q="' + q.id + '" style="display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;margin-bottom:7px;padding:10px 11px;border-radius:12px;border:1px solid ' + (d.has(q.id) ? 'rgba(46,204,150,.5)' : 'rgba(255,255,255,.14)') + ';background:' + (d.has(q.id) ? 'rgba(46,204,150,.1)' : 'rgba(255,255,255,.05)') + ';color:#eef2fa;cursor:pointer;font-family:Space Grotesk,sans-serif">'
        + '<span style="font-size:22px;line-height:1">' + q.icon + '</span><span style="min-width:0"><span style="display:block;font-weight:700;font-size:14px">' + q.t[li] + (d.has(q.id) ? ' <span style="color:#2ecc96;font-size:12px">✓ ' + g.done + '</span>' : '') + '</span>'
        + '<span style="display:block;font-size:12px;color:#b9c4d8;margin-top:2px">' + q.see[li] + '</span><span style="display:inline-block;margin-top:5px;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;padding:2px 7px;border-radius:999px;background:' + ['', 'rgba(46,204,150,.18)', 'rgba(255,184,77,.18)', 'rgba(255,93,110,.2)'][q.lvl] + ';color:' + ['', '#5fe0b0', '#ffc773', '#ff8a96'][q.lvl] + '">' + g.lvl[q.lvl] + '</span></span></button>').join('');
    el.style.display = 'block';
  }
  // give every slot a vessel, preferring empty ones; wash a vessel only when nothing empty is left
  function startQuest(id) {
    const q = QUESTS.find((x) => x.id === id); if (!q) return; questPanel(false); sel.reagent = null; sel.mode = null; dropReagent();
    const slots = {}, used = new Set(), notes = [];
    [...new Set(q.steps.flatMap((st) => st.slice(1).filter((x) => /^[A-D]$/.test(x))))].forEach((k) => {
      const pool = k === 'C' ? [vessels[4]] : k === 'D' ? [vessels[5]] : vessels.slice(0, 4).filter((v) => !used.has(v));
      let v = pool.find((x) => !x.s.vol && !x.s.solids.length && !x.s.broken) || pool[0]; if (v.s.vol || v.s.solids.length || v.s.broken) { wash(v); notes.push(fill(GT().washed, { v: vesselName(v) })); } used.add(v); slots[k] = v; });
    guide = { q, slots, i: 0, notes, done: false }; renderGuide();
  }
  function stopQuest() { guide = null; renderGuide(); }
  const curStep = () => (guide && !guide.done ? guide.q.steps[guide.i] : null);
  // the shelf must show the bottle the step asks for
  function ensureOnShelf(id) { const list = shelfList(), at = list.indexOf(id); if (at >= 0) { const pg = Math.floor(at / PER); if (pg !== page) { page = pg; fillShelf(); } return; }
    filt = SHELF.includes(id) ? 'main' : filt; query = SHELF.includes(id) ? '' : id; const fq = host.querySelector('.rm-fq'); if (fq) fq.value = query; page = 0; fillShelf(); }
  function guideEvent(type, a, b) {
    const st = curStep(); if (!st) { if (type !== 'pick') return; return; }
    const S2 = guide.slots, ok = (type === 'add' && st[0] === 'add' && a === st[1] && b === S2[st[2]]) || (type === 'heat' && st[0] === 'heat' && a === S2[st[1]]) || (type === 'flame' && st[0] === 'flame' && a === S2[st[1]]) || (type === 'pour' && st[0] === 'pour' && a === S2[st[1]] && b === S2[st[2]]);
    if (ok) { guide.i++; guide.notes = []; if (guide.i >= guide.q.steps.length) { guide.done = true; markDone(guide.q.id); } }
    renderGuide();
  }
  function renderGuide() {
    const el = host && host.querySelector('.rm-guide'), h = host && host.querySelector('.rm-hint'); if (!el) return; if (h) h.style.display = guide ? 'none' : '';
    host.querySelectorAll('.rm-tools button').forEach((b) => b.classList.remove('rm-pulse'));
    if (!guide) { el.style.display = 'none'; return; }
    const g = GT(), li = L(), q = guide.q, n = q.steps.length, dots = q.steps.map((x, i) => '<span style="width:' + (i === guide.i ? 18 : 8) + 'px;height:8px;border-radius:4px;background:' + (i < guide.i ? '#2ecc96' : i === guide.i ? '#4dd2ff' : 'rgba(255,255,255,.2)') + ';transition:.3s"></span>').join('');
    let body;
    if (guide.done) { body = '<div style="font-size:15px;font-weight:700;color:#5fe0b0">🎉 ' + g.bravo + '</div><div style="margin-top:6px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#aab6cc">' + g.why + '</div><div style="margin-top:3px;font-size:13.5px;line-height:1.55;color:#e6ecf7">' + q.why[li] + '</div>'
      + '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">' + (QUESTS.indexOf(q) < QUESTS.length - 1 ? '<button data-g="next" style="padding:8px 12px;border-radius:10px;border:1px solid rgba(46,204,150,.6);background:rgba(46,204,150,.2);color:#eafff6;font:700 13px Space Grotesk,sans-serif;cursor:pointer">' + g.next + ' →</button>' : '') + '<button data-g="list" style="padding:8px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#eef2fa;font:600 13px Space Grotesk,sans-serif;cursor:pointer">💡 ' + g.list + '</button><button data-g="stop" style="padding:8px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#eef2fa;font:600 13px Space Grotesk,sans-serif;cursor:pointer">' + g.close + '</button></div>'; }
    else { const st = q.steps[guide.i], V = (k) => vesselName(guide.slots[k]); let t;
      if (st[0] === 'add') t = sel.reagent === st[1] ? fill(g.sVessel, { v: V(st[2]) }) : fill(g.sBottle, { x: E.disp(st[1]) + ' (' + E.name(st[1]) + ')' });
      else if (st[0] === 'pour') t = sel.mode === 'pour' && sel.vessel === guide.slots[st[1]] ? fill(g.sPourTo, { v: V(st[2]) }) : sel.vessel !== guide.slots[st[1]] ? fill(g.sSel, { v: V(st[1]) }) : g.sPour;
      else t = sel.vessel !== guide.slots[st[1]] ? fill(g.sSel, { v: V(st[1]) }) : st[0] === 'heat' ? g.sHeat : g.sFlame;
      const btnKey = st[0] === 'heat' && sel.vessel === guide.slots[st[1]] ? 'heat' : st[0] === 'flame' && sel.vessel === guide.slots[st[1]] ? 'flame' : st[0] === 'pour' && sel.vessel === guide.slots[st[1]] && sel.mode !== 'pour' ? 'pour' : null;
      if (btnKey) { const b = host.querySelector('.rm-tools button[data-a="' + btnKey + '"]'); if (b) b.classList.add('rm-pulse'); }
      if (st[0] === 'add' && sel.reagent !== st[1]) ensureOnShelf(st[1]);
      body = '<div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#7fd8ff">' + (guide.i + 1) + '/' + n + ' ' + g.step + '</div><div style="margin-top:4px;font-size:14.5px;line-height:1.5;color:#f2f6fc">' + t + '</div>'
        + (guide.notes.length ? '<div style="margin-top:6px;font-size:12px;color:#ffc773">🧽 ' + guide.notes.join(' ') + '</div>' : '')
        + '<div style="margin-top:8px;font-size:12px;color:#aab6cc"><b style="color:#cfd8ea">' + g.see + ':</b> ' + q.see[li] + '</div>'; }
    el.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b style="font-size:14px;color:#eef2fa">' + q.icon + ' ' + q.t[li] + '</b>' + (guide.done ? '' : '<button data-g="stop" style="border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#cfd8ea;border-radius:8px;padding:3px 8px;font:600 11.5px Space Grotesk,sans-serif;cursor:pointer">' + g.stop + '</button>') + '</div>'
      + '<div style="display:flex;gap:4px;margin:7px 0 8px">' + dots + '</div>' + body;
    el.style.display = 'block';
  }
  // the green arrow and halo over the bottle or vessel the current step needs
  function guideFrame(now) {
    if (!pointer) { pointer = new THREE.Group(); const m = new THREE.MeshBasicMaterial({ color: lin('#39e6a4') }); const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 20), m); cone.rotation.x = Math.PI; const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 12), m); shaft.position.y = 0.5; const halo = glowSprite('#39e6a4', 1.9, 0.6); halo.position.y = -1.1; pointer.add(cone, shaft, halo); pointer.userData.halo = halo; scene.add(pointer); }
    const st = curStep(); let at = null, onBottle = false; const pb = pointer.userData.bob; if (pb) { pb.position.y = pb.userData.y0 + (pb.userData.rid === sel.reagent ? 0.18 : 0); pointer.userData.bob = null; }
    if (st && !anim) { if (st[0] === 'add' && sel.reagent !== st[1]) { const b = bottles.find((x) => x.userData.rid === st[1]); if (b) { at = b.position.clone().add(new THREE.Vector3(0, 1.5, 0.55)); onBottle = true; b.position.y = b.userData.y0 + 0.08 + Math.sin(now / 200) * 0.06; pointer.userData.bob = b; } }
      else { const k = st[0] === 'add' ? st[2] : st[0] === 'pour' && sel.mode === 'pour' ? st[2] : st[1], v = guide.slots[k]; if (v && !(st[0] !== 'add' && st[0] !== 'pour' && sel.vessel === v) && !(st[0] === 'pour' && sel.vessel === v && sel.mode !== 'pour')) at = v.g.position.clone().add(new THREE.Vector3(0, v.prof.H + 0.9, 0)); } }
    pointer.visible = !!at; if (at) { pointer.scale.setScalar(onBottle ? 0.6 : 1); pointer.userData.halo.position.y = onBottle ? -1.5 : -1.1; pointer.position.copy(at); pointer.position.y += Math.sin(now / 220) * 0.15; pointer.rotation.y = now / 600; }
  }
  function guideHTML() {
    return '<style>@keyframes rmPulse{0%,100%{box-shadow:0 0 0 0 rgba(57,230,164,.7)}50%{box-shadow:0 0 0 6px rgba(57,230,164,0)}}.rm-pulse{animation:rmPulse 1.2s ease-in-out infinite;border-color:#39e6a4!important;background:rgba(57,230,164,.18)!important}</style>'
      + '<div class="rm-guide" style="display:none;position:absolute;left:12px;bottom:128px;width:min(430px,52%);box-sizing:border-box;padding:12px 14px;border-radius:14px;background:rgba(12,18,34,.93);border:1px solid rgba(77,210,255,.45);box-shadow:0 12px 34px rgba(0,0,0,.4);backdrop-filter:blur(8px);font-family:Space Grotesk,sans-serif;z-index:2"></div>'
      + '<div class="rm-quests" style="display:none;position:absolute;left:12px;top:96px;bottom:128px;width:min(380px,calc(100% - 24px));box-sizing:border-box;overflow:auto;padding:12px;border-radius:14px;background:rgba(12,18,34,.95);border:1px solid rgba(255,255,255,.14);box-shadow:0 12px 34px rgba(0,0,0,.4);z-index:3"></div>'
      + '<div class="rm-tour" style="display:none;position:absolute;inset:0;z-index:5;background:rgba(4,8,20,.62);backdrop-filter:blur(3px);align-items:center;justify-content:center;padding:16px"></div>';
  }
  let tourI = 0;
  function tour(show) {
    const el = host.querySelector('.rm-tour'); if (!el) return; if (!show) { el.style.display = 'none'; try { localStorage.setItem('kv-room-tour', '1'); } catch (e) {} return; }
    const g = GT(), sl = g.tour[tourI], last = tourI === g.tour.length - 1;
    el.innerHTML = '<div style="width:min(460px,100%);padding:22px 22px 18px;border-radius:18px;background:rgba(14,20,38,.97);border:1px solid rgba(77,210,255,.4);box-shadow:0 20px 60px rgba(0,0,0,.5);font-family:Space Grotesk,sans-serif;color:#eef2fa">'
      + '<div style="font-size:40px;line-height:1">' + sl[0] + '</div><div style="margin-top:10px;font-size:20px;font-weight:700">' + sl[1] + '</div><div style="margin-top:8px;font-size:14.5px;line-height:1.6;color:#c9d4e8">' + sl[2] + '</div>'
      + '<div style="display:flex;gap:5px;margin:16px 0 14px">' + g.tour.map((x, i) => '<span style="width:' + (i === tourI ? 20 : 8) + 'px;height:8px;border-radius:4px;background:' + (i === tourI ? '#4dd2ff' : 'rgba(255,255,255,.22)') + '"></span>').join('') + '</div>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end"><button data-t="skip" style="padding:9px 13px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#c9d4e8;font:600 13px Space Grotesk,sans-serif;cursor:pointer">' + g.tSkip + '</button>'
      + '<button data-t="' + (last ? 'start' : 'next') + '" style="padding:9px 15px;border-radius:10px;border:none;background:linear-gradient(180deg,#4dd2ff,#2a8fdb);color:#04101e;font:700 13.5px Space Grotesk,sans-serif;cursor:pointer">' + (last ? '▶ ' + g.tStart : g.tNext + ' →') + '</button></div></div>';
    el.style.display = 'flex';
  }
  function wireGuide() {
    host.querySelector('.rm-quests').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.qx != null) return questPanel(false); if (b.dataset.q) startQuest(b.dataset.q); });
    host.querySelector('.rm-guide').addEventListener('click', (e) => { const b = e.target.closest('button[data-g]'); if (!b) return; const a = b.dataset.g;
      if (a === 'stop') stopQuest(); if (a === 'list') { stopQuest(); questPanel(true); } if (a === 'next') { const i = QUESTS.indexOf(guide.q); startQuest(QUESTS[i + 1].id); } });
    host.querySelector('.rm-tour').addEventListener('click', (e) => { const b = e.target.closest('button[data-t]'); if (!b) return; const a = b.dataset.t; if (a === 'next') { tourI++; tour(true); } if (a === 'skip') tour(false); if (a === 'start') { tour(false); startQuest(QUESTS[0].id); } });
  }
  // the toolbar is rebuilt often; re-apply the pulse on the button the current step needs
  function renderGuideKeepPulse() { if (guide && !guide.done) setTimeout(renderGuide, 0); }
  function maybeTour() { let seen = false; try { seen = localStorage.getItem('kv-room-tour') === '1'; } catch (e) {} if (!seen) { tourI = 0; tour(true); } }
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
    const btn = (k, t, c) => '<button data-a="' + k + '"' + (dis && !['cat', 'back', 'cancel', 'quest', 'help'].includes(k) ? ' disabled' : '') + ' style="padding:9px 12px;border-radius:10px;border:1px solid ' + (c || 'var(--line)') + ';background:rgba(255,255,255,.08);color:#eef2fa;font:600 13px Space Grotesk,sans-serif;cursor:pointer;opacity:' + (dis && !['cat', 'back', 'cancel', 'quest', 'help'].includes(k) ? 0.45 : 1) + '">' + t + '</button>';
    b.innerHTML = btn('quest', '💡 ' + GT().ideas, 'rgba(57,230,164,.6)') + btn('cat', '📚 ' + T.catalog, 'rgba(77,210,255,.5)') + btn('heat', '🔥 ' + (v && v.s.heated ? T.unheat : T.heat), 'rgba(255,138,58,.5)') + btn('flame', '🕯️ ' + T.flame) + btn('pour', '🫗 ' + T.pour) + btn('wash', '🧽 ' + T.wash)
      + (sel.reagent || sel.mode ? btn('cancel', '✋ ' + T.cancel) : '') + btn('help', '❓ ' + GT().help) + btn('back', '↩ ' + T.back); renderGuideKeepPulse();
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
  function chooseReagent(id) { sel.reagent = id; sel.mode = null; renderCard(); toolbar(); renderGuide(); bottles.forEach((b) => { b.position.y = (b.userData.y0 = b.userData.y0 == null ? b.position.y : b.userData.y0) + (b.userData.rid === id ? 0.18 : 0); }); }
  function onPick(obj) {
    if (anim) return; let o = obj; while (o && o.userData.rid == null && o.userData.vessel == null && o.parent) o = o.parent;
    if (!o) return; if (o.userData.rid != null && o.userData.vessel == null) return chooseReagent(o.userData.rid);
    const v = vessels[o.userData.vessel]; if (!v || v.pour) return;
    if (sel.mode === 'pour' && sel.vessel) { pourInto(sel.vessel, v); return; }
    if (sel.reagent) { if (v.s.broken) { sel.vessel = v; renderCard(); return; } const b = bottles.find((x) => x.userData.rid === sel.reagent); const from = b ? b.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.6, 0.6)) : new THREE.Vector3(-8, 7, 2); sel.vessel = v; startAdd(v, sel.reagent, from); toolbar(); return; }
    sel.vessel = v; renderCard(); toolbar(); renderGuide(); }

  // ---------- mount ----------
  function build() {
    host.innerHTML = '<style>@media (max-width:640px){.rm-guide{width:auto!important;right:12px}.rm{min-height:78vh!important}.rm-card{left:12px!important;width:auto!important;top:auto!important;bottom:160px;max-height:34%!important}.rm-hint{max-width:none!important;right:12px}.rm-cat{width:auto!important;right:12px}}</style><div class="rm" style="position:relative;width:100%;height:100%;min-height:520px;overflow:hidden;background:radial-gradient(900px 600px at 50% 30%,#2a3350,#0b0f1c 75%)">'
      + '<div class="rm-3d" style="position:absolute;inset:0"></div>'
      + '<div class="rm-hint" style="position:absolute;left:14px;top:12px;max-width:min(560px,70%);padding:8px 12px;border-radius:10px;background:rgba(10,14,28,.72);border:1px solid rgba(255,255,255,.12);color:#e9eef8;font:600 13px Space Grotesk,sans-serif;backdrop-filter:blur(6px)"></div>'
      + '<div class="rm-card" style="display:none;position:absolute;right:12px;top:96px;max-height:calc(100% - 210px);width:min(340px,44%);box-sizing:border-box;overflow:auto;padding:12px 14px;border-radius:14px;background:' + (ctx.light ? 'rgba(255,255,255,.96)' : 'rgba(16,21,38,.94)') + ';backdrop-filter:blur(8px);border:1px solid var(--line);box-shadow:0 10px 30px rgba(0,0,0,.3)"></div>'
      + '<div class="rm-cat" style="display:none;position:absolute;left:12px;top:96px;bottom:110px;width:min(330px,46%);box-sizing:border-box;overflow:auto;padding:12px;border-radius:14px;background:' + (ctx.light ? 'rgba(255,255,255,.96)' : 'rgba(16,21,38,.94)') + ';backdrop-filter:blur(8px);border:1px solid var(--line);box-shadow:0 10px 30px rgba(0,0,0,.3)"><input class="rm-q" placeholder="' + T.find + '" style="width:100%;box-sizing:border-box;margin-bottom:10px;background:var(--input);border:1px solid var(--line);border-radius:10px;color:var(--text);font:13px Space Grotesk,sans-serif;padding:8px 11px;outline:none"><div class="rm-cat-list"></div></div>'
      + '<div class="rm-tools" style="position:absolute;left:12px;right:12px;bottom:12px;padding:8px;border-radius:14px;background:rgba(10,14,28,.78);backdrop-filter:blur(8px);display:flex;flex-wrap:wrap;gap:6px;justify-content:center"></div>'
      + '<div class="rm-alert" style="position:absolute;left:50%;bottom:118px;z-index:3;transform:translate(-50%,-10px);opacity:0;transition:.4s;max-width:min(560px,80%);padding:10px 14px;border-radius:12px;background:rgba(200,30,40,.92);color:#fff;font:700 14px Space Grotesk,sans-serif;box-shadow:0 10px 30px rgba(200,30,40,.4);pointer-events:none"></div>'
      + '<div class="rm-f" style="position:absolute;left:12px;top:54px;right:12px;display:flex;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;gap:5px;align-items:center;padding-bottom:2px">'
      + [['main', '⭐ ' + T.fMain, '#3b4a6b'], ['acid', T.groups.acid, CLS.acid], ['base', T.groups.base, CLS.base], ['salt', T.groups.salt, CLS.salt], ['metal', T.groups.metal, CLS.metal], ['ind', T.groups.ind, CLS.ind], ['colour', '🎨 ' + T.fColour, '#c2410c'], ['danger', '⚠️ ' + T.fDanger, '#b91c1c']]
        .map(([k, t, c]) => '<button data-f="' + k + '" data-c="' + c + '" style="flex:0 0 auto;display:flex;align-items:center;gap:5px;padding:5px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(10,14,28,.66);color:#dfe6f5;font:600 12px Space Grotesk,sans-serif;cursor:pointer;backdrop-filter:blur(6px)"><span style="width:9px;height:9px;border-radius:50%;background:' + c + '"></span>' + t + '</button>').join('')
      + '<input class="rm-fq" placeholder="🔎 ' + T.fFind + '" style="flex:0 0 150px;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(10,14,28,.66);color:#eef2fa;font:12px Space Grotesk,sans-serif;outline:none">'
      + '<span class="rm-f-info" style="flex:0 0 auto;white-space:nowrap;font:12px Space Grotesk,sans-serif;color:#cfd8ea"></span></div>'
      + '<style>.rm-f-info button{border:1px solid rgba(255,255,255,.2);background:rgba(10,14,28,.7);color:#fff;border-radius:6px;padding:1px 7px;cursor:pointer}@media (max-width:640px){.rm-f{right:12px!important}}</style></div>';
    buildScene(host.querySelector('.rm-3d'));
    host.querySelector('.rm').insertAdjacentHTML('beforeend', guideHTML()); wireGuide();
    const ro = new ResizeObserver(place); ro.observe(host.querySelector('.rm-3d')); host._ro = ro; place();
    let down = null; renderer.domElement.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
    renderer.domElement.addEventListener('pointerup', (e) => { if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return; const r = renderer.domElement.getBoundingClientRect(), m = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      const rc = new THREE.Raycaster(); rc.setFromCamera(m, cam); const hits = rc.intersectObjects([...bottles, ...vessels.map((v) => v.hit)], true); if (hits.length) onPick(hits[0].object); });
    host.querySelector('.rm-tools').addEventListener('click', (e) => { const b = e.target.closest('button[data-a]'); if (!b || b.disabled) return; const a = b.dataset.a, v = sel.vessel;
      if (a === 'back') return onExit && onExit(); if (a === 'cat') { const c = host.querySelector('.rm-cat'); c.style.display = c.style.display === 'none' ? 'block' : 'none'; catalogue(host.querySelector('.rm-q').value); return; }
      if (a === 'cancel') { sel.mode = null; dropReagent(); renderGuide(); return; }
      if (a === 'quest') return questPanel(); if (a === 'help') { tourI = 0; return tour(true); }
      if (!v) return; if (a === 'heat') heatToggle(v); if (a === 'flame') flameTest(v); if (a === 'wash') wash(v); if (a === 'pour') { sel.reagent = null; sel.mode = 'pour'; renderCard(); toolbar(); renderGuide(); } });
    host.querySelector('.rm-cat-list').addEventListener('click', (e) => { const b = e.target.closest('button[data-r]'); if (b) { chooseReagent(b.dataset.r); host.querySelector('.rm-cat').style.display = 'none'; } });
    host.querySelector('.rm-q').addEventListener('input', (e) => catalogue(e.target.value));
    host.querySelector('.rm-f').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.f) { filt = b.dataset.f; query = ''; page = 0; host.querySelector('.rm-fq').value = ''; } if (b.dataset.pg) page += +b.dataset.pg; fillShelf(); });
    let qt = 0; host.querySelector('.rm-fq').addEventListener('input', (e) => { clearTimeout(qt); qt = setTimeout(() => { query = e.target.value.trim(); page = 0; fillShelf(); }, 250); });

    renderCard(); toolbar();
    let last = performance.now();
    const frame = (now) => { if (!alive) return; raf = requestAnimationFrame(frame); try { draw(now); } catch (e) { console.error('labroom', e); } };
    const draw = (now) => { const dt = Math.min(0.05, (now - last) / 1000); last = now;
      vessels.forEach((v) => { if (!v.pour && v.target) v.g.position.lerp(v.target, 0.08); stepPour(v, now); syncVessel(v, Date.now()); });
      stepAnim(now); guideFrame(now);
      // lamps: the central one serves the tube being heated, the others their tripods
      const tubeHot = vessels.some((v) => v.kind === 'tube' && v.s.heated); [[lamps.center, tubeHot], [lamps.b, vessels[4].s.heated], [lamps.f, vessels[5].s.heated]].forEach(([l, on]) => { l.userData.flame.visible = on; l.userData.light.intensity = on ? 1.3 + Math.sin(now / 60) * 0.25 : 0; if (on) { const s = 1 + Math.sin(now / 55 + l.id) * 0.07; l.userData.flame.scale.set(1 / s, s, 1 / s); } });
      const ft = vessels.map((v) => v.vm && v.vm.flameTest).find(Boolean); burner.userData.flame.material.color.copy(lin(ft || '#4da6ff')); burner.userData.flame.material.opacity = ft ? 0.8 : 0.5; burner.userData.light.color.copy(lin(ft || '#7fb8ff')); burner.userData.light.intensity = ft ? 1.6 : 0.6; burner.userData.flame.scale.y = 1 + Math.sin(now / 45) * 0.05; burner.userData.glow.material.color.copy(burner.userData.flame.material.color);
      const mk = scene.getObjectByName('marker'); if (sel.vessel) { mk.visible = true; const p = sel.vessel.g.position; mk.position.set(p.x, 0.02, p.z); const r = sel.vessel.kind === 'tube' ? 0.5 : 1.15; mk.scale.setScalar(r / 0.55); mk.material.opacity = 0.55 + Math.sin(now / 250) * 0.25; } else mk.visible = false;
      if (alertT && now - alertT > 6500) { const a = host.querySelector('.rm-alert'); if (a) { a.style.opacity = 0; a.style.transform = 'translate(-50%,-10px)'; } alertT = 0; }
      const sh = fx ? fx.update(now, dt) : 0; if (controls) { controls.update(); const o = cam.position.clone().sub(controls.target), sp = new THREE.Spherical().setFromVector3(o), th = Math.max(-0.8, Math.min(0.8, sp.theta)), ph = Math.max(0.72, Math.min(1.58, sp.phi));
        if (th !== sp.theta || ph !== sp.phi) { sp.theta = th; sp.phi = ph; cam.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sp)); cam.lookAt(controls.target); controls.sync(); } }
      tickClock(); if (sh > 0.002) { cam.position.x += (Math.random() - 0.5) * sh; cam.position.y += (Math.random() - 0.5) * sh; }
      renderer.render(scene, cam); };
    raf = requestAnimationFrame(frame);
    // chemistry clock: every vessel heats, boils and reacts on its own
    let lt = Date.now(); tick = setInterval(() => { const t = Date.now(), dt = Math.min(0.5, (t - lt) / 1000); lt = t; let ch = false; vessels.forEach((v) => { const n = v.s.log.length; E.step(v.s, dt); if (v.s.broken && v.s.heated) { E.heat(v.s); if (v === sel.vessel) toolbar(); } if (v.s.log.length !== n && v === sel.vessel) ch = true; }); if (ch && !sel.reagent) renderCard(); if (sel.vessel && !sel.reagent) { const tEl = host.querySelector('.rm-card span'); if (tEl) tEl.textContent = '🌡️ ' + Math.round(sel.vessel.s.temp) + ' °C'; } }, 150);
  }
  window.PTROOM = {
    mount(h, c, exit) { THREE = c.THREE; E = window.PTLAB.engine; host = h; ctx = c; onExit = exit; T = S[c.lang] || S.uz; E.setLang(c.lang); mats(); vessels = []; bottles = []; colourCache = {}; filt = 'main'; query = ''; page = 0; sel = { reagent: null, vessel: null, mode: null }; anim = null; alive = true; guide = null; pointer = null; build(); maybeTour(); },
    setCtx(c) { ctx = Object.assign(ctx || {}, c); T = S[ctx.lang] || S.uz; E.setLang(ctx.lang); if (host) { colourCache = {}; renderCard(); toolbar(); fillShelf(); renderGuide(); if (host.querySelector('.rm-quests').style.display === 'block') questPanel(true); if (host.querySelector('.rm-tour').style.display === 'flex') tour(true); } },
    // for testing: choose a reagent and click a vessel, or run an action on a vessel
    _pick(rid, vi) { if (rid) chooseReagent(rid); if (vi != null) onPick(vessels[vi].hit); }, _vessels: () => vessels, _guide: () => guide, _quest: (id) => startQuest(id),
    unmount() { alive = false; cancelAnimationFrame(raf); clearInterval(tick); if (host && host._ro) host._ro.disconnect(); if (fx) fx.clear(); if (renderer) { renderer.dispose(); try { renderer.forceContextLoss(); } catch (e) {} } renderer = null; scene = null; if (host) host.innerHTML = ''; host = null; }
  };
})();
