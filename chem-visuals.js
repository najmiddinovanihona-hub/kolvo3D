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
      crust: "Yer po'stidagi massa ulushi, %",
      diamond: ["Olmos — atom kristall panjarasi", "Har bir C atomi 4 ta qo'shni bilan kovalent bog'langan"], metal: ["Metall kristall panjarasi", "Musbat ionlar va erkin elektronlar (e⁻)"]
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
      crust: "Mass share in Earth's crust, %",
      diamond: ["Diamond — atomic crystal lattice", "Each C atom is covalently bonded to 4 neighbours"], metal: ["Metallic crystal lattice", "Positive ions and free electrons (e⁻)"]
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
      crust: "Массовая доля в земной коре, %",
      diamond: ["Алмаз — атомная кристаллическая решётка", "Каждый атом C связан ковалентно с 4 соседями"], metal: ["Металлическая кристаллическая решётка", "Положительные ионы и свободные электроны (e⁻)"]
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
  const CPK = { H: '#f4f6f8', C: '#4a4f57', N: '#3a62f0', O: '#ff3b3b', Cl: '#2fd14b', S: '#f2d23c', Na: '#a066f0', Zn: '#8a90b8', Fe: '#e0703a', Ca: '#58d65a', F: '#90e050', Br: '#a62929', I: '#940094', P: '#ff8000' };
  const RAD = { H: 0.3, C: 0.42, N: 0.42, O: 0.44, Cl: 0.58, S: 0.56, Na: 0.52, Zn: 0.5, Fe: 0.5, Ca: 0.56, F: 0.4, Br: 0.62, I: 0.7, P: 0.55 };

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
    SO2: [[['S', 0, 0.3, 0], ['O', 1.23, -0.42, 0], ['O', -1.23, -0.42, 0]], [[0, 1, 2], [0, 2, 2]]],
    F2: [[['F', -0.71, 0, 0], ['F', 0.71, 0, 0]], [[0, 1, 1]]],
    Br2: [[['Br', -1.14, 0, 0], ['Br', 1.14, 0, 0]], [[0, 1, 1]]],
    I2: [[['I', -1.33, 0, 0], ['I', 1.33, 0, 0]], [[0, 1, 1]]],
    HF: [[['H', -0.46, 0, 0], ['F', 0.46, 0, 0]], [[0, 1, 1]]],
    H2S: [[['S', 0, 0.3, 0], ['H', 0.96, -0.63, 0], ['H', -0.96, -0.63, 0]], [[0, 1, 1], [0, 2, 1]]],
    SO3: [[['S', 0, 0, 0], ['O', 0, 1.43, 0], ['O', 1.24, -0.72, 0], ['O', -1.24, -0.72, 0]], [[0, 1, 2], [0, 2, 2], [0, 3, 2]]],
    P4: [[['P', 0.78, 0.78, 0.78], ['P', 0.78, -0.78, -0.78], ['P', -0.78, 0.78, -0.78], ['P', -0.78, -0.78, 0.78]], [[0, 1, 1], [0, 2, 1], [0, 3, 1], [1, 2, 1], [1, 3, 1], [2, 3, 1]]]
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
    } else if (spec.mol === 'diamond') {
      // atomic crystal: every carbon bonded to four neighbours (fcc lattice + a basis shifted by a/4)
      const a = 3.4, P = [], F = [[0, 0, 0], [0, 0.5, 0.5], [0.5, 0, 0.5], [0.5, 0.5, 0]];
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) F.forEach((f) => [[0, 0, 0], [0.25, 0.25, 0.25]].forEach((b) => {
        const x = f[0] + b[0] + i, y = f[1] + b[1] + j, z = f[2] + b[2] + k; if (x <= 1.01 && y <= 1.01 && z <= 1.01) P.push([x, y, z]); }));
      const U = []; P.forEach((p) => { if (!U.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) < 0.01)) U.push(p); });
      // bonds first, then only atoms that take part in at least one bond (corner atoms of the cell would float)
      const B = [], used = new Set();
      for (let i = 0; i < U.length; i++) for (let j = i + 1; j < U.length; j++) { const d = Math.hypot(U[i][0] - U[j][0], U[i][1] - U[j][1], U[i][2] - U[j][2]);
        if (Math.abs(d - 0.433) < 0.02) { B.push([i, j]); used.add(i); used.add(j); } }
      U.forEach((p, i) => { if (used.has(i)) sphere('C', (p[0] - 0.5) * a, (p[1] - 0.5) * a, (p[2] - 0.5) * a, 0.3); });
      B.forEach(([i, j]) => stick(U[i].map((v) => (v - 0.5) * a), U[j].map((v) => (v - 0.5) * a), 0.08, '#9aa3b5'));
      st.start(7.5, () => { g.rotation.y += 0.004; });
    } else if (spec.mol === 'metal') {
      // metallic crystal: positive ions in a lattice, free electrons wandering between them
      const n = 3, a = 1.5, e = [];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 24), new THREE.MeshStandardMaterial({ color: lin(THREE, '#b8bfc9'), metalness: 0.7, roughness: 0.3 })); m.position.set((i - 1) * a, (j - 1) * a, (k - 1) * a); g.add(m); }
      const em = new THREE.MeshBasicMaterial({ color: lin(THREE, '#4dd2ff'), toneMapped: false });
      for (let q = 0; q < 40; q++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), em); m.position.set((Math.random() - 0.5) * 3.4, (Math.random() - 0.5) * 3.4, (Math.random() - 0.5) * 3.4); m.userData.v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.06); g.add(m); e.push(m); }
      st.start(8.5, () => { g.rotation.y += 0.003; e.forEach((m) => { m.position.add(m.userData.v); ['x', 'y', 'z'].forEach((ax) => { if (Math.abs(m.position[ax]) > 1.9) m.userData.v[ax] *= -1; }); }); });
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
    if (spec.mol === 'diamond' || spec.mol === 'metal') {
      const T = S[ctx.lang], t = spec.mol === 'diamond' ? T.diamond : T.metal;
      host.insertAdjacentHTML('beforeend', '<div style="position:absolute;left:12px;top:10px;font:600 13px Space Grotesk,sans-serif;color:#eef2ff;z-index:2">' + esc(t[0]) + '<div style="margin-top:5px;font:11px IBM Plex Mono,monospace;color:rgba(220,228,246,.85)">' + esc(t[1]) + '</div></div>');
      return;
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
        c2.fillStyle = ['H', 'S', 'Cl', 'Ca', 'Al', 'Ag', 'Mg', 'Si'].includes(p.el) ? '#111' : '#fff'; c2.font = '600 ' + Math.max(10, r * 0.75) + 'px Space Grotesk, sans-serif'; c2.textBaseline = 'middle'; c2.fillText(p.el, p.x, p.y + 1); });
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

  // ---------- part 2 additions ----------
  Object.assign(RX, {
    na_cl2: [['Na', 'Na', 'Cl2'], ['NaCl', 'NaCl'], '2Na + Cl₂ → 2NaCl'],
    h2_cl2: [['H2', 'Cl2'], ['HCl', 'HCl'], 'H₂ + Cl₂ → 2HCl'],
    n2_h2: [['N2', 'H2', 'H2', 'H2'], ['NH3', 'NH3'], 'N₂ + 3H₂ → 2NH₃'],
    s_o2: [['S', 'O2'], ['SO2'], 'S + O₂ → SO₂'],
    so2_o2: [['SO2', 'SO2', 'O2'], ['SO3', 'SO3'], '2SO₂ + O₂ → 2SO₃'],
    nh3_hcl: [['NH3', 'HCl'], ['NH4Cl'], 'NH₃ + HCl → NH₄Cl'],
    p_o2: [['P', 'P', 'P', 'P', 'O2', 'O2', 'O2', 'O2', 'O2'], ['P2O5', 'P2O5'], '4P + 5O₂ → 2P₂O₅']
  });
  Object.assign(ATOMS, { Na: ['Na'], Cl2: ['Cl', 'Cl'], N2: ['N', 'N'], NH3: ['N', 'H', 'H', 'H'], SO2: ['S', 'O', 'O'], SO3: ['S', 'O', 'O', 'O'],
    NH4Cl: ['N', 'H', 'H', 'H', 'H', 'Cl'], P: ['P'], P2O5: ['P', 'P', 'O', 'O', 'O', 'O', 'O'] });
  Object.assign(LABEL, { NH4Cl: 'NH₄Cl', P2O5: 'P₂O₅' });

  const S2 = {
    uz: { orb: "Energetik pog'onachalar", iso: "O'rtacha atom massasi", abund: "Tabiatda", radio: "radioaktiv", trace: "izlar", p: "p⁺", n: "n⁰",
      eneg: "Elektrmanfiylik (Poling shkalasi), Z = 1–20", radius: "Atom radiusi, pm, Z = 1–20",
      kin: { t: "Harorat", c: "Konsentratsiya", rate: "Samarali to'qnashuvlar / s", low: "past", high: "yuqori" },
      eq: { p: "Bosim", t: "Harorat", up: "oshirish", down: "pasaytirish", rm: "NH₃ ni ajratib olish", reset: "Boshlang'ich holat", right: "Muvozanat o'ngga siljidi — NH₃ ko'proq hosil bo'ladi", left: "Muvozanat chapga siljidi — NH₃ parchalanadi", same: "Muvozanat holati", note: "N₂ + 3H₂ ⇌ 2NH₃ + Q (to'g'ri reaksiya ekzotermik, gaz hajmi kamayadi)" },
      contact: { s: "Oltingugurt yoki pirit yondiriladi", clean: "Tozalash va quritish", app: "Kontakt apparati (V₂O₅, ~450 °C)", abs: "Yutish minorasi", oleum: "Oleum → sulfat kislota", so2: "SO₂", so3: "SO₃" },
      ncyc: { air: "Havodagi N₂", fix: "Azot fiksatsiyasi (tuganak bakteriyalar, chaqmoq)", soil: "Tuproqdagi nitratlar va ammoniy", plant: "O'simliklar oqsil hosil qiladi", animal: "Hayvonlar o'simlik bilan oziqlanadi", decay: "Chirish — ammoniy qaytadi", denit: "Denitrifikatsiya — N₂ havoga qaytadi", fert: "Mineral o'g'itlar" } },
    en: { orb: "Energy sublevels", iso: "Average atomic mass", abund: "In nature", radio: "radioactive", trace: "traces", p: "p⁺", n: "n⁰",
      eneg: "Electronegativity (Pauling scale), Z = 1–20", radius: "Atomic radius, pm, Z = 1–20",
      kin: { t: "Temperature", c: "Concentration", rate: "Effective collisions / s", low: "low", high: "high" },
      eq: { p: "Pressure", t: "Temperature", up: "raise", down: "lower", rm: "Remove NH₃", reset: "Reset", right: "Equilibrium shifts right — more NH₃ forms", left: "Equilibrium shifts left — NH₃ breaks down", same: "At equilibrium", note: "N₂ + 3H₂ ⇌ 2NH₃ + Q (forward reaction is exothermic and reduces gas volume)" },
      contact: { s: "Sulfur or pyrite is burned", clean: "Cleaning and drying", app: "Contact apparatus (V₂O₅, ~450 °C)", abs: "Absorption tower", oleum: "Oleum → sulfuric acid", so2: "SO₂", so3: "SO₃" },
      ncyc: { air: "N₂ in the air", fix: "Nitrogen fixation (root-nodule bacteria, lightning)", soil: "Nitrates and ammonium in soil", plant: "Plants build proteins", animal: "Animals eat plants", decay: "Decay returns ammonium", denit: "Denitrification returns N₂ to the air", fert: "Mineral fertilisers" } },
    ru: { orb: "Энергетические подуровни", iso: "Средняя атомная масса", abund: "В природе", radio: "радиоактивен", trace: "следы", p: "p⁺", n: "n⁰",
      eneg: "Электроотрицательность (шкала Полинга), Z = 1–20", radius: "Атомный радиус, пм, Z = 1–20",
      kin: { t: "Температура", c: "Концентрация", rate: "Эффективных столкновений / с", low: "низкая", high: "высокая" },
      eq: { p: "Давление", t: "Температура", up: "повысить", down: "понизить", rm: "Отвести NH₃", reset: "Сбросить", right: "Равновесие сместилось вправо — образуется больше NH₃", left: "Равновесие сместилось влево — NH₃ разлагается", same: "Состояние равновесия", note: "N₂ + 3H₂ ⇌ 2NH₃ + Q (прямая реакция экзотермическая, объём газов уменьшается)" },
      contact: { s: "Сжигание серы или пирита", clean: "Очистка и осушка", app: "Контактный аппарат (V₂O₅, ~450 °C)", abs: "Поглотительная башня", oleum: "Олеум → серная кислота", so2: "SO₂", so3: "SO₃" },
      ncyc: { air: "N₂ воздуха", fix: "Фиксация азота (клубеньковые бактерии, молния)", soil: "Нитраты и аммоний в почве", plant: "Растения строят белки", animal: "Животные едят растения", decay: "Гниение возвращает аммоний", denit: "Денитрификация возвращает N₂ в воздух", fert: "Минеральные удобрения" } }
  };
  const CATC = { alkali: '#ff5d73', alkaline: '#ffb454', transition: '#4dd2ff', post: '#7ee787', metalloid: '#5af2c4', nonmetal: '#6ea8ff', halogen: '#ffd24d', noble: '#c08bff', lanthanide: '#ff8ad8', actinide: '#ff7a9c' };

  // mini periodic table with some elements highlighted
  function ptable(host, spec, ctx) {
    const hl = new Set(spec.hl || []), E = ctx.elements || [];
    const cells = E.map((e) => { const on = hl.has(e.sym), c = CATC[e.cat] || '#8b95b5';
      return '<div title="' + e.z + ' ' + esc(e.name[ctx.lang] || e.name.en) + '" style="grid-column:' + e.x + ';grid-row:' + (e.y > 7 ? e.y + 0.0 : e.y) + ';aspect-ratio:1;border-radius:4px;display:flex;align-items:center;justify-content:center;font:600 ' + (on ? 11 : 9) + 'px Space Grotesk,sans-serif;'
        + (on ? 'background:' + c + ';color:#0b1020;box-shadow:0 0 10px ' + c + ';transform:scale(1.08);z-index:2' : 'background:' + c + '1f;color:var(--muted);opacity:.55') + '">' + e.sym + '</div>'; }).join('');
    host.innerHTML = card('<div style="display:grid;grid-template-columns:repeat(18,minmax(0,1fr));grid-template-rows:repeat(7,auto) 8px repeat(2,auto);gap:3px">' + cells + '</div>');
  }

  // energy sublevel diagram: boxes per orbital, arrows filled by Hund's rule, in filling order
  function orbitals(host, spec, ctx) {
    const el = (ctx.elements || []).find((e) => e.sym === spec.el); if (!el) return;
    const T2 = S2[ctx.lang], N = { s: 1, p: 3, d: 5, f: 7 }, LC = { s: '#ff8a5c', p: '#4dd2ff', d: '#7ee787', f: '#c08bff' };
    const subs = el.econf.split(' ').map((t) => { const m = t.match(/^(\d)([spdf])(\d+)$/); return m && { n: +m[1], l: m[2], e: +m[3] }; }).filter(Boolean);
    const rows = subs.slice().reverse().map((sb) => { const k = N[sb.l], box = Array.from({ length: k }, () => '');
      for (let i = 0; i < sb.e; i++) box[i % k] += i < k ? '↑' : '↓';
      return '<div style="display:flex;align-items:center;gap:10px;margin:3px 0"><span style="width:34px;text-align:right;font:600 13px IBM Plex Mono;color:' + LC[sb.l] + '">' + sb.n + sb.l + '</span><div style="display:flex;gap:3px">'
        + box.map((b) => '<span style="width:28px;height:26px;border:1.5px solid ' + LC[sb.l] + ';border-radius:4px;display:flex;align-items:center;justify-content:center;font:700 14px IBM Plex Mono;color:var(--text);letter-spacing:-2px">' + b + '</span>').join('') + '</div>'
        + '<span style="font:12px IBM Plex Mono;color:var(--muted)">' + sb.e + ' e⁻</span></div>'; }).join('');
    const conf = el.econf.replace(/([spdf])(\d+)/g, (m, l, d) => l + d.split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]).join(''));
    host.innerHTML = card('<div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:8px"><b style="color:var(--text)">' + esc(el.sym) + ' (Z = ' + el.z + ') · ' + esc(T2.orb) + '</b><span style="font:13px IBM Plex Mono;color:var(--green)">' + esc(conf) + '</span></div>'
      + '<div style="max-height:380px;overflow:auto">' + rows + '</div>');
  }

  // isotopes of an element: nucleus make-up, abundance, weighted average mass
  const ISO = { H: [[1, 99.985], [2, 0.015], [3, 0]], C: [[12, 98.9], [13, 1.1], [14, 0]], O: [[16, 99.76], [17, 0.04], [18, 0.2]], Cl: [[35, 75.8], [37, 24.2]], U: [[234, 0.005], [235, 0.72], [238, 99.275]] };
  const ZOF = { H: 1, C: 6, O: 8, Cl: 17, U: 92 };
  function isotopes(host, spec, ctx) {
    const el = ISO[spec.el] ? spec.el : 'Cl', L = ctx.lang, T2 = S2[L], z = ZOF[el], list = ISO[el];
    const avg = list.reduce((s, i) => s + i[0] * i[1], 0) / list.reduce((s, i) => s + i[1], 0);
    const nuc = (p, n) => { const tot = Math.min(p + n, 40), pp = Math.round(tot * p / (p + n)); let d = '';
      for (let i = 0; i < tot; i++) { const a = i * 2.4, r = 3.2 * Math.sqrt(i); d += '<circle cx="' + (30 + r * Math.cos(a)).toFixed(1) + '" cy="' + (30 + r * Math.sin(a)).toFixed(1) + '" r="4.2" fill="' + (i < pp ? '#ff5d6e' : '#6f8bff') + '"/>'; }
      return '<svg viewBox="0 0 60 60" style="width:60px;height:60px">' + d + '</svg>'; };
    host.innerHTML = card('<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px">' + list.map((i) => {
      const n = i[0] - z, w = i[1];
      return '<div style="background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 12px;display:flex;gap:10px;align-items:center">' + nuc(z, n)
        + '<div><div style="font:700 18px Space Grotesk;color:var(--text)"><sup style="font-size:11px">' + i[0] + '</sup>' + el + '</div><div style="font:12px IBM Plex Mono;color:var(--muted)">' + T2.p + ' ' + z + ' · ' + T2.n + ' ' + n + '</div>'
        + '<div style="margin-top:4px;font:12px IBM Plex Mono;color:var(--green)">' + (w ? num(w, L, w < 1 ? 3 : 2) + '%' : T2.trace + ', ' + T2.radio) + '</div></div></div>'; }).join('') + '</div>'
      + '<div style="margin-top:10px;font-size:13.5px;color:var(--body)">' + esc(T2.iso) + ': A<sub>r</sub>(' + el + ') ≈ ' + list.filter((i) => i[1]).map((i) => i[0] + '·' + num(i[1] / 100, L, i[1] < 1 ? 5 : 3)).join(' + ') + ' ≈ <b style="color:var(--text)">' + num(avg, L, 2) + '</b></div>');
  }

  // electronegativity / atomic radius across the first 20 elements
  function trend(host, kind, ctx) {
    const E = (ctx.elements || []).slice(0, 20), T2 = S2[ctx.lang], key = kind === 'eneg' ? 'eneg' : 'radius';
    const W = 560, H = 270, pl = 40, pr = 12, pt = 16, pb = 30, vs = E.map((e) => e[key]).filter((v) => v != null), mx = Math.max(...vs);
    const X = (z) => pl + (z - 1) / 19 * (W - pl - pr), Y = (v) => H - pb - v / mx * (H - pt - pb);
    let d = '', pen = false; E.forEach((e) => { const v = e[key]; if (v == null) { pen = false; return; } d += (pen ? 'L' : 'M') + X(e.z) + ' ' + Y(v); pen = true; });
    const dots = E.filter((e) => e[key] != null).map((e) => '<circle cx="' + X(e.z) + '" cy="' + Y(e[key]) + '" r="4" fill="' + (CATC[e.cat] || '#999') + '"><title>' + e.sym + ': ' + e[key] + '</title></circle><text x="' + X(e.z) + '" y="' + (Y(e[key]) - 8) + '" text-anchor="middle" style="fill:var(--muted);font:600 9.5px Space Grotesk">' + e.sym + '</text>').join('');
    host.innerHTML = card('<div style="font-size:12px;color:var(--muted);margin-bottom:4px">' + esc(kind === 'eneg' ? T2.eneg : T2.radius) + '</div><svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block">'
      + [3, 11, 19].map((z) => '<line x1="' + X(z - 0.5) + '" x2="' + X(z - 0.5) + '" y1="' + pt + '" y2="' + (H - pb) + '" style="stroke:var(--line);stroke-dasharray:3 3"/>').join('')
      + '<path d="' + d + '" fill="none" style="stroke:var(--muted);stroke-width:1.4;opacity:.7"/>' + dots
      + [1, 5, 10, 15, 20].map((z) => '<text x="' + X(z) + '" y="' + (H - 10) + '" text-anchor="middle" style="fill:var(--muted);font:10px IBM Plex Mono">' + z + '</text>').join('') + '</svg>');
  }

  // collision model: higher temperature → faster particles and more collisions above the activation energy
  function kinetics(host, spec, ctx) {
    const T2 = S2[ctx.lang].kin;
    host.innerHTML = card('<canvas style="display:block;width:100%;height:220px;border-radius:9px;background:rgba(10,14,30,.85)"></canvas>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10px"><label style="font-size:12px;color:var(--muted)">' + T2.t + ' <input class="k-t" type="range" min="1" max="10" value="4" style="width:100%;accent-color:#ff8a5c"></label>'
      + '<label style="font-size:12px;color:var(--muted)">' + T2.c + ' <input class="k-c" type="range" min="6" max="40" value="16" style="width:100%;accent-color:#4dd2ff"></label></div>'
      + '<div class="k-out" style="margin-top:6px;font:600 15px IBM Plex Mono;color:var(--green)"></div>');
    const cv = host.querySelector('canvas'), c2 = cv.getContext('2d'), tI = host.querySelector('.k-t'), cI = host.querySelector('.k-c'), out = host.querySelector('.k-out');
    let P = [], flashes = [], hits = [], raf = 0, alive = true;
    const reset = () => { const n = +cI.value; P = []; for (let i = 0; i < n * 2; i++) P.push({ x: Math.random(), y: Math.random(), a: Math.random() * 6.283, k: i % 2 }); };
    cI.addEventListener('input', reset); reset();
    const frame = (now) => {
      if (!alive) return;
      const dpr = window.devicePixelRatio || 1, W = cv.width = cv.clientWidth * dpr, H = cv.height = cv.clientHeight * dpr, r = 7 * dpr, T = +tI.value;
      c2.clearRect(0, 0, W, H);
      P.forEach((p) => { const sp = (0.0012 + T * 0.0007) * (0.6 + Math.random() * 0.8); p.x += Math.cos(p.a) * sp; p.y += Math.sin(p.a) * sp * W / H;
        if (p.x < 0 || p.x > 1) { p.a = Math.PI - p.a; p.x = Math.min(1, Math.max(0, p.x)); } if (p.y < 0 || p.y > 1) { p.a = -p.a; p.y = Math.min(1, Math.max(0, p.y)); } });
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) { const A = P[i], B = P[j]; if (A.k === B.k) continue;
        if (Math.hypot((A.x - B.x) * W, (A.y - B.y) * H) < r * 2) { // only energetic enough collisions react
          if (Math.random() < T / 12) { flashes.push({ x: (A.x + B.x) / 2 * W, y: (A.y + B.y) / 2 * H, t: now }); hits.push(now); }
          const t = A.a; A.a = B.a; B.a = t; } }
      flashes = flashes.filter((f) => now - f.t < 400); hits = hits.filter((h) => now - h < 1000);
      flashes.forEach((f) => { c2.beginPath(); c2.arc(f.x, f.y, r * 2.2 * (1 - (now - f.t) / 400) + r, 0, 6.283); c2.fillStyle = 'rgba(255,210,77,.45)'; c2.fill(); });
      P.forEach((p) => { c2.beginPath(); c2.arc(p.x * W, p.y * H, r, 0, 6.283); c2.fillStyle = p.k ? '#ff5d6e' : '#4dd2ff'; c2.fill(); });
      out.textContent = T2.rate + ': ' + hits.length;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    ctx.onDispose(() => { alive = false; cancelAnimationFrame(raf); });
  }

  // Le Chatelier for N2 + 3H2 ⇌ 2NH3 (+Q): a qualitative model of the NH3 share
  function equilibrium(host, spec, ctx) {
    const T2 = S2[ctx.lang].eq, L = ctx.lang; let P = 1, T = 1, msg = T2.same, shown = 0.2;
    const btn = (k, t, c) => '<button data-k="' + k + '" style="border-radius:9px;border:1px solid ' + c + ';background:' + c + '22;color:var(--text);font:600 12.5px Space Grotesk;padding:7px 10px;cursor:pointer">' + t + '</button>';
    host.innerHTML = card('<div style="font:600 14px IBM Plex Mono;color:var(--text);margin-bottom:10px">' + esc(T2.note) + '</div>'
      + '<div style="display:flex;height:34px;border-radius:9px;overflow:hidden;border:1px solid var(--line)"><div class="e-n" style="background:#3a62f0;transition:width .8s"></div><div class="e-h" style="background:#c9ced8;transition:width .8s"></div><div class="e-a" style="background:#2ecc96;transition:width .8s"></div></div>'
      + '<div class="e-l" style="display:flex;justify-content:space-between;font:12px IBM Plex Mono;color:var(--muted);margin-top:4px"></div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px">' + btn('p+', T2.p + ' ↑ ' + T2.up, '#4dd2ff') + btn('p-', T2.p + ' ↓ ' + T2.down, '#4dd2ff') + btn('t+', T2.t + ' ↑ ' + T2.up, '#ff8a5c') + btn('t-', T2.t + ' ↓ ' + T2.down, '#ff8a5c') + btn('rm', T2.rm, '#2ecc96') + btn('r', T2.reset, '#9aa3b8') + '</div>'
      + '<div class="e-m" style="margin-top:10px;font-size:14px;font-weight:600"></div>');
    const upd = () => { const nh3 = Math.max(0.04, Math.min(0.75, 0.2 + 0.12 * (P - 1) - 0.08 * (T - 1))); const rest = 1 - nh3;
      host.querySelector('.e-n').style.width = (rest * 25) + '%'; host.querySelector('.e-h').style.width = (rest * 75) + '%'; host.querySelector('.e-a').style.width = (nh3 * 100) + '%';
      host.querySelector('.e-l').innerHTML = '<span style="color:#6f8bff">N₂ ' + num(rest * 25, L, 0) + '%</span><span>H₂ ' + num(rest * 75, L, 0) + '%</span><span style="color:#2ecc96">NH₃ ' + num(nh3 * 100, L, 0) + '%</span>';
      const m = host.querySelector('.e-m'); m.textContent = msg; m.style.color = msg === T2.right ? 'var(--green)' : msg === T2.left ? 'var(--warn)' : 'var(--muted)'; shown = nh3; };
    host.addEventListener('click', (e) => { const b = e.target.closest('button[data-k]'); if (!b) return; const k = b.dataset.k;
      if (k === 'p+') { P = Math.min(4, P + 1); msg = T2.right; } if (k === 'p-') { P = Math.max(0, P - 1); msg = T2.left; }
      if (k === 't+') { T = Math.min(4, T + 1); msg = T2.left; } if (k === 't-') { T = Math.max(0, T - 1); msg = T2.right; }
      if (k === 'rm') { msg = T2.right; P = Math.min(4, P + 0.5); } if (k === 'r') { P = 1; T = 1; msg = T2.same; } upd(); });
    upd();
  }

  function diagram2(host, spec, ctx) {
    if (spec.kind === 'contact') {
      const D = S2[ctx.lang].contact, box = (x, y, w, h, t, c) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10" style="fill:' + c + '22;stroke:' + c + '"/>' + tx(x + w / 2, y + h + 18, t, { s: 11.5 });
      const ar = (x1, x2, y, lab) => '<path class="pv-flow" d="M' + x1 + ' ' + y + ' L' + x2 + ' ' + y + '" stroke="#2ecc96" stroke-width="2.5" fill="none" marker-end="url(#pvG)"/>' + (lab ? tx((x1 + x2) / 2, y - 8, lab, { s: 12, c: 'var(--green)' }) : '');
      host.innerHTML = svg(700, 230, box(10, 60, 110, 90, D.s, '#ffb454') + '<g class="pv-fl" style="transform-box:fill-box"><path d="M65 140 c-20 -20 -8 -48 0 -62 c8 14 20 42 0 62z" fill="#ffb454"/></g>'
        + ar(124, 170, 105, D.so2) + box(174, 70, 100, 70, D.clean, '#9aa3b8') + ar(278, 324, 105, D.so2)
        + box(328, 40, 120, 130, D.app, '#c08bff') + [70, 100, 130].map((y) => '<rect x="342" y="' + y + '" width="92" height="12" rx="3" fill="#c08bff" opacity=".5"/>').join('')
        + ar(452, 498, 105, D.so3) + box(502, 30, 90, 150, D.abs, '#4dd2ff') + '<path d="M512 150 h70 v20 h-70z" fill="#4dd2ff" opacity=".35"/>'
        + ar(596, 690, 105, '') + tx(645, 140, D.oleum, { s: 11 }));
      return;
    }
    const D = S2[ctx.lang].ncyc, node = (x, y, t, c) => '<rect x="' + (x - 90) + '" y="' + (y - 20) + '" width="180" height="40" rx="10" style="fill:' + c + '22;stroke:' + c + '"/>' + tx(x, y + 4, t, { s: 11.5 });
    const ar = (d, t, tx0, ty0) => '<path class="pv-flow" d="' + d + '" stroke="#2ecc96" stroke-width="2.2" fill="none" marker-end="url(#pvG)"/>' + (t ? tx(tx0, ty0, t, { s: 10.5, c: 'var(--muted)', w: 500 }) : '');
    host.innerHTML = svg(700, 320, node(350, 34, D.air, '#4dd2ff') + node(120, 160, D.soil, '#b08a5a') + node(580, 160, D.plant, '#4fbf5a') + node(350, 286, D.animal, '#ff8a5c')
      + ar('M270 50 C 190 70 140 100 125 136', D.fix, 150, 92) + ar('M212 160 L486 160', '', 0, 0) + ar('M560 182 C 520 250 450 280 444 282', '', 0, 0)
      + ar('M258 286 C 190 280 140 230 126 184', D.decay, 160, 262) + ar('M150 136 C 190 90 260 70 300 56', '', 0, 0) + tx(255, 120, D.denit, { s: 10.5, c: 'var(--muted)', w: 500 })
      + tx(560, 230, D.fert + ' →', { s: 10.5, c: '#ffd24d', w: 600 }));
  }

  // ---------- part 3 additions: dissociation, pH, activity series, metallurgy and industry diagrams ----------
  Object.assign(CPK, { Mg: '#7fd96a', Al: '#b8c2cc', Cu: '#c87533', Ag: '#d8dde4', K: '#8f40d4', Si: '#e8b878' });
  Object.assign(RAD, { Mg: 0.5, Al: 0.5, Cu: 0.5, Ag: 0.54, K: 0.6, Si: 0.52 });
  MOL.CO = [[['C', -0.56, 0, 0], ['O', 0.56, 0, 0]], [[0, 1, 3]]];
  Object.assign(RX, {
    caco3_heat: [['CaCO3'], ['CaO', 'CO2'], 'CaCO₃ → CaO + CO₂'],
    fe_cuso4: [['Fe', 'CuSO4'], ['FeSO4', 'Cu'], 'Fe + CuSO₄ → FeSO₄ + Cu'],
    agno3_nacl: [['AgNO3', 'NaCl'], ['AgCl', 'NaNO3'], 'AgNO₃ + NaCl → AgCl↓ + NaNO₃'],
    na_h2o: [['Na', 'Na', 'H2O', 'H2O'], ['NaOH', 'NaOH', 'H2'], '2Na + 2H₂O → 2NaOH + H₂'],
    mg_o2: [['Mg', 'Mg', 'O2'], ['MgO', 'MgO'], '2Mg + O₂ → 2MgO'],
    al_o2: [['Al', 'Al', 'Al', 'Al', 'O2', 'O2', 'O2'], ['Al2O3', 'Al2O3'], '4Al + 3O₂ → 2Al₂O₃'],
    fe2o3_co: [['Fe2O3', 'CO', 'CO', 'CO'], ['Fe', 'Fe', 'CO2', 'CO2', 'CO2'], 'Fe₂O₃ + 3CO → 2Fe + 3CO₂'],
    co2_caoh2: [['CO2', 'CaO2H2'], ['CaCO3', 'H2O'], 'CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O']
  });
  Object.assign(ATOMS, { CaCO3: ['C', 'Ca', 'O', 'O', 'O'], Cu: ['Cu'], CuSO4: ['S', 'Cu', 'O', 'O', 'O', 'O'], FeSO4: ['S', 'Fe', 'O', 'O', 'O', 'O'],
    AgNO3: ['N', 'Ag', 'O', 'O', 'O'], NaNO3: ['N', 'Na', 'O', 'O', 'O'], AgCl: ['Ag', 'Cl'], Mg: ['Mg'], MgO: ['Mg', 'O'], Al: ['Al'],
    Al2O3: ['O', 'Al', 'Al', 'O', 'O'], Fe2O3: ['O', 'Fe', 'Fe', 'O', 'O'], CO: ['C', 'O'] });
  Object.assign(LABEL, { Al2O3: 'Al₂O₃', Fe2O3: 'Fe₂O₃' });

  const S3 = {
    uz: { graphite: ["Grafit — qatlamli panjara", "Qatlam ichida kuchli bog', qatlamlar orasida kuchsiz tortishuv"], sio2: ["Kremniy(IV) oksid SiO₂ — atom panjara", "Har bir Si to'rtta O bilan, har bir O ikkita Si bilan bog'langan"],
      dis: { on: "Elektrolit — lampa yonadi", off: "Noelektrolit — lampa yonmaydi", water: "Suv molekulalari ionlarni o'rab oladi (gidratlanish)", sugar: "Shakar molekulalari" },
      ph: { title: "Eritma muhiti (pH)", acid: "Kislotali", neutral: "Neytral", base: "Ishqoriy", h: "[H⁺]", like: "Shunga o'xshash", salts: "Tuz eritmalari:", litmus: "Lakmus", php: "Fenolftalein", mo: "Metilzarg'aldog'i",
        sub: { stomach: "Me'da shirasi", lemon: "Limon sharbati", vinegar: "Sirka", coffee: "Qahva", rain: "Yomg'ir suvi", water: "Toza suv", blood: "Qon", sea: "Dengiz suvi", soda: "Ichimlik sodasi eritmasi", soap: "Sovun eritmasi", ammonia: "Novshadil spirti", naoh: "O'yuvchi natriy eritmasi" } },
      act: { title: "Metallarning faollik qatori", pick: "Metallni tanlang", with: "Nima bilan?", acid: "Xlorid kislota", water: "Suv", yes: "Reaksiya boradi", no: "Reaksiya bormaydi", more: "← faolroq", less: "kamroq faol →",
        whyAcid: "Qatorda vodoroddan chapda turgan metallar kislotadan vodorodni siqib chiqaradi.", whyNoAcid: "Bu metall vodoroddan o'ngda turadi, shuning uchun xlorid kislotadan vodorodni siqib chiqara olmaydi.",
        whySalt: "Faolroq metall kamroq faol metallni uning tuzi eritmasidan siqib chiqaradi.", whyNoSalt: "Metall tuz tarkibidagi metalldan faolroq emas, shuning uchun uni siqib chiqara olmaydi.",
        whyAlk: "Bu metall shu qadar faolki, tuz eritmasidagi suv bilan reaksiyaga kirishadi: ishqor va vodorod hosil bo'ladi.", same: "Metall o'z tuzi bilan reaksiyaga kirishmaydi.",
        hot: "faqat qizdirilganda", steam: "cho'g'langan holda suv bug'i bilan", film: "oksid parda olib tashlansa", pb: "PbCl₂ kam eriydi va metall sirtini qoplab, reaksiyani to'xtatadi" },
      cond: { title: "Eritmalarning elektr o'tkazuvchanligi", dw: "Distillangan suv", sugar: "Shakar eritmasi", salt: "Osh tuzi eritmasi", acid: "Xlorid kislota" },
      el2: { melt: "NaCl suyuqlanmasi", sol: "CuCl₂ eritmasi", cat: "Katod (−)", an: "Anod (+)", src: "Tok manbai" },
      cor: { t1: "Suv + havo", t2: "Quruq havo", t3: "Qaynatilgan suv + moy", r1: "Zanglaydi", r2: "Zanglamaydi", r3: "Zanglamaydi", prot: "Himoya usullari", p: ["Bo'yash, lak va moy bilan qoplash", "Rux (galvanik), xrom yoki nikel bilan qoplash", "Zanglamaydigan po'lat (Cr, Ni qo'shilgan)", "Faolroq metall (Zn, Mg) protektor sifatida ulash", "Ingibitorlar — korroziyani sekinlashtiruvchi moddalar"], rust: "4Fe + 3O₂ + 6H₂O → 4Fe(OH)₃" },
      hard: { tmp: "Vaqtinchalik qattiqlik", perm: "Doimiy qattiqlik", tmpS: "Ca(HCO₃)₂, Mg(HCO₃)₂", permS: "CaSO₄, MgCl₂, CaCl₂", boil: "Qaynatish", soda: "Soda qo'shish", ion: "Ion almashtirish (kationit)", ionS: "Ca²⁺ smola donachalariga o'tadi, o'rniga Na⁺ chiqadi", ions: "Qattiqlikni Ca²⁺ va Mg²⁺ ionlari beradi" },
      bf: { title: "Domna pechi — cho'yan olish", charge: "Shixta: ruda, koks, ohaktosh", gas: "Domna gazi", air: "Qizdirilgan havo", slag: "Shlak", iron: "Cho'yan", z1: "≈ 400 °C", z2: "≈ 700 °C", z3: "≈ 900 °C", z4: "≈ 1800 °C" },
      cv: { title: "Kislorodli konverter — po'lat olish", o2: "Kislorod (O₂)", pig: "Suyuq cho'yan + temir parchalari", steel: "Po'lat (C < 2%)", gas: "CO gazi", slag: "Shlak (SiO₂, MnO, P birikmalari)", what: "Ortiqcha C, Si, Mn, P, S oksidlanib chiqariladi" },
      sv: { title: "Ammiakli usulda soda olish", brine: "NaCl eritmasi + NH₃", carb: "Karbonizatsiya kolonnasi", filt: "Filtrlash", calc: "Qizdirish (kalsinatsiya)", soda: "Kalsinirlangan soda Na₂CO₃", kiln: "Ohaktosh kuydirish", regen: "NH₃ ni qayta tiklash", back: "qaytadi" },
      cc: { air: "Atmosferadagi CO₂", plant: "O'simliklar — fotosintez", animal: "Odam va hayvonlar — nafas olish", fuel: "Ko'mir, neft, gaz yonishi", ocean: "Okean CO₂ ni eritadi", rock: "Ohaktosh, ko'mir, neft (cho'kindilar)", decay: "Chirish" },
      sil: { sand: "Qum SiO₂", clay: "Tuproq (gil)", lime: "Ohaktosh CaCO₃", soda: "Soda Na₂CO₃", glass: "Shisha", cement: "Sement", ceram: "Keramika", glassT: "≈ 1500 °C da suyuqlantiriladi", cementT: "≈ 1450 °C da kuydiriladi", ceramT: "≈ 1000 °C da pishiriladi", ex: "g'isht, chinni, kafel" } },
    en: { graphite: ["Graphite — a layered lattice", "Strong bonds within a layer, weak attraction between layers"], sio2: ["Silicon(IV) oxide SiO₂ — an atomic lattice", "Each Si is bonded to four O, each O to two Si"],
      dis: { on: "Electrolyte — the lamp lights", off: "Non-electrolyte — the lamp stays off", water: "Water molecules surround the ions (hydration)", sugar: "Sugar molecules" },
      ph: { title: "Acidity of a solution (pH)", acid: "Acidic", neutral: "Neutral", base: "Alkaline", h: "[H⁺]", like: "Similar to", salts: "Salt solutions:", litmus: "Litmus", php: "Phenolphthalein", mo: "Methyl orange",
        sub: { stomach: "Stomach acid", lemon: "Lemon juice", vinegar: "Vinegar", coffee: "Coffee", rain: "Rainwater", water: "Pure water", blood: "Blood", sea: "Sea water", soda: "Baking soda solution", soap: "Soap solution", ammonia: "Household ammonia", naoh: "Caustic soda solution" } },
      act: { title: "Activity series of metals", pick: "Pick a metal", with: "With what?", acid: "Hydrochloric acid", water: "Water", yes: "A reaction takes place", no: "No reaction", more: "← more active", less: "less active →",
        whyAcid: "Metals to the left of hydrogen in the series push hydrogen out of acids.", whyNoAcid: "This metal is to the right of hydrogen, so it cannot push hydrogen out of hydrochloric acid.",
        whySalt: "A more active metal pushes a less active metal out of a solution of its salt.", whyNoSalt: "The metal is not more active than the metal in the salt, so it cannot displace it.",
        whyAlk: "This metal is so active that it reacts with the water of the solution instead, giving an alkali and hydrogen.", same: "A metal does not react with its own salt.",
        hot: "only when heated", steam: "red-hot, with steam", film: "once the oxide film is removed", pb: "PbCl₂ is poorly soluble and coats the metal, stopping the reaction" },
      cond: { title: "Electrical conductivity of solutions", dw: "Distilled water", sugar: "Sugar solution", salt: "Table salt solution", acid: "Hydrochloric acid" },
      el2: { melt: "Molten NaCl", sol: "CuCl₂ solution", cat: "Cathode (−)", an: "Anode (+)", src: "Power source" },
      cor: { t1: "Water + air", t2: "Dry air", t3: "Boiled water + oil", r1: "Rusts", r2: "No rust", r3: "No rust", prot: "Ways to protect", p: ["Paint, varnish or grease", "Coating with zinc (galvanising), chromium or nickel", "Stainless steel (with Cr and Ni)", "Connecting a more active metal (Zn, Mg) as a protector", "Inhibitors — substances that slow corrosion"], rust: "4Fe + 3O₂ + 6H₂O → 4Fe(OH)₃" },
      hard: { tmp: "Temporary hardness", perm: "Permanent hardness", tmpS: "Ca(HCO₃)₂, Mg(HCO₃)₂", permS: "CaSO₄, MgCl₂, CaCl₂", boil: "Boiling", soda: "Adding soda", ion: "Ion exchange (cation resin)", ionS: "Ca²⁺ moves onto the resin beads and Na⁺ comes out instead", ions: "Hardness is caused by Ca²⁺ and Mg²⁺ ions" },
      bf: { title: "Blast furnace — making pig iron", charge: "Charge: ore, coke, limestone", gas: "Furnace gas", air: "Hot air blast", slag: "Slag", iron: "Pig iron", z1: "≈ 400 °C", z2: "≈ 700 °C", z3: "≈ 900 °C", z4: "≈ 1800 °C" },
      cv: { title: "Oxygen converter — making steel", o2: "Oxygen (O₂)", pig: "Molten pig iron + scrap", steel: "Steel (C < 2%)", gas: "CO gas", slag: "Slag (SiO₂, MnO, P compounds)", what: "Extra C, Si, Mn, P and S are oxidised and removed" },
      sv: { title: "Ammonia-soda (Solvay) process", brine: "NaCl brine + NH₃", carb: "Carbonating tower", filt: "Filtering", calc: "Heating (calcining)", soda: "Soda ash Na₂CO₃", kiln: "Lime kiln", regen: "NH₃ recovery", back: "recycled" },
      cc: { air: "CO₂ in the atmosphere", plant: "Plants — photosynthesis", animal: "People and animals — breathing", fuel: "Burning coal, oil, gas", ocean: "Oceans dissolve CO₂", rock: "Limestone, coal, oil (sediments)", decay: "Decay" },
      sil: { sand: "Sand SiO₂", clay: "Clay", lime: "Limestone CaCO₃", soda: "Soda Na₂CO₃", glass: "Glass", cement: "Cement", ceram: "Ceramics", glassT: "melted at ≈ 1500 °C", cementT: "burnt at ≈ 1450 °C", ceramT: "fired at ≈ 1000 °C", ex: "bricks, porcelain, tiles" } },
    ru: { graphite: ["Графит — слоистая решётка", "Прочные связи внутри слоя, слабое притяжение между слоями"], sio2: ["Оксид кремния(IV) SiO₂ — атомная решётка", "Каждый Si связан с четырьмя O, каждый O — с двумя Si"],
      dis: { on: "Электролит — лампа горит", off: "Неэлектролит — лампа не горит", water: "Молекулы воды окружают ионы (гидратация)", sugar: "Молекулы сахара" },
      ph: { title: "Среда раствора (pH)", acid: "Кислая", neutral: "Нейтральная", base: "Щелочная", h: "[H⁺]", like: "Похоже на", salts: "Растворы солей:", litmus: "Лакмус", php: "Фенолфталеин", mo: "Метилоранж",
        sub: { stomach: "Желудочный сок", lemon: "Лимонный сок", vinegar: "Уксус", coffee: "Кофе", rain: "Дождевая вода", water: "Чистая вода", blood: "Кровь", sea: "Морская вода", soda: "Раствор питьевой соды", soap: "Мыльный раствор", ammonia: "Нашатырный спирт", naoh: "Раствор едкого натра" } },
      act: { title: "Ряд активности металлов", pick: "Выберите металл", with: "С чем?", acid: "Соляная кислота", water: "Вода", yes: "Реакция идёт", no: "Реакция не идёт", more: "← активнее", less: "менее активны →",
        whyAcid: "Металлы левее водорода в ряду вытесняют водород из кислот.", whyNoAcid: "Этот металл стоит правее водорода и не вытесняет водород из соляной кислоты.",
        whySalt: "Более активный металл вытесняет менее активный из раствора его соли.", whyNoSalt: "Металл не активнее металла в соли и не может его вытеснить.",
        whyAlk: "Этот металл настолько активен, что реагирует с водой раствора: образуются щёлочь и водород.", same: "Металл не реагирует с собственной солью.",
        hot: "только при нагревании", steam: "в раскалённом виде с водяным паром", film: "если снять оксидную плёнку", pb: "PbCl₂ малорастворим и покрывает металл, останавливая реакцию" },
      cond: { title: "Электропроводность растворов", dw: "Дистиллированная вода", sugar: "Раствор сахара", salt: "Раствор поваренной соли", acid: "Соляная кислота" },
      el2: { melt: "Расплав NaCl", sol: "Раствор CuCl₂", cat: "Катод (−)", an: "Анод (+)", src: "Источник тока" },
      cor: { t1: "Вода + воздух", t2: "Сухой воздух", t3: "Кипячёная вода + масло", r1: "Ржавеет", r2: "Не ржавеет", r3: "Не ржавеет", prot: "Способы защиты", p: ["Окраска, лак, смазка", "Покрытие цинком (оцинковка), хромом или никелем", "Нержавеющая сталь (с Cr и Ni)", "Подключение более активного металла (Zn, Mg) — протектора", "Ингибиторы — вещества, замедляющие коррозию"], rust: "4Fe + 3O₂ + 6H₂O → 4Fe(OH)₃" },
      hard: { tmp: "Временная жёсткость", perm: "Постоянная жёсткость", tmpS: "Ca(HCO₃)₂, Mg(HCO₃)₂", permS: "CaSO₄, MgCl₂, CaCl₂", boil: "Кипячение", soda: "Добавление соды", ion: "Ионный обмен (катионит)", ionS: "Ca²⁺ переходит в зёрна смолы, взамен выходит Na⁺", ions: "Жёсткость создают ионы Ca²⁺ и Mg²⁺" },
      bf: { title: "Доменная печь — получение чугуна", charge: "Шихта: руда, кокс, известняк", gas: "Доменный газ", air: "Горячее дутьё", slag: "Шлак", iron: "Чугун", z1: "≈ 400 °C", z2: "≈ 700 °C", z3: "≈ 900 °C", z4: "≈ 1800 °C" },
      cv: { title: "Кислородный конвертер — получение стали", o2: "Кислород (O₂)", pig: "Жидкий чугун + металлолом", steel: "Сталь (C < 2%)", gas: "Газ CO", slag: "Шлак (SiO₂, MnO, соединения P)", what: "Лишние C, Si, Mn, P, S окисляются и удаляются" },
      sv: { title: "Аммиачный способ получения соды", brine: "Рассол NaCl + NH₃", carb: "Карбонизационная колонна", filt: "Фильтрование", calc: "Прокаливание (кальцинация)", soda: "Кальцинированная сода Na₂CO₃", kiln: "Обжиг известняка", regen: "Регенерация NH₃", back: "возвращается" },
      cc: { air: "CO₂ атмосферы", plant: "Растения — фотосинтез", animal: "Люди и животные — дыхание", fuel: "Сжигание угля, нефти, газа", ocean: "Океан растворяет CO₂", rock: "Известняк, уголь, нефть (осадки)", decay: "Гниение" },
      sil: { sand: "Песок SiO₂", clay: "Глина", lime: "Известняк CaCO₃", soda: "Сода Na₂CO₃", glass: "Стекло", cement: "Цемент", ceram: "Керамика", glassT: "плавят при ≈ 1500 °C", cementT: "обжигают при ≈ 1450 °C", ceramT: "обжигают при ≈ 1000 °C", ex: "кирпич, фарфор, плитка" } }
  };

  // graphite layers and the SiO₂ network, built with the same look as molecule3d
  function lattice3(host, spec, ctx) {
    const st = stage(host, ctx, 320), THREE = st.THREE, g = new THREE.Group(); st.scene.add(g);
    const sphere = (el, p, r) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), new THREE.MeshStandardMaterial({ color: lin(THREE, CPK[el] || '#ccc'), roughness: 0.35 })); m.position.set(...p); g.add(m); };
    const stick = (a, b, r, col, op) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 12), new THREE.MeshStandardMaterial({ color: lin(THREE, col), roughness: 0.5, transparent: op != null, opacity: op == null ? 1 : op }));
      m.position.copy(A.clone().add(B).multiplyScalar(0.5)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(m); };
    const T = S3[ctx.lang];
    if (spec.mol === 'graphite') {
      // three honeycomb layers, every other one shifted (ABA stacking); dotted links show the weak attraction
      const a = 0.9, gap = 1.7, layers = [-1, 0, 1];
      layers.forEach((li) => { const P = [], sh = li === 0 ? a : 0;
        for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const x = i * a * 1.5, z = j * a * Math.sqrt(3) + (i % 2 ? a * Math.sqrt(3) / 2 : 0);
          [[x - a / 2, z], [x + a / 2, z]].forEach((q) => { if (Math.hypot(q[0], q[1]) < 3.1) P.push([q[0] + sh, li * gap, q[1]]); }); }
        const U = P.filter((p, i) => P.findIndex((q) => Math.hypot(q[0] - p[0], q[2] - p[2]) < 0.05) === i);
        U.forEach((p) => sphere('C', p, 0.2));
        for (let i = 0; i < U.length; i++) for (let j = i + 1; j < U.length; j++) if (Math.abs(Math.hypot(U[i][0] - U[j][0], U[i][2] - U[j][2]) - a) < 0.05) stick(U[i], U[j], 0.06, '#9aa3b5'); });
      for (let k = 0; k < 6; k++) { const ang = k * Math.PI / 3, x = Math.cos(ang) * 1.6, z = Math.sin(ang) * 1.6; stick([x, -gap, z], [x, gap, z], 0.015, '#6f8bff', 0.45); }
      st.start(9.5, () => { g.rotation.y += 0.004; });
    } else {
      // β-cristobalite-like net: Si on the diamond positions, O halfway along every Si–Si link
      const a = 4.2, P = [], F = [[0, 0, 0], [0, 0.5, 0.5], [0.5, 0, 0.5], [0.5, 0.5, 0]];
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) F.forEach((f) => [[0, 0, 0], [0.25, 0.25, 0.25]].forEach((b) => {
        const x = f[0] + b[0] + i, y = f[1] + b[1] + j, z = f[2] + b[2] + k; if (x <= 1.01 && y <= 1.01 && z <= 1.01) P.push([x, y, z]); }));
      const U = P.filter((p, i) => P.findIndex((q) => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) < 0.01) === i), used = new Set(), B = [];
      for (let i = 0; i < U.length; i++) for (let j = i + 1; j < U.length; j++) if (Math.abs(Math.hypot(U[i][0] - U[j][0], U[i][1] - U[j][1], U[i][2] - U[j][2]) - 0.433) < 0.02) { B.push([i, j]); used.add(i); used.add(j); }
      const pos = (p) => p.map((v) => (v - 0.5) * a);
      U.forEach((p, i) => { if (used.has(i)) sphere('Si', pos(p), 0.3); });
      B.forEach(([i, j]) => { const A = pos(U[i]), C = pos(U[j]), M = A.map((v, k) => (v + C[k]) / 2); sphere('O', M, 0.22); stick(A, M, 0.06, '#c9ced8'); stick(M, C, 0.06, '#c9ced8'); });
      st.start(9, () => { g.rotation.y += 0.004; });
    }
    const t = spec.mol === 'graphite' ? T.graphite : T.sio2;
    host.insertAdjacentHTML('beforeend', '<div style="position:absolute;left:12px;top:10px;font:600 13px Space Grotesk,sans-serif;color:#eef2ff;z-index:2">' + esc(t[0]) + '<div style="margin-top:5px;font:11px IBM Plex Mono,monospace;color:rgba(220,228,246,.85)">' + esc(t[1]) + '</div></div>');
  }

  // a substance dissolving in water: the crystal or molecules break up into hydrated ions, a lamp shows conductivity
  const DIS = {
    NaCl: { eq: 'NaCl → Na⁺ + Cl⁻', ions: [['Na⁺', '#a066f0', 1], ['Cl⁻', '#2fd14b', 1]] },
    HCl: { eq: 'HCl → H⁺ + Cl⁻', ions: [['H⁺', '#f4f6f8', 1], ['Cl⁻', '#2fd14b', 1]] },
    NaOH: { eq: 'NaOH → Na⁺ + OH⁻', ions: [['Na⁺', '#a066f0', 1], ['OH⁻', '#ff5d6e', 1]] },
    CuSO4: { eq: 'CuSO₄ → Cu²⁺ + SO₄²⁻', ions: [['Cu²⁺', '#3a8cff', 1], ['SO₄²⁻', '#f2d23c', 1]] },
    sugar: { eq: 'C₁₂H₂₂O₁₁ (aq)', ions: null }
  };
  function dissociation(host, spec, ctx) {
    const D = DIS[spec.s] || DIS.NaCl, T = S3[ctx.lang].dis, on = !!D.ions;
    host.innerHTML = card('<canvas style="display:block;width:100%;height:250px;border-radius:9px;background:rgba(10,14,30,.85)"></canvas>'
      + '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-top:10px"><div style="font:600 17px IBM Plex Mono,monospace;color:var(--text)">' + esc(D.eq) + '</div>'
      + '<div style="font-size:13px;font-weight:600;color:' + (on ? 'var(--green)' : 'var(--warn)') + '">' + esc(on ? T.on : T.off) + '</div></div>'
      + '<div style="margin-top:4px;font-size:12.5px;color:var(--muted)">' + esc(on ? T.water : T.sugar) + '</div>');
    const cv = host.querySelector('canvas'), c2 = cv.getContext('2d');
    // 16 formula units: in a block at first, then spread through the beaker
    const N = 16, P = [];
    for (let i = 0; i < N; i++) { const gx = i % 4, gy = Math.floor(i / 4);
      (on ? [0, 1] : [0]).forEach((k) => P.push({ k, hx: gx * 2 + k, hy: gy, x: Math.random(), y: 0.35 + Math.random() * 0.55, vx: (Math.random() - 0.5) * 0.004, vy: (Math.random() - 0.5) * 0.004 })); }
    let raf = 0, alive = true; const t0 = performance.now();
    const frame = (now) => {
      if (!alive) return;
      const dpr = window.devicePixelRatio || 1, W = cv.width = cv.clientWidth * dpr, H = cv.height = cv.clientHeight * dpr;
      const bx = W * 0.12, bw = W * 0.76, by = H * 0.3, bh = H * 0.64, r = Math.min(W, H) / 30, t = ((now - t0) / 1000) % 9, e = Math.min(1, Math.max(0, (t - 1) / 3));
      c2.clearRect(0, 0, W, H);
      // beaker and water
      c2.fillStyle = 'rgba(77,160,255,.14)'; c2.fillRect(bx, by + bh * 0.08, bw, bh * 0.92);
      c2.strokeStyle = 'rgba(220,228,246,.7)'; c2.lineWidth = 2 * dpr; c2.beginPath(); c2.moveTo(bx, by); c2.lineTo(bx, by + bh); c2.lineTo(bx + bw, by + bh); c2.lineTo(bx + bw, by); c2.stroke();
      // electrodes, wires and the lamp
      const ex1 = bx + bw * 0.08, ex2 = bx + bw * 0.92, lx = W / 2, ly = H * 0.12, glow = on && e > 0.5 ? (e - 0.5) * 2 : 0;
      c2.fillStyle = '#5d6270'; c2.fillRect(ex1 - 4 * dpr, by - 10 * dpr, 8 * dpr, bh * 0.75); c2.fillRect(ex2 - 4 * dpr, by - 10 * dpr, 8 * dpr, bh * 0.75);
      c2.strokeStyle = 'rgba(200,212,238,.6)'; c2.beginPath(); c2.moveTo(ex1, by - 10 * dpr); c2.lineTo(ex1, ly); c2.lineTo(lx - r, ly); c2.moveTo(lx + r, ly); c2.lineTo(ex2, ly); c2.lineTo(ex2, by - 10 * dpr); c2.stroke();
      if (glow) { const gr = c2.createRadialGradient(lx, ly, 0, lx, ly, r * 5); gr.addColorStop(0, 'rgba(255,220,90,' + (0.8 * glow) + ')'); gr.addColorStop(1, 'rgba(255,220,90,0)'); c2.fillStyle = gr; c2.beginPath(); c2.arc(lx, ly, r * 5, 0, 6.283); c2.fill(); }
      c2.beginPath(); c2.arc(lx, ly, r * 1.1, 0, 6.283); c2.fillStyle = glow ? '#ffe27a' : 'rgba(160,170,190,.35)'; c2.fill(); c2.strokeStyle = 'rgba(220,228,246,.8)'; c2.stroke();
      // particles: e = 0 packed crystal at the bottom, e = 1 free and drifting
      P.forEach((p) => {
        p.x += p.vx; p.y += p.vy; if (p.x < 0.05 || p.x > 0.95) p.vx *= -1; if (p.y < 0.2 || p.y > 0.95) p.vy *= -1;
        const cx = bx + bw * 0.38 + p.hx * r * 1.9 * (on ? 1 : 1.6) - (on ? 0 : bw * 0.04), cy = by + bh - r * 1.4 - p.hy * r * 1.9;
        const fx = bx + bw * (0.1 + p.x * 0.8), fy = by + bh * p.y, x = cx + (fx - cx) * e, y = cy + (fy - cy) * e;
        if (on && e > 0.2) for (let w = 0; w < 4; w++) { const a = w * 1.57 + now / 900; c2.beginPath(); c2.arc(x + Math.cos(a) * r * 1.7, y + Math.sin(a) * r * 1.7, r * 0.38, 0, 6.283); c2.fillStyle = 'rgba(255,93,110,' + 0.55 * e + ')'; c2.fill(); }
        if (on) { const ion = D.ions[p.k]; c2.beginPath(); c2.arc(x, y, r * (p.k ? 1.05 : 0.8), 0, 6.283); c2.fillStyle = ion[1]; c2.fill();
          if (e > 0.2) { c2.fillStyle = ion[1] === '#f4f6f8' || ion[1] === '#f2d23c' ? '#111' : '#fff'; c2.font = '600 ' + (r * 0.8) + 'px Space Grotesk'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillText(ion[0].replace(/[⁺⁻²]/g, ''), x, y); } }
        else { c2.beginPath(); c2.ellipse(x, y, r * 1.3, r * 0.8, 0, 0, 6.283); c2.fillStyle = '#f2efe6'; c2.fill(); }
      });
      if (on) { c2.font = (11 * dpr) + 'px IBM Plex Mono'; c2.textAlign = 'left'; D.ions.forEach((ion, i) => { c2.fillStyle = ion[1]; c2.beginPath(); c2.arc(12 * dpr, (18 + i * 18) * dpr, 5 * dpr, 0, 6.283); c2.fill(); c2.fillStyle = 'rgba(220,228,246,.85)'; c2.fillText(ion[0], 22 * dpr, (22 + i * 18) * dpr); }); }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    ctx.onDispose(() => { alive = false; cancelAnimationFrame(raf); });
  }

  // pH scale with a slider, everyday examples, salt solutions and indicator colours
  function phscale(host, spec, ctx) {
    const L = ctx.lang, T = S3[L].ph, U = T.sub;
    const EX = [[1.5, 'stomach'], [2.2, 'lemon'], [2.9, 'vinegar'], [5, 'coffee'], [5.6, 'rain'], [7, 'water'], [7.4, 'blood'], [8.1, 'sea'], [8.3, 'soda'], [10, 'soap'], [11.6, 'ammonia'], [13.5, 'naoh']];
    const SALT = [['NaCl', 7], ['Na₂CO₃', 11.6], ['NH₄Cl', 5.1], ['AlCl₃', 3.0], ['CH₃COONa', 8.9], ['ZnCl₂', 4.6]];
    const col = (p) => 'hsl(' + Math.round(p / 14 * 260) + ',85%,52%)';
    host.innerHTML = card('<div style="font-size:12px;color:var(--muted);margin-bottom:6px">' + esc(T.title) + '</div>'
      + '<div style="height:26px;border-radius:8px;background:linear-gradient(90deg,' + Array.from({ length: 15 }, (_, i) => col(i)).join(',') + ')"></div>'
      + '<input class="ph-r" type="range" min="0" max="14" step="0.1" value="7" style="width:100%;margin:6px 0 2px;accent-color:#2ecc96">'
      + '<div style="display:flex;justify-content:space-between;font:11px IBM Plex Mono;color:var(--muted)">' + Array.from({ length: 15 }, (_, i) => '<span>' + i + '</span>').join('') + '</div>'
      + '<div class="ph-o" style="margin-top:12px;display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center"></div>'
      + '<div style="margin-top:12px;display:flex;flex-wrap:wrap;align-items:center;gap:6px"><span style="font-size:12px;color:var(--muted)">' + esc(T.salts) + '</span>'
      + SALT.map((s) => '<button data-p="' + s[1] + '" style="border-radius:16px;border:1px solid var(--line);background:var(--btn);color:var(--text);font:12.5px IBM Plex Mono;padding:5px 10px;cursor:pointer">' + s[0] + '</button>').join('') + '</div>');
    const r = host.querySelector('.ph-r'), out = host.querySelector('.ph-o');
    const ind = (p) => [[T.litmus, p < 5 ? '#e63a4a' : p <= 8 ? '#8a5ad0' : '#3a6ae6'], [T.php, p < 8.2 ? '#f4f4f4' : '#e0207a'], [T.mo, p < 3.1 ? '#e6455a' : p < 4.4 ? '#f08a2a' : '#f2d23c']];
    const upd = () => { const p = +r.value, near = EX.reduce((a, b) => (Math.abs(b[0] - p) < Math.abs(a[0] - p) ? b : a)), md = p < 6.9 ? T.acid : p > 7.1 ? T.base : T.neutral;
      const hE = -Math.round(p);
      out.innerHTML = '<div style="width:74px;height:74px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:' + col(p) + ';color:#0b1020;font:700 22px IBM Plex Mono;box-shadow:0 0 18px ' + col(p) + '">' + num(p, L, 1) + '<span style="font:600 10px Space Grotesk">pH</span></div>'
        + '<div><div style="font-size:16px;font-weight:700;color:var(--text)">' + esc(md) + '</div><div style="font:12.5px IBM Plex Mono;color:var(--muted);margin-top:2px">' + T.h + ' ≈ 10' + String(hE).split('').map((c) => (c === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c])).join('') + ' mol/L</div>'
        + '<div style="font-size:13px;color:var(--body);margin-top:4px">' + esc(T.like) + ': <b>' + esc(U[near[1]]) + '</b> (pH ≈ ' + num(near[0], L, 1) + ')</div>'
        + '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px">' + ind(p).map((x) => '<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted)"><span style="width:16px;height:16px;border-radius:5px;border:1px solid var(--line);background:' + x[1] + '"></span>' + esc(x[0]) + '</span>').join('') + '</div></div>'; };
    r.addEventListener('input', upd);
    host.querySelectorAll('button[data-p]').forEach((b) => b.addEventListener('click', () => { r.value = b.dataset.p; upd(); }));
    upd();
  }

  // activity series: does metal M react with acid, water or a salt solution?
  const ACT = [['K', 1], ['Ca', 2], ['Na', 1], ['Mg', 2], ['Al', 3], ['Zn', 2], ['Fe', 2], ['Ni', 2], ['Sn', 2], ['Pb', 2], ['H', 0], ['Cu', 2], ['Hg', 2], ['Ag', 1], ['Pt', 2], ['Au', 3]];
  const SALTS = { CuSO4: ['Cu', 'SO4', 2], AgNO3: ['Ag', 'NO3', 1], FeSO4: ['Fe', 'SO4', 2], ZnSO4: ['Zn', 'SO4', 2] };
  function activity(host, spec, ctx) {
    const T = S3[ctx.lang].act, idx = (s) => ACT.findIndex((a) => a[0] === s);
    let M = 'Zn', R = 'HCl';
    const chip = (on, c) => 'border-radius:9px;border:1px solid ' + (on ? c : 'var(--line)') + ';background:' + (on ? c + '33' : 'var(--btn)') + ';color:var(--text);font:600 13px Space Grotesk;padding:6px 9px;cursor:pointer;min-width:38px';
    const salt = (m, an, v) => { // sulfate or nitrate of metal m with valence v
      if (an === 'SO4') return v === 1 ? m + '2SO4' : v === 2 ? m + 'SO4' : m + '2(SO4)3';
      return v === 1 ? m + 'NO3' : m + '(NO3)' + v; };
    const coef = (k, f) => (k === 1 ? '' : k) + pretty(f);
    const solve = () => {
      const m = ACT[idx(M)], v = m[1], left = idx(M) < idx('H');
      if (R === 'HCl') { if (!left) return [false, T.whyNoAcid];
        const eq = v === 1 ? '2' + M + ' + 2HCl → 2' + pretty(M + 'Cl') + ' + H₂' : v === 2 ? M + ' + 2HCl → ' + pretty(M + 'Cl2') + ' + H₂' : '2' + M + ' + 6HCl → 2' + pretty(M + 'Cl3') + ' + 3H₂';
        return [true, T.whyAcid + (M === 'Pb' ? ' (' + T.pb + ')' : ''), eq]; }
      if (R === 'H2O') {
        const W = { K: '2K + 2H₂O → 2KOH + H₂', Na: '2Na + 2H₂O → 2NaOH + H₂', Ca: 'Ca + 2H₂O → Ca(OH)₂ + H₂', Mg: 'Mg + 2H₂O → Mg(OH)₂ + H₂ (' + T.hot + ')',
          Al: '2Al + 6H₂O → 2Al(OH)₃ + 3H₂ (' + T.film + ')', Zn: 'Zn + H₂O → ZnO + H₂ (' + T.steam + ')', Fe: '3Fe + 4H₂O → Fe₃O₄ + 4H₂ (' + T.steam + ')' };
        return W[M] ? [true, '', W[M]] : [false, ''];
      }
      const s = SALTS[R]; if (s[0] === M) return [false, T.same];
      if (['K', 'Ca', 'Na'].includes(M)) return [true, T.whyAlk, M === 'Ca' ? 'Ca + 2H₂O → Ca(OH)₂ + H₂' : '2' + M + ' + 2H₂O → 2' + M + 'OH + H₂'];
      if (idx(M) > idx(s[0])) return [false, T.whyNoSalt];
      // a·M + c·(X salt) → b·(M salt) + d·X; a(n) = anions and m(n) = metal atoms per salt formula
      const w = s[2], sx = salt(s[0], s[1], w), sm = salt(M, s[1], v);
      const aX = s[1] === 'SO4' ? (w === 1 ? 1 : w === 2 ? 1 : 3) : w, aM = s[1] === 'SO4' ? (v === 1 ? 1 : v === 2 ? 1 : 3) : v;
      const mX = s[1] === 'SO4' ? (w === 1 ? 2 : w === 2 ? 1 : 2) : 1, mM = s[1] === 'SO4' ? (v === 1 ? 2 : v === 2 ? 1 : 2) : 1;
      // smallest whole numbers that balance metal M, the anion and metal X
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) for (let d = 1; d <= 6; d++)
        if (a === b * mM && c * aX === b * aM && c * mX === d) return [true, T.whySalt, coef(a, M) + ' + ' + coef(c, sx) + ' → ' + coef(b, sm) + ' + ' + coef(d, s[0])];
      return [true, T.whySalt];
    };
    const draw = () => {
      const res = solve();
      host.innerHTML = card('<div style="font-size:12px;color:var(--muted);margin-bottom:6px">' + esc(T.title) + ' · ' + esc(T.pick) + '</div>'
        + '<div style="display:flex;flex-wrap:wrap;gap:4px">' + ACT.map((a, i) => a[0] === 'H' ? '<span style="align-self:center;padding:6px 8px;border-radius:9px;border:1px dashed var(--muted);color:var(--muted);font:700 13px Space Grotesk">(H)</span>'
          : '<button data-m="' + a[0] + '" style="' + chip(a[0] === M, i < 10 ? '#2ecc96' : '#ffb454') + '">' + a[0] + '</button>').join('') + '</div>'
        + '<div style="display:flex;justify-content:space-between;font:11px IBM Plex Mono;color:var(--muted);margin:4px 2px 12px"><span>' + esc(T.more) + '</span><span>' + esc(T.less) + '</span></div>'
        + '<div style="font-size:12px;color:var(--muted);margin-bottom:6px">' + esc(T.with) + '</div><div style="display:flex;flex-wrap:wrap;gap:6px">'
        + [['HCl', T.acid + ' HCl'], ['H2O', T.water + ' H₂O'], ['CuSO4', 'CuSO₄'], ['AgNO3', 'AgNO₃'], ['FeSO4', 'FeSO₄'], ['ZnSO4', 'ZnSO₄']].map((x) => '<button data-r="' + x[0] + '" style="' + chip(x[0] === R, '#4dd2ff') + '">' + esc(x[1]) + '</button>').join('') + '</div>'
        + '<div style="margin-top:14px;padding:12px 14px;border-radius:10px;border:1px solid ' + (res[0] ? 'rgba(46,204,150,.55)' : 'rgba(255,93,110,.5)') + ';background:' + (res[0] ? 'rgba(46,204,150,.1)' : 'rgba(255,93,110,.08)') + '">'
        + '<div style="font-weight:700;color:' + (res[0] ? 'var(--green)' : 'var(--warn)') + '">' + (res[0] ? '✓ ' + esc(T.yes) : '✗ ' + esc(T.no)) + '</div>'
        + (res[2] ? '<div style="margin-top:6px;font:600 16px IBM Plex Mono;color:var(--text)">' + esc(res[2]) + '</div>' : '')
        + (res[1] ? '<div style="margin-top:6px;font-size:13px;color:var(--body)">' + esc(res[1]) + '</div>' : '') + '</div>');
    };
    host.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.m) M = b.dataset.m; if (b.dataset.r) R = b.dataset.r; draw(); });
    draw();
  }

  function diagram3(host, spec, ctx) {
    const T = S3[ctx.lang], k = spec.kind;
    const box = (x, y, w, h, t, c, s) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10" style="fill:' + c + '22;stroke:' + c + '"/>' + (t ? tx(x + w / 2, y + h / 2 + 4, t, { s: s || 12 }) : '');
    const ar = (d, c) => '<path class="pv-flow" d="' + d + '" stroke="' + (c || '#2ecc96') + '" stroke-width="2.4" fill="none" marker-end="url(#pvG)"/>';
    const beaker = (x, y, w, h, liq) => '<path d="M' + x + ' ' + y + ' v' + h + ' h' + w + ' v-' + h + '" style="' + glass + '"/><rect x="' + (x + 2) + '" y="' + (y + h * 0.3) + '" width="' + (w - 4) + '" height="' + (h * 0.7 - 2) + '" fill="' + liq + '" opacity=".35"/>';
    if (k === 'conductivity') {
      const D = T.cond, cells = [[D.dw, '#4dd2ff', 0], [D.sugar, '#e8e2cf', 0], [D.salt, '#4dd2ff', 1], [D.acid, '#ffd24d', 1]];
      host.innerHTML = svg(680, 260, '<style>.pv-glow{animation:pvGlow 1.4s ease-in-out infinite alternate}@keyframes pvGlow{from{opacity:.55}to{opacity:1}}</style>' + cells.map((c, i) => { const x = 20 + i * 168, on = c[2];
        return beaker(x + 20, 120, 120, 100, c[1]) + '<rect x="' + (x + 48) + '" y="100" width="8" height="90" fill="#5d6270"/><rect x="' + (x + 104) + '" y="100" width="8" height="90" fill="#5d6270"/>'
          + '<path d="M' + (x + 52) + ' 100 V50 H' + (x + 70) + ' M' + (x + 90) + ' 50 H' + (x + 108) + ' V100" style="fill:none;stroke:var(--muted);stroke-width:2"/>'
          + (on ? '<circle class="pv-glow" cx="' + (x + 80) + '" cy="50" r="22" fill="#ffd24d" opacity=".5"/>' : '') + '<circle cx="' + (x + 80) + '" cy="50" r="11" style="fill:' + (on ? '#ffe27a' : 'var(--panel)') + ';stroke:var(--text);stroke-width:1.5"/>'
          + tx(x + 80, 244, c[0], { s: 11.5 }) + tx(x + 80, 22, on ? '💡' : '✕', { s: 14, c: on ? '#ffd24d' : 'var(--muted)' }); }).join(''));
      return;
    }
    if (k === 'electrolysis_nacl') {
      const D = T.el2, side = (x0, title, liq, cat, an, catIon, anIon, catEq, anEq) => {
        const ions = Array.from({ length: 6 }, (_, i) => { const toCat = i % 2 === 0, y = 140 + (i % 3) * 30, x = x0 + 100 + i * 24;
          return '<g style="animation:' + (toCat ? 'pvL' : 'pvR') + ' 3s ease-in-out ' + (i * 0.4) + 's infinite"><circle cx="' + x + '" cy="' + y + '" r="10" fill="' + (toCat ? catIon[1] : anIon[1]) + '"/>' + tx(x, y + 4, toCat ? catIon[0] : anIon[0], { s: 9, c: '#0b1020' }) + '</g>'; }).join('');
        return tx(x0 + 160, 24, title, { s: 13 }) + beaker(x0 + 30, 90, 260, 140, liq) + '<rect x="' + (x0 + 60) + '" y="60" width="12" height="150" fill="#5d6270"/><rect x="' + (x0 + 248) + '" y="60" width="12" height="150" fill="#5d6270"/>'
          + '<path d="M' + (x0 + 66) + ' 60 V40 H' + (x0 + 140) + ' M' + (x0 + 180) + ' 40 H' + (x0 + 254) + ' V60" style="fill:none;stroke:var(--muted);stroke-width:2"/><rect x="' + (x0 + 140) + '" y="32" width="40" height="16" rx="3" style="fill:var(--panel);stroke:var(--muted)"/>' + tx(x0 + 160, 44, '− +', { s: 10 })
          + ions + tx(x0 + 66, 252, D.cat, { s: 11, c: 'var(--muted)' }) + tx(x0 + 254, 252, D.an, { s: 11, c: 'var(--muted)' })
          + tx(x0 + 66, 272, catEq, { s: 11, w: 500 }) + tx(x0 + 254, 272, anEq, { s: 11, w: 500 }); };
      host.innerHTML = svg(700, 290, '<style>@keyframes pvL{0%,100%{transform:translateX(0)}50%{transform:translateX(-26px)}}@keyframes pvR{0%,100%{transform:translateX(0)}50%{transform:translateX(26px)}}</style>'
        + side(10, D.melt, '#ffb454', 0, 0, ['Na⁺', '#a066f0'], ['Cl⁻', '#2fd14b'], 'Na⁺ + e⁻ → Na', '2Cl⁻ − 2e⁻ → Cl₂')
        + side(360, D.sol, '#3a8cff', 0, 0, ['Cu²⁺', '#3a8cff'], ['Cl⁻', '#2fd14b'], 'Cu²⁺ + 2e⁻ → Cu', '2Cl⁻ − 2e⁻ → Cl₂'));
      return;
    }
    if (k === 'corrosion') {
      const D = T.cor, tube = (x, liq, oil, rust, t, r) => '<path d="M' + x + ' 30 v150 a20 20 0 0 0 40 0 v-150" style="' + glass + '"/>'
        + (liq ? '<path d="M' + (x + 2) + ' 110 v70 a18 18 0 0 0 36 0 v-70z" fill="#4dd2ff" opacity=".35"/>' : '<rect x="' + (x + 6) + '" y="168" width="28" height="18" rx="4" fill="#e8e2cf" opacity=".7"/>')
        + (oil ? '<rect x="' + (x + 2) + '" y="100" width="36" height="10" fill="#ffd24d" opacity=".6"/>' : '')
        + '<rect x="' + (x + 17) + '" y="50" width="6" height="140" rx="2" fill="' + (rust ? '#b5562a' : '#9aa3b5') + '"/>' + (rust ? '<circle cx="' + (x + 20) + '" cy="120" r="6" fill="#c0642e"/><circle cx="' + (x + 19) + '" cy="150" r="5" fill="#a64b22"/>' : '')
        + tx(x + 20, 228, t, { s: 11 }) + tx(x + 20, 246, r, { s: 11.5, c: rust ? '#ff8a5c' : 'var(--green)' });
      host.innerHTML = svg(700, 262, tube(30, 1, 0, 1, D.t1, D.r1) + tube(150, 0, 0, 0, D.t2, D.r2) + tube(270, 1, 1, 0, D.t3, D.r3)
        + tx(380, 36, D.prot, { a: 'start', s: 13.5 }) + D.p.map((p, i) => '<circle cx="388" cy="' + (62 + i * 30) + '" r="4" fill="#2ecc96"/>' + tx(400, 66 + i * 30, p, { a: 'start', s: 11.5, w: 500 })).join('')
        + tx(380, 232, D.rust, { a: 'start', s: 12, c: '#ff8a5c' }));
      return;
    }
    if (k === 'hardness') {
      const D = T.hard;
      host.innerHTML = svg(700, 290, tx(350, 22, D.ions, { s: 13, c: 'var(--muted)' })
        + box(20, 40, 320, 60, '', '#4dd2ff') + tx(180, 64, D.tmp, { s: 13 }) + tx(180, 86, D.tmpS, { s: 12, w: 500, c: 'var(--muted)' })
        + box(360, 40, 320, 60, '', '#ff8a5c') + tx(520, 64, D.perm, { s: 13 }) + tx(520, 86, D.permS, { s: 12, w: 500, c: 'var(--muted)' })
        + ar('M180 104 L180 130') + box(20, 134, 320, 62, '', '#4dd2ff') + tx(180, 156, D.boil, { s: 12.5 }) + tx(180, 180, 'Ca(HCO₃)₂ → CaCO₃↓ + CO₂ + H₂O', { s: 11.5, w: 500 })
        + ar('M520 104 L520 130') + box(360, 134, 320, 62, '', '#ff8a5c') + tx(520, 156, D.soda, { s: 12.5 }) + tx(520, 180, 'CaSO₄ + Na₂CO₃ → CaCO₃↓ + Na₂SO₄', { s: 11.5, w: 500 })
        + box(120, 214, 460, 64, '', '#2ecc96') + tx(350, 238, D.ion, { s: 12.5 }) + tx(350, 262, D.ionS, { s: 11.5, w: 500, c: 'var(--muted)' }));
      return;
    }
    if (k === 'blast_furnace') {
      const D = T.bf, zones = [[110, D.z1, '3Fe₂O₃ + CO → 2Fe₃O₄ + CO₂', '#4dd2ff'], [170, D.z2, 'Fe₃O₄ + CO → 3FeO + CO₂', '#7ee787'], [230, D.z3, 'FeO + CO → Fe + CO₂', '#ffd24d'], [290, D.z4, 'C + O₂ → CO₂;  CO₂ + C → 2CO', '#ff5d6e']];
      host.innerHTML = svg(700, 380, tx(460, 20, D.title, { s: 13.5 })
        + '<defs><linearGradient id="pvBF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4dd2ff" stop-opacity=".25"/><stop offset=".6" stop-color="#ffb454" stop-opacity=".35"/><stop offset="1" stop-color="#ff5d6e" stop-opacity=".55"/></linearGradient></defs>'
        + '<path d="M150 60 L210 60 L250 220 L240 330 L120 330 L110 220 Z" fill="url(#pvBF)" style="stroke:var(--text);stroke-width:2"/>'
        + '<rect x="120" y="318" width="120" height="12" fill="#ff8a3a"/><rect x="120" y="304" width="120" height="14" fill="#c9a24a" opacity=".8"/>'
        + ar('M180 40 L180 58', '#ffb454') + ar('M215 68 L280 40', '#9aa3b8') + tx(290, 44, D.gas, { a: 'start', s: 11.5 })
        + ar('M60 290 L114 290', '#ff5d6e') + ar('M300 290 L246 290', '#ff5d6e') + tx(14, 278, D.air, { a: 'start', s: 11 })
        + ar('M240 311 L300 340', '#c9a24a') + tx(306, 344, D.slag, { a: 'start', s: 11.5 }) + ar('M120 324 L60 352', '#ff8a3a') + tx(56, 364, D.iron, { a: 'end', s: 11.5 })
        + tx(14, 36, D.charge, { a: 'start', s: 11.5, c: '#ffb454' })
        + zones.map((z) => '<line x1="' + (z[0] < 200 ? 230 : 252) + '" y1="' + z[0] + '" x2="360" y2="' + z[0] + '" style="stroke:var(--muted);stroke-dasharray:3 3"/>' + tx(368, z[0] - 3, z[1], { a: 'start', s: 11, c: z[3] }) + tx(368, z[0] + 14, z[2], { a: 'start', s: 11.5, w: 500 })).join(''));
      return;
    }
    if (k === 'converter') {
      const D = T.cv;
      host.innerHTML = svg(700, 320, tx(350, 20, D.title, { s: 13.5 })
        + '<path d="M150 70 L250 70 L290 130 L290 260 a20 20 0 0 1 -20 20 L130 280 a20 20 0 0 1 -20 -20 L110 130 Z" style="fill:rgba(255,138,58,.15);stroke:var(--text);stroke-width:2"/>'
        + '<path d="M114 180 L286 180 L286 262 a16 16 0 0 1 -16 16 L130 278 a16 16 0 0 1 -16 -16 Z" fill="#ff8a3a" opacity=".7"/><rect x="114" y="168" width="172" height="12" fill="#c9a24a" opacity=".8"/>'
        + '<rect x="194" y="30" width="12" height="140" fill="#9aa3b8"/>' + ar('M200 34 L200 168', '#4dd2ff') + tx(186, 44, D.o2, { a: 'end', s: 11.5, c: '#4dd2ff' })
        + Array.from({ length: 6 }, (_, i) => '<circle class="pv-bub" style="animation-delay:' + (i * 0.35) + 's" cx="' + (180 + (i % 3) * 18) + '" cy="250" r="4" fill="#ffd24d"/>').join('')
        + ar('M240 74 L300 44', '#9aa3b8') + tx(306, 44, D.gas, { a: 'start', s: 11.5 }) + tx(200, 302, D.pig, { s: 11.5 })
        + tx(330, 110, D.what, { a: 'start', s: 12 })
        + ['2C + O₂ → 2CO', 'Si + O₂ → SiO₂', '2Mn + O₂ → 2MnO', '4P + 5O₂ → 2P₂O₅'].map((e, i) => tx(340, 140 + i * 24, e, { a: 'start', s: 12.5, w: 500 })).join('')
        + tx(330, 250, D.slag, { a: 'start', s: 11.5, c: '#c9a24a' }) + tx(330, 274, '→ ' + D.steel, { a: 'start', s: 13, c: 'var(--green)' }));
      return;
    }
    if (k === 'solvay') {
      const D = T.sv;
      host.innerHTML = svg(700, 320, tx(10, 18, D.title, { a: 'start', s: 13.5 })
        + box(10, 50, 140, 50, D.brine, '#4dd2ff', 11.5) + ar('M152 75 L166 75') + box(170, 50, 170, 50, D.carb, '#c08bff', 11.5) + ar('M342 75 L356 75') + box(360, 50, 100, 50, D.filt, '#9aa3b8', 11.5)
        + ar('M462 75 L476 75') + box(480, 50, 150, 50, D.calc, '#ff8a5c', 11) + ar('M555 102 L555 136') + box(470, 140, 220, 46, D.soda, '#2ecc96', 11.5)
        + tx(255, 120, 'NaCl + NH₃ + CO₂ + H₂O → NaHCO₃↓ + NH₄Cl', { s: 12, w: 500 }) + tx(580, 206, '2NaHCO₃ → Na₂CO₃ + CO₂ + H₂O', { s: 12, w: 500 })
        + ar('M600 48 C 560 26 330 26 290 46', '#9aa3b8') + tx(445, 22, 'CO₂ ' + D.back, { s: 11, c: 'var(--muted)' })
        + box(20, 236, 220, 46, D.regen, '#7ee787', 11.5) + tx(10, 304, '2NH₄Cl + Ca(OH)₂ → CaCl₂ + 2NH₃ + 2H₂O', { a: 'start', s: 11.5, w: 500 })
        + box(300, 236, 170, 46, D.kiln, '#ffb454', 11.5) + tx(385, 304, 'CaCO₃ → CaO + CO₂', { s: 12, w: 500 })
        + ar('M100 234 L84 104', '#7ee787') + tx(98, 172, 'NH₃ ' + D.back, { a: 'start', s: 11, c: '#7ee787' })
        + ar('M360 234 L290 104', '#ffb454') + tx(336, 172, 'CO₂', { a: 'start', s: 12, c: '#ffb454' }) + ar('M298 259 L244 259', '#ffb454') + tx(271, 252, 'CaO', { s: 10.5, c: '#ffb454' }));
      return;
    }
    if (k === 'carbon_cycle') {
      const D = T.cc, node = (x, y, t, c) => '<rect x="' + (x - 100) + '" y="' + (y - 20) + '" width="200" height="40" rx="10" style="fill:' + c + '22;stroke:' + c + '"/>' + tx(x, y + 4, t, { s: 11.5 });
      host.innerHTML = svg(700, 320, node(350, 34, D.air, '#9aa3b8') + node(120, 160, D.plant, '#4fbf5a') + node(580, 160, D.animal, '#ff8a5c') + node(580, 286, D.fuel, '#ffb454') + node(120, 286, D.ocean, '#4dd2ff') + node(350, 286, D.rock, '#b08a5a')
        + ar('M260 52 C 180 70 140 110 125 138') + ar('M216 160 L476 160', '#4fbf5a') + ar('M560 138 C 540 90 480 60 452 52', '#ff8a5c') + ar('M640 264 C 680 160 560 60 452 40', '#ffb454')
        + ar('M300 54 C 220 120 160 200 130 264', '#4dd2ff') + ar('M120 182 L330 264', '#b08a5a') + ar('M452 286 L476 286', '#ffb454')
        + tx(160, 96, 'CO₂ → ' + D.plant.split(' ')[0], { s: 10.5, c: 'var(--muted)', w: 500 }) + tx(560, 84, 'CO₂', { s: 11, c: '#ff8a5c' }) + tx(240, 236, D.decay, { s: 10.5, c: 'var(--muted)', w: 500 }));
      return;
    }
    if (k === 'silicate') {
      const D = T.sil, raw = [[D.sand, '#e8b878'], [D.soda, '#e0e6f0'], [D.lime, '#cfc6b0'], [D.clay, '#b08a5a']];
      const prod = [[D.glass, D.glassT, '#4dd2ff', 'Na₂CO₃ + CaCO₃ + 6SiO₂ → Na₂O·CaO·6SiO₂ + 2CO₂'], [D.cement, D.cementT, '#9aa3b8', D.lime + ' + ' + D.clay], [D.ceram, D.ceramT, '#ff8a5c', D.ex]];
      host.innerHTML = svg(700, 300, raw.map((r, i) => box(10, 30 + i * 62, 170, 46, r[0], r[1], 11.5)).join('')
        + '<path d="M260 60 h120 v180 h-120z" style="fill:rgba(255,138,58,.18);stroke:var(--text);stroke-width:2"/><g class="pv-fl" style="transform-box:fill-box"><path d="M320 236 c-26 -26 -10 -62 0 -82 c10 20 26 56 0 82z" fill="#ff8a3a"/></g>' + tx(320, 90, '🔥', { s: 20 })
        + raw.map((r, i) => ar('M182 ' + (53 + i * 62) + ' L256 ' + (100 + i * 30))).join('')
        + prod.map((p, i) => ar('M384 150 L420 ' + (60 + i * 90)) + box(424, 34 + i * 90, 272, 70, '', p[2]) + tx(560, 56 + i * 90, p[0] + ' — ' + p[1], { s: 12 }) + tx(560, 80 + i * 90, p[3], { s: 9.5, w: 500, c: 'var(--muted)' })).join(''));
    }
  }

  window.PTV = {
    render(host, spec, ctx) {
      host.innerHTML = '';
      try {
        if (spec.type === 'chart' && (spec.kind === 'eneg' || spec.kind === 'radius')) return trend(host, spec.kind, ctx);
        if (spec.type === 'diagram' && (spec.kind === 'contact' || spec.kind === 'nitrogen_cycle')) return diagram2(host, spec, ctx);
        if (spec.type === 'molecule3d' && (spec.mol === 'graphite' || spec.mol === 'SiO2')) return lattice3(host, spec, ctx);
        if (spec.type === 'diagram' && ['conductivity', 'electrolysis_nacl', 'corrosion', 'hardness', 'blast_furnace', 'converter', 'solvay', 'carbon_cycle', 'silicate'].includes(spec.kind)) return diagram3(host, spec, ctx);
        const fn = { molecule3d, atom3d, particles, reaction, balance, chart, diagram, calc, ptable, orbitals, isotopes, kinetics, equilibrium, dissociation, phscale, activity }[spec.type];
        if (fn) fn(host, spec, ctx);
      } catch (e) { console.error('visual', spec, e); }
    },
    parseFormula
  };
})();
