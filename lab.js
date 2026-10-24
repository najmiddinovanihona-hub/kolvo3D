// Kolvo virtual laboratory: a free test-tube bench. Reagents are poured into one test tube and a small rule engine
// (ion exchange, neutralisation, gases, metal displacement, a few redox and organic tests) decides what happens.
// window.PTLAB.mount(host, { lang, light }) draws the bench; setCtx() switches language; unmount() stops timers.
(function () {
  'use strict';

  // ---------- formulas ----------
  const SUBD = '₀₁₂₃₄₅₆₇₈₉';
  const pretty = (f) => f.replace(/(\d+)/g, (m, d, i, s) => (i > 0 && /[A-Za-z)\]]/.test(s[i - 1]) ? d.split('').map((c) => SUBD[+c]).join('') : d));
  function atoms(f) {
    let i = 0;
    const num = () => { let n = ''; while (i < f.length && /\d/.test(f[i])) n += f[i++]; return n ? +n : 1; };
    const grp = (close) => { const o = {};
      while (i < f.length && f[i] !== close) {
        if (f[i] === '(' || f[i] === '[') { const c = f[i] === '(' ? ')' : ']'; i++; const g = grp(c); i++; const k = num(); for (const e in g) o[e] = (o[e] || 0) + g[e] * k; }
        else { let e = f[i++]; while (i < f.length && /[a-z]/.test(f[i])) e += f[i++]; o[e] = (o[e] || 0) + num(); } }
      return o; };
    return grp(undefined);
  }
  // smallest whole-number coefficients for reactants → products (null if the set cannot be balanced)
  function balance(R, P) {
    const sp = R.concat(P), els = [...new Set(sp.flatMap((f) => Object.keys(atoms(f))))];
    const A = els.map((e) => sp.map((f, j) => (atoms(f)[e] || 0) * (j < R.length ? 1 : -1)));
    const m = sp.length, piv = []; let r = 0;
    for (let c = 0; c < m && r < A.length; c++) {
      let p = r; while (p < A.length && Math.abs(A[p][c]) < 1e-9) p++; if (p === A.length) continue;
      [A[r], A[p]] = [A[p], A[r]]; const d = A[r][c]; A[r] = A[r].map((v) => v / d);
      for (let q = 0; q < A.length; q++) if (q !== r && Math.abs(A[q][c]) > 1e-9) { const k = A[q][c]; A[q] = A[q].map((v, j) => v - k * A[r][j]); }
      piv.push(c); r++; }
    const free = [...Array(m).keys()].filter((c) => !piv.includes(c)); if (free.length !== 1) return null;
    const x = Array(m).fill(0); x[free[0]] = 1; piv.forEach((c, i) => { x[c] = -A[i][free[0]]; });
    for (let k = 1; k <= 240; k++) { const y = x.map((v) => v * k); if (y.every((v) => Math.abs(v - Math.round(v)) < 1e-6)) { const z = y.map(Math.round); return z.every((v) => v > 0) ? z : null; } }
    return null;
  }
  const eqStr = (R, P, k, marks) => { const t = (f, i) => (k[i] > 1 ? k[i] : '') + pretty(f) + ((marks || {})[f] || '');
    return R.map((f, i) => t(f, i)).join(' + ') + ' → ' + P.map((f, i) => t(f, i + R.length)).join(' + '); };

  // ---------- ions and solubility ----------
  const ION = { H: ['H', 1], Li: ['Li', 1], Na: ['Na', 1], K: ['K', 1], Ag: ['Ag', 1], NH4: ['NH4', 1, 1], Ca: ['Ca', 2], Ba: ['Ba', 2], Sr: ['Sr', 2], Mg: ['Mg', 2], Zn: ['Zn', 2],
    Cu: ['Cu', 2], Fe2: ['Fe', 2], Fe3: ['Fe', 3], Al: ['Al', 3], Pb: ['Pb', 2], Ni: ['Ni', 2], Mn: ['Mn', 2],
    Cl: ['Cl', 1], I: ['I', 1], NO3: ['NO3', 1, 1], OH: ['OH', 1, 1], SO4: ['SO4', 2, 1], CO3: ['CO3', 2, 1], PO4: ['PO4', 3, 1], S: ['S', 2], SO3: ['SO3', 2, 1], AC: ['CH3COO', 1, 1], SCN: ['SCN', 1, 1], MnO4: ['MnO4', 1, 1] };
  const ISYM = { H: 'H⁺', Li: 'Li⁺', Na: 'Na⁺', K: 'K⁺', Ag: 'Ag⁺', NH4: 'NH₄⁺', Ca: 'Ca²⁺', Ba: 'Ba²⁺', Sr: 'Sr²⁺', Mg: 'Mg²⁺', Zn: 'Zn²⁺', Cu: 'Cu²⁺', Fe2: 'Fe²⁺', Fe3: 'Fe³⁺', Al: 'Al³⁺', Pb: 'Pb²⁺', Ni: 'Ni²⁺', Mn: 'Mn²⁺',
    Cl: 'Cl⁻', I: 'I⁻', NO3: 'NO₃⁻', OH: 'OH⁻', SO4: 'SO₄²⁻', CO3: 'CO₃²⁻', PO4: 'PO₄³⁻', S: 'S²⁻', SO3: 'SO₃²⁻', AC: 'CH₃COO⁻', SCN: 'SCN⁻', MnO4: 'MnO₄⁻' };
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const counts = (c, a) => { const qc = ION[c][1], qa = ION[a][1], l = qc * qa / gcd(qc, qa); return [l / qc, l / qa]; };
  function salt(c, a) {
    if (c === 'H' && a === 'OH') return 'H2O'; if (c === 'NH4' && a === 'OH') return 'NH4OH';
    const [nc, na] = counts(c, a), part = (k, n) => (n === 1 ? ION[k][0] : ION[k][2] ? '(' + ION[k][0] + ')' + n : ION[k][0] + n);
    return a === 'AC' ? part(a, na) + part(c, nc) : part(c, nc) + part(a, na);
  }
  // insoluble pairs → precipitate colour
  const PPT = { 'Ag,Cl': 'white', 'Ag,I': 'yellow', 'Ag,PO4': 'yellow', 'Ag,S': 'black', 'Ag,CO3': 'paleyellow', 'Ag,SO3': 'white',
    'Ba,SO4': 'white', 'Ba,CO3': 'white', 'Ba,PO4': 'white', 'Ba,SO3': 'white', 'Sr,SO4': 'white', 'Sr,CO3': 'white', 'Ca,CO3': 'white', 'Ca,PO4': 'white', 'Ca,SO3': 'white',
    'Pb,I': 'gold', 'Pb,Cl': 'white', 'Pb,SO4': 'white', 'Pb,CO3': 'white', 'Pb,S': 'black', 'Pb,OH': 'white', 'Pb,PO4': 'white',
    'Cu,OH': 'blue', 'Cu,S': 'black', 'Cu,CO3': 'teal', 'Cu,PO4': 'teal', 'Fe3,OH': 'rust', 'Fe3,PO4': 'cream', 'Fe2,OH': 'greenish', 'Fe2,S': 'black', 'Fe2,CO3': 'greenish', 'Fe2,PO4': 'white',
    'Al,OH': 'gel', 'Al,PO4': 'white', 'Zn,OH': 'white', 'Zn,S': 'white', 'Zn,CO3': 'white', 'Zn,PO4': 'white', 'Mg,OH': 'white', 'Mg,CO3': 'white', 'Mg,PO4': 'white',
    'Ni,OH': 'green', 'Ni,S': 'black', 'Ni,CO3': 'green', 'Mn,OH': 'white', 'Li,PO4': 'white', 'Ca,OH': '' };
  const COL = { white: '#f2f2ee', yellow: '#f2d23c', gold: '#ffcc1a', paleyellow: '#efe2a2', black: '#1d1d22', blue: '#3f7fe8', teal: '#4fb3a6', rust: '#a8521f', cream: '#eadfb8', greenish: '#9fbf8a', gel: '#e8eef2', green: '#5fbf5f',
    brown: '#6b3a1a', red: '#c0392b', silver: '#c9ced8', copper: '#c46a2e', lead: '#6e7480', black2: '#222' };
  const WEAKB = ['NH4', 'Cu', 'Fe2', 'Fe3', 'Al', 'Zn', 'Pb', 'Ni', 'Ag', 'Mn'], WEAKA = ['CO3', 'S', 'SO3', 'AC', 'PO4'];

  // ---------- reagents ----------
  // t: acid / base / salt / metal / ind / other; c, a: ions of a dissolved electrolyte; solid: stays at the bottom
  const RG = [
    ['HCl', 'acid', 'H', 'Cl', 'Xlorid kislota', 'Hydrochloric acid', 'Соляная кислота'],
    ['H2SO4', 'acid', 'H', 'SO4', 'Sulfat kislota (suyult.)', 'Sulfuric acid (dilute)', 'Серная кислота (разб.)'],
    ['HNO3', 'acid', 'H', 'NO3', 'Nitrat kislota (suyult.)', 'Nitric acid (dilute)', 'Азотная кислота (разб.)'],
    ['CH3COOH', 'acid', 'H', 'AC', 'Sirka kislota', 'Acetic acid', 'Уксусная кислота'],
    ['NaOH', 'base', 'Na', 'OH', 'Natriy gidroksid', 'Sodium hydroxide', 'Гидроксид натрия'],
    ['KOH', 'base', 'K', 'OH', 'Kaliy gidroksid', 'Potassium hydroxide', 'Гидроксид калия'],
    ['Ca(OH)2', 'base', 'Ca', 'OH', 'Ohakli suv', 'Limewater', 'Известковая вода'],
    ['NH4OH', 'base', 'NH4', 'OH', 'Ammiakli suv', 'Ammonia solution', 'Нашатырный спирт'],
    ['NaCl', 'salt', 'Na', 'Cl', 'Natriy xlorid (osh tuzi)', 'Sodium chloride', 'Хлорид натрия'],
    ['KCl', 'salt', 'K', 'Cl', 'Kaliy xlorid', 'Potassium chloride', 'Хлорид калия'],
    ['LiCl', 'salt', 'Li', 'Cl', 'Litiy xlorid', 'Lithium chloride', 'Хлорид лития'],
    ['CaCl2', 'salt', 'Ca', 'Cl', 'Kalsiy xlorid', 'Calcium chloride', 'Хлорид кальция'],
    ['SrCl2', 'salt', 'Sr', 'Cl', 'Stronsiy xlorid', 'Strontium chloride', 'Хлорид стронция'],
    ['BaCl2', 'salt', 'Ba', 'Cl', 'Bariy xlorid', 'Barium chloride', 'Хлорид бария'],
    ['KI', 'salt', 'K', 'I', 'Kaliy yodid', 'Potassium iodide', 'Иодид калия'],
    ['CuSO4', 'salt', 'Cu', 'SO4', 'Mis(II) sulfat', 'Copper(II) sulfate', 'Сульфат меди(II)'],
    ['FeSO4', 'salt', 'Fe2', 'SO4', 'Temir(II) sulfat', 'Iron(II) sulfate', 'Сульфат железа(II)'],
    ['FeCl3', 'salt', 'Fe3', 'Cl', 'Temir(III) xlorid', 'Iron(III) chloride', 'Хлорид железа(III)'],
    ['AlCl3', 'salt', 'Al', 'Cl', 'Alyuminiy xlorid', 'Aluminium chloride', 'Хлорид алюминия'],
    ['ZnSO4', 'salt', 'Zn', 'SO4', 'Rux sulfat', 'Zinc sulfate', 'Сульфат цинка'],
    ['MgSO4', 'salt', 'Mg', 'SO4', 'Magniy sulfat', 'Magnesium sulfate', 'Сульфат магния'],
    ['NiSO4', 'salt', 'Ni', 'SO4', 'Nikel(II) sulfat', 'Nickel(II) sulfate', 'Сульфат никеля(II)'],
    ['AgNO3', 'salt', 'Ag', 'NO3', 'Kumush nitrat', 'Silver nitrate', 'Нитрат серебра'],
    ['Pb(NO3)2', 'salt', 'Pb', 'NO3', 'Qo\'rg\'oshin(II) nitrat', 'Lead(II) nitrate', 'Нитрат свинца(II)'],
    ['Na2CO3', 'salt', 'Na', 'CO3', 'Natriy karbonat (soda)', 'Sodium carbonate', 'Карбонат натрия'],
    ['Na2SO4', 'salt', 'Na', 'SO4', 'Natriy sulfat', 'Sodium sulfate', 'Сульфат натрия'],
    ['Na3PO4', 'salt', 'Na', 'PO4', 'Natriy fosfat', 'Sodium phosphate', 'Фосфат натрия'],
    ['Na2S', 'salt', 'Na', 'S', 'Natriy sulfid', 'Sodium sulfide', 'Сульфид натрия'],
    ['Na2SO3', 'salt', 'Na', 'SO3', 'Natriy sulfit', 'Sodium sulfite', 'Сульфит натрия'],
    ['NH4Cl', 'salt', 'NH4', 'Cl', 'Ammoniy xlorid', 'Ammonium chloride', 'Хлорид аммония'],
    ['KSCN', 'salt', 'K', 'SCN', 'Kaliy rodanid', 'Potassium thiocyanate', 'Роданид калия'],
    ['KMnO4', 'salt', 'K', 'MnO4', 'Kaliy permanganat', 'Potassium permanganate', 'Перманганат калия'],
    ['Na', 'metal', '', '', 'Natriy (bo\'lakcha)', 'Sodium (small piece)', 'Натрий (кусочек)'],
    ['Mg', 'metal', '', '', 'Magniy (lenta)', 'Magnesium (ribbon)', 'Магний (лента)'],
    ['Al', 'metal', '', '', 'Alyuminiy', 'Aluminium', 'Алюминий'],
    ['Zn', 'metal', '', '', 'Rux (granula)', 'Zinc (granule)', 'Цинк (гранула)'],
    ['Fe', 'metal', '', '', 'Temir (mix)', 'Iron (nail)', 'Железо (гвоздь)'],
    ['Cu', 'metal', '', '', 'Mis (sim)', 'Copper (wire)', 'Медь (проволока)'],
    ['php', 'ind', '', '', 'Fenolftalein', 'Phenolphthalein', 'Фенолфталеин'],
    ['litmus', 'ind', '', '', 'Lakmus', 'Litmus', 'Лакмус'],
    ['mo', 'ind', '', '', 'Metilzarg\'aldog\'i', 'Methyl orange', 'Метилоранж'],
    ['H2O', 'other', '', '', 'Distillangan suv', 'Distilled water', 'Дистиллированная вода'],
    ['H2O2', 'other', '', '', 'Vodorod peroksid (3%)', 'Hydrogen peroxide (3%)', 'Пероксид водорода (3%)'],
    ['I2', 'other', '', '', 'Yod eritmasi', 'Iodine solution', 'Раствор иода'],
    ['starch', 'other', '', '', 'Kraxmal kleysteri', 'Starch paste', 'Крахмальный клейстер'],
    ['C6H12O6', 'other', '', '', 'Glyukoza eritmasi', 'Glucose solution', 'Раствор глюкозы'],
    ['C3H5(OH)3', 'other', '', '', 'Glitserin', 'Glycerol', 'Глицерин'],
    ['MnO2', 'other', '', '', 'Marganes(IV) oksid', 'Manganese(IV) oxide', 'Оксид марганца(IV)'],
    ['CaCO3', 'other', 'Ca', 'CO3', 'Marmar bo\'laklari', 'Marble chips', 'Кусочки мрамора']
  ].map((r) => ({ id: r[0], t: r[1], c: r[2] || null, a: r[3] || null, n: [r[4], r[5], r[6]], solid: ['MnO2', 'CaCO3'].includes(r[0]) || r[1] === 'metal' }));
  const RGI = Object.fromEntries(RG.map((r) => [r.id, r]));
  // how a reagent is written on its bottle
  const DISP = { NH4OH: 'NH₃·H₂O', starch: '(C₆H₁₀O₅)ₙ' }, disp = (id) => DISP[id] || pretty(id);
  const SOLCOL = { CuSO4: '#3a8cff', FeCl3: '#d4a017', FeSO4: '#a8d8a0', NiSO4: '#3fae5a', KMnO4: '#7a1fa2', I2: '#a0522d', K2MnO4: '#2e8b57', 'Fe(SCN)3': '#a8101a', '[Cu(NH3)4](OH)2': '#1a3fbf',
    starchI2: '#14143a', cuGly: '#1a3fbf', CuCl2: '#3aa0c8', 'Cu(NO3)2': '#3a8cff', 'Fe2(SO4)3': '#d4a017', FeCl2: '#a8d8a0', 'Fe(NO3)3': '#d4a017' };
  // a pour is 1 portion; strongly coloured reagents are used as a few drops of a dilute solution
  const DOSE = { KMnO4: 0.2, I2: 0.3, Na2SO3: 0.5 }, TINT = { KMnO4: 6, 'Fe(SCN)3': 8, '[Cu(NH3)4](OH)2': 5, I2: 4, K2MnO4: 5, cuGly: 5 };
  const ACT = ['K', 'Ca', 'Na', 'Mg', 'Al', 'Zn', 'Fe', 'Ni', 'Sn', 'Pb', 'H', 'Cu', 'Hg', 'Ag', 'Pt', 'Au'];
  const MION = { Na: 'Na', K: 'K', Ca: 'Ca', Mg: 'Mg', Al: 'Al', Zn: 'Zn', Fe: 'Fe2', Cu: 'Cu', Ag: 'Ag', Pb: 'Pb', Ni: 'Ni' }, MOFION = { Fe2: 'Fe', Fe3: 'Fe' };
  const FLAME = { Na: ['#ffc21a', 'sariq', 'yellow', 'жёлтый'], K: ['#b07cff', 'binafsha', 'violet', 'фиолетовый'], Ca: ['#ff5a36', 'g\'isht-qizil', 'brick red', 'кирпично-красный'], Ba: ['#9be36b', 'sarg\'ish-yashil', 'yellow-green', 'жёлто-зелёный'],
    Cu: ['#2ee6a0', 'yashil', 'green', 'зелёный'], Li: ['#ff2a6a', 'qip-qizil', 'crimson', 'малиновый'], Sr: ['#ff2020', 'qizil', 'red', 'красный'] };

  // ---------- strings ----------
  const S = {
    uz: { shelf: 'Reaktivlar javoni', groups: { acid: 'Kislotalar', base: 'Asoslar', salt: 'Tuzlar', metal: 'Metallar', ind: 'Indikatorlar', other: 'Boshqalar' }, find: 'Reaktiv qidirish…',
      heat: 'Qizdirish', stop: 'Qizdirishni to\'xtatish', flame: 'Alangada sinash', clear: 'Probirkani tozalash', log: 'Kuzatuvlar', presets: 'Tayyor tajribalar', empty: 'Javondan reaktiv tanlang — u probirkaga quyiladi. Tayyor tajribalardan birini ham ishga tushirishingiz mumkin.',
      medium: { acid: 'Muhit: kislotali', base: 'Muhit: ishqoriy', neutral: 'Muhit: neytral', none: 'Probirka bo\'sh' }, full: 'Probirka to\'ldi — tozalang.',
      added: '{x} qo\'shildi', nothing: 'Ko\'rinadigan o\'zgarish yo\'q', nothingWhy: 'Ionlar birikib cho\'kma, gaz yoki suv hosil qilmaydi — eritmada aralashgan holda qoladi.',
      ppt: '{c} cho\'kma tushdi: {f}', gas: 'Gaz ajraldi: {f}', neutral: 'Neytrallanish: issiqlik ajraldi', dissolve: 'Cho\'kma eridi', colour: 'Eritma rangi o\'zgardi', metalDep: 'Metall sirtida {f} ajraldi',
      noMetal: '{m} bu eritmadan metallni siqib chiqara olmaydi (faollik qatoriga qarang).', noAcid: '{m} vodoroddan keyin turadi — kislotadan H₂ ni siqib chiqarmaydi.',
      ionic: 'Qisqa ionli tenglama', run: 'Boshlash', heatOn: 'Probirka qizdirilmoqda', flameRes: 'Alanga rangi: {c} — {i} ionlari', flameNone: 'Alanga rangi o\'zgarmadi: rang beradigan metall ionlari yo\'q.',
      colours: { white: 'Oq', yellow: 'Sariq', gold: 'Oltinrang-sariq', paleyellow: 'Och sariq', black: 'Qora', blue: 'Ko\'k', teal: 'Ko\'kimtir-yashil', rust: 'Qo\'ng\'ir', cream: 'Och sariq', greenish: 'Yashilsimon', gel: 'Oq dirildoq', green: 'Yashil', brown: 'Qo\'ng\'ir', red: 'G\'isht-qizil' },
      tests: { H2: 'Yonib turgan cho\'p yaqinlashtirilsa, "pop" ovozi bilan yonadi.', O2: 'Cho\'g\'langan cho\'p alangalanib ketadi.', CO2: 'Ohakli suvni loyqalatadi, yonishni to\'xtatadi.', NH3: 'O\'tkir hid; ho\'llangan qizil lakmus qog\'oz ko\'karadi.',
        H2S: 'Palag\'da tuxum hidi — zaharli!', SO2: 'O\'tkir, bo\'g\'uvchi hid.', NO: 'Rangsiz gaz probirka og\'zida havodagi O₂ bilan qo\'ng\'ir NO₂ ga aylanadi.' },
      safety: 'Haqiqiy laboratoriyada himoya ko\'zoynagi va qo\'lqop kiying. Bu — xavfsiz virtual tajriba.' },
    en: { shelf: 'Reagent shelf', groups: { acid: 'Acids', base: 'Bases', salt: 'Salts', metal: 'Metals', ind: 'Indicators', other: 'Others' }, find: 'Find a reagent…',
      heat: 'Heat', stop: 'Stop heating', flame: 'Flame test', clear: 'Empty the test tube', log: 'Observations', presets: 'Ready-made experiments', empty: 'Pick a reagent on the shelf — it is poured into the test tube. You can also run one of the ready-made experiments.',
      medium: { acid: 'Medium: acidic', base: 'Medium: alkaline', neutral: 'Medium: neutral', none: 'The tube is empty' }, full: 'The test tube is full — empty it.',
      added: '{x} added', nothing: 'No visible change', nothingWhy: 'The ions do not join into a precipitate, a gas or water — they simply stay mixed in solution.',
      ppt: '{c} precipitate forms: {f}', gas: 'Gas given off: {f}', neutral: 'Neutralisation: heat released', dissolve: 'The precipitate dissolves', colour: 'The colour of the solution changes', metalDep: '{f} deposits on the metal',
      noMetal: '{m} cannot push a metal out of this solution (see the activity series).', noAcid: '{m} stands after hydrogen — it does not push H₂ out of the acid.',
      ionic: 'Short ionic equation', run: 'Run', heatOn: 'The test tube is being heated', flameRes: 'Flame colour: {c} — {i} ions', flameNone: 'The flame does not change: no colouring metal ions.',
      colours: { white: 'White', yellow: 'Yellow', gold: 'Golden-yellow', paleyellow: 'Pale yellow', black: 'Black', blue: 'Blue', teal: 'Blue-green', rust: 'Brown', cream: 'Cream', greenish: 'Greenish', gel: 'White jelly-like', green: 'Green', brown: 'Brown', red: 'Brick-red' },
      tests: { H2: 'A burning splint makes it burn with a "pop".', O2: 'A glowing splint bursts into flame.', CO2: 'Turns limewater milky and puts out a flame.', NH3: 'Sharp smell; damp red litmus paper turns blue.',
        H2S: 'Smell of rotten eggs — poisonous!', SO2: 'Sharp, choking smell.', NO: 'The colourless gas turns into brown NO₂ with air at the mouth of the tube.' },
      safety: 'In a real lab wear safety glasses and gloves. This is a safe virtual experiment.' },
    ru: { shelf: 'Полка с реактивами', groups: { acid: 'Кислоты', base: 'Основания', salt: 'Соли', metal: 'Металлы', ind: 'Индикаторы', other: 'Другие' }, find: 'Найти реактив…',
      heat: 'Нагреть', stop: 'Прекратить нагрев', flame: 'Окраска пламени', clear: 'Вымыть пробирку', log: 'Наблюдения', presets: 'Готовые опыты', empty: 'Выберите реактив на полке — он наливается в пробирку. Можно также запустить один из готовых опытов.',
      medium: { acid: 'Среда: кислая', base: 'Среда: щелочная', neutral: 'Среда: нейтральная', none: 'Пробирка пуста' }, full: 'Пробирка заполнена — вымойте её.',
      added: 'Добавлено: {x}', nothing: 'Видимых изменений нет', nothingWhy: 'Ионы не образуют осадка, газа или воды — они просто остаются в растворе.',
      ppt: 'Выпал {c} осадок: {f}', gas: 'Выделился газ: {f}', neutral: 'Нейтрализация: выделилось тепло', dissolve: 'Осадок растворился', colour: 'Окраска раствора изменилась', metalDep: 'На металле выделился {f}',
      noMetal: '{m} не вытесняет металл из этого раствора (см. ряд активности).', noAcid: '{m} стоит после водорода — не вытесняет H₂ из кислоты.',
      ionic: 'Сокращённое ионное уравнение', run: 'Запустить', heatOn: 'Пробирка нагревается', flameRes: 'Окраска пламени: {c} — ионы {i}', flameNone: 'Пламя не окрашивается: нет окрашивающих ионов металлов.',
      colours: { white: 'белый', yellow: 'жёлтый', gold: 'золотисто-жёлтый', paleyellow: 'светло-жёлтый', black: 'чёрный', blue: 'голубой', teal: 'сине-зелёный', rust: 'бурый', cream: 'кремовый', greenish: 'зеленоватый', gel: 'белый студенистый', green: 'зелёный', brown: 'бурый', red: 'кирпично-красный' },
      tests: { H2: 'Горящая лучинка — газ сгорает с хлопком.', O2: 'Тлеющая лучинка вспыхивает.', CO2: 'Известковая вода мутнеет, пламя гаснет.', NH3: 'Резкий запах; влажная красная лакмусовая бумажка синеет.',
        H2S: 'Запах тухлых яиц — ядовит!', SO2: 'Резкий удушливый запах.', NO: 'Бесцветный газ у отверстия пробирки буреет — образуется NO₂.' },
      safety: 'В настоящей лаборатории надевайте защитные очки и перчатки. Это безопасный виртуальный опыт.' }
  };
  const LI = { uz: 0, en: 1, ru: 2 };

  // ready-made experiments: name and the sequence of steps (reagent ids, 'heat', 'flame')
  const PRESETS = [
    [['Neytrallanish va fenolftalein', 'Neutralisation with phenolphthalein', 'Нейтрализация и фенолфталеин'], ['NaOH', 'php', 'HCl']],
    [['Kumush xlorid cho\'kmasi', 'Silver chloride precipitate', 'Осадок хлорида серебра'], ['NaCl', 'AgNO3']],
    [['Sulfat ioniga sifat reaksiya', 'Test for sulfate ions', 'Качественная реакция на сульфат-ион'], ['Na2SO4', 'BaCl2']],
    [['"Oltin yomg\'ir" — PbI₂', '"Golden rain" — PbI₂', '«Золотой дождь» — PbI₂'], ['Pb(NO3)2', 'KI']],
    [['Mis(II) gidroksid va uni qizdirish', 'Copper(II) hydroxide and heating it', 'Гидроксид меди(II) и его нагревание'], ['CuSO4', 'NaOH', 'NaOH', 'heat']],
    [['Temir(III) gidroksid', 'Iron(III) hydroxide', 'Гидроксид железа(III)'], ['FeCl3', 'NaOH']],
    [['Amfoter Al(OH)₃', 'Amphoteric Al(OH)₃', 'Амфотерный Al(OH)₃'], ['AlCl3', 'NaOH', 'NaOH', 'NaOH', 'NaOH']],
    [['Marmar + xlorid kislota → CO₂', 'Marble + hydrochloric acid → CO₂', 'Мрамор + соляная кислота → CO₂'], ['CaCO3', 'HCl', 'HCl']],
    [['Rux + xlorid kislota → H₂', 'Zinc + hydrochloric acid → H₂', 'Цинк + соляная кислота → H₂'], ['Zn', 'HCl', 'HCl']],
    [['Temir mixni mis bilan qoplash', 'Copper plating an iron nail', 'Омеднение железного гвоздя'], ['Fe', 'CuSO4']],
    [['Mis simda kumush kristallari', 'Silver crystals on copper wire', 'Кристаллы серебра на медной проволоке'], ['Cu', 'AgNO3', 'AgNO3']],
    [['Mis + nitrat kislota', 'Copper + nitric acid', 'Медь + азотная кислота'], ['Cu', 'HNO3', 'HNO3', 'HNO3']],
    [['KMnO₄ kislotali muhitda', 'KMnO₄ in acidic medium', 'KMnO₄ в кислой среде'], ['KMnO4', 'H2SO4', 'Na2SO3']],
    [['KMnO₄ neytral muhitda', 'KMnO₄ in neutral medium', 'KMnO₄ в нейтральной среде'], ['KMnO4', 'H2O', 'Na2SO3']],
    [['KMnO₄ ishqoriy muhitda', 'KMnO₄ in alkaline medium', 'KMnO₄ в щелочной среде'], ['KMnO4', 'KOH', 'Na2SO3']],
    [['Yod + kraxmal', 'Iodine + starch', 'Иод + крахмал'], ['starch', 'I2']],
    [['Fe³⁺ ga sifat reaksiya (KSCN)', 'Test for Fe³⁺ (KSCN)', 'Качественная реакция на Fe³⁺ (KSCN)'], ['FeCl3', 'KSCN']],
    [['Vodorod peroksidning parchalanishi', 'Decomposition of hydrogen peroxide', 'Разложение пероксида водорода'], ['H2O2', 'MnO2']],
    [['"Kumush ko\'zgu" reaksiyasi', '"Silver mirror" test', 'Реакция «серебряного зеркала»'], ['AgNO3', 'NH4OH', 'NH4OH', 'NH4OH', 'C6H12O6', 'heat']],
    [['Glyukoza + Cu(OH)₂', 'Glucose + Cu(OH)₂', 'Глюкоза + Cu(OH)₂'], ['CuSO4', 'NaOH', 'NaOH', 'C6H12O6', 'heat']],
    [['Ammiak olish', 'Making ammonia', 'Получение аммиака'], ['NH4Cl', 'NaOH', 'heat']],
    [['Natriy + suv', 'Sodium + water', 'Натрий + вода'], ['H2O', 'php', 'Na']],
    [['Alanga rangi: mis', 'Flame colour: copper', 'Окраска пламени: медь'], ['CuSO4', 'flame']],
    [['Alanga rangi: kaliy', 'Flame colour: potassium', 'Окраска пламени: калий'], ['KCl', 'flame']]
  ];

  // ---------- engine ----------
  let st, host, ctx = { lang: 'uz' }, T = S.uz, timers = [];
  const fresh = () => ({ vol: 0, sol: [], solids: [], ind: null, heated: false, flags: {}, gas: null, gasT: 0, mirror: false, flame: null, log: [] });
  const L = () => LI[ctx.lang] || 0;
  const nameOf = (id) => (RGI[id] ? RGI[id].n[L()] : pretty(id));
  const fmt = (s, o) => s.replace(/\{(\w)\}/g, (m, k) => o[k]);
  const findSol = (f) => st.sol.find((x) => x.f === f && x.n > 1e-6);
  const addSol = (f, c, a, n) => { const e = st.sol.find((x) => x.f === f); if (e) e.n += n; else st.sol.push({ f, c, a, n }); };
  const addSolid = (f, kind, color, n, c, a) => { const e = st.solids.find((x) => x.f === f && x.kind === kind); if (e) e.n += n; else st.solids.push({ f, kind, color, n, c, a }); };
  const tidy = () => { st.sol = st.sol.filter((x) => x.n > 1e-6); st.solids = st.solids.filter((x) => x.n > 1e-6); };
  const log = (e) => st.log.unshift(e);
  const gasOn = (f) => { st.gas = f; st.gasT = Date.now(); };

  function medium() {
    let acid = 0, base = 0, hyd = 0;
    st.sol.forEach((x) => { if (x.c === 'H') acid += x.n * (x.f === 'CH3COOH' ? 0.3 : 1); else if (x.a === 'OH') base += x.n * (x.f === 'NH4OH' ? 0.4 : 1);
      else if (x.c && x.a) { if (WEAKB.includes(x.c) && !WEAKA.includes(x.a)) hyd -= x.n; if (WEAKA.includes(x.a) && !WEAKB.includes(x.c)) hyd += x.n; } });
    if (!st.vol) return { k: 'none', ph: 7 };
    if (acid > base + 1e-6) return { k: 'acid', ph: st.sol.some((x) => x.c === 'H' && x.f !== 'CH3COOH') ? 1.5 : 3 };
    if (base > acid + 1e-6) return { k: 'base', ph: st.sol.some((x) => x.a === 'OH' && x.f !== 'NH4OH') ? 13 : 10.5 };
    if (hyd < -1e-6) return { k: 'acid', ph: 4.8 }; if (hyd > 1e-6) return { k: 'base', ph: 10.5 };
    return { k: 'neutral', ph: 7 };
  }
  // what an exchange partner turns into: products, whether it drives the reaction, and what the eye sees
  function part(c, a) {
    const heat = st.heated;
    if (c === 'H' && a === 'OH') return { p: ['H2O'], drive: 'water' };
    if (c === 'H' && a === 'CO3') return { p: ['CO2', 'H2O'], drive: 'gas', gas: 'CO2' };
    if (c === 'H' && a === 'SO3') return { p: ['SO2', 'H2O'], drive: 'gas', gas: 'SO2' };
    if (c === 'H' && a === 'S') return { p: ['H2S'], drive: 'gas', gas: 'H2S' };
    if (c === 'NH4' && a === 'OH') return heat ? { p: ['NH3', 'H2O'], drive: 'gas', gas: 'NH3' } : { p: ['NH4OH'], sol: ['NH4', 'OH'] };
    if (c === 'Ag' && a === 'OH') return { p: ['Ag2O', 'H2O'], drive: 'ppt', ppt: 'Ag2O', color: 'brown' };
    if ((c === 'Al' || c === 'Fe3') && a === 'CO3') return { p: [salt(c, 'OH'), 'CO2'], drive: 'ppt', ppt: salt(c, 'OH'), color: c === 'Al' ? 'gel' : 'rust', gas: 'CO2', water: true };
    if (c === 'Al' && a === 'S') return { p: ['Al(OH)3', 'H2S'], drive: 'ppt', ppt: 'Al(OH)3', color: 'gel', gas: 'H2S', water: true };
    const col = PPT[c + ',' + a];
    if (col) return { p: [salt(c, a)], drive: 'ppt', ppt: salt(c, a), color: col };
    return { p: [salt(c, a)], sol: [c, a] };
  }
  function ionicEq(c, a, info) {
    if (info.drive === 'water') return 'H⁺ + OH⁻ → H₂O';
    if (info.drive === 'ppt' && !info.water && info.ppt !== 'Ag2O') { const [nc, na] = counts(c, a); return (nc > 1 ? nc : '') + ISYM[c] + ' + ' + (na > 1 ? na : '') + ISYM[a] + ' → ' + pretty(info.ppt) + '↓'; }
    if (info.gas === 'CO2' && c === 'H') return '2H⁺ + CO₃²⁻ → CO₂↑ + H₂O';
    if (info.gas === 'SO2') return '2H⁺ + SO₃²⁻ → SO₂↑ + H₂O';
    if (info.gas === 'H2S' && c === 'H') return '2H⁺ + S²⁻ → H₂S↑';
    if (info.gas === 'NH3') return 'NH₄⁺ + OH⁻ → NH₃↑ + H₂O';
    return '';
  }
  // react X with Y by swapping ions; returns true when something happened
  function exchange(X, Y, ySolid) {
    if (!X.c || !Y.c || X.f === Y.f || X.c === Y.c || X.a === Y.a) return false;
    const p1 = part(X.c, Y.a), p2 = part(Y.c, X.a), drv = [p1, p2].filter((p) => p.drive && !(ySolid && p.ppt === Y.f));
    if (!drv.length) return false;
    const rk = (o) => (o.c === 'H' || o.a === 'OH' ? 1 : 0), pair = rk(X) > rk(Y) ? [Y, X] : [X, Y];
    const R = pair.map((o) => o.f).concat(drv.some((p) => p.water) ? ['H2O'] : []), P = [...new Set(p1.p.concat(p2.p))].filter((f) => !R.includes(f) || f === 'H2O');
    const pk = (f) => (drv.some((p) => p.ppt === f) ? 0 : f === 'H2O' ? 4 : ['CO2', 'SO2', 'H2S', 'NH3'].includes(f) ? 3 : 1);
    const Pc = P.filter((f) => !(f === 'H2O' && R.includes('H2O'))).sort((a, b) => pk(a) - pk(b)), k = balance(R, Pc); if (!k) return false;
    const kx = pair[0] === X ? k[0] : k[1], ky = pair[0] === X ? k[1] : k[0], ext = Math.min(X.n / kx, Y.n / ky); if (ext < 1e-6) return false;
    X.n -= kx * ext; Y.n -= ky * ext;
    const marks = {};
    Pc.forEach((f, i) => { const kk = k[R.length + i] * ext, src = [p1, p2].find((p) => p.p.includes(f));
      if (src.ppt === f) { addSolid(f, 'ppt', src.color, kk, f === 'Ag2O' ? null : (src === p1 ? X.c : Y.c), f === 'Ag2O' ? null : (f.includes('OH') ? 'OH' : src === p1 ? Y.a : X.a)); marks[f] = '↓'; }
      else if (['CO2', 'SO2', 'H2S', 'NH3'].includes(f)) { gasOn(f); marks[f] = '↑'; }
      else if (src.sol) addSol(f, src.sol[0], src.sol[1], kk); });
    const main = drv[0], ion = !ySolid && X.f !== 'CH3COOH' && Y.f !== 'CH3COOH' && X.f !== 'NH4OH' && Y.f !== 'NH4OH' ? ionicEq(main === p1 ? X.c : Y.c, main === p1 ? Y.a : X.a, main) : '';
    let title;
    if (drv.some((p) => p.drive === 'ppt')) { const pp = drv.find((p) => p.drive === 'ppt'); title = fmt(T.ppt, { c: T.colours[pp.color] || '', f: pretty(pp.ppt) }); }
    else if (drv.some((p) => p.gas)) title = fmt(T.gas, { f: pretty(drv.find((p) => p.gas).gas) });
    else title = ySolid ? T.dissolve : T.neutral;
    const gas = drv.find((p) => p.gas);
    log({ icon: drv.some((p) => p.drive === 'ppt') ? '⬇️' : gas ? '🫧' : '🌡️', title, eq: eqStr(R, Pc, k, marks), ion, note: gas ? T.tests[gas.gas] : '' });
    return true;
  }
  const HNO3EQ = { Cu: ['3Cu + 8HNO₃ → 3Cu(NO₃)₂ + 2NO↑ + 4H₂O', 'Cu(NO3)2', 'Cu', 3 / 8], Ag: ['3Ag + 4HNO₃ → 3AgNO₃ + NO↑ + 2H₂O', 'AgNO3', 'Ag', 3 / 4], Fe: ['Fe + 4HNO₃ → Fe(NO₃)₃ + NO↑ + 2H₂O', 'Fe(NO3)3', 'Fe3', 1 / 4],
    Zn: ['3Zn + 8HNO₃ → 3Zn(NO₃)₂ + 2NO↑ + 4H₂O', 'Zn(NO3)2', 'Zn', 3 / 8], Mg: ['3Mg + 8HNO₃ → 3Mg(NO₃)₂ + 2NO↑ + 4H₂O', 'Mg(NO3)2', 'Mg', 3 / 8], Al: ['Al + 4HNO₃ → Al(NO₃)₃ + NO↑ + 2H₂O', 'Al(NO3)3', 'Al', 1 / 4] };
  function metalStep() {
    for (const m of st.solids.filter((s) => s.kind === 'metal')) {
      const M = m.f;
      if (['Na', 'K', 'Ca'].includes(M)) { if (!st.vol) continue;
        const eq = M === 'Ca' ? 'Ca + 2H₂O → Ca(OH)₂ + H₂↑' : '2' + M + ' + 2H₂O → 2' + M + 'OH + H₂↑'; addSol(M === 'Ca' ? 'Ca(OH)2' : M + 'OH', M, 'OH', m.n); m.n = 0; gasOn('H2');
        log({ icon: '💥', title: fmt(T.gas, { f: 'H₂' }), eq, note: T.tests.H2 }); return true; }
      for (const x of st.sol) {
        if (x.c === 'H' && x.a === 'NO3' && HNO3EQ[M]) { const h = HNO3EQ[M], ext = Math.min(m.n, x.n * h[3]); m.n -= ext; x.n -= ext / h[3]; addSol(h[1], h[2], 'NO3', ext); gasOn('NO');
          log({ icon: '🟤', title: fmt(T.gas, { f: 'NO' }), eq: h[0], note: T.tests.NO }); return true; }
        if (x.c === 'H') { if (ACT.indexOf(M) > ACT.indexOf('H') || M === 'Pb') continue; const mi = MION[M], R = [M, x.f], P = [salt(mi, x.a), 'H2'], k = balance(R, P); if (!k) continue;
          const ext = Math.min(m.n / k[0], x.n / k[1]); m.n -= k[0] * ext; x.n -= k[1] * ext; addSol(P[0], mi, x.a, k[2] * ext); gasOn('H2');
          log({ icon: '🫧', title: fmt(T.gas, { f: 'H₂' }), eq: eqStr(R, P, k, { H2: '↑' }), ion: (k[0] > 1 ? k[0] : '') + M + ' + ' + (k[1] * (x.f === 'H2SO4' ? 2 : 1) > 1 ? k[1] * (x.f === 'H2SO4' ? 2 : 1) : '') + 'H⁺ → ' + (k[0] > 1 ? k[0] : '') + ISYM[mi] + ' + ' + (k[3] > 1 ? k[3] : '') + 'H₂↑', note: T.tests.H2 }); return true; }
        if ((M === 'Al' || M === 'Zn') && x.a === 'OH' && (x.c === 'Na' || x.c === 'K')) {
          const cx = M === 'Al' ? x.c + '[Al(OH)4]' : x.c + '2[Zn(OH)4]', R = [M, x.f, 'H2O'], P = [cx, 'H2'], k = balance(R, P); if (!k) continue;
          const ext = Math.min(m.n / k[0], x.n / k[1]); m.n -= k[0] * ext; x.n -= k[1] * ext; addSol(cx, null, null, k[3] * ext); gasOn('H2');
          log({ icon: '🫧', title: fmt(T.gas, { f: 'H₂' }), eq: eqStr(R, P, k, { H2: '↑' }), note: T.tests.H2 }); return true; }
        if (x.c && x.c !== 'H' && x.c !== 'NH4' && MOFION[x.c] !== M && x.c !== MION[M]) {
          const xm = MOFION[x.c] || ION[x.c][0]; if (ACT.indexOf(M) < 0 || ACT.indexOf(xm) < 0 || ACT.indexOf(M) >= ACT.indexOf(xm)) continue;
          if (x.c === 'Fe3' && (M === 'Cu' || M === 'Fe')) { const R = [M, x.f], P = M === 'Fe' ? [salt('Fe2', x.a)] : [salt('Fe2', x.a), salt('Cu', x.a)], k = balance(R, P); if (!k) continue;
            const ext = Math.min(m.n / k[0], x.n / k[1]); m.n -= k[0] * ext; x.n -= k[1] * ext; addSol(P[0], 'Fe2', x.a, k[2] * ext); if (P[1]) addSol(P[1], 'Cu', x.a, k[3] * ext);
            log({ icon: '🎨', title: T.colour, eq: eqStr(R, P, k) }); return true; }
          const mi = MION[M], R = [M, x.f], P = [salt(mi, x.a), xm], k = balance(R, P); if (!k) continue;
          const ext = Math.min(m.n / k[0], x.n / k[1]); m.n -= k[0] * ext; x.n -= k[1] * ext; addSol(P[0], mi, x.a, k[2] * ext);
          addSolid(xm, 'deposit', xm === 'Cu' ? COL.copper : xm === 'Ag' ? COL.silver : xm === 'Pb' ? COL.lead : COL.silver, k[3] * ext);
          log({ icon: '✨', title: fmt(T.metalDep, { f: xm }), eq: eqStr(R, P, k), ion: (k[0] > 1 ? k[0] : '') + M + ' + ' + (k[3] > 1 ? k[3] : '') + ISYM[x.c] + ' → ' + (k[0] > 1 ? k[0] : '') + ISYM[mi] + ' + ' + (k[3] > 1 ? k[3] : '') + xm }); return true; }
      }
    }
    return false;
  }
  // redox, complex and organic tests that do not follow the plain ion-swap rule
  function special() {
    const has = (f) => findSol(f), solid = (f) => st.solids.find((s) => s.f === f && s.n > 1e-6), use = (o, k) => { o.n = Math.max(0, o.n - k); };
    const mn = has('KMnO4');
    if (mn) { const md = st.sol.some((x) => x.f === 'H2SO4') ? 'acid' : st.sol.some((x) => x.f === 'KOH' || x.f === 'NaOH') ? 'base' : 'neutral';
      const red = ['Na2SO3', 'FeSO4', 'H2O2', 'KI'].map(has).find(Boolean);
      if (red) { const E = {
        acid: { Na2SO3: ['2KMnO₄ + 5Na₂SO₃ + 3H₂SO₄ → 2MnSO₄ + 5Na₂SO₄ + K₂SO₄ + 3H₂O', 2, 5], FeSO4: ['2KMnO₄ + 10FeSO₄ + 8H₂SO₄ → 2MnSO₄ + 5Fe₂(SO₄)₃ + K₂SO₄ + 8H₂O', 2, 10],
          H2O2: ['2KMnO₄ + 5H₂O₂ + 3H₂SO₄ → 2MnSO₄ + 5O₂↑ + K₂SO₄ + 8H₂O', 2, 5], KI: ['2KMnO₄ + 10KI + 8H₂SO₄ → 2MnSO₄ + 5I₂ + 6K₂SO₄ + 8H₂O', 2, 10] },
        neutral: { Na2SO3: ['2KMnO₄ + 3Na₂SO₃ + H₂O → 2MnO₂↓ + 3Na₂SO₄ + 2KOH', 2, 3], H2O2: ['2KMnO₄ + 3H₂O₂ → 2MnO₂↓ + 3O₂↑ + 2KOH + 2H₂O', 2, 3], KI: ['2KMnO₄ + 6KI + 4H₂O → 2MnO₂↓ + 3I₂ + 8KOH', 2, 6] },
        base: { Na2SO3: ['2KMnO₄ + Na₂SO₃ + 2KOH → 2K₂MnO₄ + Na₂SO₄ + H₂O', 2, 1] } }[md][red.f];
        if (E) { const ext = Math.min(mn.n / E[1], red.n / E[2]); use(mn, E[1] * ext); use(red, E[2] * ext);
          if (md === 'acid') { addSol('MnSO4', 'Mn', 'SO4', E[1] * ext); if (red.f === 'FeSO4') addSol('Fe2(SO4)3', 'Fe3', 'SO4', 5 * ext); }
          if (md === 'neutral') addSolid('MnO2', 'ppt', 'brown', E[1] * ext); if (md === 'base') addSol('K2MnO4', null, null, E[1] * ext);
          if (red.f === 'H2O2') gasOn('O2'); if (red.f === 'KI') addSol('I2', null, null, 2 * ext);
          log({ icon: '🎨', title: T.colour + ' — ' + { acid: 'Mn⁺⁷ → Mn⁺²', neutral: 'Mn⁺⁷ → Mn⁺⁴ (MnO₂↓)', base: 'Mn⁺⁷ → Mn⁺⁶ (MnO₄²⁻)' }[md], eq: E[0], note: red.f === 'H2O2' ? T.tests.O2 : '' }); return true; } } }
    const fe3 = st.sol.find((x) => x.c === 'Fe3' && x.f === 'FeCl3' && x.n > 1e-6);
    if (fe3 && has('KI')) { const ki = has('KI'), ext = Math.min(fe3.n / 2, ki.n / 2); use(fe3, 2 * ext); use(ki, 2 * ext); addSol('FeCl2', 'Fe2', 'Cl', 2 * ext); addSol('I2', null, null, ext); addSol('KCl', 'K', 'Cl', 2 * ext);
      log({ icon: '🎨', title: T.colour, eq: '2FeCl₃ + 2KI → 2FeCl₂ + I₂ + 2KCl' }); return true; }
    if (fe3 && has('KSCN')) { const s = has('KSCN'), ext = Math.min(fe3.n, s.n / 3); use(fe3, ext); use(s, 3 * ext); addSol('Fe(SCN)3', null, null, ext); addSol('KCl', 'K', 'Cl', 3 * ext);
      log({ icon: '🩸', title: T.colour, eq: 'FeCl₃ + 3KSCN → Fe(SCN)₃ + 3KCl', ion: 'Fe³⁺ + 3SCN⁻ → Fe(SCN)₃' }); return true; }
    if (has('H2O2') && solid('MnO2')) { const h = has('H2O2'); use(h, h.n); gasOn('O2'); log({ icon: '🫧', title: fmt(T.gas, { f: 'O₂' }), eq: '2H₂O₂ —(MnO₂)→ 2H₂O + O₂↑', note: T.tests.O2 }); return true; }
    if (has('I2') && has('starch') && !st.flags.starch) { st.flags.starch = 1; log({ icon: '🟦', title: T.colour, eq: 'I₂ + (C₆H₁₀O₅)ₙ → ' + ['to\'q ko\'k birikma', 'deep-blue complex', 'тёмно-синее соединение'][L()] }); return true; }
    const cuoh = solid('Cu(OH)2');
    const left = (c) => st.sol.some((x) => x.c === c && x.n > 1e-6);
    if (cuoh && has('NH4OH') && !left('Cu')) { const a = has('NH4OH'), ext = Math.min(cuoh.n, a.n / 4); if (ext > 1e-6) { use(cuoh, ext); use(a, 4 * ext); addSol('[Cu(NH3)4](OH)2', null, null, ext);
      log({ icon: '🎨', title: T.dissolve, eq: 'Cu(OH)₂ + 4NH₃·H₂O → [Cu(NH₃)₄](OH)₂ + 4H₂O' }); return true; } }
    const ag2o = solid('Ag2O');
    if (ag2o && has('NH4OH') && !left('Ag')) { const a = has('NH4OH'), ext = Math.min(ag2o.n, a.n / 4); if (ext > 1e-6) { use(ag2o, ext); use(a, 4 * ext); addSol('[Ag(NH3)2]OH', null, null, 2 * ext);
      log({ icon: '🧪', title: T.dissolve, eq: 'Ag₂O + 4NH₃·H₂O → 2[Ag(NH₃)₂]OH + 3H₂O' }); return true; } }
    for (const [f, cx, kk] of [['Al(OH)3', 'Na[Al(OH)4]', 1], ['Zn(OH)2', 'Na2[Zn(OH)4]', 2]]) { const p = solid(f), b = st.sol.find((x) => (x.f === 'NaOH' || x.f === 'KOH') && x.n > 1e-6);
      if (p && b && !left(f[0] === 'A' ? 'Al' : 'Zn')) { const ext = Math.min(p.n, b.n / kk); use(p, ext); use(b, kk * ext); addSol(b.f === 'KOH' ? cx.replace('Na', 'K') : cx, null, null, ext);
        log({ icon: '🫗', title: T.dissolve, eq: pretty(f) + ' + ' + (kk > 1 ? kk : '') + pretty(b.f) + ' → ' + pretty(b.f === 'KOH' ? cx.replace('Na', 'K') : cx) }); return true; } }
    const poly = has('C3H5(OH)3') || has('C6H12O6');
    if (cuoh && poly && !st.heated && !st.flags.cuGly) { st.flags.cuGly = 1; use(cuoh, cuoh.n); addSol('cuGly', null, null, 1);
      log({ icon: '🟦', title: T.dissolve, eq: poly.f === 'C6H12O6' ? 'C₆H₁₂O₆ + Cu(OH)₂ → ' + ['to\'q ko\'k eritma (ko\'p atomli spirt guruhlari)', 'deep-blue solution (polyol groups)', 'ярко-синий раствор (многоатомный спирт)'][L()] : '2C₃H₅(OH)₃ + Cu(OH)₂ → (C₃H₅(OH)₂O)₂Cu + 2H₂O' }); return true; }
    if (st.heated && has('C6H12O6') && (cuoh || has('cuGly'))) { const g = has('C6H12O6'); use(g, g.n); if (cuoh) use(cuoh, cuoh.n); const cg = has('cuGly'); if (cg) use(cg, cg.n); addSolid('Cu2O', 'ppt', 'red', 0.5);
      log({ icon: '🔥', title: fmt(T.ppt, { c: T.colours.red, f: 'Cu₂O' }), eq: 'C₆H₁₂O₆ + 2Cu(OH)₂ —t→ C₆H₁₂O₇ + Cu₂O↓ + 2H₂O' }); return true; }
    if (st.heated && has('C6H12O6') && has('[Ag(NH3)2]OH') && !st.mirror) { const g = has('C6H12O6'), a = has('[Ag(NH3)2]OH'); use(g, g.n); use(a, a.n); st.mirror = true;
      log({ icon: '🪞', title: ['Probirka devorida "kumush ko\'zgu" hosil bo\'ldi', 'A "silver mirror" coats the tube', 'На стенках образовалось «серебряное зеркало»'][L()], eq: 'C₆H₁₂O₆ + Ag₂O —(NH₃, t)→ C₆H₁₂O₇ + 2Ag↓' }); return true; }
    if (st.heated && cuoh) { use(cuoh, cuoh.n); addSolid('CuO', 'ppt', 'black', 0.5); log({ icon: '🔥', title: fmt(T.ppt, { c: T.colours.black, f: 'CuO' }), eq: 'Cu(OH)₂ —t→ CuO + H₂O' }); return true; }
    return false;
  }
  function react() {
    for (let guard = 0; guard < 12; guard++) { tidy(); let did = metalStep() || special();
      if (!did) { outer: for (let i = st.sol.length - 1; i >= 0; i--) { for (let j = 0; j < st.sol.length; j++) if (j !== i && exchange(st.sol[i], st.sol[j], false)) { did = true; break outer; }
        for (const s of st.solids) if (s.kind === 'ppt' && s.c && exchange(st.sol[i], s, true)) { did = true; break outer; }
        for (const s of st.solids) if (s.kind === 'solid' && s.c && exchange(st.sol[i], s, true)) { did = true; break outer; } } }
      if (!did) break; }
    tidy();
  }
  function add(id) {
    const r = RGI[id]; if (!r) return;
    if (st.vol >= 8 && !r.solid && r.t !== 'ind') { log({ icon: '⚠️', title: T.full }); return render(); }
    const before = st.log.length;
    log({ icon: '➕', title: fmt(T.added, { x: r.n[L()] + (r.t === 'ind' ? '' : ' (' + disp(r.id) + ')') }), muted: true });
    // a nail or granule is a large excess; a sodium piece is small and is used up
    if (r.t === 'metal') addSolid(id, 'metal', '', ['Na', 'K', 'Ca'].includes(id) ? 1 : 4);
    else if (r.solid) addSolid(id, 'solid', '', 1, r.c, r.a);
    else if (r.t === 'ind') st.ind = id;
    else { st.vol++; addSol(id, r.c, r.a, DOSE[id] || 1); }
    react();
    if (st.log.length === before + 1 && st.vol && (r.c || r.t === 'metal') && st.sol.length + st.solids.length > 1) {
      const mt = r.t === 'metal' ? r.id : null;
      log({ icon: '·', title: T.nothing, note: mt ? (st.sol.some((x) => x.c === 'H') ? fmt(T.noAcid, { m: mt }) : fmt(T.noMetal, { m: mt })) : T.nothingWhy }); }
    render();
  }
  function heat() { st.heated = !st.heated; if (st.heated) { log({ icon: '🔥', title: T.heatOn, muted: true }); react(); } render(); }
  function flame() {
    const ions = [...st.sol.map((x) => x.c), ...st.solids.map((s) => s.c || (s.kind === 'metal' ? s.f : null))].filter(Boolean).map((c) => MOFION[c] || c);
    const k = ['Na', 'Li', 'Sr', 'Ca', 'Ba', 'Cu', 'K'].find((x) => ions.includes(x));
    st.flame = k ? FLAME[k][0] : '#4dd2ff'; setTimeout(() => { st.flame = null; draw(); }, 3500);
    log(k ? { icon: '🔥', title: fmt(T.flameRes, { c: FLAME[k][1 + L()], i: ISYM[k] || k }) } : { icon: '🔥', title: T.flameNone }); render();
  }
  function clear() { st = fresh(); render(); }
  function runPreset(i) {
    clear(); timers.forEach(clearTimeout); timers = [];
    PRESETS[i][1].forEach((s, k) => timers.push(setTimeout(() => (s === 'heat' ? (!st.heated && heat()) : s === 'flame' ? flame() : add(s)), 450 + k * 750)));
  }

  // ---------- drawing ----------
  const mix = (cols) => { if (!cols.length) return null; let r = 0, g = 0, b = 0, w = 0;
    cols.forEach(([c, k]) => { const v = parseInt(c.slice(1), 16); r += (v >> 16) * k; g += ((v >> 8) & 255) * k; b += (v & 255) * k; w += k; });
    return 'rgb(' + Math.round(r / w) + ',' + Math.round(g / w) + ',' + Math.round(b / w) + ')'; };
  function liquidColour(md) {
    const cols = [];
    st.sol.forEach((x) => { const c = SOLCOL[x.f] || (x.c && { Cu: '#3a8cff', Fe3: '#d4a017', Fe2: '#a8d8a0', Ni: '#3fae5a' }[x.c]); if (c) cols.push([c, x.n * (TINT[x.f] || 1)]); });
    if (st.flags.starch && findSol('I2')) cols.push([SOLCOL.starchI2, 6]);
    if (st.ind && st.vol) { const p = md.ph, c = st.ind === 'php' ? (p > 8.2 ? '#e0207a' : null) : st.ind === 'litmus' ? (p < 5 ? '#e63a4a' : p <= 8 ? '#8a5ad0' : '#3a6ae6') : (p < 3.1 ? '#e6455a' : p < 4.4 ? '#f08a2a' : '#f2c23c'); if (c) cols.push([c, 3]); }
    return mix(cols);
  }
  function tubeSVG() {
    const md = medium(), lc = liquidColour(md), H = st.vol ? Math.min(250, 40 + st.vol * 26) : 0, top = 330 - H, now = Date.now(), bubbling = st.gas && now - st.gasT < 6000;
    const ppt = st.solids.filter((s) => s.kind === 'ppt'), pptH = Math.min(70, ppt.reduce((t, s) => t + s.n, 0) * 30 + (ppt.length ? 8 : 0));
    let y = 330, layers = '';
    ppt.forEach((s) => { const h = Math.max(8, Math.min(60, s.n * 30)); y -= h; layers += '<rect x="66" y="' + y + '" width="68" height="' + h + '" fill="' + (COL[s.color] || '#ddd') + '"/>'
      + Array.from({ length: 10 }, (_, i) => '<circle cx="' + (70 + (i * 37) % 60) + '" cy="' + (y + (i * 13) % Math.max(6, h - 2) + 2) + '" r="2.2" fill="' + (COL[s.color] || '#ddd') + '" opacity=".9" style="filter:brightness(.85)"/>').join(''); });
    const metals = st.solids.filter((s) => s.kind === 'metal' || s.kind === 'solid' || s.kind === 'deposit').map((s, i) => { const x = 82 + (i % 3) * 16, yy = 318 - Math.floor(i / 3) * 14, sz = 6 + Math.min(1, s.n / 2) * 6;
      const c = s.kind === 'deposit' ? s.color : { Na: '#d9d6c8', Mg: '#cfd4da', Al: '#d5dae0', Zn: '#a9b0b8', Fe: '#7d838c', Cu: '#c46a2e', MnO2: '#2a2a2a', CaCO3: '#f0eee6' }[s.f] || '#bbb';
      return s.f === 'Fe' ? '<rect x="96" y="150" width="8" height="175" rx="3" fill="' + c + '"/><rect x="88" y="145" width="24" height="8" rx="3" fill="' + c + '"/>'
        : s.f === 'Cu' && s.kind === 'metal' ? '<path d="M100 120 C 110 180, 90 240, 102 320" stroke="' + c + '" stroke-width="5" fill="none"/>'
          : s.f === 'Mg' ? '<rect x="94" y="230" width="12" height="95" rx="2" fill="' + c + '"/>'
            : s.kind === 'deposit' ? (st.solids.some((q) => q.f === 'Fe' && q.kind === 'metal') ? '<rect x="95" y="' + Math.max(top, 150) + '" width="10" height="' + (325 - Math.max(top, 150)) + '" rx="3" fill="' + c + '" opacity=".9"/>' : st.solids.some((q) => q.f === 'Cu' && q.kind === 'metal') ? Array.from({ length: 8 }, (_, j) => '<path d="M' + (96 + (j % 2) * 8) + ' ' + (300 - j * 18) + ' l6 -6 l6 6 l-6 6z" fill="' + c + '"/>').join('') : '<circle cx="' + x + '" cy="' + yy + '" r="' + sz + '" fill="' + c + '"/>')
              : '<circle cx="' + x + '" cy="' + yy + '" r="' + sz + '" fill="' + c + '"/>'; }).join('');
    const bub = bubbling && st.vol ? Array.from({ length: 14 }, (_, i) => '<circle class="lb-b" style="animation-delay:' + (i * 0.17) + 's" cx="' + (72 + (i * 23) % 56) + '" cy="322" r="' + (2 + (i % 3)) + '" fill="#fff" opacity=".8"/>').join('') : '';
    const cloud = bubbling && ['NO', 'H2S', 'NH3', 'SO2'].includes(st.gas) ? '<g class="lb-c"><ellipse cx="100" cy="40" rx="34" ry="14" fill="' + (st.gas === 'NO' ? '#a0521d' : '#cfd6e0') + '" opacity=".55"/></g>' : '';
    const flameUnder = st.heated ? '<g class="lb-f"><path d="M100 395 c-16 -16 -6 -36 0 -48 c6 12 16 32 0 48z" fill="#ff8a3a"/><path d="M100 393 c-8 -8 -3 -20 0 -26 c3 6 8 18 0 26z" fill="#4dd2ff"/></g>' : '';
    const flameTest = st.flame ? '<g class="lb-f"><path d="M175 300 c-30 -30 -12 -80 0 -110 c12 30 30 80 0 110z" fill="' + st.flame + '" opacity=".9"/><line x1="150" y1="220" x2="120" y2="150" stroke="#9aa3b8" stroke-width="2"/></g>' : '';
    return '<svg viewBox="0 0 220 410" style="width:100%;max-width:240px;height:auto;display:block;margin:0 auto"><defs><clipPath id="lbClip"><path d="M64 20 V310 a36 36 0 0 0 72 0 V20 Z"/></clipPath>'
      + '<linearGradient id="lbMir" x1="0" x2="1"><stop offset="0" stop-color="#e8ecf2"/><stop offset=".5" stop-color="#9aa3b0"/><stop offset="1" stop-color="#eef2f6"/></linearGradient></defs>'
      + '<style>.lb-b{animation:lbB 1.6s linear infinite}@keyframes lbB{from{transform:translateY(0);opacity:.9}to{transform:translateY(-' + Math.max(40, H - 10) + 'px);opacity:0}}.lb-f{transform-origin:100px 395px;animation:lbF .5s ease-in-out infinite alternate}@keyframes lbF{to{transform:scale(1.05,.92)}}.lb-c{animation:lbC 3s ease-out infinite}@keyframes lbC{from{transform:translateY(20px);opacity:0}40%{opacity:1}to{transform:translateY(-14px);opacity:0}}</style>'
      + '<g clip-path="url(#lbClip)">' + (st.mirror ? '<rect x="60" y="20" width="80" height="330" fill="url(#lbMir)"/>' : '')
      + (st.vol ? '<rect x="60" y="' + top + '" width="80" height="' + (H + 40) + '" fill="' + (lc || 'rgba(170,205,255,.22)') + '" opacity="' + (lc ? 0.82 : 1) + '"/><rect x="60" y="' + top + '" width="80" height="3" fill="#fff" opacity=".35"/>' : '')
      + layers + metals + bub + '</g>'
      + '<path d="M64 20 V310 a36 36 0 0 0 72 0 V20" style="fill:none;stroke:var(--text);stroke-width:2.5"/><path d="M58 20 h84" style="stroke:var(--text);stroke-width:3;stroke-linecap:round"/>'
      + '<path d="M74 40 V300" stroke="#fff" stroke-width="4" opacity=".18" stroke-linecap="round"/>' + cloud + flameUnder + flameTest + '</svg>';
  }
  function draw() { const t = host && host.querySelector('.lb-tube'); if (t) t.innerHTML = tubeSVG(); }
  function render() {
    if (!host) return;
    const md = medium(), mdc = { acid: '#ff5d6e', base: '#6f8bff', neutral: '#2ecc96', none: 'var(--muted)' }[md.k];
    host.querySelector('.lb-tube').innerHTML = tubeSVG();
    host.querySelector('.lb-md').innerHTML = '<span style="color:' + mdc + '">● ' + T.medium[md.k] + (md.k !== 'none' ? ' · pH ≈ ' + String(md.ph).replace('.', L() === 1 ? '.' : ',') : '') + '</span>';
    host.querySelector('.lb-heat').textContent = '🔥 ' + (st.heated ? T.stop : T.heat);
    host.querySelector('.lb-heat').style.background = st.heated ? 'rgba(255,138,58,.2)' : 'var(--btn)';
    const contents = st.sol.filter((x) => !['H2O'].includes(x.f)).map((x) => pretty(x.f === 'NH4OH' ? 'NH3·H2O' : x.f === 'cuGly' ? 'Cu-glitserat' : x.f)).concat(st.solids.map((s) => pretty(s.f) + (s.kind === 'ppt' ? '↓' : '')));
    host.querySelector('.lb-in').textContent = contents.length ? contents.join(' · ') : '';
    host.querySelector('.lb-log').innerHTML = st.log.length ? st.log.map((e) => '<div style="padding:9px 11px;border-radius:10px;background:' + (e.muted ? 'transparent' : 'var(--panel)') + ';border:1px solid ' + (e.muted ? 'transparent' : 'var(--line)') + '">'
      + '<div style="display:flex;gap:8px;align-items:baseline;font-size:' + (e.muted ? 12.5 : 14) + 'px;font-weight:' + (e.muted ? 500 : 700) + ';color:' + (e.muted ? 'var(--muted)' : 'var(--text)') + '"><span>' + e.icon + '</span><span>' + e.title + '</span></div>'
      + (e.eq ? '<div style="margin-top:6px;font:600 14px IBM Plex Mono,monospace;color:var(--green);overflow-x:auto;white-space:nowrap">' + e.eq + '</div>' : '')
      + (e.ion ? '<div style="margin-top:4px;font:12.5px IBM Plex Mono,monospace;color:var(--body)"><span style="color:var(--muted)">' + T.ionic + ':</span> ' + e.ion + '</div>' : '')
      + (e.note ? '<div style="margin-top:5px;font-size:12.5px;color:var(--body)">' + e.note + '</div>' : '') + '</div>').join('')
      : '<div style="font-size:13.5px;color:var(--muted);line-height:1.6">' + T.empty + '</div>';
  }
  function shelf(q) {
    const qq = (q || '').toLowerCase().replace(/['‘’ʻ]/g, '');
    return ['acid', 'base', 'salt', 'metal', 'ind', 'other'].map((g) => { const items = RG.filter((r) => r.t === g && (!qq || (r.id + ' ' + r.n.join(' ')).toLowerCase().replace(/['‘’ʻ]/g, '').includes(qq))); if (!items.length) return '';
      return '<div style="margin-bottom:12px"><div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 2px 6px">' + T.groups[g] + '</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px">'
        + items.map((r) => { const c = SOLCOL[r.id] || ({ acid: '#ff5d6e', base: '#6f8bff', metal: '#9aa3b8', ind: '#c08bff' }[r.t]) || '#2ecc96';
          return '<button data-r="' + r.id + '" title="' + r.n[L()] + '" style="display:flex;align-items:center;gap:8px;text-align:left;padding:7px 9px;border-radius:9px;border:1px solid var(--line);background:var(--btn);color:var(--text);cursor:pointer;font-family:Space Grotesk,sans-serif">'
            + '<span style="flex:0 0 auto;width:12px;height:18px;border-radius:3px 3px 5px 5px;background:' + c + ';box-shadow:0 0 8px ' + c + '66"></span><span style="min-width:0"><span style="display:block;font:600 13px IBM Plex Mono,monospace">' + (r.t === 'ind' ? r.n[L()] : disp(r.id)) + '</span>'
            + '<span style="display:block;font-size:10.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (r.t === 'ind' ? '' : r.n[L()]) + '</span></span></button>'; }).join('') + '</div></div>'; }).join('');
  }
  function build() {
    const btn = (cls, t, c) => '<button class="' + cls + '" style="padding:9px 13px;border-radius:10px;border:1px solid ' + (c || 'var(--line)') + ';background:var(--btn);color:var(--text);font:600 13px Space Grotesk,sans-serif;cursor:pointer">' + t + '</button>';
    host.innerHTML = '<style>.lb-wrap{display:grid;grid-template-columns:minmax(260px,1fr) minmax(260px,330px) minmax(280px,1.1fr);gap:16px;height:100%;padding:16px 20px;box-sizing:border-box}'
      + '.lb-col{min-height:0;overflow:auto;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px}'
      + '@media (max-width:980px){.lb-wrap{grid-template-columns:1fr;height:auto}.lb-col{overflow:visible}.lb-bench{order:-1}}.lb-wrap button:hover{filter:brightness(1.12)}</style>'
      + '<div class="lb-wrap"><div class="lb-col"><div style="font-weight:700;color:var(--text);margin-bottom:8px">🧴 ' + T.shelf + '</div>'
      + '<input class="lb-q" placeholder="' + T.find + '" style="width:100%;box-sizing:border-box;margin-bottom:12px;background:var(--input);border:1px solid var(--line);border-radius:10px;color:var(--text);font:13px Space Grotesk,sans-serif;padding:9px 12px;outline:none"><div class="lb-shelf">' + shelf('') + '</div></div>'
      + '<div class="lb-col lb-bench" style="display:flex;flex-direction:column;align-items:stretch;gap:10px"><div class="lb-md" style="font-size:13px;font-weight:600;text-align:center"></div><div class="lb-tube" style="flex:1;min-height:300px;display:flex;align-items:center"></div>'
      + '<div class="lb-in" style="min-height:18px;text-align:center;font:12px IBM Plex Mono,monospace;color:var(--muted)"></div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">' + btn('lb-heat', '🔥 ' + T.heat, 'rgba(255,138,58,.5)') + btn('lb-flame', '🕯️ ' + T.flame) + btn('lb-clear', '🧽 ' + T.clear) + '</div>'
      + '<div style="font-size:11px;color:var(--muted);text-align:center;line-height:1.5">⚠️ ' + T.safety + '</div></div>'
      + '<div class="lb-col" style="display:flex;flex-direction:column;gap:12px"><div><div style="font-weight:700;color:var(--text);margin-bottom:8px">📋 ' + T.presets + '</div>'
      + '<select class="lb-pre" style="width:100%;background:var(--input);border:1px solid var(--line);border-radius:10px;color:var(--text);font:13px Space Grotesk,sans-serif;padding:9px 10px">' + PRESETS.map((p, i) => '<option value="' + i + '">' + (i + 1) + '. ' + p[0][L()] + '</option>').join('') + '</select>'
      + '<button class="lb-run" style="margin-top:8px;width:100%;padding:9px;border-radius:10px;border:1px solid rgba(46,204,150,.55);background:rgba(46,204,150,.15);color:var(--green);font:700 13px Space Grotesk,sans-serif;cursor:pointer">▶ ' + T.run + '</button></div>'
      + '<div style="font-weight:700;color:var(--text)">🔬 ' + T.log + '</div><div class="lb-log" style="display:flex;flex-direction:column;gap:8px"></div></div></div>';
    host.querySelector('.lb-shelf').addEventListener('click', (e) => { const b = e.target.closest('button[data-r]'); if (b) add(b.dataset.r); });
    host.querySelector('.lb-q').addEventListener('input', (e) => { host.querySelector('.lb-shelf').innerHTML = shelf(e.target.value); });
    host.querySelector('.lb-heat').addEventListener('click', heat);
    host.querySelector('.lb-flame').addEventListener('click', flame);
    host.querySelector('.lb-clear').addEventListener('click', () => { timers.forEach(clearTimeout); timers = []; clear(); });
    host.querySelector('.lb-run').addEventListener('click', () => runPreset(+host.querySelector('.lb-pre').value));
    render();
  }
  let tick = 0;
  window.PTLAB = {
    mount(h, c) { host = h; ctx = c; T = S[c.lang] || S.uz; if (!st) st = fresh(); build(); clearInterval(tick); tick = setInterval(() => { if (st.gas && Date.now() - st.gasT > 6000) { st.gas = null; draw(); } }, 1000); },
    setCtx(c) { ctx = c; T = S[c.lang] || S.uz; if (host) build(); },
    unmount() { timers.forEach(clearTimeout); timers = []; clearInterval(tick); host = null; },
    // exposed for testing: run reagent ids and return the log
    _test(ids) { st = fresh(); ids.forEach((x) => (x === 'heat' ? (st.heated = true, react()) : add(x))); return st.log.slice().reverse(); },
    _tube: () => tubeSVG(),
    balance
  };
})();
