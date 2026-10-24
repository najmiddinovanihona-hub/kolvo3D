// Kolvo virtual laboratory: a free test-tube bench. Reagents are poured into one test tube and a small rule engine
// (ion exchange from the solubility table, neutralisation, gases, metal displacement, hydrolysis, redox and organic tests,
// heating with boiling, evaporation and thermal decomposition) decides what happens; the tube is drawn as realistic SVG.
// window.PTLAB.mount(host, { lang, light }) draws the bench; setCtx() switches language; unmount() stops timers.
(function () {
  'use strict';

  // ---------- formulas ----------
  const SUBD = '₀₁₂₃₄₅₆₇₈₉';
  const pretty = (f) => f.replace(/(\d+)/g, (m, d, i, s) => (i > 0 && /[A-Za-z)\]·]/.test(s[i - 1]) && s[i - 1] !== '·' ? d.split('').map((c) => SUBD[+c]).join('') : d));
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
  const eqStr = (R, P, k, marks, cond) => { const t = (f, i) => (k[i] > 1 ? k[i] : '') + pretty(f) + ((marks || {})[f] || '');
    return R.map((f, i) => t(f, i)).join(' + ') + (cond ? ' —' + cond + '→ ' : ' → ') + P.map((f, i) => t(f, i + R.length)).join(' + '); };

  // ---------- ions, names and the solubility table ----------
  // cations: key, symbol, charge, polyatomic, uz / en / ru (genitive), colour of the hydrated ion
  const CATS = [['Li', 'Li', 1, 0, 'litiy', 'lithium', 'лития'], ['Na', 'Na', 1, 0, 'natriy', 'sodium', 'натрия'], ['K', 'K', 1, 0, 'kaliy', 'potassium', 'калия'],
    ['NH4', 'NH4', 1, 1, 'ammoniy', 'ammonium', 'аммония'], ['Mg', 'Mg', 2, 0, 'magniy', 'magnesium', 'магния'], ['Ca', 'Ca', 2, 0, 'kalsiy', 'calcium', 'кальция'],
    ['Sr', 'Sr', 2, 0, 'stronsiy', 'strontium', 'стронция'], ['Ba', 'Ba', 2, 0, 'bariy', 'barium', 'бария'], ['Al', 'Al', 3, 0, 'alyuminiy', 'aluminium', 'алюминия'],
    ['Cr', 'Cr', 3, 0, 'xrom(III)', 'chromium(III)', 'хрома(III)', '#3b6e58'], ['Mn', 'Mn', 2, 0, 'marganes(II)', 'manganese(II)', 'марганца(II)', '#f3cdd5'],
    ['Fe2', 'Fe', 2, 0, 'temir(II)', 'iron(II)', 'железа(II)', '#cde7bd'], ['Fe3', 'Fe', 3, 0, 'temir(III)', 'iron(III)', 'железа(III)', '#c8861c'],
    ['Co', 'Co', 2, 0, 'kobalt(II)', 'cobalt(II)', 'кобальта(II)', '#e0769a'], ['Ni', 'Ni', 2, 0, 'nikel(II)', 'nickel(II)', 'никеля(II)', '#3aa86a'],
    ['Cu', 'Cu', 2, 0, 'mis(II)', 'copper(II)', 'меди(II)', '#2b8be0'], ['Zn', 'Zn', 2, 0, 'rux', 'zinc', 'цинка'], ['Ag', 'Ag', 1, 0, 'kumush', 'silver', 'серебра'],
    ['Hg', 'Hg', 2, 0, 'simob(II)', 'mercury(II)', 'ртути(II)'], ['Sn', 'Sn', 2, 0, 'qalay(II)', 'tin(II)', 'олова(II)'], ['Pb', 'Pb', 2, 0, 'qo\'rg\'oshin(II)', 'lead(II)', 'свинца(II)']];
  const ANS = [['OH', 'OH', 1, 1, 'gidroksid', 'hydroxide', 'гидроксид', 'Гидроксиды'], ['F', 'F', 1, 0, 'ftorid', 'fluoride', 'фторид', 'Фториды'], ['Cl', 'Cl', 1, 0, 'xlorid', 'chloride', 'хлорид', 'Хлориды'],
    ['Br', 'Br', 1, 0, 'bromid', 'bromide', 'бромид', 'Бромиды'], ['I', 'I', 1, 0, 'yodid', 'iodide', 'иодид', 'Иодиды'], ['NO3', 'NO3', 1, 1, 'nitrat', 'nitrate', 'нитрат', 'Нитраты'],
    ['SO4', 'SO4', 2, 1, 'sulfat', 'sulfate', 'сульфат', 'Сульфаты'], ['SO3', 'SO3', 2, 1, 'sulfit', 'sulfite', 'сульфит', 'Сульфиты'], ['S', 'S', 2, 0, 'sulfid', 'sulfide', 'сульфид', 'Сульфиды'],
    ['CO3', 'CO3', 2, 1, 'karbonat', 'carbonate', 'карбонат', 'Карбонаты'], ['SiO3', 'SiO3', 2, 1, 'silikat', 'silicate', 'силикат', 'Силикаты'], ['PO4', 'PO4', 3, 1, 'fosfat', 'phosphate', 'фосфат', 'Фосфаты'],
    ['AC', 'CH3COO', 1, 1, 'atsetat', 'acetate', 'ацетат', 'Ацетаты']];
  // R soluble, M slightly soluble, N insoluble, - does not exist in water (decomposes); columns follow CATS
  const SOL = { OH: 'RRRRNMMRNNNNNNNNN--NN', F: 'MRRRNNNMMMMMMMMMMR-RM', Cl: 'RRRRRRRRRRRRRRRRRNRRM', Br: 'RRRRRRRRRRRRRRRRRNMRM', I: 'RRRRRRRRRRRR-RR-RNNMN',
    NO3: 'RRRRRRRRRRRRRRRRRRR-R', SO4: 'RRRRRMNNRRRRRRRRRM-RN', SO3: 'RRRRMNNN--NN-NN-MN--N', S: 'RRRR-MRR--NN-NNNNNNNN', CO3: 'MRRRNNNN--NN-NN-NN--N',
    SiO3: 'RRR-NNNN--NN-NN-N---N', PO4: 'MRRRNNNNNNNNNNNNNNNNN', AC: 'RRRRRRRRRRRRRRRRRMRRR' };
  const ION = { H: ['H', 1], SCN: ['SCN', 1, 1], MnO4: ['MnO4', 1, 1] };
  CATS.forEach((c) => { ION[c[0]] = [c[1], c[2], c[3]]; }); ANS.forEach((a) => { ION[a[0]] = [a[1], a[2], a[3]]; });
  const CI = Object.fromEntries(CATS.map((c, i) => [c[0], i]));
  const sol = (c, a) => (SOL[a] && CI[c] != null ? SOL[a][CI[c]] : c === 'Ag' && a === 'SCN' ? 'N' : 'R');
  const SUPC = { 1: '⁺', 2: '²⁺', 3: '³⁺' }, SUPA = { 1: '⁻', 2: '²⁻', 3: '³⁻' };
  const isym = (k) => pretty(ION[k][0]) + (CI[k] != null || k === 'H' ? SUPC[ION[k][1]] : SUPA[ION[k][1]]);
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const counts = (c, a) => { const qc = ION[c][1], qa = ION[a][1], l = qc * qa / gcd(qc, qa); return [l / qc, l / qa]; };
  function salt(c, a) {
    if (c === 'H' && a === 'OH') return 'H2O'; if (c === 'NH4' && a === 'OH') return 'NH4OH';
    const [nc, na] = counts(c, a), part = (k, n) => (n === 1 ? ION[k][0] : ION[k][2] ? '(' + ION[k][0] + ')' + n : ION[k][0] + n);
    return a === 'AC' ? part(a, na) + part(c, nc) : part(c, nc) + part(a, na);
  }
  const oxide = (c) => { const s = ION[c][0], q = ION[c][1]; return q === 1 ? s + '2O' : q === 2 ? s + 'O' : s + '2O3'; };
  const STRONG = ['Cl', 'Br', 'I', 'NO3', 'SO4'], ALK = ['Li', 'Na', 'K', 'Ba', 'Sr', 'Ca'];
  const WEAKB = ['NH4', 'Mg', 'Al', 'Cr', 'Mn', 'Fe2', 'Fe3', 'Co', 'Ni', 'Cu', 'Zn', 'Ag', 'Hg', 'Sn', 'Pb'], WEAKA = ['F', 'SO3', 'S', 'CO3', 'SiO3', 'PO4', 'AC'];
  // anions whose precipitates dissolve in a strong acid, and sulfides that do not
  const ACIDSOL = ['OH', 'CO3', 'SO3', 'PO4', 'AC', 'S'], ACIDINSOL_S = ['Cu', 'Ag', 'Hg', 'Pb'];

  // ---------- colours and textures ----------
  const PCOL = { 'OH:Cr': '#6f8d74', 'OH:Mn': '#efe2d6', 'OH:Fe2': '#b7cfa2', 'OH:Fe3': '#9a4716', 'OH:Co': '#d996b1', 'OH:Ni': '#69b56f', 'OH:Cu': '#4c93e3', 'OH:Al': '#eef3f6',
    'Br:Ag': '#efe3ad', 'I:Ag': '#efd96a', 'I:Hg': '#e2412b', 'I:Sn': '#f0b23a', 'I:Pb': '#ffc61c', 'I:Cu': '#efe8dc', 'S:Mn': '#e8a98c', 'S:Fe2': '#18181b', 'S:Co': '#1c1c1f', 'S:Ni': '#1c1c1f',
    'S:Cu': '#141416', 'S:Ag': '#141416', 'S:Hg': '#141416', 'S:Sn': '#6b4a2a', 'S:Pb': '#141416', 'S:Fe3': '#202022', 'CO3:Co': '#d98aa8', 'CO3:Ni': '#7fc38a', 'CO3:Ag': '#f0e6b0', 'CO3:Fe2': '#dfe8d6',
    'CO3:Cu': '#2f8a5c', 'SiO3:Co': '#b77cc0', 'SiO3:Ni': '#7fc38a', 'SiO3:Fe2': '#cfe0c2', 'SiO3:Mn': '#f0c8c8', 'SiO3:Ag': '#e8d070', 'PO4:Ag': '#e7d24a', 'PO4:Fe3': '#ece0bb',
    'PO4:Cr': '#5f8f6a', 'PO4:Co': '#9a5ab8', 'PO4:Ni': '#8acb90', 'PO4:Cu': '#5fb3c8', 'PO4:Mn': '#f2dfe2', 'SO3:Co': '#e0a0b8', 'SO3:Ni': '#9fd0a4', 'SO3:Fe2': '#dfe8d6',
    'F:Cu': '#bfe0f0', 'F:Ni': '#b8e0b0', 'F:Co': '#f0c0d0', 'F:Fe3': '#f0ecd8', 'F:Cr': '#a8d0a8' };
  const OCOL = { CuO: '#151515', FeO: '#1a1a1a', Fe2O3: '#7a2a12', Al2O3: '#f4f4f2', ZnO: '#f6f6ee', MgO: '#f6f6f4', NiO: '#4e6a4e', CoO: '#4a5640', Cr2O3: '#3c7a3a', MnO: '#5c6a50',
    PbO: '#e8b830', SnO: '#2a2a2a', Ag2O: '#4a3626', HgO: '#f0b52a', MnO2: '#2a2522', Ag: '#c8ccd2', Cu2O: '#b33a1d', 'H2SiO3': '#eef4f2', '(CuOH)2CO3': '#2f8a5c', Li2O: '#f4f4f4', CaO: '#f4f4f2', Cu: '#c4682c' };
  // solid salts left after the water boils away: hydrates keep their colour until they lose water
  const HYD = { CuSO4: ['CuSO4·5H2O', '#2f80dc', 5, 150], CoCl2: ['CoCl2·6H2O', '#d9608a', 6, 110], FeSO4: ['FeSO4·7H2O', '#a9d18e', 7, 300], NiSO4: ['NiSO4·7H2O', '#3fa86a', 7, 280] };
  const DRYC = { CuSO4: '#f2f2ee', CoCl2: '#2a5fd0', FeSO4: '#f2f2e8', NiSO4: '#e6d860', KMnO4: '#3c0848', K2MnO4: '#163f2a', 'Fe(SCN)3': '#6a0c10', '[Cu(NH3)4](OH)2': '#2a3fb0', I2: '#3a2a3a' };
  const solCol = (x) => SOLCOL[x.f] || (x.c && CATS[CI[x.c]] && CATS[CI[x.c]][7]) || null;
  const SOLCOL = { KMnO4: '#5a0a72', I2: '#a65520', K2MnO4: '#2a7a4a', 'Fe(SCN)3': '#8a0a14', '[Cu(NH3)4](OH)2': '#1f35b8', '[Ni(NH3)6](OH)2': '#6d63d6', cuGly: '#1f3cc0', starchI2: '#141038',
    CuCl2: '#2aa0b8', CuBr2: '#3a6aa0', CoCl2: '#e0769a', 'Na3[Cr(OH)6]': '#2e8a4a', 'K3[Cr(OH)6]': '#2e8a4a' };
  const TINT = { KMnO4: 7, 'Fe(SCN)3': 9, '[Cu(NH3)4](OH)2': 6, '[Ni(NH3)6](OH)2': 5, I2: 5, K2MnO4: 6, cuGly: 6, 'Fe2(SO4)3': 2, FeCl3: 2, 'Fe(NO3)3': 2 };
  const texOf = (f, a, c) => (/^Ag(Cl|Br)$/.test(f) ? 'curdy' : f === 'PbI2' || f === 'PbCl2' ? 'cryst' : f === 'Al(OH)3' || f === 'H2SiO3' || f === 'Zn(OH)2' ? 'gel' : a === 'OH' || /OH/.test(f) ? 'floc' : 'fine');

  // ---------- reagents ----------
  const A3 = (u, e, r) => [u, e, r];
  const ACIDS = [['HF', 'F', A3('Ftorid kislota (plavik)', 'Hydrofluoric acid', 'Плавиковая кислота')], ['HCl', 'Cl', A3('Xlorid kislota', 'Hydrochloric acid', 'Соляная кислота')],
    ['HBr', 'Br', A3('Bromid kislota', 'Hydrobromic acid', 'Бромоводородная кислота')], ['HI', 'I', A3('Yodid kislota', 'Hydroiodic acid', 'Иодоводородная кислота')],
    ['HNO3', 'NO3', A3('Nitrat kislota (suyult.)', 'Nitric acid (dilute)', 'Азотная кислота (разб.)')], ['H2SO4', 'SO4', A3('Sulfat kislota (suyult.)', 'Sulfuric acid (dilute)', 'Серная кислота (разб.)')],
    ['H2SO3', 'SO3', A3('Sulfit kislota', 'Sulfurous acid', 'Сернистая кислота')], ['H2S', 'S', A3('Sulfid kislota (H₂S eritmasi)', 'Hydrosulfuric acid (H₂S water)', 'Сероводородная кислота')],
    ['H2CO3', 'CO3', A3('Karbonat kislota (CO₂ eritmasi)', 'Carbonic acid (CO₂ water)', 'Угольная кислота (раствор CO₂)')], ['H2SiO3', 'SiO3', A3('Silikat kislota (gel)', 'Silicic acid (gel)', 'Кремниевая кислота (гель)')],
    ['H3PO4', 'PO4', A3('Fosfat kislota', 'Phosphoric acid', 'Фосфорная кислота')], ['CH3COOH', 'AC', A3('Sirka kislota', 'Acetic acid', 'Уксусная кислота')]];
  const RG = [];
  ACIDS.forEach(([id, a, n]) => RG.push({ id, t: 'acid', c: 'H', a, n, solid: id === 'H2SiO3' }));
  CATS.forEach((k) => { const c = k[0], code = sol(c, 'OH'); if (code === '-') return; const id = salt(c, 'OH');
    const n = id === 'Ca(OH)2' ? A3('Kalsiy gidroksid (ohakli suv)', 'Calcium hydroxide (limewater)', 'Гидроксид кальция (известковая вода)') : id === 'NH4OH' ? A3('Ammiakli suv', 'Ammonia solution', 'Нашатырный спирт (раствор аммиака)')
      : A3(k[4] + ' gidroksid', k[5] + ' hydroxide', 'гидроксид ' + k[6]);
    const soluble = code === 'R' || c === 'Ca' || c === 'Sr';
    RG.push({ id, t: 'base', c, a: 'OH', n, solid: !soluble, code, grp: soluble ? 'alk' : 'ins' }); });
  ANS.slice(1).forEach((an) => CATS.forEach((k) => { const c = k[0], a = an[0], code = sol(c, a); if (code === '-') return; const id = salt(c, a);
    const extra = { NaCl: [' (osh tuzi)', ' (table salt)', ' (поваренная соль)'], Na2CO3: [' (soda)', ' (soda)', ' (сода)'], CaCO3: [' (bo\'r, marmar)', ' (chalk, marble)', ' (мел, мрамор)'], KNO3: [' (selitra)', ' (saltpetre)', ' (селитра)'] }[id] || ['', '', ''];
    RG.push({ id, t: 'salt', c, a, n: A3(k[4] + ' ' + an[4] + extra[0], k[5] + ' ' + an[5] + extra[1], an[6] + ' ' + k[6] + extra[2]), solid: code !== 'R', code, grp: a }); }));
  [['KSCN', 'K', 'SCN', A3('Kaliy rodanid', 'Potassium thiocyanate', 'Роданид калия')], ['KMnO4', 'K', 'MnO4', A3('Kaliy permanganat', 'Potassium permanganate', 'Перманганат калия')]]
    .forEach(([id, c, a, n]) => RG.push({ id, t: 'salt', c, a, n, grp: 'spec' }));
  [['Li', A3('Litiy (bo\'lakcha)', 'Lithium (small piece)', 'Литий (кусочек)')], ['K', A3('Kaliy (bo\'lakcha)', 'Potassium (small piece)', 'Калий (кусочек)')], ['Ca', A3('Kalsiy (qirindi)', 'Calcium (turnings)', 'Кальций (стружка)')],
    ['Na', A3('Natriy (bo\'lakcha)', 'Sodium (small piece)', 'Натрий (кусочек)')], ['Mg', A3('Magniy (lenta)', 'Magnesium (ribbon)', 'Магний (лента)')], ['Al', A3('Alyuminiy (folga)', 'Aluminium (foil)', 'Алюминий (фольга)')],
    ['Zn', A3('Rux (granula)', 'Zinc (granule)', 'Цинк (гранула)')], ['Fe', A3('Temir (mix)', 'Iron (nail)', 'Железо (гвоздь)')], ['Cu', A3('Mis (sim)', 'Copper (wire)', 'Медь (проволока)')]]
    .forEach(([id, n]) => RG.push({ id, t: 'metal', n, solid: true }));
  [['php', A3('Fenolftalein', 'Phenolphthalein', 'Фенолфталеин')], ['litmus', A3('Lakmus', 'Litmus', 'Лакмус')], ['mo', A3('Metilzarg\'aldog\'i', 'Methyl orange', 'Метилоранж')]]
    .forEach(([id, n]) => RG.push({ id, t: 'ind', n }));
  [['H2O', A3('Distillangan suv', 'Distilled water', 'Дистиллированная вода')], ['H2O2', A3('Vodorod peroksid (3%)', 'Hydrogen peroxide (3%)', 'Пероксид водорода (3%)')], ['H2O2c', A3('Vodorod peroksid (30%, konsentrlangan)', 'Hydrogen peroxide (30%, concentrated)', 'Пероксид водорода (30%, конц.)')],
    ['KMnO4s', A3('Kaliy permanganat (kristallar)', 'Potassium permanganate (crystals)', 'Перманганат калия (кристаллы)')],
    ['I2', A3('Yod eritmasi', 'Iodine solution', 'Раствор иода')], ['starch', A3('Kraxmal kleysteri', 'Starch paste', 'Крахмальный клейстер')],
    ['C6H12O6', A3('Glyukoza eritmasi', 'Glucose solution', 'Раствор глюкозы')], ['C3H5(OH)3', A3('Glitserin', 'Glycerol', 'Глицерин')], ['MnO2', A3('Marganes(IV) oksid', 'Manganese(IV) oxide', 'Оксид марганца(IV)')]]
    .forEach(([id, n]) => RG.push({ id, t: 'other', n, solid: id === 'MnO2' || id === 'KMnO4s' }));
  const RGI = Object.fromEntries(RG.map((r) => [r.id, r]));
  const DISP = { NH4OH: 'NH₃·H₂O', starch: '(C₆H₁₀O₅)ₙ', cuGly: 'Cu-glitserat', H2O2c: 'H₂O₂ 30%', KMnO4s: 'KMnO₄ (kr.)' }, disp = (id) => DISP[id] || pretty(id);
  // a pour is 1 portion; strongly coloured reagents are used as a few drops of a dilute solution
  const DOSE = { KMnO4: 0.2, I2: 0.3, Na2SO3: 0.5 };
  const ACT = ['Li', 'K', 'Ba', 'Sr', 'Ca', 'Na', 'Mg', 'Al', 'Mn', 'Cr', 'Zn', 'Fe', 'Co', 'Ni', 'Sn', 'Pb', 'H', 'Cu', 'Hg', 'Ag', 'Pt', 'Au'];
  const MION = { Na: 'Na', K: 'K', Li: 'Li', Ca: 'Ca', Mg: 'Mg', Al: 'Al', Zn: 'Zn', Fe: 'Fe2', Cu: 'Cu' }, metalOf = (c) => ION[c][0];
  const FLAME = { Na: ['#ffc21a', 'sariq', 'yellow', 'жёлтый'], K: ['#b07cff', 'binafsha', 'violet', 'фиолетовый'], Ca: ['#ff5a36', 'g\'isht-qizil', 'brick red', 'кирпично-красный'], Ba: ['#9be36b', 'sarg\'ish-yashil', 'yellow-green', 'жёлто-зелёный'],
    Cu: ['#2ee6a0', 'yashil', 'green', 'зелёный'], Li: ['#ff2a6a', 'qip-qizil', 'crimson', 'малиновый'], Sr: ['#ff2020', 'qizil', 'red', 'красный'] };

  // ---------- strings ----------
  const S = {
    uz: { step: { pour: '{n}-qadam. Probirkaga {x} eritmasidan 2–3 ml quyamiz.', powder: '{n}-qadam. Shpatel bilan ozgina {x} olib, probirkaga solamiz.', metal: '{n}-qadam. Pinset bilan {x} ni probirkaga ehtiyotkorlik bilan tushiramiz.', drops: '{n}-qadam. Tomizgich bilan 2–3 tomchi {x} tomizamiz.', heat: '{n}-qadam. Probirkani qisqichda ushlab, spirt lampasi alangasida asta qizdiramiz.', flame: '{n}-qadam. Toza sim halqani eritmaga botirib, gorelka alangasiga tutamiz.', intro: 'Tajriba boshlanmoqda. Har bir qadamni kuzatib boring.', obs: 'Kuzatuv', none: 'Ko\'rinadigan o\'zgarish yo\'q.', done: 'Tajriba tugadi. Tenglamalar va xulosa — kuzatuvlar jurnalida.', stop: 'To\'xtatish', wait: 'Kuzatamiz…' }, shelf: 'Reaktivlar javoni', groups: { acid: 'Kislotalar', alk: 'Ishqorlar (eriydigan asoslar)', ins: 'Erimaydigan asoslar', salt: 'Tuzlar', spec: 'Boshqa tuzlar', metal: 'Metallar', ind: 'Indikatorlar', other: 'Boshqalar' },
      find: 'Reaktiv qidirish…', count: '{n} ta reaktiv', insol: 'erimaydi', slight: 'kam eriydi', heat: 'Qizdirish', stop: 'Qizdirishni to\'xtatish', flame: 'Alangada sinash', clear: 'Probirkani tozalash',
      log: 'Kuzatuvlar', presets: 'Tayyor tajribalar', empty: 'Javondan reaktiv tanlang — u probirkaga quyiladi. Tayyor tajribalardan birini ham ishga tushirishingiz mumkin.',
      medium: { acid: 'Muhit: kislotali', base: 'Muhit: ishqoriy', neutral: 'Muhit: neytral', none: 'Probirka bo\'sh' }, full: 'Probirka to\'ldi — tozalang.',
      added: '{x} qo\'shildi', nothing: 'Ko\'rinadigan o\'zgarish yo\'q', nothingWhy: 'Ionlar birikib cho\'kma, gaz yoki suv hosil qilmaydi — eritmada aralashgan holda qoladi.',
      ppt: '{c} cho\'kma tushdi: {f}', pptS: 'Cho\'kma tushdi: {f}', gas: 'Gaz ajraldi: {f}', neutral: 'Neytrallanish: issiqlik ajraldi', dissolve: 'Cho\'kma eridi', colour: 'Eritma rangi o\'zgardi', metalDep: 'Metall sirtida {f} ajraldi',
      hydro: 'To\'liq gidroliz: {f} cho\'kmaga tushdi', noMetal: '{m} bu eritmadan metallni siqib chiqara olmaydi (faollik qatoriga qarang).', noAcid: '{m} vodoroddan keyin turadi — kislotadan H₂ ni siqib chiqarmaydi.',
      ionic: 'Qisqa ionli tenglama', run: 'Boshlash', heatOn: 'Spirt lampasi yoqildi — probirka qizimoqda', heatOff: 'Qizdirish to\'xtatildi — probirka soviyapti', boil: 'Eritma qaynay boshladi (~100 °C) — suv bug\'lanmoqda',
      dry: 'Suv bug\'lanib ketdi — probirka tubida qoldi: {f}', dryNone: 'Suv bug\'lanib ketdi — probirka bo\'sh qoldi', volatile: '{f} bug\' bilan birga uchib ketdi', decomp: 'Termik parchalanish: {f}',
      noDecomp: '{f} spirt lampasi alangasida (~600 °C) parchalanmaydi — buning uchun 800–1000 °C kerak.', sublime: 'Yod sublimatlandi — binafsha bug\'lar ko\'tarildi', ring: 'Probirkaning sovuq devorida oq halqa (NH₄Cl) hosil bo\'ldi',
      hgDrops: 'Probirka devorida kumushsimon simob tomchilari paydo bo\'ldi (simob bug\'i zaharli!)', temp: 'Harorat',
      flameRes: 'Alanga rangi: {c} — {i} ionlari', flameNone: 'Alanga rangi o\'zgarmadi: rang beradigan metall ionlari yo\'q.',
      colours: { '#f2f2ee': 'Oq' }, cn: { white: 'Oq', yellow: 'Sariq', black: 'Qora', blue: 'Ko\'k', green: 'Yashil', brown: 'Qo\'ng\'ir', red: 'Qizil', pink: 'Pushti', orange: 'To\'q sariq', grey: 'Kulrang', violet: 'Binafsha' },
      tests: { H2: 'Yonib turgan cho\'p yaqinlashtirilsa, "pop" ovozi bilan yonadi.', O2: 'Cho\'g\'langan cho\'p alangalanib ketadi.', CO2: 'Ohakli suvni loyqalatadi, yonishni to\'xtatadi.', NH3: 'O\'tkir hid; ho\'llangan qizil lakmus qog\'oz ko\'karadi.',
        H2S: 'Palag\'da tuxum hidi — zaharli!', SO2: 'O\'tkir, bo\'g\'uvchi hid.', NO: 'Rangsiz gaz probirka og\'zida havodagi O₂ bilan qo\'ng\'ir NO₂ ga aylanadi.', NO2: 'Qo\'ng\'ir, o\'tkir hidli zaharli gaz.', N2O: '"Kuldiruvchi gaz" — cho\'g\'langan cho\'pni alangalantiradi.', HX: 'Ho\'l havoda oq tuman hosil qiladi.' },
      safety: 'Haqiqiy laboratoriyada himoya ko\'zoynagi va qo\'lqop kiying, probirka og\'zini o\'zingizga qaratmang. Bu — xavfsiz virtual tajriba.' },
    en: { step: { pour: 'Step {n}. Pour 2–3 ml of {x} solution into the test tube.', powder: 'Step {n}. Take a little {x} on a spatula and tip it into the tube.', metal: 'Step {n}. Use tweezers to lower {x} carefully into the tube.', drops: 'Step {n}. Add 2–3 drops of {x} with a dropper.', heat: 'Step {n}. Hold the tube in a holder and warm it gently in the spirit-lamp flame.', flame: 'Step {n}. Dip a clean wire loop into the solution and hold it in the burner flame.', intro: 'The experiment is starting. Watch every step.', obs: 'Observation', none: 'No visible change.', done: 'The experiment is over. Equations and conclusions are in the observation log.', stop: 'Stop', wait: 'Watching…' }, shelf: 'Reagent shelf', groups: { acid: 'Acids', alk: 'Alkalis (soluble bases)', ins: 'Insoluble bases', salt: 'Salts', spec: 'Other salts', metal: 'Metals', ind: 'Indicators', other: 'Others' },
      find: 'Find a reagent…', count: '{n} reagents', insol: 'insoluble', slight: 'slightly soluble', heat: 'Heat', stop: 'Stop heating', flame: 'Flame test', clear: 'Empty the test tube',
      log: 'Observations', presets: 'Ready-made experiments', empty: 'Pick a reagent on the shelf — it is poured into the test tube. You can also run one of the ready-made experiments.',
      medium: { acid: 'Medium: acidic', base: 'Medium: alkaline', neutral: 'Medium: neutral', none: 'The tube is empty' }, full: 'The test tube is full — empty it.',
      added: '{x} added', nothing: 'No visible change', nothingWhy: 'The ions do not join into a precipitate, a gas or water — they simply stay mixed in solution.',
      ppt: '{c} precipitate forms: {f}', pptS: 'A precipitate forms: {f}', gas: 'Gas given off: {f}', neutral: 'Neutralisation: heat released', dissolve: 'The precipitate dissolves', colour: 'The colour of the solution changes', metalDep: '{f} deposits on the metal',
      hydro: 'Complete hydrolysis: {f} precipitates', noMetal: '{m} cannot push a metal out of this solution (see the activity series).', noAcid: '{m} stands after hydrogen — it does not push H₂ out of the acid.',
      ionic: 'Short ionic equation', run: 'Run', heatOn: 'The spirit lamp is lit — the tube is warming up', heatOff: 'Heating stopped — the tube is cooling', boil: 'The solution starts to boil (~100 °C) — water is evaporating',
      dry: 'The water has boiled away — left at the bottom: {f}', dryNone: 'The water has boiled away — the tube is empty', volatile: '{f} escaped with the steam', decomp: 'Thermal decomposition: {f}',
      noDecomp: '{f} does not decompose in a spirit-lamp flame (~600 °C) — it needs 800–1000 °C.', sublime: 'Iodine sublimes — violet vapour rises', ring: 'A white ring of NH₄Cl forms on the cool wall of the tube',
      hgDrops: 'Silvery droplets of mercury appear on the wall (mercury vapour is poisonous!)', temp: 'Temperature',
      flameRes: 'Flame colour: {c} — {i} ions', flameNone: 'The flame does not change: no colouring metal ions.',
      cn: { white: 'White', yellow: 'Yellow', black: 'Black', blue: 'Blue', green: 'Green', brown: 'Brown', red: 'Red', pink: 'Pink', orange: 'Orange', grey: 'Grey', violet: 'Violet' },
      tests: { H2: 'A burning splint makes it burn with a "pop".', O2: 'A glowing splint bursts into flame.', CO2: 'Turns limewater milky and puts out a flame.', NH3: 'Sharp smell; damp red litmus paper turns blue.',
        H2S: 'Smell of rotten eggs — poisonous!', SO2: 'Sharp, choking smell.', NO: 'The colourless gas turns into brown NO₂ with air at the mouth of the tube.', NO2: 'Brown, sharp-smelling poisonous gas.', N2O: '"Laughing gas" — relights a glowing splint.', HX: 'Forms white fumes in moist air.' },
      safety: 'In a real lab wear safety glasses and gloves and never point the tube at anyone. This is a safe virtual experiment.' },
    ru: { step: { pour: 'Шаг {n}. Наливаем в пробирку 2–3 мл раствора: {x}.', powder: 'Шаг {n}. Берём шпателем немного вещества ({x}) и высыпаем в пробирку.', metal: 'Шаг {n}. Пинцетом осторожно опускаем в пробирку: {x}.', drops: 'Шаг {n}. Пипеткой добавляем 2–3 капли: {x}.', heat: 'Шаг {n}. Держим пробирку в держателе и осторожно нагреваем в пламени спиртовки.', flame: 'Шаг {n}. Чистую проволочную петлю смачиваем раствором и вносим в пламя горелки.', intro: 'Опыт начинается. Следите за каждым шагом.', obs: 'Наблюдение', none: 'Видимых изменений нет.', done: 'Опыт закончен. Уравнения и выводы — в журнале наблюдений.', stop: 'Остановить', wait: 'Наблюдаем…' }, shelf: 'Полка с реактивами', groups: { acid: 'Кислоты', alk: 'Щёлочи (растворимые основания)', ins: 'Нерастворимые основания', salt: 'Соли', spec: 'Другие соли', metal: 'Металлы', ind: 'Индикаторы', other: 'Другие' },
      find: 'Найти реактив…', count: 'реактивов: {n}', insol: 'нерастворим', slight: 'малорастворим', heat: 'Нагреть', stop: 'Прекратить нагрев', flame: 'Окраска пламени', clear: 'Вымыть пробирку',
      log: 'Наблюдения', presets: 'Готовые опыты', empty: 'Выберите реактив на полке — он наливается в пробирку. Можно также запустить один из готовых опытов.',
      medium: { acid: 'Среда: кислая', base: 'Среда: щелочная', neutral: 'Среда: нейтральная', none: 'Пробирка пуста' }, full: 'Пробирка заполнена — вымойте её.',
      added: 'Добавлено: {x}', nothing: 'Видимых изменений нет', nothingWhy: 'Ионы не образуют осадка, газа или воды — они просто остаются в растворе.',
      ppt: 'Выпал осадок ({c}): {f}', pptS: 'Выпал осадок: {f}', gas: 'Выделился газ: {f}', neutral: 'Нейтрализация: выделилось тепло', dissolve: 'Осадок растворился', colour: 'Окраска раствора изменилась', metalDep: 'На металле выделился {f}',
      hydro: 'Полный гидролиз: выпал {f}', noMetal: '{m} не вытесняет металл из этого раствора (см. ряд активности).', noAcid: '{m} стоит после водорода — не вытесняет H₂ из кислоты.',
      ionic: 'Сокращённое ионное уравнение', run: 'Запустить', heatOn: 'Спиртовка зажжена — пробирка нагревается', heatOff: 'Нагрев прекращён — пробирка остывает', boil: 'Раствор закипел (~100 °C) — вода испаряется',
      dry: 'Вода выкипела — на дне осталось: {f}', dryNone: 'Вода выкипела — пробирка пуста', volatile: '{f} улетучился вместе с паром', decomp: 'Термическое разложение: {f}',
      noDecomp: '{f} не разлагается в пламени спиртовки (~600 °C) — нужно 800–1000 °C.', sublime: 'Иод возгоняется — поднимаются фиолетовые пары', ring: 'На холодной стенке пробирки образовалось белое кольцо NH₄Cl',
      hgDrops: 'На стенках появились серебристые капли ртути (пары ртути ядовиты!)', temp: 'Температура',
      flameRes: 'Окраска пламени: {c} — ионы {i}', flameNone: 'Пламя не окрашивается: нет окрашивающих ионов металлов.',
      cn: { white: 'белый', yellow: 'жёлтый', black: 'чёрный', blue: 'голубой', green: 'зелёный', brown: 'бурый', red: 'красный', pink: 'розовый', orange: 'оранжевый', grey: 'серый', violet: 'фиолетовый' },
      tests: { H2: 'Горящая лучинка — газ сгорает с хлопком.', O2: 'Тлеющая лучинка вспыхивает.', CO2: 'Известковая вода мутнеет, пламя гаснет.', NH3: 'Резкий запах; влажная красная лакмусовая бумажка синеет.',
        H2S: 'Запах тухлых яиц — ядовит!', SO2: 'Резкий удушливый запах.', NO: 'Бесцветный газ у отверстия пробирки буреет — образуется NO₂.', NO2: 'Бурый ядовитый газ с резким запахом.', N2O: '«Веселящий газ» — тлеющая лучинка вспыхивает.', HX: 'Во влажном воздухе образует белый туман.' },
      safety: 'В настоящей лаборатории надевайте очки и перчатки, не направляйте пробирку на людей. Это безопасный виртуальный опыт.' }
  };
  const LI = { uz: 0, en: 1, ru: 2 };
  const L10N = {
    broken: ['Probirka singan — tozalang (yangi probirka oling).', 'The tube is broken — empty it (take a new tube).', 'Пробирка разбита — вымойте (возьмите новую).'],
    mixed: ['Bir idishdagi aralashma ikkinchisiga quyildi', 'The contents were poured into another vessel', 'Содержимое перелито в другой сосуд'],
    naFire: ['Natriy suv ustida eriydi, shar bo\'lib aylanadi; ajralgan vodorod sariq alanga bilan yonib ketishi mumkin.', 'Sodium melts into a ball that races over the water; the hydrogen can catch fire with a yellow flame.', 'Натрий плавится в шарик и бегает по воде; водород может вспыхнуть жёлтым пламенем.'],
    kFire: ['Kaliy suv bilan juda shiddatli reaksiyaga kirishadi: binafsha alanga va kichik portlash! Ishqoriy metallar kerosin ostida saqlanadi.', 'Potassium reacts violently: a lilac flame and a small explosion! Alkali metals are kept under paraffin oil.', 'Калий реагирует бурно: фиолетовое пламя и небольшой взрыв! Щелочные металлы хранят под керосином.'],
    liCalm: ['Litiy suvda tinchgina, sekin vishillab eriydi — ishqoriy metallar ichida eng sustidir.', 'Lithium fizzes calmly and slowly — the mildest of the alkali metals.', 'Литий спокойно и медленно шипит — самый «тихий» из щелочных металлов.'],
    caCalm: ['Kalsiy suv bilan bir tekis reaksiyaga kirishadi; kam eriydigan Ca(OH)₂ eritmani loyqalatadi.', 'Calcium reacts steadily; poorly soluble Ca(OH)₂ makes the water cloudy.', 'Кальций реагирует ровно; малорастворимый Ca(OH)₂ мутит воду.'],
    pop: ['Vodorod "pop" ovozi bilan portladi', 'Hydrogen burns with a "pop"', 'Водород сгорел с хлопком'],
    popNote: ['Vodorodning havo bilan aralashmasi ("qaldiroq gaz") alangadan portlaydi. Shuning uchun vodorod bilan ishlaganda avval uning tozaligi tekshiriladi.', 'A mixture of hydrogen and air ("oxyhydrogen") explodes in a flame — so hydrogen is always tested for purity first.', 'Смесь водорода с воздухом («гремучий газ») взрывается от пламени — поэтому водород сначала проверяют на чистоту.'],
    foam: ['"Fil tish pastasi": ko\'pik probirkadan otilib chiqdi', '"Elephant toothpaste": foam shoots out of the tube', '«Зубная паста для слона»: пена вырвалась из пробирки'],
    foamNote: ['KI katalizatori konsentrlangan H₂O₂ ni bir zumda parchalaydi; ajralgan O₂ ko\'pik hosil qiladi, aralashma qiziydi. Himoya ko\'zoynagi shart!', 'KI makes concentrated H₂O₂ decompose at once; the oxygen whips up foam and the mixture gets hot. Goggles are a must!', 'KI мгновенно разлагает концентрированный H₂O₂; кислород вспенивает смесь, она горячая. Очки обязательны!'],
    ignWait: ['KMnO₄ kristallari glitserin bilan aralashdi — bir necha soniyadan keyin nimadir sodir bo\'ladi…', 'KMnO₄ crystals meet glycerol — something happens in a few seconds…', 'Кристаллы KMnO₄ смешались с глицерином — через несколько секунд что-то произойдёт…'],
    ign: ['O\'z-o\'zidan alangalanish! Aralashma binafsha-oq alanga bilan yonib ketdi', 'Spontaneous ignition! The mixture bursts into a lilac-white flame', 'Самовоспламенение! Смесь вспыхнула фиолетово-белым пламенем'],
    ignNote: ['Kuchli oksidlovchi (KMnO₄) glitserinni oksidlaydi, issiqlik shunchalik ko\'p ajraladiki, aralashma o\'zi alangalanadi. Oksidlovchilarni organik moddalardan alohida saqlang!', 'The strong oxidiser oxidises glycerol so fast that the heat sets it on fire. Keep oxidisers away from organic substances!', 'Сильный окислитель так быстро окисляет глицерин, что смесь сама воспламеняется. Храните окислители отдельно от органики!'],
    mg: ['Magniy ko\'zni qamashtiruvchi oq nur bilan yonmoqda', 'Magnesium burns with a blinding white light', 'Магний горит ослепительно белым светом'],
    mgNote: ['Yonayotgan magniyga to\'g\'ridan-to\'g\'ri qaramang — nuri ko\'zga zarar yetkazadi. Oq kukun — MgO.', 'Do not look straight at burning magnesium — the light can hurt your eyes. The white powder is MgO.', 'Не смотрите прямо на горящий магний — свет вреден для глаз. Белый порошок — MgO.'],
    boom: ['PORTLASH! Ammoniy nitrat qizdirilganda portladi, probirka sindi', 'EXPLOSION! Ammonium nitrate exploded on heating and the tube shattered', 'ВЗРЫВ! Нитрат аммония взорвался при нагревании, пробирка разбита'],
    boomNote: ['Ammoniy nitrat kuchli qizdirilganda yoki qattiq siqilganda portlaydi (o\'g\'it omborlaridagi baxtsiz hodisalar shundan). Hech qachon uni yopiq idishda qizdirmang!', 'Ammonium nitrate can explode when strongly heated or confined (this is behind real warehouse disasters). Never heat it in a closed vessel!', 'Нитрат аммония взрывается при сильном нагреве или в замкнутом объёме (так случались реальные катастрофы на складах). Никогда не нагревайте его в закрытом сосуде!'],
    h2o2Mn: ['Konsentrlangan H₂O₂ MnO₂ ustida shiddatli qaynab, bug\' va kislorod chiqardi', 'Concentrated H₂O₂ boils violently on MnO₂, giving off steam and oxygen', 'Концентрированный H₂O₂ бурно вскипает на MnO₂ с паром и кислородом']
  };
  const raise = (type, color, size) => st.events.push({ type, color, size: size || 1, t0: Date.now() });
  // a colour word for a hex colour, so the log can say "blue precipitate"
  function cname(hex) { const v = parseInt(hex.slice(1), 16), r = v >> 16, g = (v >> 8) & 255, b = v & 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (l > 215 && mx - mn < 40) return 'white'; if (l < 45) return 'black'; if (mx - mn < 25) return 'grey';
    const h = mx === r ? ((g - b) / (mx - mn) * 60 + 360) % 360 : mx === g ? (b - r) / (mx - mn) * 60 + 120 : (r - g) / (mx - mn) * 60 + 240;
    if (h < 15 || h >= 345) return l > 170 ? 'pink' : (r > 120 && g < 70 ? 'red' : 'brown'); if (h < 40) return l > 185 ? 'pink' : l > 150 ? 'orange' : 'brown'; if (h < 70) return 'yellow'; if (h < 170) return 'green'; if (h < 255) return 'blue'; if (h < 300) return 'violet'; return 'pink'; }

  const PRESETS = [
    [['Neytrallanish va fenolftalein', 'Neutralisation with phenolphthalein', 'Нейтрализация и фенолфталеин'], ['NaOH', 'php', 'HCl']],
    [['Kumush xlorid cho\'kmasi', 'Silver chloride precipitate', 'Осадок хлорида серебра'], ['NaCl', 'AgNO3']],
    [['Galogenidlarni farqlash: AgCl, AgBr, AgI', 'Telling halides apart: AgCl, AgBr, AgI', 'Различаем галогениды: AgCl, AgBr, AgI'], ['KBr', 'AgNO3']],
    [['Sulfat ioniga sifat reaksiya', 'Test for sulfate ions', 'Качественная реакция на сульфат-ион'], ['Na2SO4', 'BaCl2']],
    [['"Oltin yomg\'ir" — PbI₂', '"Golden rain" — PbI₂', '«Золотой дождь» — PbI₂'], ['Pb(NO3)2', 'KI']],
    [['Simob(II) yodid — qizil cho\'kma', 'Mercury(II) iodide — red precipitate', 'Иодид ртути(II) — красный осадок'], ['Hg(NO3)2', 'KI']],
    [['Mis(II) gidroksid va uni qizdirish', 'Copper(II) hydroxide and heating it', 'Гидроксид меди(II) и его нагревание'], ['CuSO4', 'NaOH', 'NaOH', 'heat']],
    [['Temir(III) gidroksid', 'Iron(III) hydroxide', 'Гидроксид железа(III)'], ['FeCl3', 'NaOH']],
    [['Temir(II) gidroksid', 'Iron(II) hydroxide', 'Гидроксид железа(II)'], ['FeSO4', 'NaOH']],
    [['Amfoter Al(OH)₃', 'Amphoteric Al(OH)₃', 'Амфотерный Al(OH)₃'], ['AlCl3', 'NaOH', 'NaOH', 'NaOH', 'NaOH']],
    [['Nikel va kobalt gidroksidlari', 'Nickel and cobalt hydroxides', 'Гидроксиды никеля и кобальта'], ['NiSO4', 'NaOH']],
    [['Sulfidlar: CuS, ZnS, MnS', 'Sulfides: CuS, ZnS, MnS', 'Сульфиды: CuS, ZnS, MnS'], ['MnSO4', 'Na2S']],
    [['Marmar + xlorid kislota → CO₂', 'Marble + hydrochloric acid → CO₂', 'Мрамор + соляная кислота → CO₂'], ['CaCO3', 'HCl', 'HCl']],
    [['Soda + kislota', 'Soda + acid', 'Сода + кислота'], ['Na2CO3', 'HCl']],
    [['To\'liq gidroliz: AlCl₃ + Na₂CO₃', 'Complete hydrolysis: AlCl₃ + Na₂CO₃', 'Полный гидролиз: AlCl₃ + Na₂CO₃'], ['AlCl3', 'Na2CO3']],
    [['Silikat kislota geli', 'Silicic acid gel', 'Гель кремниевой кислоты'], ['Na2SiO3', 'HCl']],
    [['Rux + xlorid kislota → H₂', 'Zinc + hydrochloric acid → H₂', 'Цинк + соляная кислота → H₂'], ['Zn', 'HCl', 'HCl']],
    [['Temir mixni mis bilan qoplash', 'Copper plating an iron nail', 'Омеднение железного гвоздя'], ['Fe', 'CuSO4']],
    [['Mis simda kumush kristallari', 'Silver crystals on copper wire', 'Кристаллы серебра на медной проволоке'], ['Cu', 'AgNO3', 'AgNO3']],
    [['Mis + nitrat kislota', 'Copper + nitric acid', 'Медь + азотная кислота'], ['Cu', 'HNO3', 'HNO3', 'HNO3']],
    [['KMnO₄ kislotali muhitda', 'KMnO₄ in acidic medium', 'KMnO₄ в кислой среде'], ['KMnO4', 'H2SO4', 'Na2SO3']],
    [['KMnO₄ neytral muhitda', 'KMnO₄ in neutral medium', 'KMnO₄ в нейтральной среде'], ['KMnO4', 'H2O', 'Na2SO3']],
    [['KMnO₄ ishqoriy muhitda', 'KMnO₄ in alkaline medium', 'KMnO₄ в щелочной среде'], ['KMnO4', 'KOH', 'Na2SO3']],
    [['Yod + kraxmal', 'Iodine + starch', 'Иод + крахмал'], ['starch', 'I2']],
    [['Fe³⁺ ga sifat reaksiya (KSCN)', 'Test for Fe³⁺ (KSCN)', 'Качественная реакция на Fe³⁺ (KSCN)'], ['FeCl3', 'KSCN']],
    [['Fe³⁺ + I⁻ → I₂', 'Fe³⁺ + I⁻ → I₂', 'Fe³⁺ + I⁻ → I₂'], ['FeCl3', 'KI', 'starch']],
    [['Vodorod peroksidning parchalanishi', 'Decomposition of hydrogen peroxide', 'Разложение пероксида водорода'], ['H2O2', 'MnO2']],
    [['"Kumush ko\'zgu" reaksiyasi', '"Silver mirror" test', 'Реакция «серебряного зеркала»'], ['AgNO3', 'NH4OH', 'NH4OH', 'NH4OH', 'C6H12O6', 'heat']],
    [['Glyukoza + Cu(OH)₂', 'Glucose + Cu(OH)₂', 'Глюкоза + Cu(OH)₂'], ['CuSO4', 'NaOH', 'NaOH', 'C6H12O6', 'heat']],
    [['Mis(II) — ammiakli kompleks', 'Copper(II) ammine complex', 'Аммиачный комплекс меди(II)'], ['CuSO4', 'NH4OH', 'NH4OH', 'NH4OH']],
    [['Ammiak olish', 'Making ammonia', 'Получение аммиака'], ['NH4Cl', 'NaOH', 'heat']],
    [['Natriy + suv', 'Sodium + water', 'Натрий + вода'], ['H2O', 'php', 'Na']],
    [['Mis kuporosi eritmasini bug\'latish', 'Evaporating copper sulfate solution', 'Выпаривание раствора медного купороса'], ['CuSO4', 'heat']],
    [['Kobalt xlorid — namlik indikatori', 'Cobalt chloride — moisture indicator', 'Хлорид кобальта — индикатор влаги'], ['CoCl2', 'heat']],
    [['Mis(II) nitratni qizdirish → NO₂', 'Heating copper(II) nitrate → NO₂', 'Нагревание нитрата меди(II) → NO₂'], ['Cu(NO3)2', 'heat']],
    [['Kumush nitratni qizdirish → Ag', 'Heating silver nitrate → Ag', 'Нагревание нитрата серебра → Ag'], ['AgNO3', 'heat']],
    [['Ammoniy xloridni qizdirish', 'Heating ammonium chloride', 'Нагревание хлорида аммония'], ['NH4Cl', 'heat']],
    [['Simob(II) oksidining parchalanishi', 'Decomposition of mercury(II) oxide', 'Разложение оксида ртути(II)'], ['Hg(NO3)2', 'NaOH', 'NaOH', 'heat']],
    [['Yod sublimatsiyasi', 'Sublimation of iodine', 'Возгонка иода'], ['I2', 'heat']],
    [['Alanga rangi: mis', 'Flame colour: copper', 'Окраска пламени: медь'], ['CuSO4', 'flame']],
    [['Alanga rangi: stronsiy', 'Flame colour: strontium', 'Окраска пламени: стронций'], ['SrCl2', 'flame']]
  ];

  // ---------- engine ----------
  let st, host, ctx = { lang: 'uz' }, T = S.uz, timers = [];
  const SOLIDCOL = { MnO2: '#2a2522', H2SiO3: '#eef4f2', KMnO4s: '#3c0848' };
  const fresh = () => ({ events: [], broken: false, lastDec: 0, vol: 0, sol: [], solids: [], ind: null, heated: false, temp: 20, boiling: false, flags: {}, gas: null, gasT: 0, gasSrc: null, mirror: false, ring: false, hg: false, cloud: null, cloudT: 0, flame: null, log: [] });
  const L = () => LI[ctx.lang] || 0;
  const fmt = (s, o) => s.replace(/\{(\w)\}/g, (m, k) => o[k]);
  const findSol = (f) => st.sol.find((x) => x.f === f && x.n > 1e-6);
  const addSol = (f, c, a, n) => { const e = st.sol.find((x) => x.f === f); if (e) e.n += n; else st.sol.push({ f, c, a, n }); };
  const addSolid = (f, kind, color, n, c, a, tex) => { const e = st.solids.find((x) => x.f === f && x.kind === kind); const now = Date.now();
    if (e) { e.n += n; if (kind === 'ppt') e.t0 = now; } else st.solids.push({ f, kind, color, n, c, a, tex, t0: now }); };
  const tidy = () => { st.sol = st.sol.filter((x) => x.n > 1e-6); st.solids = st.solids.filter((x) => x.n > 1e-6); };
  const log = (e) => st.log.unshift(e);
  const gasOn = (f, src) => { st.gas = f; st.gasT = Date.now(); st.gasSrc = src || null; if (f === 'NO' || f === 'NO2') cloudOn('#9a3f14'); };
  const cloudOn = (c) => { st.cloud = c; st.cloudT = Date.now(); };
  const isStrongAcid = (x) => x.c === 'H' && STRONG.includes(x.a), isStrongBase = (x) => x.a === 'OH' && ALK.includes(x.c);

  function medium() {
    let acid = 0, base = 0, hyd = 0, strongA = false, strongB = false;
    st.sol.forEach((x) => { if (x.c === 'H') { acid += x.n * (isStrongAcid(x) ? 1 : 0.3); strongA = strongA || isStrongAcid(x); } else if (x.a === 'OH' && x.c) { base += x.n * (isStrongBase(x) ? 1 : 0.4); strongB = strongB || isStrongBase(x); }
      else if (x.c && x.a) { if (WEAKB.includes(x.c) && !WEAKA.includes(x.a)) hyd -= x.n; if (WEAKA.includes(x.a) && !WEAKB.includes(x.c)) hyd += x.n; } });
    if (!st.vol) return { k: 'none', ph: 7 };
    if (acid > base + 1e-6) return { k: 'acid', ph: strongA ? 1.5 : 3.5 };
    if (base > acid + 1e-6) return { k: 'base', ph: strongB ? 13 : 10.5 };
    if (hyd < -1e-6) return { k: 'acid', ph: 4.8 }; if (hyd > 1e-6) return { k: 'base', ph: 10.5 };
    return { k: 'neutral', ph: 7 };
  }
  const hydOf = (c) => (c === 'Hg' ? 'HgO' : c === 'Ag' ? 'Ag2O' : salt(c, 'OH'));
  // what an ion pair turns into when it meets in water
  function part(c, a) {
    const hot = st.temp >= 60;
    if (c === 'H') {
      if (a === 'OH') return { p: ['H2O'], drive: 'water' };
      if (a === 'CO3') return { p: ['CO2', 'H2O'], drive: 'gas', gas: 'CO2' };
      if (a === 'SO3') return { p: ['SO2', 'H2O'], drive: 'gas', gas: 'SO2' };
      if (a === 'S') return { p: ['H2S'], drive: 'gas', gas: 'H2S' };
      if (a === 'SiO3') return { p: ['H2SiO3'], drive: 'ppt', ppt: 'H2SiO3', color: OCOL.H2SiO3, tex: 'gel' };
      return { p: [salt('H', a)], sol: ['H', a], acid: true, strong: STRONG.includes(a) };
    }
    if (c === 'NH4' && a === 'OH') return hot ? { p: ['NH3', 'H2O'], drive: 'gas', gas: 'NH3' } : { p: ['NH4OH'], sol: ['NH4', 'OH'] };
    const code = sol(c, a);
    if (code === '-') {
      if (a === 'OH') { const o = hydOf(c); return { p: [o, 'H2O'], drive: 'ppt', ppt: o, color: OCOL[o] }; }
      if (a === 'I' && c === 'Fe3') return { p: ['FeI2', 'I2'], drive: 'redox', sol: null, i2: true };
      if (a === 'I' && c === 'Cu') return { p: ['CuI', 'I2'], drive: 'ppt', ppt: 'CuI', color: PCOL['I:Cu'], i2: true };
      if (a === 'S' && c === 'Fe3') return { p: ['FeS', 'S'], drive: 'ppt', ppt: 'FeS', color: '#202022' };
      if (a === 'SiO3' && c === 'NH4') return { p: ['H2SiO3', 'NH3'], drive: 'ppt', ppt: 'H2SiO3', color: OCOL.H2SiO3, tex: 'gel', gas: 'NH3', water: true };
      if (a === 'SiO3' && c === 'Ag') return { p: ['Ag2SiO3'], drive: 'ppt', ppt: 'Ag2SiO3', color: PCOL['SiO3:Ag'] };
      // complete hydrolysis: hydroxide (or oxide / basic carbonate) + the weak acid or its gas
      const g = { CO3: 'CO2', SO3: 'SO2', S: 'H2S', SiO3: 'H2SiO3' }[a];
      if (g) { const h = c === 'Cu' && a === 'CO3' ? '(CuOH)2CO3' : hydOf(c); return { p: [h, g], drive: 'ppt', ppt: h, color: OCOL[h] || PCOL['OH:' + c] || '#eee', gas: g === 'H2SiO3' ? null : g, water: true, hydro: true, tex: texOf(h, 'OH') }; }
      return { p: [salt(c, a)], sol: [c, a] };
    }
    if (code === 'N' || code === 'M') { const f = salt(c, a); return { p: [f], drive: 'ppt', ppt: f, color: PCOL[a + ':' + c] || '#f3f3ef', tex: texOf(f, a, c), slight: code === 'M' }; }
    return { p: [salt(c, a)], sol: [c, a] };
  }
  function ionicEq(c, a, info) {
    if (info.drive === 'water') return 'H⁺ + OH⁻ → H₂O';
    if (info.drive === 'ppt' && !info.water && !info.i2 && info.ppt === salt(c, a)) { const [nc, na] = counts(c, a); return (nc > 1 ? nc : '') + isym(c) + ' + ' + (na > 1 ? na : '') + isym(a) + ' → ' + pretty(info.ppt) + '↓'; }
    if (info.gas === 'CO2' && c === 'H') return '2H⁺ + CO₃²⁻ → CO₂↑ + H₂O';
    if (info.gas === 'SO2' && c === 'H') return '2H⁺ + SO₃²⁻ → SO₂↑ + H₂O';
    if (info.gas === 'H2S' && c === 'H') return '2H⁺ + S²⁻ → H₂S↑';
    if (info.gas === 'NH3' && c === 'NH4') return 'NH₄⁺ + OH⁻ → NH₃↑ + H₂O';
    if (info.ppt === 'H2SiO3' && c === 'H') return '2H⁺ + SiO₃²⁻ → H₂SiO₃↓';
    return '';
  }
  // react X with Y by swapping ions; returns true when something happened
  function exchange(X, Y, ySolid) {
    if (!X.c || !Y.c || !X.a || !Y.a || X.f === Y.f || X.c === Y.c || X.a === Y.a) return false;
    const p1 = part(X.c, Y.a), p2 = part(Y.c, X.a);
    let drv = [p1, p2].filter((p) => p.drive && !(ySolid && p.ppt === Y.f));
    // a strong acid made in the same reaction would dissolve these precipitates again
    if ([p1, p2].some((p) => p.acid && p.strong)) drv = drv.filter((p) => !(p.drive === 'ppt' && !p.hydro && ACIDSOL.includes(p === p1 ? Y.a : X.a) && !(p === p1 ? Y.a === 'S' && ACIDINSOL_S.includes(X.c) : X.a === 'S' && ACIDINSOL_S.includes(Y.c))));
    if (ySolid) { if (Y.a === 'S' && ACIDINSOL_S.includes(Y.c)) return false; drv = drv.filter((p) => p.drive === 'water' || p.gas || p.drive === 'redox');
      if (!drv.length && X.c === 'H' && isStrongAcid(X) && ['PO4', 'AC'].includes(Y.a)) drv = [p2.acid ? p2 : p1].filter((p) => p.acid); }
    if (!drv.length) return false;
    const rk = (o) => (o.c === 'H' || o.a === 'OH' ? 1 : 0), pair = rk(X) > rk(Y) ? [Y, X] : [X, Y];
    const prods = [...new Set(p1.p.concat(p2.p))];
    const pk = (f) => (drv.some((p) => p.ppt === f) ? 0 : f === 'H2O' ? 4 : ['CO2', 'SO2', 'H2S', 'NH3'].includes(f) ? 3 : f === 'I2' ? 2 : 1);
    let R, Pc, k;
    for (const withWater of drv.some((p) => p.water) ? [true, false] : [false, true]) {
      R = pair.map((o) => o.f).concat(withWater ? ['H2O'] : []);
      Pc = prods.filter((f) => !(f === 'H2O' && withWater)).sort((a, b) => pk(a) - pk(b)); k = balance(R, Pc); if (k) break; }
    if (!k) return false;
    const kx = pair[0] === X ? k[0] : k[1], ky = pair[0] === X ? k[1] : k[0], ext = Math.min(X.n / kx, Y.n / ky); if (ext < 1e-6) return false;
    X.n -= kx * ext; Y.n -= ky * ext;
    const marks = {};
    Pc.forEach((f, i) => { const kk = k[R.length + i] * ext, src = [p1, p2].find((p) => p.p.includes(f));
      if (src.ppt === f) { addSolid(f, 'ppt', src.color, kk, src === p1 ? X.c : Y.c, src.hydro || f === 'Ag2O' || f === 'HgO' ? (f === 'Ag2O' || f === 'HgO' ? null : 'OH') : src === p1 ? Y.a : X.a, src.tex); marks[f] = '↓'; }
      else if (['CO2', 'SO2', 'H2S', 'NH3'].includes(f)) { gasOn(f); marks[f] = '↑'; }
      else if (f === 'S') { addSolid('S', 'ppt', '#e8d23a', kk, null, null, 'fine'); marks[f] = '↓'; }
      else if (f === 'I2') addSol('I2', null, null, kk);
      else if (src.sol) addSol(f, src.sol[0], src.sol[1], kk);
      else if (f !== 'H2O') addSol(f, f === 'FeI2' ? 'Fe2' : null, f === 'FeI2' ? 'I' : null, kk); });
    const main = drv[0], weak = [X, Y].some((o) => o.f === 'CH3COOH' || o.f === 'NH4OH' || (o.c === 'H' && !isStrongAcid(o)));
    const ion = !ySolid && !weak ? ionicEq(main === p1 ? X.c : Y.c, main === p1 ? Y.a : X.a, main) : '';
    const pp = drv.find((p) => p.drive === 'ppt'), gas = drv.find((p) => p.gas);
    let title;
    if (pp) title = pp.hydro ? fmt(T.hydro, { f: pretty(pp.ppt) }) : fmt(T.ppt, { c: T.cn[cname(pp.color)] || '', f: pretty(pp.ppt) + (pp.slight ? ' (' + T.slight + ')' : '') });
    else if (drv.some((p) => p.i2)) title = T.colour + ' — I₂';
    else if (gas) title = fmt(T.gas, { f: pretty(gas.gas) });
    else title = ySolid ? T.dissolve : drv.some((p) => p.drive === 'water') ? T.neutral : T.colour;
    log({ icon: pp ? '⬇️' : gas ? '🫧' : drv.some((p) => p.i2) ? '🎨' : '🌡️', title, eq: eqStr(R, Pc, k, marks), ion, note: gas ? T.tests[gas.gas] : '' });
    return true;
  }
  const HNO3EQ = { Cu: ['3Cu + 8HNO₃ → 3Cu(NO₃)₂ + 2NO↑ + 4H₂O', 'Cu(NO3)2', 'Cu', 3 / 8], Fe: ['Fe + 4HNO₃ → Fe(NO₃)₃ + NO↑ + 2H₂O', 'Fe(NO3)3', 'Fe3', 1 / 4],
    Zn: ['3Zn + 8HNO₃ → 3Zn(NO₃)₂ + 2NO↑ + 4H₂O', 'Zn(NO3)2', 'Zn', 3 / 8], Mg: ['3Mg + 8HNO₃ → 3Mg(NO₃)₂ + 2NO↑ + 4H₂O', 'Mg(NO3)2', 'Mg', 3 / 8], Al: ['Al + 4HNO₃ → Al(NO₃)₃ + NO↑ + 2H₂O', 'Al(NO3)3', 'Al', 1 / 4] };
  function metalStep() {
    for (const m of st.solids.filter((s) => s.kind === 'metal')) {
      const M = m.f;
      if (['Na', 'K', 'Li', 'Ca'].includes(M)) { if (!st.vol) continue; const hy = M === 'Ca' ? 'Ca(OH)2' : M + 'OH'; addSol(hy, M, 'OH', m.n); m.n = 0; gasOn('H2', M === 'Na' || M === 'K' ? 'na' : 'bottom');
        if (M === 'Na' || M === 'K') st.flags.na = Date.now(); if (M === 'Na') raise('fire', '#ffc21a', 0.55); if (M === 'K') { raise('fire', '#b07cff', 0.8); raise('pop', '#c8a0ff', 0.7); }
        log({ icon: M === 'K' ? '💥' : M === 'Na' ? '🔥' : '🫧', title: fmt(T.gas, { f: 'H₂' }), eq: M === 'Ca' ? 'Ca + 2H₂O → Ca(OH)₂ + H₂↑' : '2' + M + ' + 2H₂O → 2' + M + 'OH + H₂↑', note: L10N[{ Na: 'naFire', K: 'kFire', Li: 'liCalm', Ca: 'caCalm' }[M]][L()] }); return true; }
      for (const x of st.sol) {
        if (x.c === 'H' && x.a === 'NO3' && HNO3EQ[M]) { const h = HNO3EQ[M], ext = Math.min(m.n, x.n * h[3]); m.n -= ext; x.n -= ext / h[3]; addSol(h[1], h[2], 'NO3', ext); gasOn('NO', M);
          log({ icon: '🟤', title: fmt(T.gas, { f: 'NO' }), eq: h[0], note: T.tests.NO }); return true; }
        if (x.c === 'H') { if (ACT.indexOf(M) > ACT.indexOf('H')) continue; const mi = MION[M], R = [M, x.f], P = [salt(mi, x.a), 'H2'], k = balance(R, P); if (!k) continue;
          const ext = Math.min(m.n / k[0], x.n / k[1]); m.n -= k[0] * ext; x.n -= k[1] * ext;
          const sp = part(mi, x.a); if (sp.drive === 'ppt') addSolid(P[0], 'ppt', sp.color, k[2] * ext, mi, x.a, sp.tex); else addSol(P[0], mi, x.a, k[2] * ext); gasOn('H2', M);
          const hc = k[1] * (atoms(x.f).H || 1);
          log({ icon: '🫧', title: fmt(T.gas, { f: 'H₂' }), eq: eqStr(R, P, k, { H2: '↑' }), ion: isStrongAcid(x) ? (k[0] > 1 ? k[0] : '') + M + ' + ' + (hc > 1 ? hc : '') + 'H⁺ → ' + (k[0] > 1 ? k[0] : '') + isym(mi) + ' + ' + (k[3] > 1 ? k[3] : '') + 'H₂↑' : '', note: T.tests.H2 }); return true; }
        if ((M === 'Al' || M === 'Zn') && x.a === 'OH' && ['Na', 'K', 'Li'].includes(x.c)) {
          const cx = M === 'Al' ? x.c + '[Al(OH)4]' : x.c + '2[Zn(OH)4]', R = [M, x.f, 'H2O'], P = [cx, 'H2'], k = balance(R, P); if (!k) continue;
          const ext = Math.min(m.n / k[0], x.n / k[1]); m.n -= k[0] * ext; x.n -= k[1] * ext; addSol(cx, null, null, k[3] * ext); gasOn('H2', M);
          log({ icon: '🫧', title: fmt(T.gas, { f: 'H₂' }), eq: eqStr(R, P, k, { H2: '↑' }), note: T.tests.H2 }); return true; }
        if (x.c && x.c !== 'H' && x.c !== 'NH4' && CI[x.c] != null) {
          const xm = metalOf(x.c); if (xm === M || ACT.indexOf(M) < 0 || ACT.indexOf(xm) < 0 || ACT.indexOf(M) >= ACT.indexOf(xm)) continue;
          if (x.c === 'Fe3' && (M === 'Cu' || M === 'Fe')) { const R = [M, x.f], P = M === 'Fe' ? [salt('Fe2', x.a)] : [salt('Fe2', x.a), salt('Cu', x.a)], k = balance(R, P); if (!k) continue;
            const ext = Math.min(m.n / k[0], x.n / k[1]); m.n -= k[0] * ext; x.n -= k[1] * ext; addSol(P[0], 'Fe2', x.a, k[2] * ext); if (P[1]) addSol(P[1], 'Cu', x.a, k[3] * ext);
            log({ icon: '🎨', title: T.colour, eq: eqStr(R, P, k) }); return true; }
          const mi = MION[M], R = [M, x.f], P = [salt(mi, x.a), xm], k = balance(R, P); if (!k) continue;
          const ext = Math.min(m.n / k[0], x.n / k[1]); m.n -= k[0] * ext; x.n -= k[1] * ext; addSol(P[0], mi, x.a, k[2] * ext);
          addSolid(xm, 'deposit', { Cu: '#c4682c', Ag: '#d6dae0', Pb: '#5f6670', Sn: '#a9b0b8', Hg: '#d8dde4' }[xm] || '#8a9099', k[3] * ext, M);
          log({ icon: '✨', title: fmt(T.metalDep, { f: xm }), eq: eqStr(R, P, k), ion: (k[0] > 1 ? k[0] : '') + M + ' + ' + (k[3] > 1 ? k[3] : '') + isym(x.c) + ' → ' + (k[0] > 1 ? k[0] : '') + isym(mi) + ' + ' + (k[3] > 1 ? k[3] : '') + xm }); return true; }
      }
    }
    return false;
  }
  // redox, complex and organic tests that do not follow the plain ion-swap rule
  function special() {
    const has = (f) => findSol(f), solid = (f) => st.solids.find((s) => s.f === f && s.n > 1e-6 && s.kind !== 'crystal'), use = (o, k) => { o.n = Math.max(0, o.n - k); };
    const left = (c) => st.sol.some((x) => x.c === c && x.n > 1e-6);
    const mn = has('KMnO4');
    if (mn && st.vol) { const md = st.sol.some((x) => x.f === 'H2SO4') ? 'acid' : st.sol.some((x) => isStrongBase(x)) ? 'base' : 'neutral';
      const red = ['Na2SO3', 'FeSO4', 'H2O2', 'KI'].map(has).find(Boolean);
      if (red) { const E = {
        acid: { Na2SO3: ['2KMnO₄ + 5Na₂SO₃ + 3H₂SO₄ → 2MnSO₄ + 5Na₂SO₄ + K₂SO₄ + 3H₂O', 2, 5], FeSO4: ['2KMnO₄ + 10FeSO₄ + 8H₂SO₄ → 2MnSO₄ + 5Fe₂(SO₄)₃ + K₂SO₄ + 8H₂O', 2, 10],
          H2O2: ['2KMnO₄ + 5H₂O₂ + 3H₂SO₄ → 2MnSO₄ + 5O₂↑ + K₂SO₄ + 8H₂O', 2, 5], KI: ['2KMnO₄ + 10KI + 8H₂SO₄ → 2MnSO₄ + 5I₂ + 6K₂SO₄ + 8H₂O', 2, 10] },
        neutral: { Na2SO3: ['2KMnO₄ + 3Na₂SO₃ + H₂O → 2MnO₂↓ + 3Na₂SO₄ + 2KOH', 2, 3], H2O2: ['2KMnO₄ + 3H₂O₂ → 2MnO₂↓ + 3O₂↑ + 2KOH + 2H₂O', 2, 3], KI: ['2KMnO₄ + 6KI + 4H₂O → 2MnO₂↓ + 3I₂ + 8KOH', 2, 6] },
        base: { Na2SO3: ['2KMnO₄ + Na₂SO₃ + 2KOH → 2K₂MnO₄ + Na₂SO₄ + H₂O', 2, 1] } }[md][red.f];
        if (E) { const ext = Math.min(mn.n / E[1], red.n / E[2]); use(mn, E[1] * ext); use(red, E[2] * ext);
          if (md === 'acid') { addSol('MnSO4', 'Mn', 'SO4', E[1] * ext); if (red.f === 'FeSO4') addSol('Fe2(SO4)3', 'Fe3', 'SO4', 5 * ext); }
          if (md === 'neutral') addSolid('MnO2', 'ppt', OCOL.MnO2, E[1] * ext, null, null, 'fine'); if (md === 'base') addSol('K2MnO4', null, null, E[1] * ext);
          if (red.f === 'H2O2') gasOn('O2'); if (red.f === 'KI') addSol('I2', null, null, 2 * ext);
          log({ icon: '🎨', title: T.colour + ' — ' + { acid: 'Mn⁺⁷ → Mn⁺²', neutral: 'Mn⁺⁷ → Mn⁺⁴ (MnO₂↓)', base: 'Mn⁺⁷ → Mn⁺⁶ (MnO₄²⁻)' }[md], eq: E[0], note: red.f === 'H2O2' ? T.tests.O2 : '' }); return true; } } }
    const fe3 = st.sol.find((x) => x.c === 'Fe3' && x.n > 1e-6), scn = has('KSCN');
    if (fe3 && scn) { const R = [fe3.f, 'KSCN'], P = ['Fe(SCN)3', salt('K', fe3.a)], k = balance(R, P);
      if (k) { const ext = Math.min(fe3.n / k[0], scn.n / k[1]); use(fe3, k[0] * ext); use(scn, k[1] * ext); addSol('Fe(SCN)3', null, null, k[2] * ext); addSol(P[1], 'K', fe3.a, k[3] * ext);
        log({ icon: '🩸', title: T.colour + ' — ' + T.cn.red, eq: eqStr(R, P, k), ion: 'Fe³⁺ + 3SCN⁻ → Fe(SCN)₃' }); return true; } }
    const hc = has('H2O2c');
    if (hc && has('KI')) { use(hc, hc.n); gasOn('O2'); raise('foam', '#fff6e0', 1); cloudOn('#ffffff'); log({ icon: '🫧', title: L10N.foam[L()], eq: '2H₂O₂ —KI→ 2H₂O + O₂↑', note: L10N.foamNote[L()] }); return true; }
    if (hc && (solid('MnO2') || st.temp >= 70)) { use(hc, hc.n); gasOn('O2'); cloudOn('#ffffff'); log({ icon: '♨️', title: L10N.h2o2Mn[L()], eq: '2H₂O₂ —MnO₂→ 2H₂O + O₂↑', note: T.tests.O2 }); return true; }
    if (st.solids.some((x) => x.f === 'KMnO4s' && x.n > 1e-6) && has('C3H5(OH)3') && !st.flags.ign) { st.flags.ign = Date.now() + 4200; log({ icon: '⏳', title: L10N.ignWait[L()] }); return true; }
    if (has('H2O2') && (solid('MnO2') || st.temp >= 70)) { const h = has('H2O2'); use(h, h.n); gasOn('O2'); log({ icon: '🫧', title: fmt(T.gas, { f: 'O₂' }), eq: solid('MnO2') ? '2H₂O₂ —MnO₂→ 2H₂O + O₂↑' : '2H₂O₂ —t→ 2H₂O + O₂↑', note: T.tests.O2 }); return true; }
    if (has('I2') && has('starch') && !st.flags.starch) { st.flags.starch = 1; log({ icon: '🟦', title: T.colour, eq: 'I₂ + (C₆H₁₀O₅)ₙ → ' + ['to\'q ko\'k birikma', 'deep-blue complex', 'тёмно-синее соединение'][L()] }); return true; }
    // ammonia complexes and amphoteric hydroxides: only after every matching cation has precipitated
    const NHC = { 'Cu(OH)2': ['[Cu(NH3)4](OH)2', 4, 'Cu'], 'Ag2O': ['[Ag(NH3)2]OH', 4, 'Ag'], 'Zn(OH)2': ['[Zn(NH3)4](OH)2', 4, 'Zn'], 'Ni(OH)2': ['[Ni(NH3)6](OH)2', 6, 'Ni'] };
    for (const f in NHC) { const p = solid(f), a = has('NH4OH'), cx = NHC[f]; if (!p || !a || left(cx[2])) continue; const R = [f, 'NH4OH'], P = [cx[0], 'H2O'], k = balance(R, P); if (!k) continue;
      const ext = Math.min(p.n / k[0], a.n / k[1]); if (ext < 1e-6) continue; use(p, k[0] * ext); use(a, k[1] * ext); addSol(cx[0], null, null, k[2] * ext);
      log({ icon: '🎨', title: T.dissolve, eq: eqStr(R, P, k).replace(/NH₄OH/g, 'NH₃·H₂O') }); return true; }
    const AMPH = { 'Al(OH)3': ['[Al(OH)4]', 1, 'Al'], 'Zn(OH)2': ['2[Zn(OH)4]', 2, 'Zn'], 'Cr(OH)3': ['3[Cr(OH)6]', 3, 'Cr'], 'Pb(OH)2': ['2[Pb(OH)4]', 2, 'Pb'], 'Sn(OH)2': ['2[Sn(OH)4]', 2, 'Sn'] };
    for (const f in AMPH) { const p = solid(f), b = st.sol.find((x) => isStrongBase(x) && ['Na', 'K', 'Li'].includes(x.c) && x.n > 1e-6); if (!p || !b || left(AMPH[f][2])) continue;
      const cx = b.c + AMPH[f][0], R = [f, b.f], P = [cx], k = balance(R, P); if (!k) continue; const ext = Math.min(p.n / k[0], b.n / k[1]); use(p, k[0] * ext); use(b, k[1] * ext); addSol(cx, null, null, k[2] * ext);
      log({ icon: '🫗', title: T.dissolve, eq: eqStr(R, P, k), note: ['Amfoter gidroksid ortiqcha ishqorda eriydi.', 'An amphoteric hydroxide dissolves in excess alkali.', 'Амфотерный гидроксид растворяется в избытке щёлочи.'][L()] }); return true; }
    const cuoh = solid('Cu(OH)2'), poly = has('C3H5(OH)3') || has('C6H12O6');
    if (cuoh && poly && st.temp < 60 && !st.flags.cuGly) { st.flags.cuGly = 1; use(cuoh, cuoh.n); addSol('cuGly', null, null, 1);
      log({ icon: '🟦', title: T.dissolve, eq: poly.f === 'C6H12O6' ? 'C₆H₁₂O₆ + Cu(OH)₂ → ' + ['to\'q ko\'k eritma (ko\'p atomli spirt guruhlari)', 'deep-blue solution (polyol groups)', 'ярко-синий раствор (многоатомный спирт)'][L()] : '2C₃H₅(OH)₃ + Cu(OH)₂ → (C₃H₅(OH)₂O)₂Cu + 2H₂O' }); return true; }
    if (st.temp >= 70 && has('C6H12O6') && (cuoh || has('cuGly'))) { const g = has('C6H12O6'); use(g, g.n); if (cuoh) use(cuoh, cuoh.n); const cg = has('cuGly'); if (cg) use(cg, cg.n); addSolid('Cu2O', 'ppt', OCOL.Cu2O, 0.5, null, null, 'fine');
      log({ icon: '🔥', title: fmt(T.ppt, { c: T.cn.red, f: 'Cu₂O' }), eq: 'C₆H₁₂O₆ + 2Cu(OH)₂ —t→ C₆H₁₂O₇ + Cu₂O↓ + 2H₂O' }); return true; }
    if (st.temp >= 60 && has('C6H12O6') && has('[Ag(NH3)2]OH') && !st.mirror) { const g = has('C6H12O6'), a = has('[Ag(NH3)2]OH'); use(g, g.n); use(a, a.n); st.mirror = true;
      log({ icon: '🪞', title: ['Probirka devorida "kumush ko\'zgu" hosil bo\'ldi', 'A "silver mirror" coats the tube', 'На стенках образовалось «серебряное зеркало»'][L()], eq: 'C₆H₁₂O₆ + Ag₂O —NH₃, t→ C₆H₁₂O₇ + 2Ag↓' }); return true; }
    if (st.temp >= 80 && cuoh && st.vol) { use(cuoh, cuoh.n); addSolid('CuO', 'ppt', OCOL.CuO, 0.5, null, null, 'fine'); log({ icon: '🔥', title: fmt(T.ppt, { c: T.cn.black, f: 'CuO' }), eq: 'Cu(OH)₂ —t→ CuO + H₂O', note: ['Ko\'k cho\'kma qaynatilganda qorayadi.', 'The blue precipitate turns black on boiling.', 'При кипячении голубой осадок чернеет.'][L()] }); return true; }
    return false;
  }
  function react() {
    for (let guard = 0; guard < 14; guard++) { tidy(); let did = metalStep() || special();
      if (!did && st.vol) { outer: for (let i = st.sol.length - 1; i >= 0; i--) { for (let j = 0; j < st.sol.length; j++) if (j !== i && exchange(st.sol[i], st.sol[j], false)) { did = true; break outer; }
        for (const s of st.solids) if ((s.kind === 'ppt' || s.kind === 'solid') && s.c && exchange(st.sol[i], s, true)) { did = true; break outer; } } }
      if (!did) break; }
    tidy();
  }

  // ---------- heating: temperature, boiling, evaporation, thermal decomposition ----------
  const VOLATILE = ['HCl', 'HBr', 'HI', 'HNO3', 'HF', 'H2CO3', 'H2SO3', 'H2S', 'CH3COOH', 'NH4OH', 'H2O2'];
  const HEAVY = ['H2SO4', 'H3PO4', 'C3H5(OH)3'];
  function dryOut() {
    const left = [], gone = [];
    st.sol.forEach((x) => { if (VOLATILE.includes(x.f)) { gone.push(pretty(x.f === 'NH4OH' ? 'NH3' : x.f)); return; }
      if (x.f === 'I2') { cloudOn('#8a3fc0'); log({ icon: '🟣', title: T.sublime, eq: 'I₂ (qattiq) → I₂ (bug\')'.replace('qattiq', ['qattiq', 'solid', 'тв.'][L()]).replace('bug\'', ['bug\'', 'gas', 'газ'][L()]) }); return; }
      if (x.f === 'starch' || x.f === 'C6H12O6') { addSolid(x.f, 'crystal', '#f2ede0', x.n); left.push(disp(x.f)); return; }
      const h = HYD[x.f], f = h ? h[0] : x.f, col = h ? h[1] : DRYC[x.f] || (x.c && CATS[CI[x.c]] && CATS[CI[x.c]][7]) || '#f4f4f0';
      addSolid(f, 'crystal', col, x.n, x.c, x.a); left.push(pretty(f)); });
    st.sol = []; st.vol = 0; st.boiling = false;
    if (gone.length) log({ icon: '💨', title: fmt(T.volatile, { f: gone.join(', ') }), muted: true });
    log({ icon: '🧂', title: left.length ? fmt(T.dry, { f: left.join(', ') }) : T.dryNone });
  }
  // one decomposition step for the hottest-to-react solid; returns true when something changed
  function decomp() {
    const t = st.temp, dry = !st.vol;
    for (const s of st.solids) {
      if (s.n < 1e-6 || s.kind === 'metal' || s.kind === 'deposit') continue;
      const done = (title, eq, prods, extra) => { s.n = 0; prods.forEach((p) => addSolid(p[0], p[1] || 'crystal', p[2], p[3] || 0.5, p[4], p[5])); if (extra) extra(); log(Object.assign({ icon: '🔥', title, eq }, extra && extra.note ? { note: extra.note } : {})); return true; };
      const hy = Object.keys(HYD).find((k) => HYD[k][0] === s.f);
      if (hy && dry && t >= HYD[hy][3]) { const nw = HYD[hy][2];
        return done(fmt(T.decomp, { f: pretty(s.f) }) + ' — ' + T.cn[cname(DRYC[hy])], pretty(s.f) + ' —t→ ' + pretty(hy) + ' + ' + nw + 'H₂O↑', [[hy, 'crystal', DRYC[hy], s.n, s.c, s.a]]); }
      if (s.f === 'KMnO4' && dry && t >= 220) { gasOn('O2'); return done(fmt(T.decomp, { f: 'KMnO₄' }), '2KMnO₄ —t→ K₂MnO₄ + MnO₂ + O₂↑', [['K2MnO4', 'crystal', DRYC.K2MnO4], ['MnO2', 'crystal', OCOL.MnO2]], Object.assign(() => {}, { note: T.tests.O2 })); }
      if (s.f === 'Ag2O' && dry && t >= 300) { gasOn('O2'); return done(fmt(T.decomp, { f: 'Ag₂O' }), '2Ag₂O —t→ 4Ag + O₂↑', [['Ag', 'crystal', OCOL.Ag]], Object.assign(() => {}, { note: T.tests.O2 })); }
      if (s.f === 'HgO' && dry && t >= 400) { gasOn('O2'); st.hg = true; return done(fmt(T.decomp, { f: 'HgO' }), '2HgO —t→ 2Hg + O₂↑', [], Object.assign(() => {}, { note: T.hgDrops + ' ' + T.tests.O2 })); }
      if (s.a === 'OH' && s.c && !ALK.includes(s.c) && s.c !== 'NH4' && (dry ? t >= 200 : false)) { const o = oxide(s.c), k = balance([s.f], [o, 'H2O']); if (!k) continue;
        return done(fmt(T.decomp, { f: pretty(s.f) }) + ' → ' + pretty(o), eqStr([s.f], [o, 'H2O'], k, { H2O: '↑' }, 't'), [[o, 'crystal', OCOL[o] || '#ddd', s.n]]); }
      if (s.f === '(CuOH)2CO3' && dry && t >= 250) { gasOn('CO2'); return done(fmt(T.decomp, { f: '(CuOH)₂CO₃' }), '(CuOH)₂CO₃ —t→ 2CuO + CO₂↑ + H₂O↑', [['CuO', 'crystal', OCOL.CuO]]); }
      if (s.a === 'CO3' && s.c && dry) {
        if (['Ca', 'Sr', 'Ba', 'Li', 'Na', 'K'].includes(s.c)) { if (t >= 590 && !st.flags['nd' + s.f]) { st.flags['nd' + s.f] = 1; log({ icon: 'ℹ️', title: fmt(T.noDecomp, { f: pretty(s.f) }) }); } continue; }
        if (t >= 300) { const prod = s.c === 'Ag' ? 'Ag2O' : s.c === 'NH4' ? null : oxide(s.c); if (!prod) continue; const k = balance([s.f], [prod, 'CO2']); if (!k) continue; gasOn('CO2');
          return done(fmt(T.decomp, { f: pretty(s.f) }), eqStr([s.f], [prod, 'CO2'], k, { CO2: '↑' }, 't'), [[prod, 'crystal', OCOL[prod] || '#ddd']]); } }
      if (s.f === 'NH4NO3' && dry && t >= 240 && s.n >= 0.4) { raise('explosion', '#ffb347', 1.4); st.broken = true; st.solids = []; st.sol = []; st.vol = 0; st.heated = false; cloudOn('#8a8a90');
        log({ icon: '💥', title: L10N.boom[L()], eq: '2NH₄NO₃ —t→ 2N₂↑ + O₂↑ + 4H₂O↑', note: L10N.boomNote[L()] }); return true; }
      if (s.a === 'NO3' && s.c && dry && t >= (s.c === 'NH4' ? 260 : 300)) {
        let P; if (s.c === 'NH4') P = ['N2O', 'H2O']; else if (s.c === 'Na' || s.c === 'K') P = [salt(s.c, 'NO3').replace('NO3', 'NO2'), 'O2']; else if (s.c === 'Ag' || s.c === 'Hg') P = [metalOf(s.c), 'NO2', 'O2']; else P = [oxide(s.c), 'NO2', 'O2'];
        const k = balance([s.f], P); if (!k) continue; const solidP = P[0] !== 'N2O' ? P[0] : null; gasOn(P.includes('NO2') ? 'NO2' : P[0] === 'N2O' ? 'N2O' : 'O2'); if (s.c === 'Hg') st.hg = true;
        return done(fmt(T.decomp, { f: pretty(s.f) }), eqStr([s.f], P, k, { NO2: '↑', O2: '↑', N2O: '↑', H2O: '↑' }, 't'), solidP && s.c !== 'Hg' ? [[solidP, 'crystal', OCOL[solidP] || '#f4f4f0']] : [], Object.assign(() => {}, { note: P.includes('NO2') ? T.tests.NO2 : P[0] === 'N2O' ? T.tests.N2O : T.tests.O2 })); }
      if (s.c === 'NH4' && dry && t >= 250 && ['Cl', 'Br', 'I', 'F'].includes(s.a)) { st.ring = true; cloudOn('#f4f4f4');
        return done(fmt(T.decomp, { f: pretty(s.f) }), pretty(s.f) + ' —t→ NH₃↑ + H' + s.a + '↑', [], Object.assign(() => {}, { note: T.ring })); }
      if (s.c === 'NH4' && dry && t >= 300 && ['SO4', 'PO4', 'CO3'].includes(s.a)) { const P = s.a === 'SO4' ? ['NH3', 'NH4HSO4'] : s.a === 'PO4' ? ['NH3', 'H3PO4'] : ['NH3', 'CO2', 'H2O'], k = balance([s.f], P); if (!k) continue; gasOn('NH3');
        return done(fmt(T.decomp, { f: pretty(s.f) }), eqStr([s.f], P, k, { NH3: '↑', CO2: '↑', H2O: '↑' }, 't'), [], Object.assign(() => {}, { note: T.tests.NH3 })); }
    }
    return false;
  }
  let lastDec = 0;
  function step(dt) {
    const target = st.heated ? (st.vol > 0 ? 100 : 600) : 20;
    const rate = st.heated ? (st.vol > 0 ? 16 : 40) : 14;
    if (st.temp < target) st.temp = Math.min(target, st.temp + rate * dt); else if (st.temp > target) st.temp = Math.max(target, st.temp - rate * dt);
    let changed = false;
    if (st.vol > 0 && st.temp >= 99.5 && st.heated) {
      if (!st.boiling) { st.boiling = true; log({ icon: '♨️', title: T.boil }); changed = true; }
      const minV = st.sol.some((x) => HEAVY.includes(x.f)) ? 0.4 : 0;
      st.vol = Math.max(minV, st.vol - 0.22 * dt);
      if (st.vol <= minV + 1e-6) { if (minV) { if (!st.flags.heavy) { st.flags.heavy = 1; log({ icon: '♨️', title: ['Quyuq qoldiq bug\'lanmaydi (qaynash harorati yuqori)', 'The thick residue does not boil away (high boiling point)', 'Густой остаток не выкипает (высокая температура кипения)'][L()] }); } }
        else { dryOut(); changed = true; } }
    } else if (st.boiling && st.temp < 99) st.boiling = false;
    if (st.temp >= 60) { const n = st.log.length; react(); if (st.log.length !== n) changed = true; }
    if (st.heated && Date.now() - (st.lastDec || 0) > 1400) { st.lastDec = Date.now(); if (decomp()) { tidy(); changed = true; } }
    if (st.flags.ign && Date.now() >= st.flags.ign) { st.flags.ign = 0; raise('fire', '#c9a0ff', 1.2); cloudOn('#9a9aa0'); st.temp = Math.max(st.temp, 300);
      st.solids.forEach((x) => { if (x.f === 'KMnO4s') x.n = 0; }); st.sol.forEach((x) => { if (x.f === 'C3H5(OH)3') x.n = 0; }); addSolid('MnO2', 'crystal', '#2a2522', 0.6); tidy();
      log({ icon: '🔥', title: L10N.ign[L()], eq: '14KMnO₄ + 4C₃H₅(OH)₃ → 7K₂CO₃ + 7Mn₂O₃ + 5CO₂↑ + 16H₂O', note: L10N.ignNote[L()] }); changed = true; }
    const mgm = st.solids.find((x) => x.kind === 'metal' && x.f === 'Mg' && x.n > 1e-6);
    if (mgm && st.heated && !st.vol && st.temp >= 550) { mgm.n = 0; raise('bright', '#ffffff', 1); cloudOn('#f2f2f2'); addSolid('MgO', 'crystal', '#f6f6f4', 0.8); tidy();
      log({ icon: '✨', title: L10N.mg[L()], eq: '2Mg + O₂ → 2MgO', note: L10N.mgNote[L()] }); changed = true; }
    return changed;
  }

  function add(id) {
    const r = RGI[id]; if (!r) return;
    if (st.vol >= 8 && !r.solid && r.t !== 'ind') { log({ icon: '⚠️', title: T.full }); return render(); }
    const before = st.log.length;
    log({ icon: '➕', title: fmt(T.added, { x: r.n[L()] + (r.t === 'ind' ? '' : ' (' + disp(r.id) + ')') }), muted: true });
    if (st.broken) { log({ icon: '⚠️', title: L10N.broken[L()] }); return render(); }
    if (r.t === 'metal') addSolid(id, 'metal', '', ['Na', 'K', 'Li', 'Ca'].includes(id) ? 1 : 4);
    else if (r.solid) addSolid(id, 'solid', PCOL[(r.a || '') + ':' + r.c] || SOLIDCOL[id] || '#f3f3ef', 1, r.c, r.a, texOf(r.id, r.a, r.c));
    else if (r.t === 'ind') st.ind = id;
    else { st.vol++; addSol(id, r.c, r.a, DOSE[id] || 1); if (st.solids.some((s) => s.kind === 'crystal')) st.solids.forEach((s) => { if (s.kind === 'crystal' && s.c && sol(s.c, s.a) === 'R') { s.n = 0; addSol(Object.keys(HYD).find((k) => HYD[k][0] === s.f) || s.f, s.c, s.a, 0.5); } }); }
    react();
    if (st.log.length === before + 1 && (st.vol || r.t === 'metal') && (r.c || r.t === 'metal') && st.sol.length + st.solids.length > 1) {
      const mt = r.t === 'metal' ? r.id : null;
      log({ icon: '·', title: T.nothing, note: mt ? (st.sol.some((x) => x.c === 'H') ? fmt(T.noAcid, { m: mt }) : fmt(T.noMetal, { m: mt })) : r.solid ? '' : T.nothingWhy }); }
    render();
  }
  function heat() { st.heated = !st.heated; log({ icon: st.heated ? '🔥' : '🧊', title: st.heated ? T.heatOn : T.heatOff, muted: true }); render(); }
  function flame() {
    const S0 = st;
    if (st.gas === 'H2' && Date.now() - st.gasT < 9000) { raise('pop', '#ffd27a', 0.8); st.gas = null; log({ icon: '💥', title: L10N.pop[L()], eq: '2H₂ + O₂ → 2H₂O', note: L10N.popNote[L()] }); }
    const ions = [...st.sol.map((x) => x.c), ...st.solids.map((s) => s.c || (s.kind === 'metal' ? s.f : null))].filter(Boolean).map((c) => (CI[c] != null ? metalOf(c) : c));
    const k = ['Na', 'Li', 'Sr', 'Ca', 'Ba', 'Cu', 'K'].find((x) => ions.includes(x));
    st.flame = k ? FLAME[k][0] : '#4dd2ff'; setTimeout(() => { S0.flame = null; draw(); }, 3500);
    log(k ? { icon: '🔥', title: fmt(T.flameRes, { c: FLAME[k][1 + L()], i: isym(k === 'Cu' ? 'Cu' : k) }) } : { icon: '🔥', title: T.flameNone }); render();
  }
  function clear() { runTok++; timers.forEach(clearTimeout); timers = []; busy = Promise.resolve(); st = fresh(); stepUI(null); render(); }
  // how a reagent gets into the tube: poured from a bottle, a spatula of powder, a piece with tweezers, or drops
  const actKind = (id) => { const r = RGI[id]; return r.t === 'metal' ? 'metal' : r.solid ? 'powder' : r.t === 'ind' || DOSE[id] ? 'drops' : 'pour'; };
  const actColour = (id) => { const r = RGI[id]; if (SOLIDCOL[id]) return SOLIDCOL[id]; return r.t === 'ind' ? { php: '#f4f4f4', litmus: '#7b4fbf', mo: '#f39c12' }[id] : r.solid ? (PCOL[(r.a || '') + ':' + r.c] || (id === 'MnO2' ? OCOL.MnO2 : '#efefe8')) : (solCol({ f: id, c: r.c }) || '#d6e9ff'); };
  const wait = (ms) => new Promise((res) => timers.push(setTimeout(res, ms)));
  let busy = Promise.resolve(), runTok = 0;
  // the reagent goes in at 80% of the animation, then the hand moves away
  function addAnimated(id, dur) { return new Promise((res) => { st.act = { kind: actKind(id), id, col: actColour(id), label: RGI[id].t === 'ind' ? '' : disp(id), t0: Date.now(), dur };
    timers.push(setTimeout(() => add(id), dur * 0.8)); timers.push(setTimeout(() => { st.act = null; draw(); res(); }, dur)); }); }
  const queueAdd = (id) => { busy = busy.then(() => addAnimated(id, 1500)); };
  function stepUI(o) { const el = host && host.querySelector('.lb-step'); if (!el) return; if (!o) { el.style.display = 'none'; return; }
    el.style.display = 'block'; el.querySelector('.lb-st-t').textContent = o.title || ''; el.querySelector('.lb-st-n').textContent = o.n ? o.k + ' / ' + o.n : '';
    el.querySelector('.lb-st-bar').style.width = (o.n ? Math.round(o.k / o.n * 100) : 0) + '%'; el.querySelector('.lb-st-x').textContent = o.text || '';
    const ob = el.querySelector('.lb-st-o'); ob.innerHTML = o.obs ? '<b>' + T.step.obs + ':</b> ' + o.obs : ''; ob.style.display = o.obs ? 'block' : 'none'; }
  const fresh_ = (before) => st.log.slice(0, Math.max(0, st.log.length - before)).filter((e) => !e.muted && e.icon !== '·').reverse();
  async function runPreset(i) {
    clear(); const tok = runTok, P = PRESETS[i], steps = P[1], title = P[0][L()];
    const alive = () => tok === runTok && host;
    stepUI({ title, k: 0, n: steps.length, text: T.step.intro }); await wait(1600);
    for (let k = 0; k < steps.length; k++) { if (!alive()) return; const s = steps[k], before = st.log.length, base = { title, k: k + 1, n: steps.length };
      if (s === 'heat') { const text = fmt(T.step.heat, { n: k + 1 }); stepUI(Object.assign({ text, obs: T.step.wait }, base)); if (!st.heated) heat();
        let seen = st.log.length, quiet = 0; for (let t = 0; t < 70 && alive(); t++) { await wait(1000); const nw = fresh_(seen); seen = st.log.length;
          if (nw.length) { quiet = 0; stepUI(Object.assign({ text, obs: nw.map((e) => e.title).join(' → ') }, base)); } else quiet++;
          if (quiet >= 7 && t >= 9) break; }
        if (alive() && st.heated) heat(); continue; }
      if (s === 'flame') { const text = fmt(T.step.flame, { n: k + 1 }); stepUI(Object.assign({ text }, base)); await wait(1400); if (!alive()) return; flame();
        stepUI(Object.assign({ text, obs: fresh_(before).map((e) => e.title).join(' → ') }, base)); await wait(4200); continue; }
      const r = RGI[s], text = fmt(T.step[actKind(s)], { n: k + 1, x: r.n[L()] + (r.t === 'ind' ? '' : ' (' + disp(s) + ')') });
      stepUI(Object.assign({ text }, base)); await wait(900); if (!alive()) return; await addAnimated(s, 2600); await wait(800); if (!alive()) return;
      const nw = fresh_(before); stepUI(Object.assign({ text, obs: nw.length ? nw.map((e) => e.title).join(' → ') : T.step.none }, base)); await wait(nw.length ? 4200 : 2600); }
    if (alive()) stepUI({ title, k: steps.length, n: steps.length, text: T.step.done });
  }

  // ---------- drawing ----------
  const mix = (cols) => { if (!cols.length) return null; let r = 0, g = 0, b = 0, w = 0;
    cols.forEach(([c, k]) => { const v = parseInt(c.slice(1), 16); r += (v >> 16) * k; g += ((v >> 8) & 255) * k; b += (v & 255) * k; w += k; });
    const h = (x) => Math.round(x / w).toString(16).padStart(2, '0'); return '#' + h(r) + h(g) + h(b); };
  function liquidColour(md) {
    const cols = [];
    st.sol.forEach((x) => { const c = solCol(x); if (c) cols.push([c, x.n * (TINT[x.f] || 1)]); });
    if (st.flags.starch && findSol('I2')) cols.push([SOLCOL.starchI2, 8]);
    if (st.ind && st.vol) { const p = md.ph, c = st.ind === 'php' ? (p > 8.2 ? '#ff1f8f' : null) : st.ind === 'litmus' ? (p < 5 ? '#e0263a' : p <= 8 ? '#8e44ad' : '#2c5fd6') : (p < 3.1 ? '#e8282e' : p < 4.4 ? '#f39c12' : '#f1c40f'); if (c) cols.push([c, 3]); }
    return { c: mix(cols), k: cols.reduce((t, x) => t + x[1], 0) };
  }
  // deterministic pseudo-random numbers so textures do not jump between frames
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const X0 = 82, X1 = 158, BOT = 398, TOP = 34;
  function tubeSVG() {
    const md = medium(), lq = liquidColour(md), now = Date.now(), H = st.vol > 0 ? Math.min(300, 16 + st.vol * 34) : 0, top = BOT - H;
    const bubbling = st.gas && now - st.gasT < 6500, boil = st.boiling && st.vol > 0;
    const liqCol = lq.c || '#d7e8ff', liqOp = lq.c ? Math.min(0.92, 0.45 + lq.k * 0.12) : 0.22;
    let defs = '<clipPath id="lbIn"><path d="M' + X0 + ' ' + TOP + ' V' + (BOT - 38) + ' A38 38 0 0 0 ' + X1 + ' ' + (BOT - 38) + ' V' + TOP + ' Z"/></clipPath>'
      + '<linearGradient id="lbGl" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".12" stop-color="#fff" stop-opacity=".05"/><stop offset=".8" stop-color="#fff" stop-opacity=".03"/><stop offset=".92" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity=".08"/></linearGradient>'
      + '<linearGradient id="lbLq" x1="0" x2="1"><stop offset="0" stop-color="' + liqCol + '" stop-opacity="' + Math.min(1, liqOp + 0.12) + '"/><stop offset=".45" stop-color="' + liqCol + '" stop-opacity="' + liqOp + '"/><stop offset="1" stop-color="' + liqCol + '" stop-opacity="' + Math.min(1, liqOp + 0.18) + '"/></linearGradient>'
      + '<linearGradient id="lbMir" x1="0" x2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".3" stop-color="#9aa3b0"/><stop offset=".55" stop-color="#e8ecf0"/><stop offset=".8" stop-color="#7d8794"/><stop offset="1" stop-color="#eef2f6"/></linearGradient>'
      + '<radialGradient id="lbFl" cx=".5" cy=".85" r=".8"><stop offset="0" stop-color="#bfe7ff"/><stop offset=".35" stop-color="#4da6ff" stop-opacity=".85"/><stop offset=".6" stop-color="#ffb347" stop-opacity=".8"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>'
      + '<linearGradient id="lbLamp" x1="0" x2="1"><stop offset="0" stop-color="#9fc7e8" stop-opacity=".35"/><stop offset=".5" stop-color="#e8f4ff" stop-opacity=".18"/><stop offset="1" stop-color="#9fc7e8" stop-opacity=".35"/></linearGradient>'
      + '<filter id="lbBlur"><feGaussianBlur stdDeviation="2.2"/></filter>';
    let inner = '';
    if (st.mirror) inner += '<rect x="' + (X0 - 4) + '" y="' + TOP + '" width="' + (X1 - X0 + 8) + '" height="' + (BOT - TOP) + '" fill="url(#lbMir)"/>';
    if (H > 0) {
      const sh = boil ? Math.sin(now / 90) * 2 : 0;
      inner += '<path d="M' + (X0 - 4) + ' ' + (top + sh) + ' Q120 ' + (top + 9 - sh) + ' ' + (X1 + 4) + ' ' + (top - sh) + ' V' + (BOT + 4) + ' H' + (X0 - 4) + ' Z" fill="url(#lbLq)"/>'
        + '<path d="M' + X0 + ' ' + (top + sh) + ' Q120 ' + (top + 9 - sh) + ' ' + X1 + ' ' + (top - sh) + '" style="fill:none;stroke:#fff;stroke-opacity:.45;stroke-width:1.5"/>';
    }
    // precipitates: a fresh one clouds the whole liquid and then settles into its layer
    let y = BOT;
    st.solids.filter((s) => s.kind === 'ppt').forEach((s, si) => {
      const age = Math.min(1, (now - (s.t0 || 0)) / 3200), h0 = Math.max(14, Math.min(95, s.n * 44)), h = h0 * (0.25 + 0.75 * age), c = s.color || '#eee'; y -= h;
      if (age < 1 && H > 0) inner += '<rect x="' + X0 + '" y="' + top + '" width="' + (X1 - X0) + '" height="' + (BOT - top) + '" fill="' + c + '" opacity="' + (0.75 * (1 - age)).toFixed(2) + '"/>'
        + Array.from({ length: 26 }, (_, i) => '<circle cx="' + (X0 + 4 + rnd(i + si * 50) * 68).toFixed(1) + '" cy="' + (top + (rnd(i * 3 + si) * (BOT - top)) * (0.4 + 0.6 * age) + age * (BOT - top) * 0.5).toFixed(1) + '" r="' + (1.4 + rnd(i * 7) * 2.4).toFixed(1) + '" fill="' + c + '" opacity="' + (0.9 - age * 0.6).toFixed(2) + '"/>').join('');
      const tex = s.tex || 'fine';
      if (tex === 'gel') inner += '<rect x="' + X0 + '" y="' + y + '" width="' + (X1 - X0) + '" height="' + (h + 4) + '" fill="' + c + '" opacity=".55"/>' + Array.from({ length: 9 }, (_, i) => '<ellipse cx="' + (X0 + 8 + rnd(i + 9) * 60).toFixed(1) + '" cy="' + (y + 4 + rnd(i + 3) * h).toFixed(1) + '" rx="' + (6 + rnd(i) * 9).toFixed(1) + '" ry="' + (3 + rnd(i + 5) * 4).toFixed(1) + '" fill="#fff" opacity=".22"/>').join('');
      else if (tex === 'floc') inner += '<rect x="' + X0 + '" y="' + (y + 3) + '" width="' + (X1 - X0) + '" height="' + (h + 4) + '" fill="' + c + '" opacity=".9"/>' + Array.from({ length: 16 }, (_, i) => '<ellipse cx="' + (X0 + 4 + rnd(i + 21) * 68).toFixed(1) + '" cy="' + (y + 2 + rnd(i + 13) * h).toFixed(1) + '" rx="' + (4 + rnd(i + 2) * 6).toFixed(1) + '" ry="' + (2.5 + rnd(i + 8) * 3.5).toFixed(1) + '" fill="' + c + '" style="filter:brightness(' + (0.8 + rnd(i) * 0.45).toFixed(2) + ')"/>').join('');
      else if (tex === 'curdy') inner += '<rect x="' + X0 + '" y="' + (y + 4) + '" width="' + (X1 - X0) + '" height="' + (h + 4) + '" fill="' + c + '"/>' + Array.from({ length: 14 }, (_, i) => '<circle cx="' + (X0 + 5 + rnd(i + 40) * 66).toFixed(1) + '" cy="' + (y + 3 + rnd(i + 17) * (h - 2)).toFixed(1) + '" r="' + (3 + rnd(i + 4) * 4).toFixed(1) + '" fill="' + c + '" stroke="#000" stroke-opacity=".12"/>').join('');
      else if (tex === 'cryst') inner += '<rect x="' + X0 + '" y="' + (y + 2) + '" width="' + (X1 - X0) + '" height="' + (h + 4) + '" fill="' + c + '" opacity=".8"/>' + Array.from({ length: 22 }, (_, i) => { const cx = X0 + 4 + rnd(i + 70) * 68, cy = y + 2 + rnd(i + 31) * h, r = 1.8 + rnd(i + 11) * 2.4;
        return '<path class="lb-tw" style="animation-delay:' + (rnd(i) * 2).toFixed(2) + 's" d="M' + cx.toFixed(1) + ' ' + (cy - r).toFixed(1) + ' L' + (cx + r).toFixed(1) + ' ' + cy.toFixed(1) + ' L' + cx.toFixed(1) + ' ' + (cy + r).toFixed(1) + ' L' + (cx - r).toFixed(1) + ' ' + cy.toFixed(1) + 'Z" fill="#fff6c0"/>'; }).join('');
      else inner += '<rect x="' + X0 + '" y="' + (y + 2) + '" width="' + (X1 - X0) + '" height="' + (h + 4) + '" fill="' + c + '"/><rect x="' + X0 + '" y="' + (y + 2) + '" width="' + (X1 - X0) + '" height="3" fill="#fff" opacity=".12"/>'
        + Array.from({ length: 18 }, (_, i) => '<circle cx="' + (X0 + 3 + rnd(i + 90) * 70).toFixed(1) + '" cy="' + (y + 3 + rnd(i + 51) * h).toFixed(1) + '" r="1.1" fill="#000" opacity=".1"/>').join('');
    });
    // dry residue: crystals and powders after the water has boiled away
    st.solids.filter((s) => s.kind === 'crystal').forEach((s, si) => { const h = Math.max(16, Math.min(40, s.n * 30)); y -= h * 0.75;
      inner += Array.from({ length: 30 }, (_, i) => { const cx = X0 + 10 + rnd(i + si * 20 + 3) * 56, cy = Math.min(BOT - 8, y + rnd(i + si * 9) * h), w = 5 + rnd(i + 2) * 8, a = rnd(i + 8) * 70 - 35;
        return '<rect x="' + (cx - w / 2).toFixed(1) + '" y="' + (cy - w / 2).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + (w * 0.7).toFixed(1) + '" transform="rotate(' + a.toFixed(0) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')" fill="' + s.color + '" stroke="#fff" stroke-opacity=".25"/>'; }).join(''); });
    // powders and metal pieces lying on the bottom
    const metals = st.solids.filter((s) => s.kind === 'metal'), deps = st.solids.filter((s) => s.kind === 'deposit');
    st.solids.filter((s) => s.kind === 'solid').forEach((s, si) => { inner += Array.from({ length: 22 }, (_, i) => '<circle cx="' + (X0 + 8 + rnd(i + si * 33) * 60).toFixed(1) + '" cy="' + (BOT - 6 - rnd(i + 5 + si) * 14).toFixed(1) + '" r="' + (s.f === 'CaCO3' ? 3 + rnd(i) * 4 : 1.6 + rnd(i) * 1.8).toFixed(1) + '" fill="' + s.color + '" stroke="#000" stroke-opacity=".15"/>').join(''); });
    metals.forEach((m) => { const dep = deps.find((d) => d.c === m.f), dc = dep ? dep.color : null;
      if (m.f === 'Fe') inner += '<defs><linearGradient id="lbNail" x1="0" x2="1"><stop offset="0" stop-color="#5d636b"/><stop offset=".5" stop-color="#b9c0c8"/><stop offset="1" stop-color="#4c5158"/></linearGradient></defs><rect x="115" y="150" width="10" height="230" rx="2" fill="url(#lbNail)"/><path d="M115 380 L120 396 L125 380Z" fill="#6a7078"/><rect x="104" y="142" width="32" height="9" rx="3" fill="url(#lbNail)"/>'
        + (dc ? '<rect x="115" y="' + Math.max(top, 150) + '" width="10" height="' + (380 - Math.max(top, 150)) + '" fill="' + dc + '" opacity=".88"/>' + Array.from({ length: 12 }, (_, i) => '<circle cx="' + (113 + rnd(i) * 14).toFixed(1) + '" cy="' + (Math.max(top, 160) + rnd(i + 3) * (370 - Math.max(top, 160))).toFixed(1) + '" r="1.6" fill="' + dc + '"/>').join('') : '');
      else if (m.f === 'Cu') inner += '<path d="M120 90 C 140 140, 100 170, 122 210 S 104 290, 124 330 S 112 370, 120 388" style="fill:none;stroke:#b8642c;stroke-width:5;stroke-linecap:round"/><path d="M120 90 C 140 140, 100 170, 122 210 S 104 290, 124 330 S 112 370, 120 388" style="fill:none;stroke:#f0a070;stroke-width:1.4;stroke-opacity:.7"/>'
        + (dc ? Array.from({ length: 18 }, (_, i) => { const cy = Math.max(top + 6, 200) + rnd(i + 2) * (380 - Math.max(top + 6, 200)), cx = 112 + rnd(i + 9) * 18; return '<path d="M' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' l' + (4 + rnd(i) * 6).toFixed(1) + ' -' + (3 + rnd(i + 1) * 5).toFixed(1) + ' M' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' l-' + (3 + rnd(i + 4) * 5).toFixed(1) + ' -' + (4 + rnd(i + 6) * 5).toFixed(1) + '" style="stroke:' + dc + ';stroke-width:1.6"/>'; }).join('') : '');
      else if (m.f === 'Mg') inner += '<rect x="112" y="230" width="16" height="160" rx="1" fill="#d9dde2"/><rect x="112" y="230" width="4" height="160" fill="#fff" opacity=".6"/>';
      else if (m.f === 'Al') inner += '<path d="M98 372 l14 -18 l10 8 l12 -12 l8 22 l-16 14 l-18 -2z" fill="#cfd5dc" stroke="#9aa3ad"/><path d="M104 366 l10 -10 l8 6" style="fill:none;stroke:#fff;stroke-opacity:.6"/>';
      else if (m.f === 'Zn') inner += [[104, 384], [126, 386], [116, 372]].map(([cx, cy], i) => '<path d="M' + (cx - 8) + ' ' + cy + ' q2 -9 9 -10 q9 1 9 8 q0 9 -9 10 q-8 0 -9 -8z" fill="#9aa3ad" stroke="#6d757e"/><circle cx="' + (cx - 1) + '" cy="' + (cy - 5) + '" r="2.4" fill="#e8ecf0" opacity=".8"/>' + (dc ? '<circle cx="' + (cx + 3) + '" cy="' + (cy + 2) + '" r="5" fill="' + dc + '" opacity=".8"/>' : '')).join('');
      else if (m.f === 'Na' && H <= 0) inner += '<rect x="110" y="380" width="20" height="14" rx="3" fill="#d9d6c8" stroke="#a9a596"/>'; });
    if (st.flags.na && now - st.flags.na < 4500 && H > 0) { const x = 100 + Math.sin(now / 160) * 22; inner += '<circle cx="' + x.toFixed(1) + '" cy="' + (top + 5) + '" r="' + (7 - (now - st.flags.na) / 900).toFixed(1) + '" fill="#e8e4d4"/>' + Array.from({ length: 5 }, (_, i) => '<circle cx="' + (x + (rnd(i + now % 7) - 0.5) * 22).toFixed(1) + '" cy="' + (top - rnd(i + 2) * 10).toFixed(1) + '" r="1.4" fill="#ffd27a"/>').join(''); }
    // gas bubbles rise from the metal surface (or the bottom); boiling makes large bubbles
    if (H > 0 && (bubbling || boil)) {
      const srcX = st.gasSrc === 'Fe' ? [120, 120] : st.gasSrc === 'Cu' ? [116, 124] : st.gasSrc === 'Mg' ? [114, 126] : st.gasSrc === 'na' ? [96, 140] : [X0 + 6, X1 - 6];
      const fade = bubbling ? Math.max(0.2, 1 - (now - st.gasT) / 6500) : 0, n = Math.round(4 + 18 * fade) + (boil ? 10 : 0);
      inner += Array.from({ length: n }, (_, i) => { const big = boil && i >= n - 10, x = big ? X0 + 8 + rnd(i + 3) * 60 : srcX[0] + rnd(i + 11) * (srcX[1] - srcX[0]), r = big ? 3 + rnd(i) * 4 : 1.2 + rnd(i + 5) * 2.4, dur = big ? 0.9 + rnd(i) * 0.6 : 1.3 + rnd(i + 2) * 1.2;
        return '<circle class="lb-b" style="--h:' + Math.max(30, H - 8) + 'px;animation-duration:' + dur.toFixed(2) + 's;animation-delay:-' + (rnd(i + 7) * dur).toFixed(2) + 's" cx="' + x.toFixed(1) + '" cy="' + (BOT - 6 - rnd(i + 1) * 10).toFixed(1) + '" r="' + r.toFixed(1) + '" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1"/>'; }).join('');
    }
    if (st.ring) inner += '<rect x="' + X0 + '" y="56" width="' + (X1 - X0) + '" height="16" fill="#f6f6f2" opacity=".85"/><rect x="' + X0 + '" y="56" width="' + (X1 - X0) + '" height="16" fill="url(#lbGl)"/>';
    if (st.hg) inner += Array.from({ length: 14 }, (_, i) => '<circle cx="' + (X0 + 3 + rnd(i + 5) * 70).toFixed(1) + '" cy="' + (70 + rnd(i + 2) * 120).toFixed(1) + '" r="' + (1.4 + rnd(i) * 2).toFixed(1) + '" fill="#e6eaef" stroke="#8a929c" stroke-width=".6"/>').join('');
    // vapour above the mouth: steam while boiling, brown NO₂, violet iodine, white NH₄Cl smoke
    let out = '';
    const cloud = st.cloud && now - st.cloudT < 7000 ? st.cloud : null;
    if (boil) out += Array.from({ length: 4 }, (_, i) => '<path class="lb-s" style="animation-delay:-' + (i * 0.6).toFixed(1) + 's" d="M' + (106 + i * 8) + ' 30 q-8 -14 0 -26 q8 -12 0 -24" style="fill:none;stroke:#fff;stroke-opacity:.55;stroke-width:5;stroke-linecap:round;filter:url(#lbBlur)"/>').join('');
    if (cloud) out += '<g class="lb-c"><ellipse cx="120" cy="20" rx="40" ry="16" fill="' + cloud + '" opacity=".6" filter="url(#lbBlur)"/><ellipse cx="104" cy="6" rx="22" ry="10" fill="' + cloud + '" opacity=".45" filter="url(#lbBlur)"/></g>'
      + (H <= 0 || cloud !== '#f4f4f4' ? '<rect x="' + X0 + '" y="' + (TOP + 10) + '" width="' + (X1 - X0) + '" height="' + Math.max(40, (H > 0 ? top : BOT) - TOP - 20) + '" fill="' + cloud + '" opacity=".22" clip-path="url(#lbIn)"/>' : '');
    // spirit lamp with a flickering flame while heating; a wooden holder at the top
    const lamp = '<ellipse cx="120" cy="498" rx="46" ry="8" fill="#000" opacity=".25"/><path d="M84 470 q0 -30 36 -32 q36 2 36 32 q0 24 -36 26 q-36 -2 -36 -26z" fill="url(#lbLamp)" style="stroke:var(--text);stroke-opacity:.5;stroke-width:1.5"/>'
      + '<path d="M86 474 q34 12 68 0 q-2 20 -34 22 q-32 -2 -34 -22z" fill="#9fd4ff" opacity=".35"/><rect x="110" y="428" width="20" height="12" rx="2" fill="#8a8f98"/><rect x="117" y="420" width="6" height="9" fill="#e8dcc0"/>'
      + (st.heated ? '<g class="lb-f"><path d="M120 422 c-18 -14 -10 -36 0 -50 c10 14 18 36 0 50z" fill="url(#lbFl)"/><path d="M120 420 c-6 -6 -4 -16 0 -22 c4 6 6 16 0 22z" fill="#cfefff" opacity=".85"/></g><ellipse cx="120" cy="' + (BOT + 2) + '" rx="26" ry="6" fill="#ff8a3a" opacity=".25" filter="url(#lbBlur)"/>' : '');
    const holder = '<rect x="58" y="56" width="104" height="14" rx="4" fill="#8a5a2b"/><rect x="58" y="56" width="104" height="4" rx="2" fill="#b07a44"/><rect x="20" y="58" width="46" height="10" rx="3" fill="#7a4e24"/>';
    const flameTest = st.flame ? '<g class="lb-f"><path d="M205 330 c-26 -26 -10 -70 0 -96 c10 26 26 70 0 96z" fill="' + st.flame + '" opacity=".88"/><path d="M205 328 c-8 -8 -4 -22 0 -30 c4 8 8 22 0 30z" fill="#fff" opacity=".5"/></g><path d="M178 250 L196 300" stroke="#c8ccd2" stroke-width="2"/><circle cx="197" cy="303" r="4" fill="none" stroke="#c8ccd2" stroke-width="1.6"/>' : '';
    return '<svg viewBox="-20 -110 290 620" style="height:100%;width:auto;max-width:100%;display:block"><defs>' + defs + '</defs>'
      + '<style>.lb-b{animation:lbB 1.6s linear infinite}@keyframes lbB{0%{transform:translateY(0);opacity:0}10%{opacity:.9}100%{transform:translateY(calc(var(--h) * -1));opacity:0}}'
      + '.lb-f{transform-origin:120px 422px;animation:lbF .18s ease-in-out infinite alternate}@keyframes lbF{to{transform:scale(1.06,.9) skewX(2deg)}}.lb-c{animation:lbC 3.5s ease-out infinite}@keyframes lbC{from{transform:translateY(16px);opacity:0}35%{opacity:1}to{transform:translateY(-16px);opacity:0}}'
      + '.lb-s{animation:lbS 1.8s linear infinite}@keyframes lbS{from{transform:translateY(10px);opacity:0}30%{opacity:.8}to{transform:translateY(-34px);opacity:0}}.lb-tw{animation:lbT 1.6s ease-in-out infinite}@keyframes lbT{50%{opacity:.15}}</style>'
      + lamp + '<g clip-path="url(#lbIn)">' + inner + '</g>'
      + '<path d="M' + X0 + ' ' + TOP + ' V' + (BOT - 38) + ' A38 38 0 0 0 ' + X1 + ' ' + (BOT - 38) + ' V' + TOP + '" fill="url(#lbGl)" style="stroke:var(--text);stroke-opacity:.75;stroke-width:2.2"/>'
      + '<path d="M' + (X0 + 6) + ' ' + (TOP + 30) + ' V' + (BOT - 50) + '" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/><path d="M' + (X1 - 7) + ' ' + (TOP + 40) + ' V' + (BOT - 70) + '" stroke="#fff" stroke-opacity=".14" stroke-width="2" stroke-linecap="round"/>'
      + '<ellipse cx="120" cy="' + TOP + '" rx="' + ((X1 - X0) / 2 + 5) + '" ry="5" style="fill:none;stroke:var(--text);stroke-opacity:.8;stroke-width:2.4"/>' + holder + out + flameTest + actorSVG(top, H) + '</svg>';
  }
  // the hand that adds a reagent: a tilting bottle and its stream, a spatula, tweezers or a dropper
  function actorSVG(top, H) {
    const a = st.act; if (!a) return ''; const p = Math.min(1, (Date.now() - a.t0) / a.dur), ease = (x) => x * x * (3 - 2 * x), lerp = (u, v, t) => u + (v - u) * t;
    const inP = ease(Math.min(1, p / 0.28)), outP = ease(Math.max(0, (p - 0.82) / 0.18)), k = inP * (1 - outP), surf = H > 0 ? top + 6 : BOT - 8;
    if (a.kind === 'pour') { const x = lerp(232, 150, k), y = lerp(-30, -14, k), ang = lerp(0, -116, k), flow = p > 0.3 && p < 0.82, lvl = p > 0.3 ? Math.min(1, (p - 0.3) / 0.5) : 0;
      const bottleG = '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')"><path d="M-5 0 h10 v10 q12 4 14 16 v46 q0 6 -6 6 h-26 q-6 0 -6 -6 v-46 q2 -12 14 -16z" fill="rgba(220,236,255,.18)" style="stroke:var(--text);stroke-opacity:.7;stroke-width:1.6"/>'
        + '<path d="M-17 ' + (40 + 18 * lvl).toFixed(1) + ' h34 v' + (32 - 18 * lvl).toFixed(1) + ' q0 4 -4 4 h-26 q-4 0 -4 -4z" fill="' + a.col + '" opacity=".75"/><rect x="-14" y="30" width="28" height="18" rx="2" fill="#f6f2e6"/><text x="0" y="43" text-anchor="middle" style="font:700 8px IBM Plex Mono,monospace;fill:#222">' + a.label + '</text></g>';
      const stream = flow ? '<path d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' Q 128 ' + (y + 12).toFixed(1) + ' 121 ' + (TOP + 4) + ' L121 ' + surf.toFixed(1) + '" style="fill:none;stroke:' + a.col + ';stroke-width:3.4;stroke-linecap:round;opacity:.85"/>' : '';
      return stream + bottleG; }
    if (a.kind === 'powder') { const x = lerp(250, 128, k), y = lerp(-60, 18, k), ang = lerp(-20, 28, Math.max(0, Math.min(1, (p - 0.3) / 0.25))) * (1 - outP);
      const fall = p > 0.4 && p < 0.85 ? Array.from({ length: 14 }, (_, i) => { const t = ((p - 0.4) / 0.45 * 1.6 + i / 14) % 1; return '<circle cx="' + (118 + (i % 5) * 1.6).toFixed(1) + '" cy="' + (26 + t * (surf - 26)).toFixed(1) + '" r="1.8" fill="' + a.col + '"/>'; }).join('') : '';
      return fall + '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')"><rect x="0" y="-2" width="120" height="4" rx="2" fill="#c5ccd4"/><ellipse cx="-4" cy="0" rx="12" ry="5" fill="#c5ccd4"/>' + (p < 0.55 ? '<ellipse cx="-4" cy="-4" rx="9" ry="4" fill="' + a.col + '"/>' : '') + '</g>'; }
    if (a.kind === 'metal') { const y = lerp(-90, 10, k), open = p > 0.45, dropY = open ? Math.min(surf - 6, 10 + (p - 0.45) / 0.3 * (surf - 10)) : y + 26;
      return '<g transform="translate(120 ' + y.toFixed(1) + ')"><path d="M-3 -70 L' + (open ? -9 : -4) + ' 24 M3 -70 L' + (open ? 9 : 4) + ' 24" style="stroke:#c5ccd4;stroke-width:3;stroke-linecap:round"/></g>'
        + (p < 0.85 ? '<circle cx="120" cy="' + dropY.toFixed(1) + '" r="6" fill="' + ({ Cu: '#c4682c', Fe: '#7d838c', Zn: '#9aa3ad', Mg: '#d9dde2', Al: '#cfd5dc', Na: '#e8e4d4' }[a.id] || '#aaa') + '"/>' : ''); }
    const y = lerp(-100, -40, k), drops = p > 0.32 && p < 0.85 ? [0, 1, 2].map((i) => { const t = (p - 0.32) / 0.5 - i * 0.28; return t > 0 && t < 1 ? '<ellipse cx="120" cy="' + (y + 52 + t * (surf - y - 52)).toFixed(1) + '" rx="2.6" ry="3.4" fill="' + a.col + '" stroke="#fff" stroke-opacity=".5" stroke-width=".6"/>' : ''; }).join('') : '';
    return drops + '<g transform="translate(120 ' + y.toFixed(1) + ')"><path d="M-4 0 v40 l4 10 l4 -10 v-40z" fill="rgba(220,236,255,.25)" style="stroke:var(--text);stroke-opacity:.6"/><rect x="-7" y="-26" width="14" height="28" rx="7" fill="#2a2a2e"/></g>';
  }
  function animating() { const now = Date.now(); return !!st.act || st.heated || st.temp > 21 || (st.gas && now - st.gasT < 6500) || (st.cloud && now - st.cloudT < 7000) || st.flame || (st.flags.na && now - st.flags.na < 4500) || st.solids.some((s) => s.kind === 'ppt' && now - (s.t0 || 0) < 3300); }
  // what the 3D bench needs to know about the tube, recomputed every frame
  function vm() {
    if (!st) return null; const md = medium(), lq = liquidColour(md), now = Date.now(), na = st.flags.na && now - st.flags.na < 4500;
    const metals = st.solids.filter((s) => s.kind === 'metal').map((m) => { const d = st.solids.find((x) => x.kind === 'deposit' && x.c === m.f); return { f: m.f, dep: d ? d.color : null }; });
    if (na && !metals.some((m) => m.f === 'Na')) metals.push({ f: 'Na' });
    return { vol: st.vol, liqCol: lq.c, liqOp: lq.c ? Math.min(0.9, 0.42 + lq.k * 0.12) : 0.22, boil: st.boiling && st.vol > 0, heated: st.heated,
      ppts: st.solids.filter((s) => s.kind === 'ppt').map((s) => ({ f: s.f, color: s.color || '#eeeeee', tex: s.tex || 'fine', n: s.n, age: (now - (s.t0 || 0)) / 1000 })),
      crystals: st.solids.filter((s) => s.kind === 'crystal').map((s) => ({ color: s.color || '#f4f4f0', n: s.n })),
      powders: st.solids.filter((s) => s.kind === 'solid').map((s) => ({ color: s.color || '#eeeeee', big: s.f === 'CaCO3' })), metals,
      gas: st.gas ? Math.max(0, 1 - (now - st.gasT) / 6500) : 0, gasSrc: st.gasSrc, cloud: st.cloud && now - st.cloudT < 7000 ? st.cloud : null,
      mirror: st.mirror, ring: st.ring, hg: st.hg, naBall: na, naAge: na ? (now - st.flags.na) / 1000 : 0, flameTest: st.flame,
      act: st.act ? Object.assign({}, st.act, { t0p: performance.now() - (now - st.act.t0) }) : null,
      events: st.events.filter((e) => now - e.t0 < 5000), broken: st.broken, temp: st.temp };
  }
  // a short card about a reagent for the room: what it is, how it dissolves, its colour and its hazards
  function describe(id) {
    const r = RGI[id]; if (!r) return null; const li = L(), W = (u, e, ru) => [u, e, ru][li];
    const cls = r.t === 'acid' ? (STRONG.includes(r.a) ? W('Kuchli kislota', 'Strong acid', 'Сильная кислота') : W('Kuchsiz kislota', 'Weak acid', 'Слабая кислота'))
      : r.t === 'base' ? (r.grp === 'alk' ? (r.c === 'NH4' ? W('Kuchsiz asos (ammiak eritmasi)', 'Weak base (ammonia solution)', 'Слабое основание (раствор аммиака)') : W('Ishqor (eriydigan kuchli asos)', 'Alkali (soluble strong base)', 'Щёлочь (растворимое сильное основание)')) : W('Erimaydigan asos', 'Insoluble base', 'Нерастворимое основание'))
        : r.t === 'salt' ? W('Tuz', 'Salt', 'Соль') : r.t === 'metal' ? W('Metall', 'Metal', 'Металл') : r.t === 'ind' ? W('Indikator', 'Indicator', 'Индикатор') : W('Boshqa modda', 'Other substance', 'Другое вещество');
    const solw = r.code === 'N' ? W('suvda erimaydi', 'insoluble in water', 'нерастворим в воде') : r.code === 'M' ? W('suvda kam eriydi', 'slightly soluble', 'малорастворим') : r.t === 'metal' ? '' : r.solid ? W('qattiq modda', 'solid', 'твёрдое вещество') : W('suvdagi eritma', 'aqueous solution', 'водный раствор');
    const c = r.t === 'metal' ? null : r.solid ? (PCOL[(r.a || '') + ':' + r.c] || SOLIDCOL[id] || '#f3f3ef') : solCol({ f: id, c: r.c });
    const colw = c ? T.cn[cname(c)] : r.t === 'metal' ? W('kumushrang / metall yaltiroq', 'silvery / metallic', 'серебристый / металлический') : W('rangsiz', 'colourless', 'бесцветный');
    const hz = [];
    if (r.t === 'acid' && STRONG.includes(r.a)) hz.push(W('O\'yuvchi: teri va ko\'zni kuydiradi', 'Corrosive: burns skin and eyes', 'Едкая: обжигает кожу и глаза'));
    if (id === 'HF') hz.push(W('Juda zaharli, shishani yemiradi', 'Very toxic, etches glass', 'Очень ядовита, разъедает стекло'));
    if (r.t === 'base' && r.grp === 'alk' && r.c !== 'NH4') hz.push(W('O\'yuvchi ishqor: terini yemiradi', 'Caustic: attacks skin', 'Едкая щёлочь: разъедает кожу'));
    if (id === 'NH4OH' || id === 'H2S' || id === 'H2SO3') hz.push(W('O\'tkir hidli bug\' — nafas olmang', 'Pungent vapour — do not breathe it', 'Едкий запах — не вдыхайте'));
    if (['Pb', 'Hg', 'Cr', 'Ni', 'Co'].includes(r.c) || (r.c === 'Ba' && r.code === 'R')) hz.push(W('Zaharli (og\'ir metall birikmasi)', 'Toxic (heavy-metal compound)', 'Ядовито (соединение тяжёлого металла)'));
    if (['KMnO4', 'KMnO4s', 'HNO3', 'H2O2c'].includes(id) || r.a === 'NO3' && r.c === 'NH4') hz.push(W('Kuchli oksidlovchi — organik moddalardan uzoq tuting', 'Strong oxidiser — keep away from organic matter', 'Сильный окислитель — держите подальше от органики'));
    if (['Na', 'K', 'Li', 'Ca'].includes(id)) hz.push(W('Suv bilan shiddatli reaksiyaga kirishadi (kerosin ostida saqlanadi)', 'Reacts violently with water (kept under paraffin oil)', 'Бурно реагирует с водой (хранится под керосином)'));
    if (id === 'NH4NO3') hz.push(W('Kuchli qizdirilganda portlashi mumkin', 'Can explode when strongly heated', 'При сильном нагревании может взорваться'));
    if (r.a === 'F' && r.t === 'salt') hz.push(W('Ftoridlar zaharli', 'Fluorides are toxic', 'Фториды ядовиты'));
    if (r.a === 'S' && r.t === 'salt') hz.push(W('Kislota bilan zaharli H₂S chiqaradi', 'Gives poisonous H₂S with acids', 'С кислотами выделяет ядовитый H₂S'));
    const ions = r.c && r.a && r.t !== 'metal' && r.t !== 'ind' ? isym(r.c) + ' + ' + isym(r.a) : '';
    return { name: r.n[li], formula: disp(id), cls, sol: solw, colour: colw, colourHex: c, ions, hazards: hz, kind: actKind(id) };
  }
  let view3d = null;
  function draw() { const t = host && host.querySelector('.lb-tube'); if (t && !view3d) t.innerHTML = tubeSVG(); const th = host && host.querySelector('.lb-t'); if (th) th.textContent = '🌡️ ' + Math.round(st.temp) + ' °C'; }
  function render() {
    if (!host) return;
    const md = medium(), mdc = { acid: '#ff5d6e', base: '#6f8bff', neutral: '#2ecc96', none: 'var(--muted)' }[md.k];
    draw();
    host.querySelector('.lb-md').innerHTML = '<span style="color:' + mdc + '">● ' + T.medium[md.k] + (md.k !== 'none' ? ' · pH ≈ ' + String(md.ph).replace('.', L() === 1 ? '.' : ',') : '') + '</span>';
    host.querySelector('.lb-heat').textContent = '🔥 ' + (st.heated ? T.stop : T.heat);
    host.querySelector('.lb-heat').style.background = st.heated ? 'rgba(255,138,58,.2)' : 'var(--btn)';
    const contents = st.sol.filter((x) => x.f !== 'H2O').map((x) => disp(x.f)).concat(st.solids.map((s) => pretty(s.f) + (s.kind === 'ppt' ? '↓' : '')));
    host.querySelector('.lb-in').textContent = contents.join(' · ');
    host.querySelector('.lb-log').innerHTML = st.log.length ? st.log.map((e) => '<div style="padding:9px 11px;border-radius:10px;background:' + (e.muted ? 'transparent' : 'var(--panel)') + ';border:1px solid ' + (e.muted ? 'transparent' : 'var(--line)') + '">'
      + '<div style="display:flex;gap:8px;align-items:baseline;font-size:' + (e.muted ? 12.5 : 14) + 'px;font-weight:' + (e.muted ? 500 : 700) + ';color:' + (e.muted ? 'var(--muted)' : 'var(--text)') + '"><span>' + e.icon + '</span><span>' + e.title + '</span></div>'
      + (e.eq ? '<div style="margin-top:6px;font:600 14px IBM Plex Mono,monospace;color:var(--green);overflow-x:auto;white-space:nowrap">' + e.eq + '</div>' : '')
      + (e.ion ? '<div style="margin-top:4px;font:12.5px IBM Plex Mono,monospace;color:var(--body)"><span style="color:var(--muted)">' + T.ionic + ':</span> ' + e.ion + '</div>' : '')
      + (e.note ? '<div style="margin-top:5px;font-size:12.5px;color:var(--body)">' + e.note + '</div>' : '') + '</div>').join('')
      : '<div style="font-size:13.5px;color:var(--muted);line-height:1.6">' + T.empty + '</div>';
  }
  const bottle = (r) => { const c = r.t === 'acid' ? '#ff5d6e' : r.t === 'base' ? '#6f8bff' : r.t === 'metal' ? '#9aa3b8' : r.t === 'ind' ? '#c08bff' : r.solid ? (PCOL[(r.a || '') + ':' + r.c] || '#e8e8e2') : (solCol({ f: r.id, c: r.c }) || '#9fd8c8');
    const tag = r.code === 'N' ? T.insol : r.code === 'M' ? T.slight : '';
    return '<button data-r="' + r.id + '" title="' + r.n[L()] + '" style="display:flex;align-items:center;gap:8px;text-align:left;padding:7px 9px;border-radius:9px;border:1px solid var(--line);background:var(--btn);color:var(--text);cursor:pointer;font-family:Space Grotesk,sans-serif;min-width:0">'
      + '<span style="flex:0 0 auto;width:12px;height:18px;border-radius:' + (r.solid ? '50%' : '3px 3px 5px 5px') + ';background:' + c + ';box-shadow:0 0 8px ' + c + '66;border:1px solid rgba(0,0,0,.15)"></span><span style="min-width:0"><span style="display:block;font:600 13px IBM Plex Mono,monospace">' + (r.t === 'ind' ? r.n[L()] : disp(r.id)) + '</span>'
      + '<span style="display:block;font-size:10.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (r.t === 'ind' ? '' : r.n[L()]) + (tag ? ' · ' + tag : '') + '</span></span></button>'; };
  function shelf(q) {
    const qq = (q || '').toLowerCase().replace(/['‘’ʻ]/g, ''), match = (r) => !qq || (r.id + ' ' + r.n.join(' ')).toLowerCase().replace(/['‘’ʻ]/g, '').includes(qq);
    const grid = (items) => '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px">' + items.map(bottle).join('') + '</div>';
    const sec = (title, items, open) => (items.length ? '<details' + (open || qq ? ' open' : '') + ' style="margin-bottom:10px"><summary style="cursor:pointer;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 2px 6px">' + title + ' · ' + items.length + '</summary>' + grid(items) + '</details>' : '');
    const by = (f) => RG.filter((r) => f(r) && match(r));
    const anTitle = (a) => { const an = ANS.find((x) => x[0] === a); return [an[4].charAt(0).toUpperCase() + an[4].slice(1) + 'lar', an[5].charAt(0).toUpperCase() + an[5].slice(1) + 's', an[7]][L()]; };
    const total = by(() => true).length;
    return '<div style="font-size:11.5px;color:var(--muted);margin:-4px 2px 10px">' + fmt(T.count, { n: total }) + '</div>'
      + sec(T.groups.acid, by((r) => r.t === 'acid'), true) + sec(T.groups.alk, by((r) => r.t === 'base' && r.grp === 'alk'), true) + sec(T.groups.ins, by((r) => r.t === 'base' && r.grp === 'ins'))
      + ANS.slice(1).map((an) => sec(T.groups.salt + ': ' + anTitle(an[0]), by((r) => r.t === 'salt' && r.grp === an[0]), ['Cl', 'SO4', 'NO3', 'CO3'].includes(an[0]))).join('')
      + sec(T.groups.spec, by((r) => r.grp === 'spec'), true) + sec(T.groups.metal, by((r) => r.t === 'metal'), true) + sec(T.groups.ind, by((r) => r.t === 'ind'), true) + sec(T.groups.other, by((r) => r.t === 'other'), true);
  }
  function build() {
    const btn = (cls, t, c) => '<button class="' + cls + '" style="padding:9px 13px;border-radius:10px;border:1px solid ' + (c || 'var(--line)') + ';background:var(--btn);color:var(--text);font:600 13px Space Grotesk,sans-serif;cursor:pointer">' + t + '</button>';
    host.innerHTML = '<style>.lb-wrap{display:grid;grid-template-columns:minmax(260px,1fr) minmax(260px,330px) minmax(280px,1.1fr);gap:16px;height:100%;padding:16px 20px;box-sizing:border-box}'
      + '.lb-col{min-height:0;overflow:auto;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px}'
      + '@media (max-width:980px){.lb-wrap{grid-template-columns:1fr;height:auto}.lb-col{overflow:visible}.lb-bench{order:-1}}.lb-wrap button:hover{filter:brightness(1.12)}.lb-wrap summary::marker{color:var(--green)}</style>'
      + '<div class="lb-wrap"><div class="lb-col"><div style="font-weight:700;color:var(--text);margin-bottom:8px">🧴 ' + T.shelf + '</div>'
      + '<input class="lb-q" placeholder="' + T.find + '" style="width:100%;box-sizing:border-box;margin-bottom:12px;background:var(--input);border:1px solid var(--line);border-radius:10px;color:var(--text);font:13px Space Grotesk,sans-serif;padding:9px 12px;outline:none"><div class="lb-shelf">' + shelf('') + '</div></div>'
      + '<div class="lb-col lb-bench" style="display:flex;flex-direction:column;align-items:stretch;gap:10px"><div style="display:flex;justify-content:space-between;gap:8px;font-size:13px;font-weight:600"><span class="lb-md"></span><span class="lb-t" style="font-family:IBM Plex Mono,monospace;color:var(--muted)"></span></div>'
      + '<div class="lb-step" style="display:none;padding:10px 12px;border-radius:12px;background:rgba(46,204,150,.08);border:1px solid rgba(46,204,150,.4)"><div style="display:flex;justify-content:space-between;gap:8px;font-size:12px;font-weight:700;color:var(--green)"><span class="lb-st-t"></span><span class="lb-st-n"></span></div>'
      + '<div style="height:4px;border-radius:2px;background:var(--line);margin:7px 0 8px;overflow:hidden"><div class="lb-st-bar" style="height:100%;width:0;background:#2ecc96;transition:width .5s"></div></div>'
      + '<div class="lb-st-x" style="font-size:14px;line-height:1.5;color:var(--text)"></div><div class="lb-st-o" style="display:none;margin-top:6px;font-size:13px;line-height:1.5;color:var(--body)"></div>'
      + '<button class="lb-st-stop" style="margin-top:8px;padding:5px 10px;border-radius:8px;border:1px solid var(--line);background:var(--btn);color:var(--text);font:600 12px Space Grotesk,sans-serif;cursor:pointer">⏸ ' + T.step.stop + '</button></div>'
      + '<div class="lb-tube" style="height:min(56vh,520px);min-height:300px;display:flex;justify-content:center;overflow:hidden"></div>'
      + '<div class="lb-in" style="min-height:18px;text-align:center;font:12px IBM Plex Mono,monospace;color:var(--muted)"></div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">' + btn('lb-heat', '🔥 ' + T.heat, 'rgba(255,138,58,.5)') + btn('lb-flame', '🕯️ ' + T.flame) + btn('lb-clear', '🧽 ' + T.clear) + '</div>'
      + '<div style="font-size:11px;color:var(--muted);text-align:center;line-height:1.5">⚠️ ' + T.safety + '</div></div>'
      + '<div class="lb-col" style="display:flex;flex-direction:column;gap:12px">' + (window.PTROOM && ctx.THREE ? '<button class="lb-room" style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(77,210,255,.6);background:linear-gradient(135deg,rgba(77,210,255,.22),rgba(155,107,255,.22));color:var(--text);font:700 14px Space Grotesk,sans-serif;cursor:pointer;text-align:left">🥽 ' + ROOM[L()][0] + '<div style="font-weight:500;font-size:12px;color:var(--body);margin-top:3px">' + ROOM[L()][1] + '</div></button>' : '') + '<div><div style="font-weight:700;color:var(--text);margin-bottom:8px">📋 ' + T.presets + '</div>'
      + '<select class="lb-pre" style="width:100%;background:var(--input);border:1px solid var(--line);border-radius:10px;color:var(--text);font:13px Space Grotesk,sans-serif;padding:9px 10px">' + PRESETS.map((p, i) => '<option value="' + i + '">' + (i + 1) + '. ' + p[0][L()] + '</option>').join('') + '</select>'
      + '<button class="lb-run" style="margin-top:8px;width:100%;padding:9px;border-radius:10px;border:1px solid rgba(46,204,150,.55);background:rgba(46,204,150,.15);color:var(--green);font:700 13px Space Grotesk,sans-serif;cursor:pointer">▶ ' + T.run + '</button></div>'
      + '<div style="font-weight:700;color:var(--text)">🔬 ' + T.log + '</div><div class="lb-log" style="display:flex;flex-direction:column;gap:8px"></div></div></div>';
    host.querySelector('.lb-shelf').addEventListener('click', (e) => { const b = e.target.closest('button[data-r]'); if (b) queueAdd(b.dataset.r); });
    host.querySelector('.lb-q').addEventListener('input', (e) => { host.querySelector('.lb-shelf').innerHTML = shelf(e.target.value); });
    host.querySelector('.lb-heat').addEventListener('click', heat);
    host.querySelector('.lb-flame').addEventListener('click', flame);
    host.querySelector('.lb-clear').addEventListener('click', clear);
    host.querySelector('.lb-st-stop').addEventListener('click', () => { runTok++; timers.forEach(clearTimeout); timers = []; st.act = null; if (st.heated) heat(); stepUI(null); render(); });
    host.querySelector('.lb-run').addEventListener('click', () => runPreset(+host.querySelector('.lb-pre').value));
    const rb = host.querySelector('.lb-room'); if (rb) rb.addEventListener('click', enterRoom);
    // the 3D bench when Three.js is on the page, the flat drawing otherwise
    if (view3d) { view3d.dispose(); view3d = null; }
    if (ctx.THREE && window.PTLAB3D) { try { view3d = window.PTLAB3D.create(host.querySelector('.lb-tube'), { THREE: ctx.THREE, orbit: ctx.orbit, light: ctx.light, getVM: vm }); } catch (e) { console.error('lab3d', e); view3d = null; } }
    render();
  }
  // the free 3D laboratory takes over the same host until its exit button brings the simple bench back
  const ROOM = [['3D laboratoriyaga kirish', 'Haqiqiy xonadek: javondan moddani olib, probirka, stakan yoki kolbaga o‘zingiz soling'], ['Enter the 3D laboratory', 'Like a real room: take substances off the shelf and add them to tubes, a beaker or a flask yourself'], ['Войти в 3D лабораторию', 'Как настоящая комната: берите вещества с полки и сами добавляйте в пробирки, стакан или колбу']];
  let inRoom = false;
  function enterRoom() { const h = host, c = ctx; window.PTLAB.unmount(); inRoom = true; window.PTROOM.mount(h, c, () => { window.PTROOM.unmount(); inRoom = false; window.PTLAB.mount(h, c); }); }
  let tick = 0, last = 0;
  function loop() { const now = Date.now(), dt = Math.min(0.5, (now - last) / 1000); last = now; if (!st) return; const ch = step(dt); if (ch) render(); else if (animating()) draw(); }
  window.PTLAB = {
    mount(h, c) { if (inRoom) { window.PTROOM.unmount(); inRoom = false; } host = h; ctx = c; T = S[c.lang] || S.uz; if (!st) st = fresh(); build(); clearInterval(tick); last = Date.now(); tick = setInterval(loop, 120); },
    setCtx(c) { ctx = c; T = S[c.lang] || S.uz; if (inRoom) return window.PTROOM.setCtx(c); if (host) build(); },
    unmount() { if (inRoom) { window.PTROOM.unmount(); inRoom = false; } timers.forEach(clearTimeout); timers = []; clearInterval(tick); if (view3d) { view3d.dispose(); view3d = null; } host = null; },
    // for testing: run reagent ids ('heat' heats for the given seconds) and return the log, oldest first
    _test(ids, secs) { st = fresh(); ids.forEach((x) => { if (x === 'heat') { st.heated = true; for (let i = 0; i < (secs || 40) / 0.12; i++) { lastDec = 0; step(0.12); } } else add(x); }); return st.log.slice().reverse(); },
    engine: {
      fresh, withState(s, fn) { const prev = st; st = s; try { return fn(); } finally { st = prev; } },
      add: (s, id) => window.PTLAB.engine.withState(s, () => add(id)), heat: (s) => window.PTLAB.engine.withState(s, () => heat()), flame: (s) => window.PTLAB.engine.withState(s, () => flame()),
      step: (s, dt) => window.PTLAB.engine.withState(s, () => step(dt)), vm: (s) => window.PTLAB.engine.withState(s, () => vm()), medium: (s) => window.PTLAB.engine.withState(s, () => medium()),
      mix(a, b) { window.PTLAB.engine.withState(b, () => { a.sol.forEach((x) => addSol(x.f, x.c, x.a, x.n)); a.solids.filter((x) => x.kind !== 'metal').forEach((x) => addSolid(x.f, x.kind === 'crystal' ? 'solid' : x.kind, x.color, x.n, x.c, x.a, x.tex));
        st.vol = Math.min(8, st.vol + a.vol); if (a.ind) st.ind = a.ind; log({ icon: '🫗', title: L10N.mixed[L()] }); react(); }); },
      actKind, actColour, disp, name: (id) => (RGI[id] ? RGI[id].n[L()] : id), reagents: () => RG, setLang(l) { ctx = Object.assign({}, ctx, { lang: l }); T = S[l] || S.uz; },
      describe
    },
    _tube: () => tubeSVG(), _state: () => st, _reagents: () => RG.map((r) => [r.id, r.t, r.grp || '', r.code || '', r.n[0]]),
    balance
  };
})();
