// Visual building blocks for the "Umumiy kimyo" lessons: 3D molecules and atoms, particle and reaction
// animations, scales, charts, diagrams and calculators. Each lesson block may carry
// { type, ... } and window.PTV.render(host, spec, ctx) draws it into an empty <div>.
// ctx = { lang, light, THREE, elements, shellColors, orbit(camera, dom), onDispose(fn) }.
(function () {
  'use strict';

  // ---------- strings ----------
  const S = {
    uz: { drag: "Aylantirish: sudrang · Zoom: g'ildirak", solid: "Qattiq", liquid: "Suyuq", gas: "Gaz", play: "▶ Qayta ko'rsatish",
      before: "Reaksiyagacha", after: "Reaksiyadan keyin", reactants: "Boshlang'ich moddalar", products: "Mahsulotlar",
      formula: "Formula", mass: "Massa, g", molar: "Molyar massa", amount: "Modda miqdori", particles: "Zarrachalar soni",
      volume: "Hajm (n. sh.)", element: "Element", count: "Atomlar soni", share: "Ulushi", bad: "Formulani tushunmadim",
      solute: "Erigan modda, g", water: "Suv, g", fraction: "Massa ulushi", temp: "Harorat",
      air: { N2: "Azot N₂", O2: "Kislorod O₂", Ar: "Argon Ar", CO2: "Karbonat angidrid CO₂ va boshqalar" },
      water: { sea: "Okean va dengizlar (sho'r)", ice: "Muzliklar", ground: "Yer osti suvlari", surface: "Daryo, ko'l, atmosfera" },
      waterTitle: "Yerdagi suv", fresh: "chuchuk suv",
      lab: { tube: "Probirka", beaker: "Kimyoviy stakan", flask: "Konussimon kolba", funnel: "Voronka", lamp: "Spirt lampasi", stand: "Shtativ" },
      flame: { inner: "Ichki qism — eng sovuq", mid: "O'rta qism — yorug'", outer: "Tashqi qism — eng issiq", wick: "Pilik" },
      filt: { mix: "Aralashma", paper: "Filtr qog'oz", filtrate: "Filtrat (toza eritma)", residue: "Cho'kma qog'ozda qoladi" },
      dist: { flask: "Qizdirilgan aralashma", cond: "Sovutgich", water: "Sovuq suv", receiver: "Distillangan suv" },
      elec: { cat: "Katod (−)", an: "Anod (+)", h2: "Vodorod H₂ — 2 hajm", o2: "Kislorod O₂ — 1 hajm", src: "Tok manbai" },
      cyc: { sun: "Quyosh", plant: "O'simliklar — fotosintez", animal: "Odam va hayvonlar — nafas olish", fire: "Yonish, zavodlar", o2: "O₂", co2: "CO₂" },
      cls: { sub: "Moddalar", simple: "Oddiy moddalar", complex: "Murakkab moddalar", metals: "Metallar", nonmetals: "Metallmaslar",
        oxides: "Oksidlar", bases: "Asoslar", acids: "Kislotalar", salts: "Tuzlar" },
      gen: { metal: "Metall", boxide: "Asosli oksid", base: "Asos", salt: "Tuz", acid: "Kislota", aoxide: "Kislotali oksid", nonmetal: "Metallmas" },
      ind: { name: "Indikator", acid: "Kislotali", neutral: "Neytral", base: "Ishqoriy", litmus: "Lakmus", php: "Fenolftalein", mo: "Metilzarg'aldog'i",
        colorless: "rangsiz" },
      st: { solid: "Qattiq", liquid: "Suyuq", gas: "Gaz", melt: "Erish", freeze: "Qotish", boil: "Bug'lanish", cond: "Kondensatlanish", subl: "Sublimatsiya", depo: "Desublimatsiya" },
      sol: { title: "100 g suvda eriydigan modda, g", t: "Harorat, °C" },
      crust: "Yer po'stidagi massa ulushi, %"
    },
    en: { drag: "Rotate: drag · Zoom: wheel", solid: "Solid", liquid: "Liquid", gas: "Gas", play: "▶ Replay",
      before: "Before the reaction", after: "After the reaction", reactants: "Reactants", products: "Products",
      formula: "Formula", mass: "Mass, g", molar: "Molar mass", amount: "Amount of substance", particles: "Number of particles",
      volume: "Volume (normal cond.)", element: "Element", count: "Atoms", share: "Share", bad: "Could not read the formula",
      solute: "Solute, g", water: "Water, g", fraction: "Mass fraction", temp: "Temperature",
      air: { N2: "Nitrogen N₂", O2: "Oxygen O₂", Ar: "Argon Ar", CO2: "Carbon dioxide CO₂ and others" },
      water: { sea: "Oceans and seas (salt)", ice: "Glaciers and ice", ground: "Groundwater", surface: "Rivers, lakes, air" },
      waterTitle: "Water on Earth", fresh: "fresh water",
      lab: { tube: "Test tube", beaker: "Beaker", flask: "Conical flask", funnel: "Funnel", lamp: "Spirit lamp", stand: "Lab stand" },
      flame: { inner: "Inner zone — coolest", mid: "Middle zone — bright", outer: "Outer zone — hottest", wick: "Wick" },
      filt: { mix: "Mixture", paper: "Filter paper", filtrate: "Filtrate (clear solution)", residue: "Residue stays on the paper" },
      dist: { flask: "Heated mixture", cond: "Condenser", water: "Cold water", receiver: "Distilled water" },
      elec: { cat: "Cathode (−)", an: "Anode (+)", h2: "Hydrogen H₂ — 2 volumes", o2: "Oxygen O₂ — 1 volume", src: "Power source" },
      cyc: { sun: "Sun", plant: "Plants — photosynthesis", animal: "People and animals — breathing", fire: "Burning, factories", o2: "O₂", co2: "CO₂" },
      cls: { sub: "Substances", simple: "Simple substances", complex: "Complex substances", metals: "Metals", nonmetals: "Non-metals",
        oxides: "Oxides", bases: "Bases", acids: "Acids", salts: "Salts" },
      gen: { metal: "Metal", boxide: "Basic oxide", base: "Base", salt: "Salt", acid: "Acid", aoxide: "Acidic oxide", nonmetal: "Non-metal" },
      ind: { name: "Indicator", acid: "Acidic", neutral: "Neutral", base: "Alkaline", litmus: "Litmus", php: "Phenolphthalein", mo: "Methyl orange",
        colorless: "colourless" },
      st: { solid: "Solid", liquid: "Liquid", gas: "Gas", melt: "Melting", freeze: "Freezing", boil: "Evaporation", cond: "Condensation", subl: "Sublimation", depo: "Deposition" },
      sol: { title: "Grams dissolving in 100 g of water", t: "Temperature, °C" },
      crust: "Mass share in Earth's crust, %"
    },
    ru: { drag: "Вращение: перетащите · Зум: колесо", solid: "Твёрдое", liquid: "Жидкое", gas: "Газ", play: "▶ Повторить",
      before: "До реакции", after: "После реакции", reactants: "Исходные вещества", products: "Продукты",
      formula: "Формула", mass: "Масса, г", molar: "Молярная масса", amount: "Количество вещества", particles: "Число частиц",
      volume: "Объём (н. у.)", element: "Элемент", count: "Атомов", share: "Доля", bad: "Не удалось прочитать формулу",
      solute: "Растворённое вещество, г", water: "Вода, г", fraction: "Массовая доля", temp: "Температура",
      air: { N2: "Азот N₂", O2: "Кислород O₂", Ar: "Аргон Ar", CO2: "Углекислый газ CO₂ и другие" },
      water: { sea: "Океаны и моря (солёная)", ice: "Ледники", ground: "Подземные воды", surface: "Реки, озёра, атмосфера" },
      waterTitle: "Вода на Земле", fresh: "пресная вода",
      lab: { tube: "Пробирка", beaker: "Химический стакан", flask: "Коническая колба", funnel: "Воронка", lamp: "Спиртовка", stand: "Штатив" },
      flame: { inner: "Внутренняя зона — самая холодная", mid: "Средняя зона — светящаяся", outer: "Внешняя зона — самая горячая", wick: "Фитиль" },
      filt: { mix: "Смесь", paper: "Фильтровальная бумага", filtrate: "Фильтрат (прозрачный раствор)", residue: "Осадок остаётся на бумаге" },
      dist: { flask: "Нагреваемая смесь", cond: "Холодильник", water: "Холодная вода", receiver: "Дистиллированная вода" },
      elec: { cat: "Катод (−)", an: "Анод (+)", h2: "Водород H₂ — 2 объёма", o2: "Кислород O₂ — 1 объём", src: "Источник тока" },
      cyc: { sun: "Солнце", plant: "Растения — фотосинтез", animal: "Люди и животные — дыхание", fire: "Горение, заводы", o2: "O₂", co2: "CO₂" },
      cls: { sub: "Вещества", simple: "Простые вещества", complex: "Сложные вещества", metals: "Металлы", nonmetals: "Неметаллы",
        oxides: "Оксиды", bases: "Основания", acids: "Кислоты", salts: "Соли" },
      gen: { metal: "Металл", boxide: "Основный оксид", base: "Основание", salt: "Соль", acid: "Кислота", aoxide: "Кислотный оксид", nonmetal: "Неметалл" },
      ind: { name: "Индикатор", acid: "Кислая", neutral: "Нейтральная", base: "Щелочная", litmus: "Лакмус", php: "Фенолфталеин", mo: "Метилоранж",
        colorless: "бесцветный" },
      st: { solid: "Твёрдое", liquid: "Жидкое", gas: "Газ", melt: "Плавление", freeze: "Отвердевание", boil: "Испарение", cond: "Конденсация", subl: "Возгонка", depo: "Десублимация" },
      sol: { title: "Граммов растворяется в 100 г воды", t: "Температура, °C" },
      crust: "Массовая доля в земной коре, %"
    }
  };

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = (v, L, d) => { const t = Number(v).toFixed(d == null ? 2 : d); return L === 'en' ? t : t.replace('.', ','); };
  const SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
  const pretty = (f) => f.replace(/(\d+)/g, (m, d, i, s) => (i > 0 && /[A-Za-z)\]]/.test(s[i - 1]) ? d.split('').map((c) => SUB[c]).join('') : d));
  const card = (inner, extra) => '<div style="background:var(--input);border:1px solid var(--line);border-radius:12px;padding:14px 16px;' + (extra || '') + '">' + inner + '</div>';
  const field = 'width:100%;background:var(--panel);border:1px solid var(--line);border-radius:9px;color:var(--text);font:15px IBM Plex Mono,monospace;padding:9px 11px;outline:none';
  const lbl = 'display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:0 0 5px';

  // CPK-style atom colours and display radii
  const CPK = { H: '#f4f6f8', C: '#4a4f57', N: '#3a62f0', O: '#ff3b3b', Cl: '#2fd14b', S: '#f2d23c', Na: '#a066f0', Zn: '#8a90b8', Fe: '#e0703a', Ca: '#58d65a' };
  const RAD = { H: 0.3, C: 0.42, N: 0.42, O: 0.44, Cl: 0.58, S: 0.56, Na: 0.52, Zn: 0.5, Fe: 0.5, Ca: 0.56 };

  // ---------- 3D stage shared by molecule3d / atom3d ----------
  function stage(host, ctx, h) {
    const THREE = ctx.THREE;
    host.style.cssText += ';position:relative;height:' + (h || 320) + 'px;border-radius:12px;overflow:hidden;border:1px solid var(--line);background:radial-gradient(520px 320px at 50% 42%,#26305a,#070a16 78%)';
    host.innerHTML = '<div style="position:absolute;left:12px;bottom:9px;font:10.5px IBM Plex Mono,monospace;color:rgba(200,212,238,.7);pointer-events:none;z-index:2">' + esc(S[ctx.lang].drag) + '</div>';
    const W = host.clientWidth || 600, H = host.clientHeight || 320;
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.setSize(W, H); renderer.outputEncoding = THREE.sRGBEncoding;
    host.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55)); scene.add(new THREE.HemisphereLight(0xe8f0ff, 0x1a1d26, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(4, 6, 8); scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.35); fill.position.set(-6, -2, 4); scene.add(fill);
    const controls = ctx.orbit(camera, renderer.domElement);
    let raf = 0, alive = true, tick = null;
    const onResize = () => { const w = host.clientWidth, hh = host.clientHeight; if (!w || !hh) return; camera.aspect = w / hh; camera.updateProjectionMatrix(); renderer.setSize(w, hh); };
    window.addEventListener('resize', onResize);
    const loop = () => { if (!alive) return; if (tick) tick(); controls.update(); renderer.render(scene, camera); raf = requestAnimationFrame(loop); };
    ctx.onDispose(() => { alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); controls.dispose && controls.dispose(); renderer.dispose(); try { renderer.forceContextLoss(); } catch (e) {} });
    return { THREE, scene, camera, controls, start: (dist, t) => { tick = t || null; camera.position.set(dist * 0.35, dist * 0.25, dist); controls.sync(); loop(); } };
  }
  const lin = (THREE, c) => new THREE.Color(c).convertSRGBToLinear();

  // molecule geometries in ångström-like units; bonds [i, j, order]
  const MOL = {
    H2: [[['H', -0.37, 0, 0], ['H', 0.37, 0, 0]], [[0, 1, 1]]],
    O2: [[['O', -0.6, 0, 0], ['O', 0.6, 0, 0]], [[0, 1, 2]]],
    N2: [[['N', -0.55, 0, 0], ['N', 0.55, 0, 0]], [[0, 1, 3]]],
    Cl2: [[['Cl', -1.0, 0, 0], ['Cl', 1.0, 0, 0]], [[0, 1, 1]]],
    HCl: [[['H', -0.64, 0, 0], ['Cl', 0.64, 0, 0]], [[0, 1, 1]]],
    H2O: [[['O', 0, 0.12, 0], ['H', 0.76, -0.47, 0], ['H', -0.76, -0.47, 0]], [[0, 1, 1], [0, 2, 1]]],
    CO2: [[['C', 0, 0, 0], ['O', 1.16, 0, 0], ['O', -1.16, 0, 0]], [[0, 1, 2], [0, 2, 2]]],
    NH3: [[['N', 0, 0.12, 0], ['H', 0.94, -0.26, 0], ['H', -0.47, -0.26, 0.81], ['H', -0.47, -0.26, -0.81]], [[0, 1, 1], [0, 2, 1], [0, 3, 1]]],
    CH4: [[['C', 0, 0, 0], ['H', 0.63, 0.63, 0.63], ['H', -0.63, -0.63, 0.63], ['H', -0.63, 0.63, -0.63], ['H', 0.63, -0.63, -0.63]], [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]]],
    O3: [[['O', 0, 0.33, 0], ['O', 1.09, -0.33, 0], ['O', -1.09, -0.33, 0]], [[0, 1, 1.5], [0, 2, 1.5]]],
    SO2: [[['S', 0, 0.3, 0], ['O', 1.23, -0.42, 0], ['O', -1.23, -0.42, 0]], [[0, 1, 2], [0, 2, 2]]]
  };

  function molecule3d(host, spec, ctx) {
    const st = stage(host, ctx, 320), THREE = st.THREE, g = new THREE.Group(); st.scene.add(g);
    const sphere = (el, x, y, z, r) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 30), new THREE.MeshStandardMaterial({ color: lin(THREE, CPK[el] || '#cccccc'), roughness: 0.35, metalness: 0.05 })); m.position.set(x, y, z); g.add(m); };
    const stick = (a, b, r, col) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), len = d.length();
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 16), new THREE.MeshStandardMaterial({ color: lin(THREE, col || '#c9ced8'), roughness: 0.5 }));
      m.position.copy(A.clone().add(B).multiplyScalar(0.5)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(m); };
    if (spec.mol === 'NaCl') {
      // rock-salt crystal: Na⁺ and Cl⁻ alternate on a cubic grid
      const n = 3, a = 1.5;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) {
        const el = (i + j + k) % 2 ? 'Na' : 'Cl', x = (i - 1) * a, y = (j - 1) * a, z = (k - 1) * a;
        sphere(el, x, y, z, el === 'Na' ? 0.38 : 0.6);
        if (i < n - 1) stick([x, y, z], [x + a, y, z], 0.05, '#7b8399'); if (j < n - 1) stick([x, y, z], [x, y + a, z], 0.05, '#7b8399'); if (k < n - 1) stick([x, y, z], [x, y, z + a], 0.05, '#7b8399');
      }
      st.start(9, () => { g.rotation.y += 0.004; });
    } else {
      const m = MOL[spec.mol] || MOL.H2O, at = m[0], sc = 1.6;
      at.forEach((p) => sphere(p[0], p[1] * sc, p[2] * sc, p[3] * sc, RAD[p[0]] || 0.45));
      m[1].forEach(([i, j, o]) => { const A = at[i].slice(1).map((v) => v * sc), B = at[j].slice(1).map((v) => v * sc);
        if (o === 1) stick(A, B, 0.09);
        else { // double / triple bond: parallel sticks offset sideways
          const k = Math.round(o) === 3 ? [-0.14, 0, 0.14] : o === 1.5 ? [-0.07, 0.07] : [-0.09, 0.09];
          k.forEach((off) => stick([A[0], A[1] + off, A[2] + off * 0.5], [B[0], B[1] + off, B[2] + off * 0.5], 0.055)); } });
      st.start(6.2, () => { g.rotation.y += 0.005; });
    }
    const legend = [...new Set((spec.mol === 'NaCl' ? ['Na', 'Cl'] : (MOL[spec.mol] || MOL.H2O)[0].map((a) => a[0])))]
      .map((e) => '<span style="display:inline-flex;align-items:center;gap:5px;margin-right:10px"><span style="width:10px;height:10px;border-radius:50%;background:' + CPK[e] + '"></span>' + e + '</span>').join('');
    host.insertAdjacentHTML('beforeend', '<div style="position:absolute;left:12px;top:10px;font:600 13px Space Grotesk,sans-serif;color:#eef2ff;z-index:2">' + esc(pretty(spec.mol === 'NaCl' ? 'NaCl' : spec.mol)) + '<div style="margin-top:5px;font:11px IBM Plex Mono,monospace;color:rgba(220,228,246,.85)">' + legend + '</div></div>');
  }

  function atom3d(host, spec, ctx) {
    const el = (ctx.elements || []).find((e) => e.sym === spec.el) || (ctx.elements || [])[0]; if (!el) return;
    const st = stage(host, ctx, 320), THREE = st.THREE, g = new THREE.Group(); st.scene.add(g);
    const neutrons = Math.max(0, Math.round(el.mass) - el.z), nP = Math.min(el.z, 60), nN = Math.min(neutrons, 60), R = 0.35 + Math.cbrt(nP + nN) * 0.14;
    const pm = new THREE.MeshStandardMaterial({ color: lin(THREE, '#e8283f'), roughness: 0.5, toneMapped: false }), nm = new THREE.MeshStandardMaterial({ color: lin(THREE, '#2f5be0'), roughness: 0.5, toneMapped: false });
    const ng = new THREE.SphereGeometry(R * 0.3, 14, 12);
    for (let i = 0; i < nP + nN; i++) { let v; do { v = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1); } while (v.lengthSq() > 1);
      const m = new THREE.Mesh(ng, i < nP ? pm : nm); m.position.copy(v.multiplyScalar(R)); g.add(m); }
    const shells = [];
    el.shells.forEach((cnt, si) => { const r = R + 1.1 + si * 0.85, sg = new THREE.Group(), col = lin(THREE, ctx.shellColors[si] || '#ffffff');
      sg.rotation.x = si * 0.65; sg.rotation.y = si * 1.05;
      const pts = []; for (let i = 0; i <= 96; i++) { const a = i / 96 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)); }
      sg.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.7, toneMapped: false })));
      const eg = new THREE.SphereGeometry(0.12, 12, 10), em = new THREE.MeshBasicMaterial({ color: col, toneMapped: false });
      for (let i = 0; i < cnt; i++) { const a = i / cnt * Math.PI * 2, e = new THREE.Mesh(eg, em); e.position.set(Math.cos(a) * r, Math.sin(a) * r, 0); sg.add(e); }
      g.add(sg); shells.push({ sg, sp: 0.012 / (si * 0.5 + 1) }); });
    st.start(R + 1.1 + (el.shells.length - 1) * 0.85 + 4.2 + el.shells.length * 1.2, () => shells.forEach((s) => { s.sg.rotateZ(s.sp); }));
    host.insertAdjacentHTML('beforeend', '<div style="position:absolute;left:12px;top:10px;font:600 13px Space Grotesk,sans-serif;color:#eef2ff;z-index:2">' + esc(el.sym) + ' · Z = ' + el.z
      + '<div style="margin-top:5px;font:11px IBM Plex Mono,monospace;color:rgba(220,228,246,.85)"><span style="color:#ff5d6e">● p⁺ ' + el.z + '</span> &nbsp;<span style="color:#7fa2ff">● n⁰ ' + neutrons + '</span> &nbsp;<span>● e⁻ ' + el.z + '</span> · ' + el.shells.join(', ') + '</div></div>');
  }

  // ---------- particles in the three states ----------
  function particles(host, spec, ctx) {
    const T = S[ctx.lang];
    host.innerHTML = card('<div style="display:flex;gap:6px;margin-bottom:10px" class="pv-btns"></div><canvas style="display:block;width:100%;height:240px;border-radius:9px;background:rgba(10,14,30,.85)"></canvas>');
    const cv = host.querySelector('canvas'), btns = host.querySelector('.pv-btns'), c2 = cv.getContext('2d');
    let mode = 'solid';
    const modes = [['solid', T.solid, '#6fb3ff'], ['liquid', T.liquid, '#4fe0b0'], ['gas', T.gas, '#ffb454']];
    const draw = () => { btns.innerHTML = modes.map((m) => '<button data-m="' + m[0] + '" style="flex:1;border-radius:9px;border:1px solid ' + (mode === m[0] ? m[2] : 'var(--line)') + ';background:' + (mode === m[0] ? m[2] + '33' : 'var(--btn)') + ';color:' + (mode === m[0] ? 'var(--text)' : 'var(--muted)') + ';font:600 13px Space Grotesk,sans-serif;padding:8px;cursor:pointer">' + m[1] + '</button>').join(''); };
    btns.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { mode = b.dataset.m; draw(); } });
    draw();
    const N = 42, P = []; for (let i = 0; i < N; i++) P.push({ x: 0, y: 0, vx: 0, vy: 0, hx: 0, hy: 0 });
    let raf = 0, alive = true;
    const step = () => {
      if (!alive) return;
      const W = cv.width = cv.clientWidth * (window.devicePixelRatio || 1), H = cv.height = cv.clientHeight * (window.devicePixelRatio || 1), r = H / 26;
      c2.clearRect(0, 0, W, H);
      const col = modes.find((m) => m[0] === mode)[2];
      P.forEach((p, i) => {
        if (mode === 'solid') { const cols = 7, gx = W / 2 + ((i % cols) - 3) * r * 2.3, gy = H - r * 1.4 - Math.floor(i / cols) * r * 2.3; p.x += (gx + (Math.random() - 0.5) * r * 0.35 - p.x) * 0.25; p.y += (gy + (Math.random() - 0.5) * r * 0.35 - p.y) * 0.25; }
        else {
          const sp = mode === 'gas' ? r * 0.45 : r * 0.12;
          if (Math.hypot(p.vx, p.vy) < sp * 0.5) { const a = Math.random() * 6.28; p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp; }
          p.vx += (Math.random() - 0.5) * sp * 0.2; p.vy += (Math.random() - 0.5) * sp * 0.2 + (mode === 'liquid' ? r * 0.02 : 0);
          const m = Math.hypot(p.vx, p.vy); if (m > sp) { p.vx *= sp / m; p.vy *= sp / m; }
          p.x += p.vx; p.y += p.vy;
          const top = mode === 'liquid' ? H * 0.42 : r;
          if (p.x < r) { p.x = r; p.vx = Math.abs(p.vx); } if (p.x > W - r) { p.x = W - r; p.vx = -Math.abs(p.vx); }
          if (p.y < top) { p.y = top; p.vy = Math.abs(p.vy); } if (p.y > H - r) { p.y = H - r; p.vy = -Math.abs(p.vy); }
        }
        c2.beginPath(); c2.arc(p.x, p.y, r * 0.95, 0, 6.283); c2.fillStyle = col; c2.globalAlpha = 0.9; c2.fill(); c2.globalAlpha = 1;
      });
      raf = requestAnimationFrame(step);
    };
    P.forEach((p) => { p.x = Math.random() * 400; p.y = Math.random() * 200; });
    step();
    ctx.onDispose(() => { alive = false; cancelAnimationFrame(raf); });
  }

  // ---------- reaction animation: atoms leave the reactant molecules and regroup into products ----------
  const RX = {
    h2_o2: [['H2', 'H2', 'O2'], ['H2O', 'H2O'], '2H₂ + O₂ → 2H₂O'],
    ch4_o2: [['CH4', 'O2', 'O2'], ['CO2', 'H2O', 'H2O'], 'CH₄ + 2O₂ → CO₂ + 2H₂O'],
    c_o2: [['C', 'O2'], ['CO2'], 'C + O₂ → CO₂'],
    h2o_el: [['H2O', 'H2O'], ['H2', 'H2', 'O2'], '2H₂O → 2H₂ + O₂'],
    zn_hcl: [['Zn', 'HCl', 'HCl'], ['ZnCl2', 'H2'], 'Zn + 2HCl → ZnCl₂ + H₂'],
    naoh_hcl: [['NaOH', 'HCl'], ['NaCl', 'H2O'], 'NaOH + HCl → NaCl + H₂O'],
    cao_h2o: [['CaO', 'H2O'], ['CaO2H2'], 'CaO + H₂O → Ca(OH)₂'],
    fe_s: [['Fe', 'S'], ['FeS'], 'Fe + S → FeS']
  };
  // atoms of a small molecule, central atom first
  const ATOMS = { H2: ['H', 'H'], O2: ['O', 'O'], H2O: ['O', 'H', 'H'], CH4: ['C', 'H', 'H', 'H', 'H'], CO2: ['C', 'O', 'O'], C: ['C'], Zn: ['Zn'], HCl: ['Cl', 'H'],
    ZnCl2: ['Zn', 'Cl', 'Cl'], NaOH: ['O', 'Na', 'H'], NaCl: ['Na', 'Cl'], CaO: ['Ca', 'O'], CaO2H2: ['Ca', 'O', 'O', 'H', 'H'], Fe: ['Fe'], S: ['S'], FeS: ['Fe', 'S'] };
  const LABEL = { CaO2H2: 'Ca(OH)₂' };
  function layout(list, x0, x1, cy, u) {
    // place each molecule's atoms: the first in the middle, the rest around it
    const out = [], step = (x1 - x0) / list.length;
    list.forEach((m, mi) => { const at = ATOMS[m], cx = x0 + step * (mi + 0.5);
      at.forEach((el, k) => { let x = cx, y = cy;
        if (at.length === 2) { x = cx + (k ? 1 : -1) * u * 0.62; }
        else if (k > 0) { const n = at.length - 1, a = (-150 + (120 / Math.max(1, n - 1)) * (k - 1)) * Math.PI / 180; x = cx + Math.cos(a) * u * 1.15; y = cy - Math.sin(a) * u * 1.15; }
        out.push({ el, x, y, mol: mi, label: LABEL[m] || pretty(m), cx }); }); });
    return out;
  }
  function reaction(host, spec, ctx) {
    const R = RX[spec.id] || RX.h2_o2, T = S[ctx.lang];
    host.innerHTML = card('<canvas style="display:block;width:100%;height:230px;border-radius:9px;background:rgba(10,14,30,.85)"></canvas>'
      + '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-top:10px"><div style="font:600 17px IBM Plex Mono,monospace;color:var(--text)">' + esc(R[2]) + '</div>'
      + '<button class="rx-play" style="border-radius:9px;border:1px solid rgba(46,204,150,.5);background:rgba(46,204,150,.14);color:var(--green);font:600 13px Space Grotesk,sans-serif;padding:7px 13px;cursor:pointer">' + esc(T.play) + '</button></div>');
    const cv = host.querySelector('canvas'), c2 = cv.getContext('2d');
    let t0 = performance.now(), raf = 0, alive = true;
    host.querySelector('.rx-play').addEventListener('click', () => { t0 = performance.now(); });
    const frame = (now) => {
      if (!alive) return;
      const dpr = window.devicePixelRatio || 1, W = cv.width = cv.clientWidth * dpr, H = cv.height = cv.clientHeight * dpr, u = Math.min(W / 16, H / 6.5);
      const A = layout(R[0], 0, W * 0.44, H * 0.5, u), B = layout(R[1], W * 0.56, W, H * 0.5, u);
      // pair every reactant atom with a product atom of the same element
      const used = new Set(), pair = A.map((a) => { const j = B.findIndex((b, i) => !used.has(i) && b.el === a.el); used.add(j); return B[j] || a; });
      const t = ((now - t0) / 1000) % 6, k = t < 1.6 ? 0 : t < 3.6 ? (t - 1.6) / 2 : 1, e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      c2.clearRect(0, 0, W, H);
      c2.font = (12 * dpr) + 'px Space Grotesk, sans-serif'; c2.textAlign = 'center'; c2.fillStyle = 'rgba(200,212,238,.75)';
      c2.fillText(T.reactants, W * 0.22, 18 * dpr); c2.fillText(T.products, W * 0.78, 18 * dpr);
      c2.fillStyle = 'rgba(200,212,238,.5)'; c2.font = (26 * dpr) + 'px sans-serif'; c2.fillText('→', W / 2, H * 0.53);
      // bonds (thin lines) inside the molecule each atom currently belongs to
      const pos = A.map((a, i) => ({ el: a.el, x: a.x + (pair[i].x - a.x) * e, y: a.y + (pair[i].y - a.y) * e + Math.sin(e * Math.PI) * (i % 2 ? -1 : 1) * u * 0.5, grp: e < 0.5 ? 'a' + a.mol : 'b' + pair[i].mol }));
      c2.strokeStyle = 'rgba(200,210,230,.55)'; c2.lineWidth = 3 * dpr;
      if (e === 0 || e === 1) { const gs = {}; pos.forEach((p) => { (gs[p.grp] = gs[p.grp] || []).push(p); });
        Object.values(gs).forEach((g) => g.slice(1).forEach((p) => { c2.beginPath(); c2.moveTo(g[0].x, g[0].y); c2.lineTo(p.x, p.y); c2.stroke(); })); }
      pos.forEach((p) => { const r = u * (RAD[p.el] || 0.45) * 1.15; c2.beginPath(); c2.arc(p.x, p.y, r, 0, 6.283); c2.fillStyle = CPK[p.el] || '#ccc'; c2.fill();
        c2.fillStyle = ['H', 'S', 'Cl', 'Ca'].includes(p.el) ? '#111' : '#fff'; c2.font = '600 ' + Math.max(10, r * 0.75) + 'px Space Grotesk, sans-serif'; c2.textBaseline = 'middle'; c2.fillText(p.el, p.x, p.y + 1); });
      c2.textBaseline = 'alphabetic'; c2.fillStyle = 'rgba(220,228,246,.85)'; c2.font = (12 * dpr) + 'px IBM Plex Mono, monospace';
      const labs = (list, L) => { const seen = {}; L.forEach((a) => { if (!seen[a.mol]) { seen[a.mol] = 1; c2.fillText(a.label, a.cx, H - 12 * dpr); } }); };
      if (e === 0) labs(R[0], A); if (e === 1) labs(R[1], B);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    ctx.onDispose(() => { alive = false; cancelAnimationFrame(raf); });
  }

  // ---------- conservation of mass: two pans stay level ----------
  function balance(host, spec, ctx) {
    const T = S[ctx.lang];
    host.innerHTML = card('<svg viewBox="0 0 520 230" style="width:100%;height:auto;display:block">'
      + '<style>.bl-beam{transform-origin:260px 60px;animation:blTilt 5s ease-in-out infinite}@keyframes blTilt{0%,100%{transform:rotate(-6deg)}35%,65%{transform:rotate(0deg)}}</style>'
      + '<rect x="250" y="60" width="20" height="140" rx="4" style="fill:var(--muted);opacity:.6"/><rect x="190" y="198" width="140" height="14" rx="6" style="fill:var(--muted);opacity:.6"/>'
      + '<g class="bl-beam"><rect x="80" y="54" width="360" height="10" rx="5" style="fill:var(--text);opacity:.75"/>'
      + '<line x1="110" y1="64" x2="110" y2="120" style="stroke:var(--muted)"/><line x1="410" y1="64" x2="410" y2="120" style="stroke:var(--muted)"/>'
      + '<path d="M60 120 h100 l-12 16 h-76z" style="fill:#4dd2ff;opacity:.85"/><path d="M360 120 h100 l-12 16 h-76z" style="fill:#c08bff;opacity:.85"/>'
      + '<path d="M95 82 h30 v10 l14 24 h-58 l14 -24z" style="fill:rgba(255,255,255,.25);stroke:var(--text)"/><circle cx="104" cy="108" r="4" fill="#ff3b3b"/><circle cx="116" cy="110" r="4" fill="#f4f6f8"/>'
      + '<path d="M395 82 h30 v10 l14 24 h-58 l14 -24z" style="fill:rgba(255,255,255,.25);stroke:var(--text)"/><circle cx="410" cy="109" r="5" fill="#58d65a"/></g>'
      + '<circle cx="260" cy="60" r="7" style="fill:var(--text)"/>'
      + '<text x="110" y="165" text-anchor="middle" style="fill:var(--text);font:600 14px Space Grotesk">' + esc(T.before) + '</text><text x="110" y="185" text-anchor="middle" style="fill:var(--muted);font:13px IBM Plex Mono">m = 100 g</text>'
      + '<text x="410" y="165" text-anchor="middle" style="fill:var(--text);font:600 14px Space Grotesk">' + esc(T.after) + '</text><text x="410" y="185" text-anchor="middle" style="fill:var(--muted);font:13px IBM Plex Mono">m = 100 g</text>'
      + '</svg>');
  }

  // ---------- charts ----------
  function donut(parts, size) {
    let a = -Math.PI / 2; const r = size / 2 - 8, cx = size / 2, cy = size / 2;
    return parts.map((p) => { const da = p.v / 100 * Math.PI * 2, a2 = a + da, large = da > Math.PI ? 1 : 0;
      const d = 'M' + (cx + r * Math.cos(a)) + ' ' + (cy + r * Math.sin(a)) + ' A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + (cx + r * Math.cos(a2 - 0.0001)) + ' ' + (cy + r * Math.sin(a2 - 0.0001));
      a = a2; return '<path d="' + d + '" fill="none" stroke="' + p.c + '" stroke-width="26" style="stroke-dasharray:2000;stroke-dashoffset:2000;animation:dnDraw 1.4s ease forwards"><title>' + esc(p.l) + ': ' + p.v + '%</title></path>'; }).join('');
  }
  const legendRows = (parts, L) => parts.map((p) => '<div style="display:flex;align-items:center;gap:9px;margin:5px 0;font-size:13px;color:var(--body)"><span style="flex:0 0 auto;width:12px;height:12px;border-radius:3px;background:' + p.c + '"></span><span style="flex:1">' + esc(p.l) + '</span><b style="font-family:IBM Plex Mono;color:var(--text)">' + num(p.v, L, p.d) + '%</b></div>').join('');
  function chart(host, spec, ctx) {
    const L = ctx.lang, T = S[L], kind = spec.kind;
    const anim = '<style>@keyframes dnDraw{to{stroke-dashoffset:0}}@keyframes barGrow{from{transform:scaleX(0)}}</style>';
    if (kind === 'air' || kind === 'water') {
      const parts = kind === 'air'
        ? [{ l: T.air.N2, v: 78.08, c: '#4dd2ff', d: 2 }, { l: T.air.O2, v: 20.95, c: '#ff5d6e', d: 2 }, { l: T.air.Ar, v: 0.93, c: '#c08bff', d: 2 }, { l: T.air.CO2, v: 0.04, c: '#ffd24d', d: 2 }]
        : [{ l: T.water.sea, v: 97.5, c: '#2f7cf0', d: 1 }, { l: T.water.ice, v: 1.7, c: '#bfe6ff', d: 1 }, { l: T.water.ground, v: 0.76, c: '#4fe0b0', d: 2 }, { l: T.water.surface, v: 0.04, c: '#ffd24d', d: 2 }];
      host.innerHTML = card(anim + '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:18px"><svg viewBox="0 0 200 200" style="width:190px;height:190px;flex:0 0 auto">' + donut(parts, 200)
        + (kind === 'water' ? '<text x="100" y="96" text-anchor="middle" style="fill:var(--text);font:700 22px Space Grotesk">2,5%</text><text x="100" y="116" text-anchor="middle" style="fill:var(--muted);font:11px Space Grotesk">' + esc(T.fresh) + '</text>' : '<text x="100" y="108" text-anchor="middle" style="fill:var(--text);font:700 18px Space Grotesk">' + (L === 'uz' ? 'Havo' : L === 'ru' ? 'Воздух' : 'Air') + '</text>')
        + '</svg><div style="flex:1;min-width:200px">' + (kind === 'water' ? '<div style="font-weight:700;margin-bottom:6px;color:var(--text)">' + esc(T.waterTitle) + '</div>' : '') + legendRows(parts, L) + '</div></div>');
      return;
    }
    if (kind === 'crust') {
      const d = [['O', 46.1], ['Si', 28.2], ['Al', 8.2], ['Fe', 5.6], ['Ca', 4.2], ['Na', 2.4], ['Mg', 2.3], ['K', 2.1]];
      host.innerHTML = card(anim + '<div style="font-size:12px;color:var(--muted);margin-bottom:8px">' + esc(T.crust) + '</div>' + d.map((r, i) => '<div style="display:flex;align-items:center;gap:10px;margin:6px 0"><b style="width:28px;font-family:IBM Plex Mono;color:var(--text)">' + r[0] + '</b><div style="flex:1;height:14px;border-radius:7px;background:var(--btn)"><div style="height:100%;width:' + (r[1] / 46.1 * 100) + '%;border-radius:7px;background:linear-gradient(90deg,#4dd2ff,#c08bff);transform-origin:left;animation:barGrow 1s ' + (i * 0.08) + 's ease both"></div></div><span style="width:52px;text-align:right;font-family:IBM Plex Mono;font-size:13px;color:var(--body)">' + num(r[1], L, 1) + '</span></div>').join(''));
      return;
    }
    if (kind === 'solubility') {
      // grams per 100 g water (approximate textbook values)
      const KNO3 = [[0, 13.3], [10, 20.9], [20, 31.6], [30, 45.8], [40, 63.9], [50, 85.5], [60, 110], [70, 138], [80, 169], [90, 202], [100, 246]];
      const NaCl = [[0, 35.7], [20, 35.9], [40, 36.4], [60, 37.1], [80, 38.0], [100, 39.2]];
      const W = 520, H = 290, pl = 46, pr = 16, pt = 18, pb = 38, X = (t) => pl + t / 100 * (W - pl - pr), Y = (v) => H - pb - v / 250 * (H - pt - pb);
      const path = (d) => d.map((p, i) => (i ? 'L' : 'M') + X(p[0]) + ' ' + Y(p[1])).join(' ');
      const interp = (d, t) => { for (let i = 1; i < d.length; i++) if (t <= d[i][0]) { const a = d[i - 1], b = d[i]; return a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]); } return d[d.length - 1][1]; };
      let g = ''; for (let v = 0; v <= 250; v += 50) g += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" style="stroke:var(--line-soft)"/><text x="' + (pl - 6) + '" y="' + (Y(v) + 4) + '" text-anchor="end" style="fill:var(--muted);font:10px IBM Plex Mono">' + v + '</text>';
      for (let t = 0; t <= 100; t += 20) g += '<text x="' + X(t) + '" y="' + (H - pb + 15) + '" text-anchor="middle" style="fill:var(--muted);font:10px IBM Plex Mono">' + t + '</text>';
      host.innerHTML = card(anim + '<div style="font-size:12px;color:var(--muted);margin-bottom:4px">' + esc(T.sol.title) + '</div><svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block">' + g
        + '<path d="' + path(KNO3) + '" fill="none" stroke="#ff8a5c" stroke-width="3" style="stroke-dasharray:1200;stroke-dashoffset:1200;animation:dnDraw 1.6s ease forwards"/>'
        + '<path d="' + path(NaCl) + '" fill="none" stroke="#4dd2ff" stroke-width="3" style="stroke-dasharray:1200;stroke-dashoffset:1200;animation:dnDraw 1.6s .2s ease forwards"/>'
        + '<text x="' + X(84) + '" y="' + Y(205) + '" style="fill:#ff8a5c;font:600 13px Space Grotesk">KNO₃</text><text x="' + X(84) + '" y="' + (Y(39) - 8) + '" style="fill:#4dd2ff;font:600 13px Space Grotesk">NaCl</text>'
        + '<line class="sl-line" x1="0" x2="0" y1="' + pt + '" y2="' + (H - pb) + '" style="stroke:var(--text);stroke-dasharray:4 3;opacity:.6"/>'
        + '<text x="' + (W - pr) + '" y="' + (H - 4) + '" text-anchor="end" style="fill:var(--muted);font:10.5px Space Grotesk">' + esc(T.sol.t) + '</text></svg>'
        + '<div style="display:flex;align-items:center;gap:12px;margin-top:8px"><input class="sl-t" type="range" min="0" max="100" value="20" style="flex:1;accent-color:#2ecc96"><span class="sl-out" style="font:13px IBM Plex Mono;color:var(--text);min-width:230px"></span></div>');
      const inp = host.querySelector('.sl-t'), out = host.querySelector('.sl-out'), ln = host.querySelector('.sl-line');
      const upd = () => { const t = +inp.value; ln.setAttribute('x1', X(t)); ln.setAttribute('x2', X(t));
        out.innerHTML = t + ' °C: <span style="color:#ff8a5c">KNO₃ ' + num(interp(KNO3, t), L, 1) + ' g</span> · <span style="color:#4dd2ff">NaCl ' + num(interp(NaCl, t), L, 1) + ' g</span>'; };
      inp.addEventListener('input', upd); upd();
    }
  }

  // ---------- diagrams (SVG) ----------
  const tx = (x, y, s, o) => '<text x="' + x + '" y="' + y + '" text-anchor="' + ((o && o.a) || 'middle') + '" style="fill:' + ((o && o.c) || 'var(--text)') + ';font:' + ((o && o.w) || 600) + ' ' + ((o && o.s) || 12.5) + 'px Space Grotesk,sans-serif">' + esc(s) + '</text>';
  const arrowDefs = '<defs><marker id="pvA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:var(--muted)"/></marker>'
    + '<marker id="pvG" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#2ecc96"/></marker></defs>'
    + '<style>.pv-flow{stroke-dasharray:6 5;animation:pvFlow 1.2s linear infinite}@keyframes pvFlow{to{stroke-dashoffset:-22}}.pv-bub{animation:pvBub 2.4s linear infinite}@keyframes pvBub{from{transform:translateY(0);opacity:.9}to{transform:translateY(-120px);opacity:0}}'
    + '.pv-drop{animation:pvDrop 1.6s ease-in infinite}@keyframes pvDrop{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(46px);opacity:0}}.pv-fl{transform-origin:50% 100%;animation:pvFl 1.1s ease-in-out infinite alternate}@keyframes pvFl{to{transform:scale(1.04,.96)}}'
    + '.pv-rise{animation:pvRise 6s ease-out infinite}@keyframes pvRise{0%{transform:scaleY(0)}70%,100%{transform:scaleY(1)}}</style>';
  const svg = (w, h, body) => card('<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:auto;display:block">' + arrowDefs + body + '</svg>');
  const glass = 'fill:rgba(160,200,255,.12);stroke:var(--text);stroke-width:2';

  function diagram(host, spec, ctx) {
    const T = S[ctx.lang], k = spec.kind;
    if (k === 'lab') {
      const D = T.lab;
      host.innerHTML = svg(640, 250,
        // test tube
        '<path d="M50 40 v140 a14 14 0 0 0 28 0 v-140" style="' + glass + '"/><path d="M52 140 v40 a12 12 0 0 0 24 0 v-40z" fill="#4dd2ff" opacity=".55"/>' + tx(64, 225, D.tube)
        // beaker
        + '<path d="M120 80 h80 v100 a8 8 0 0 1 -8 8 h-64 a8 8 0 0 1 -8 -8z" style="' + glass + '"/><path d="M122 130 h76 v50 a6 6 0 0 1 -6 6 h-64 a6 6 0 0 1 -6 -6z" fill="#4fe0b0" opacity=".45"/>' + tx(160, 225, D.beaker)
        // conical flask
        + '<path d="M255 60 h20 v40 l40 80 a6 6 0 0 1 -5 8 h-90 a6 6 0 0 1 -5 -8 l40 -80z" style="' + glass + '"/><path d="M236 150 h58 l15 30 a5 5 0 0 1 -4 7 h-80 a5 5 0 0 1 -4 -7z" fill="#ff8ad8" opacity=".5"/>' + tx(265, 225, D.flask)
        // funnel
        + '<path d="M340 70 h80 l-32 50 v60 h-16 v-60z" style="' + glass + '"/>' + tx(380, 225, D.funnel)
        // spirit lamp with flame
        + '<path d="M455 150 a30 30 0 0 0 60 0 v30 h-60z" style="' + glass + '"/><rect x="478" y="128" width="14" height="22" style="fill:var(--muted)"/><g class="pv-fl" style="transform-box:fill-box"><path d="M485 128 c-14 -18 -4 -40 0 -52 c4 12 14 34 0 52z" fill="#ffb454"/><path d="M485 126 c-6 -8 -2 -20 0 -26 c2 6 6 18 0 26z" fill="#4dd2ff"/></g>' + tx(485, 225, D.lamp)
        // stand
        + '<rect x="560" y="186" width="66" height="10" rx="3" style="fill:var(--muted)"/><rect x="590" y="40" width="6" height="148" style="fill:var(--muted)"/><rect x="560" y="90" width="34" height="5" style="fill:var(--muted)"/><circle cx="566" cy="92" r="9" style="fill:none;stroke:var(--muted);stroke-width:3"/>' + tx(596, 225, D.stand));
      return;
    }
    if (k === 'flame') {
      const D = T.flame;
      host.innerHTML = svg(520, 300, '<g class="pv-fl" style="transform-box:fill-box"><path d="M170 250 c-80 -70 -40 -160 0 -220 c40 60 80 150 0 220z" fill="#ff8a3a" opacity=".85"/><path d="M170 245 c-54 -50 -28 -120 0 -165 c28 45 54 115 0 165z" fill="#ffd24d"/><path d="M170 240 c-26 -26 -14 -64 0 -88 c14 24 26 62 0 88z" fill="#4dd2ff" opacity=".9"/></g>'
        + '<rect x="160" y="250" width="20" height="30" fill="#5d5d66"/>'
        + '<line x1="240" y1="60" x2="300" y2="60" style="stroke:var(--muted)" marker-end="url(#pvA)"/>' + tx(306, 64, D.outer, { a: 'start' })
        + '<line x1="215" y1="140" x2="300" y2="140" style="stroke:var(--muted)" marker-end="url(#pvA)"/>' + tx(306, 144, D.mid, { a: 'start' })
        + '<line x1="185" y1="215" x2="300" y2="215" style="stroke:var(--muted)" marker-end="url(#pvA)"/>' + tx(306, 219, D.inner, { a: 'start' })
        + '<line x1="182" y1="265" x2="300" y2="265" style="stroke:var(--muted)" marker-end="url(#pvA)"/>' + tx(306, 269, D.wick, { a: 'start' }));
      return;
    }
    if (k === 'filtration') {
      const D = T.filt;
      host.innerHTML = svg(520, 300, '<path d="M120 20 h90 v70 a8 8 0 0 1 -8 8 h-74 a8 8 0 0 1 -8 -8z" transform="rotate(25 165 60)" style="' + glass + '"/><path d="M128 52 h74 v38 h-74z" transform="rotate(25 165 60)" fill="#b08a5a" opacity=".6"/>'
        + '<path d="M190 110 h120 l-48 70 v60 h-24 v-60z" style="' + glass + '"/><path d="M200 116 h100 l-42 58 h-16z" fill="#f5f0e6" opacity=".85"/><path d="M226 150 h48 l-12 18 h-24z" fill="#8a6a40" opacity=".8"/>'
        + '<circle class="pv-drop" cx="250" cy="244" r="4" fill="#4dd2ff"/><path d="M200 300 v-50 h100 v50" style="' + glass + '"/><rect x="202" y="270" width="96" height="28" fill="#4dd2ff" opacity=".35"/>'
        + tx(90, 140, D.mix, { a: 'start', s: 12 }) + '<line x1="330" y1="130" x2="300" y2="128" style="stroke:var(--muted)" marker-end="url(#pvA)"/>' + tx(336, 134, D.paper, { a: 'start' })
        + '<line x1="330" y1="168" x2="270" y2="160" style="stroke:var(--muted)" marker-end="url(#pvA)"/>' + tx(336, 172, D.residue, { a: 'start' })
        + '<line x1="330" y1="282" x2="300" y2="282" style="stroke:var(--muted)" marker-end="url(#pvA)"/>' + tx(336, 286, D.filtrate, { a: 'start' }));
      return;
    }
    if (k === 'distillation') {
      const D = T.dist;
      host.innerHTML = svg(600, 280, '<circle cx="110" cy="170" r="50" style="' + glass + '"/><rect x="100" y="80" width="20" height="45" style="' + glass + '"/><path d="M62 185 a50 50 0 0 0 96 0z" fill="#b08a5a" opacity=".55"/>'
        + '<g class="pv-fl" style="transform-box:fill-box"><path d="M110 270 c-14 -14 -6 -30 0 -40 c6 10 14 26 0 40z" fill="#ffb454"/></g>'
        + '<path d="M120 90 L430 170" style="stroke:var(--text);stroke-width:2"/><path d="M200 100 L410 154 L404 176 L194 122z" style="fill:rgba(77,210,255,.15);stroke:var(--text)"/>'
        + '<path class="pv-flow" d="M210 135 L400 183" stroke="#4dd2ff" stroke-width="3" fill="none" marker-end="url(#pvG)"/>'
        + '<circle class="pv-drop" cx="434" cy="178" r="4" fill="#4dd2ff"/><path d="M405 200 v60 a6 6 0 0 0 6 6 h50 a6 6 0 0 0 6 -6 v-60" style="' + glass + '"/><rect x="407" y="232" width="58" height="32" fill="#4dd2ff" opacity=".4"/>'
        + tx(110, 30, D.flask) + tx(300, 90, D.cond) + tx(300, 210, D.water, { c: '#4dd2ff', s: 11 }) + tx(436, 276, D.receiver, { s: 11.5 }));
      return;
    }
    if (k === 'electrolysis') {
      const D = T.elec;
      const bubbles = (x, n, c) => Array.from({ length: n }, (_, i) => '<circle class="pv-bub" style="animation-delay:' + (i * 0.38) + 's" cx="' + (x - 8 + (i % 3) * 8) + '" cy="236" r="' + (2 + (i % 2)) + '" fill="' + c + '"/>').join('');
      host.innerHTML = svg(560, 300, '<rect x="60" y="150" width="440" height="110" rx="8" style="' + glass + '"/><rect x="62" y="170" width="436" height="88" fill="#4dd2ff" opacity=".25"/>'
        + '<rect x="140" y="40" width="44" height="200" rx="6" style="' + glass + '"/><rect x="376" y="40" width="44" height="200" rx="6" style="' + glass + '"/>'
        + '<g class="pv-rise" style="transform-origin:162px 42px;transform-box:view-box"><rect x="142" y="42" width="40" height="120" fill="#f4f6f8" opacity=".55"/></g>'
        + '<g class="pv-rise" style="transform-origin:398px 42px;transform-box:view-box"><rect x="378" y="42" width="40" height="60" fill="#ff5d6e" opacity=".45"/></g>'
        + bubbles(162, 7, '#f4f6f8') + bubbles(398, 4, '#ff8a8a')
        + '<rect x="156" y="240" width="12" height="40" fill="#5d6270"/><rect x="392" y="240" width="12" height="40" fill="#5d6270"/>'
        + '<path d="M162 280 v12 h236 v-12" style="fill:none;stroke:var(--muted);stroke-width:2"/><rect x="250" y="282" width="60" height="18" rx="3" style="fill:var(--panel);stroke:var(--muted)"/>' + tx(280, 296, '− +', { s: 11 })
        + tx(162, 30, D.h2, { s: 12 }) + tx(398, 30, D.o2, { s: 12 }) + tx(110, 214, D.cat, { s: 11.5, c: 'var(--muted)' }) + tx(456, 214, D.an, { s: 11.5, c: 'var(--muted)' }));
      return;
    }
    if (k === 'oxygen_cycle') {
      const D = T.cyc;
      host.innerHTML = svg(620, 300, '<circle cx="80" cy="60" r="34" fill="#ffd24d"/>' + tx(80, 112, D.sun)
        + '<path d="M300 230 v-70" stroke="#3a8a3a" stroke-width="10"/><circle cx="300" cy="130" r="48" fill="#4fbf5a" opacity=".9"/>' + tx(300, 262, D.plant)
        + '<circle cx="520" cy="120" r="20" style="fill:var(--muted)"/><rect x="505" y="142" width="30" height="60" rx="10" style="fill:var(--muted)"/>' + tx(520, 226, D.animal, { s: 11.5 })
        + '<rect x="70" y="180" width="70" height="60" style="fill:var(--muted);opacity:.7"/><rect x="118" y="150" width="14" height="30" style="fill:var(--muted);opacity:.7"/>' + tx(105, 262, D.fire, { s: 11.5 })
        + '<path class="pv-flow" d="M352 112 C 420 80 460 90 495 108" stroke="#ff5d6e" stroke-width="3" fill="none" marker-end="url(#pvG)"/>' + tx(425, 82, D.o2, { c: '#ff5d6e' })
        + '<path class="pv-flow" d="M500 150 C 450 190 400 190 352 160" stroke="#9aa3b8" stroke-width="3" fill="none" marker-end="url(#pvG)"/>' + tx(425, 200, D.co2, { c: '#9aa3b8' })
        + '<path class="pv-flow" d="M148 200 C 190 180 220 160 252 148" stroke="#9aa3b8" stroke-width="3" fill="none" marker-end="url(#pvG)"/>' + tx(200, 160, D.co2, { c: '#9aa3b8' })
        + '<path class="pv-flow" d="M112 72 C 170 80 220 96 256 112" stroke="#ffd24d" stroke-width="2" fill="none" marker-end="url(#pvG)"/>');
      return;
    }
    if (k === 'classification') {
      const D = T.cls, box = (x, y, w, s, c) => '<rect x="' + (x - w / 2) + '" y="' + (y - 17) + '" width="' + w + '" height="34" rx="9" style="fill:' + c + '33;stroke:' + c + '"/>' + tx(x, y + 4, s, { s: 12.5 });
      const ln = (x1, y1, x2, y2) => '<path class="pv-flow" d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '" style="stroke:var(--muted);fill:none" marker-end="url(#pvA)"/>';
      host.innerHTML = svg(640, 250, box(320, 30, 150, D.sub, '#c08bff') + ln(300, 47, 175, 92) + ln(340, 47, 465, 92)
        + box(160, 110, 170, D.simple, '#4dd2ff') + box(480, 110, 180, D.complex, '#ff8a5c')
        + ln(140, 127, 90, 182) + ln(180, 127, 230, 182) + box(80, 200, 120, D.metals, '#4dd2ff') + box(240, 200, 130, D.nonmetals, '#4dd2ff')
        + ln(440, 127, 370, 182) + ln(470, 127, 455, 182) + ln(495, 127, 535, 182) + ln(520, 127, 610, 182)
        + box(372, 200, 80, D.oxides, '#ff8a5c') + box(455, 200, 80, D.bases, '#ff8a5c') + box(537, 200, 80, D.acids, '#ff8a5c') + box(612, 200, 56, D.salts, '#ff8a5c'));
      return;
    }
    if (k === 'genetic') {
      const D = T.gen, box = (x, y, t, f, c) => '<rect x="' + (x - 64) + '" y="' + (y - 26) + '" width="128" height="52" rx="10" style="fill:' + c + '26;stroke:' + c + '"/>' + tx(x, y - 4, t, { s: 12 }) + tx(x, y + 15, f, { s: 13, w: 500, c: 'var(--muted)' });
      const ar = (x1, y1, x2, y2) => '<path class="pv-flow" d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '" stroke="#2ecc96" stroke-width="2.5" fill="none" marker-end="url(#pvG)"/>';
      host.innerHTML = svg(660, 260, box(80, 50, D.metal, 'Ca', '#4dd2ff') + ar(146, 50, 186, 50) + box(252, 50, D.boxide, 'CaO', '#4dd2ff') + ar(318, 50, 358, 50) + box(424, 50, D.base, 'Ca(OH)₂', '#4dd2ff')
        + box(80, 210, D.nonmetal, 'P', '#ff8a5c') + ar(146, 210, 186, 210) + box(252, 210, D.aoxide, 'P₂O₅', '#ff8a5c') + ar(318, 210, 358, 210) + box(424, 210, D.acid, 'H₃PO₄', '#ff8a5c')
        + ar(490, 66, 548, 112) + ar(490, 194, 548, 148) + box(590, 130, D.salt, 'Ca₃(PO₄)₂', '#c08bff'));
      return;
    }
    if (k === 'indicators') {
      const D = T.ind, rows = [[D.litmus, ['#e63a4a', '#8a5ad0', '#3a6ae6'], ['', '', '']], [D.php, ['#f4f4f4', '#f4f4f4', '#e0207a'], [D.colorless, D.colorless, '']], [D.mo, ['#e6455a', '#f08a2a', '#f2d23c'], ['', '', '']]];
      host.innerHTML = card('<table style="width:100%;border-collapse:separate;border-spacing:8px;font-size:13px"><thead><tr><th style="text-align:left;color:var(--muted);font-weight:600">' + esc(D.name) + '</th><th style="color:var(--muted)">' + esc(D.acid) + '</th><th style="color:var(--muted)">' + esc(D.neutral) + '</th><th style="color:var(--muted)">' + esc(D.base) + '</th></tr></thead><tbody>'
        + rows.map((r) => '<tr><td style="color:var(--text);font-weight:600">' + esc(r[0]) + '</td>' + r[1].map((c, i) => '<td><div style="height:44px;border-radius:10px;background:' + c + ';border:1px solid var(--line);display:flex;align-items:flex-end;justify-content:center;font-size:10.5px;color:#333;padding-bottom:3px">' + esc(r[2][i]) + '</div></td>').join('') + '</tr>').join('') + '</tbody></table>');
      return;
    }
    if (k === 'states') {
      const D = T.st, node = (x, y, s, c) => '<circle cx="' + x + '" cy="' + y + '" r="42" style="fill:' + c + '26;stroke:' + c + ';stroke-width:2"/>' + tx(x, y + 5, s, { s: 14 });
      const ar = (d, c) => '<path class="pv-flow" d="' + d + '" stroke="' + c + '" stroke-width="2.5" fill="none" marker-end="url(#pvG)"/>';
      host.innerHTML = svg(620, 300, node(110, 230, D.solid, '#6fb3ff') + node(510, 230, D.liquid, '#4fe0b0') + node(310, 60, D.gas, '#ffb454')
        + ar('M156 222 L462 222', '#ff8a5c') + tx(310, 212, D.melt, { s: 12 }) + ar('M462 246 L156 246', '#4dd2ff') + tx(310, 266, D.freeze, { s: 12 })
        + ar('M486 192 L348 88', '#ff8a5c') + tx(460, 130, D.boil, { s: 12, a: 'start' }) + ar('M330 100 L470 200', '#4dd2ff') + tx(400, 176, D.cond, { s: 12, a: 'end' })
        + ar('M134 192 L272 88', '#ff8a5c') + tx(150, 130, D.subl, { s: 12, a: 'end' }) + ar('M290 100 L150 200', '#4dd2ff') + tx(228, 146, D.depo, { s: 12, a: 'start' }));
    }
  }

  // ---------- calculators ----------
  // parse a formula such as H2SO4, Ca(OH)2, CuSO4·5H2O into { element: count }
  function parseFormula(raw) {
    const s = raw.replace(/[₀-₉]/g, (c) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(c))).replace(/\s+/g, '');
    const total = {};
    // a hydrate dot splits the formula into parts, each with an optional leading coefficient (5H2O)
    s.split(/[·*.•]/).forEach((part) => { const m = part.match(/^(\d+)/), k = m ? +m[1] : 1;
      const P = parseFormulaPart(m ? part.slice(m[1].length) : part); for (const e in P) total[e] = (total[e] || 0) + P[e] * k; });
    return total;
  }
  function parseFormulaPart(s) {
    let i = 0;
    const numAt = () => { let n = ''; while (i < s.length && /\d/.test(s[i])) n += s[i++]; return n ? +n : 1; };
    const add = (a, b, k) => { for (const e in b) a[e] = (a[e] || 0) + b[e] * k; return a; };
    const group = (close) => { const out = {};
      while (i < s.length && s[i] !== close) {
        if (s[i] === '(' || s[i] === '[') { const c = s[i] === '(' ? ')' : ']'; i++; const g = group(c); if (s[i] !== c) throw 0; i++; add(out, g, numAt()); }
        else if (/[A-Z]/.test(s[i])) { let e = s[i++]; while (i < s.length && /[a-z]/.test(s[i])) e += s[i++]; add(out, { [e]: 1 }, numAt()); }
        else throw 0; }
      return out; };
    const r = group(undefined); if (i !== s.length || !Object.keys(r).length) throw 0; return r;
  }
  function molarOf(f, ctx) {
    const counts = parseFormula(f), rows = []; let M = 0;
    for (const e in counts) { const el = (ctx.elements || []).find((x) => x.sym === e); if (!el) throw 0; const ar = Math.round(el.mass * 100) / 100; rows.push({ e, n: counts[e], ar, m: ar * counts[e] }); M += ar * counts[e]; }
    return { M, rows };
  }
  function calc(host, spec, ctx) {
    const L = ctx.lang, T = S[L], k = spec.kind;
    const ex = ['H2O', 'CO2', 'NaCl', 'H2SO4', 'CaCO3', 'Ca(OH)2', 'C6H12O6', 'CuSO4·5H2O'];
    const chips = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 12px">' + ex.map((f) => '<button data-f="' + f + '" style="border-radius:16px;border:1px solid var(--line);background:var(--btn);color:var(--text);font:12.5px IBM Plex Mono;padding:5px 10px;cursor:pointer">' + esc(pretty(f)) + '</button>').join('') + '</div>';
    if (k === 'molar') {
      host.innerHTML = card('<label style="' + lbl + '">' + T.formula + '</label><input class="cf" value="H2SO4" style="' + field + '">' + chips + '<div class="co"></div>');
    } else if (k === 'mole') {
      host.innerHTML = card('<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div><label style="' + lbl + '">' + T.formula + '</label><input class="cf" value="H2O" style="' + field + '"></div><div><label style="' + lbl + '">' + T.mass + '</label><input class="cm" type="number" value="36" min="0" style="' + field + '"></div></div>' + chips + '<div class="co"></div>');
    } else if (k === 'gas') {
      host.innerHTML = card('<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div><label style="' + lbl + '">' + T.formula + '</label><input class="cf" value="O2" style="' + field + '"></div><div><label style="' + lbl + '">' + T.mass + '</label><input class="cm" type="number" value="64" min="0" style="' + field + '"></div></div>' + chips + '<div class="co"></div>');
    } else if (k === 'fraction') {
      host.innerHTML = card('<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><div><label style="' + lbl + '">' + T.solute + ' <b class="vs"></b></label><input class="cs" type="range" min="0" max="100" value="20" style="width:100%;accent-color:#2ecc96"></div>'
        + '<div><label style="' + lbl + '">' + T.water + ' <b class="vw"></b></label><input class="cw" type="range" min="10" max="300" value="80" style="width:100%;accent-color:#4dd2ff"></div></div>'
        + '<div style="display:flex;align-items:center;gap:18px;margin-top:12px"><svg viewBox="0 0 90 110" style="width:90px;flex:0 0 auto"><path d="M10 10 v86 a6 6 0 0 0 6 6 h58 a6 6 0 0 0 6 -6 v-86" style="' + glass + '"/><rect class="liq" x="12" y="40" width="66" height="60" rx="4" fill="#2ecc96"/></svg><div class="co" style="flex:1"></div></div>');
    }
    const out = host.querySelector('.co'), f = host.querySelector('.cf'), m = host.querySelector('.cm');
    const res = (big, small) => '<div style="font:700 22px IBM Plex Mono;color:var(--green)">' + big + '</div>' + (small ? '<div style="margin-top:6px;font-size:13px;color:var(--body);line-height:1.6">' + small + '</div>' : '');
    const upd = () => {
      try {
        if (k === 'fraction') { const s1 = +host.querySelector('.cs').value, w = +host.querySelector('.cw').value, om = s1 / (s1 + w) * 100;
          host.querySelector('.vs').textContent = s1; host.querySelector('.vw').textContent = w; host.querySelector('.liq').setAttribute('opacity', (0.15 + om / 100 * 1.6).toFixed(2));
          out.innerHTML = res('ω = ' + num(om, L, 1) + '%', 'ω = m(' + (L === 'en' ? 'solute' : L === 'ru' ? 'в-ва' : "modda") + ') / m(' + (L === 'en' ? 'solution' : L === 'ru' ? 'р-ра' : 'eritma') + ') · 100% = ' + s1 + ' / ' + (s1 + w) + ' · 100%'); return; }
        const { M, rows } = molarOf(f.value, ctx);
        if (k === 'molar') {
          out.innerHTML = res('M(' + esc(pretty(f.value)) + ') = ' + num(M, L) + ' g/mol', '<table style="width:100%;border-collapse:collapse;margin-top:4px">'
            + '<tr style="color:var(--muted);font-size:11px;text-transform:uppercase"><td>' + T.element + '</td><td>' + T.count + '</td><td>Ar</td><td>Ar · n</td><td>' + T.share + '</td></tr>'
            + rows.map((r) => '<tr style="font-family:IBM Plex Mono;color:var(--text)"><td>' + r.e + '</td><td>' + r.n + '</td><td>' + num(r.ar, L) + '</td><td>' + num(r.m, L) + '</td><td>' + num(r.m / M * 100, L, 1) + '%</td></tr>').join('') + '</table>');
        } else {
          const mass = +m.value || 0, n = mass / M, N = n * 6.02e23;
          const sci = (v) => { if (!v) return '0'; const e = Math.floor(Math.log10(v)), b = v / Math.pow(10, e); return num(b, L) + '·10' + String(e).split('').map((c) => (c === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c])).join(''); };
          if (k === 'mole') out.innerHTML = res('n = ' + num(n, L, 3) + ' mol', 'M = ' + num(M, L) + ' g/mol · n = m / M = ' + mass + ' / ' + num(M, L) + '<br>N = n · N<sub>A</sub> = ' + sci(N) + ' ' + T.particles.toLowerCase());
          else out.innerHTML = res('V = ' + num(n * 22.4, L, 2) + ' L', 'n = m / M = ' + mass + ' / ' + num(M, L) + ' = ' + num(n, L, 3) + ' mol<br>V = n · 22,4 L/mol (' + T.volume + ')');
        }
      } catch (e) { out.innerHTML = '<div style="color:var(--warn);font-size:13px">' + esc(T.bad) + '</div>'; }
    };
    host.querySelectorAll('input').forEach((x) => x.addEventListener('input', upd));
    host.querySelectorAll('button[data-f]').forEach((b) => b.addEventListener('click', () => { f.value = b.dataset.f; upd(); }));
    upd();
  }

  window.PTV = {
    render(host, spec, ctx) {
      host.innerHTML = '';
      try {
        const fn = { molecule3d, atom3d, particles, reaction, balance, chart, diagram, calc }[spec.type];
        if (fn) fn(host, spec, ctx);
      } catch (e) { console.error('visual', spec, e); }
    },
    parseFormula
  };
})();
