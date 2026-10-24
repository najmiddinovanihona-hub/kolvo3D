// Kolvo "Kimyoviy asboblar": every common piece of lab apparatus as a rotatable 3D model (Three.js) with its story.
// Texts come from data/apparatus.js (window.PT_APP); the models are built here from lathe profiles and simple parts.
// window.PTAPP.mount(host, { lang, light, THREE, orbit(camera, dom) }) draws the screen; setCtx() switches language.
(function () {
  'use strict';
  const IDS = ['test_tube', 'test_tube_rack', 'test_tube_holder', 'beaker', 'erlenmeyer', 'round_flask', 'flat_flask', 'wurtz_flask', 'volumetric_flask', 'graduated_cylinder', 'burette', 'pipette',
    'dropper', 'funnel', 'separatory_funnel', 'buchner_funnel', 'filter_flask', 'liebig_condenser', 'retort', 'evaporating_dish', 'mortar_pestle', 'crucible', 'crucible_tongs', 'watch_glass', 'petri_dish',
    'bunsen_burner', 'spirit_lamp', 'retort_stand', 'tripod_gauze', 'kipp_apparatus', 'desiccator', 'thermometer', 'dewar_flask', 'soxhlet', 'spatula', 'balance', 'hydrometer', 'wash_bottle'];
  const S = {
    uz: { title: 'Kimyoviy asboblar', find: 'Asbob qidirish…', all: 'Hammasi', cats: { glass: 'Shisha idishlar', measure: 'O\'lchov asboblari', heat: 'Qizdirish', filter: 'Filtrlash va ajratish', support: 'Tutqich va shtativlar', porcelain: 'Chinni idishlar', apparatus: 'Asbob-uskunalar' },
      purpose: 'Vazifasi', material: 'Materiali', use: 'Qanday ishlatiladi', inventor: 'Ixtirochi', year: 'Yili', history: 'Tarixi', fact: 'Qiziqarli fakt', safety: 'Xavfsizlik', drag: 'Aylantirish: sudrang · Yaqinlashtirish: g\'ildirak', rotate: 'Avto-aylanish', count: '{n} ta asbob' },
    en: { title: 'Laboratory apparatus', find: 'Find an apparatus…', all: 'All', cats: { glass: 'Glassware', measure: 'Measuring', heat: 'Heating', filter: 'Filtering & separating', support: 'Holders & stands', porcelain: 'Porcelain ware', apparatus: 'Devices' },
      purpose: 'Purpose', material: 'Material', use: 'How to use it', inventor: 'Inventor', year: 'Year', history: 'History', fact: 'Interesting fact', safety: 'Safety', drag: 'Rotate: drag · Zoom: wheel', rotate: 'Auto-rotate', count: '{n} items' },
    ru: { title: 'Химическая посуда и приборы', find: 'Найти прибор…', all: 'Все', cats: { glass: 'Стеклянная посуда', measure: 'Измерительные', heat: 'Нагревание', filter: 'Фильтрование и разделение', support: 'Держатели и штативы', porcelain: 'Фарфоровая посуда', apparatus: 'Приборы' },
      purpose: 'Назначение', material: 'Материал', use: 'Как пользоваться', inventor: 'Изобретатель', year: 'Год', history: 'История', fact: 'Интересный факт', safety: 'Безопасность', drag: 'Вращение: перетащите · Зум: колесо', rotate: 'Автовращение', count: 'предметов: {n}' }
  };

  // ---------- materials and helpers ----------
  let THREE, M = {};
  const lin = (c) => new THREE.Color(c).convertSRGBToLinear();
  function mats() {
    const P = THREE.MeshPhysicalMaterial;
    M = {
      glass: new P({ color: lin('#f2faff'), metalness: 0, roughness: 0.02, transparent: true, opacity: 0.13, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 3.4, side: THREE.DoubleSide, depthWrite: false }),
      glassThick: new P({ color: lin('#dff2ea'), metalness: 0, roughness: 0.05, transparent: true, opacity: 0.32, clearcoat: 1, envMapIntensity: 2.4, side: THREE.DoubleSide, depthWrite: false }),
      porcelain: new P({ color: lin('#f6f4ee'), roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.2, envMapIntensity: 1 }),
      porcelainRough: new THREE.MeshStandardMaterial({ color: lin('#e8e2d6'), roughness: 0.9 }),
      steel: new THREE.MeshStandardMaterial({ color: lin('#c5ccd4'), metalness: 0.95, roughness: 0.28, envMapIntensity: 1.4 }),
      darkSteel: new THREE.MeshStandardMaterial({ color: lin('#4a5058'), metalness: 0.85, roughness: 0.4 }),
      brass: new THREE.MeshStandardMaterial({ color: lin('#c9a24a'), metalness: 0.95, roughness: 0.3 }),
      silver: new THREE.MeshStandardMaterial({ color: lin('#e8ecf0'), metalness: 1, roughness: 0.08, envMapIntensity: 1.8 }),
      wood: new THREE.MeshStandardMaterial({ color: lin('#a8743f'), roughness: 0.7 }),
      rubber: new THREE.MeshStandardMaterial({ color: lin('#c0392b'), roughness: 0.6 }),
      blackRubber: new THREE.MeshStandardMaterial({ color: lin('#2a2a2e'), roughness: 0.7 }),
      cork: new THREE.MeshStandardMaterial({ color: lin('#c8a06a'), roughness: 0.95 }),
      plastic: new P({ color: lin('#f2f6f8'), roughness: 0.35, transparent: true, opacity: 0.85, clearcoat: 0.6 }),
      blue: new THREE.MeshStandardMaterial({ color: lin('#2f80ed'), roughness: 0.4 }),
      paper: new THREE.MeshStandardMaterial({ color: lin('#fbfaf5'), roughness: 0.95, side: THREE.DoubleSide }),
      white: new THREE.MeshBasicMaterial({ color: lin('#ffffff'), transparent: true, opacity: 0.85 }),
      line: new THREE.LineBasicMaterial({ color: lin('#ffffff'), transparent: true, opacity: 0.85 })
    };
  }
  const liquid = (c, op) => new THREE.MeshPhysicalMaterial({ color: lin(c), roughness: 0.1, transparent: true, opacity: op || 0.72, clearcoat: 1, envMapIntensity: 1.2, side: THREE.DoubleSide, depthWrite: false });
  const V2 = (r, y) => new THREE.Vector2(r, y);
  const lathe = (pts, mat, seg) => { const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map((p) => V2(p[0], p[1])), seg || 72), mat); m.renderOrder = mat.transparent ? 2 : 0; return m; };
  const cyl = (r1, r2, h, mat, seg, open) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg || 48, 1, !!open), mat);
  const at = (o, x, y, z, rx, ry, rz) => { o.position.set(x || 0, y || 0, z || 0); o.rotation.set(rx || 0, ry || 0, rz || 0); return o; };
  const tubeAlong = (pts, r, mat) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 64, r, 16, false), mat);
  // a quarter-circle bottom joined to straight walls, as lathe points
  function roundBottom(r, h, lip) { const p = []; for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI / 2; p.push([Math.max(0.001, Math.cos(a) * r), r + Math.sin(a) * r]); }
    p.push([r, h]); if (lip) p.push([r + lip, h + 0.02], [r + lip, h + 0.08], [r, h + 0.08]); return p; }
  // the same profile cut at a liquid level, for the liquid inside
  function fill(profile, level, inset) { const out = []; for (let i = 0; i < profile.length; i++) { const [r, y] = profile[i]; if (y > level) { const [r0, y0] = profile[i - 1] || profile[i]; const t = (level - y0) / ((y - y0) || 1); out.push([Math.max(0.001, (r0 + (r - r0) * t) - inset), level]); break; } out.push([Math.max(0.001, r - inset), y]); }
    out.push([0.001, out[out.length - 1][1]]); return out; }
  // graduation marks on the front of a cylinder
  function marks(g, r, y0, y1, n, every) { const pts = []; for (let i = 0; i <= n; i++) { const y = y0 + (y1 - y0) * i / n, w = i % (every || 5) === 0 ? 0.42 : 0.22;
      for (let k = 0; k < 8; k++) { const a1 = -w / 2 + w * k / 8, a2 = -w / 2 + w * (k + 1) / 8; pts.push(new THREE.Vector3(Math.sin(a1) * r, y, Math.cos(a1) * r), new THREE.Vector3(Math.sin(a2) * r, y, Math.cos(a2) * r)); } }
    g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), M.line)); }
  const flameMesh = (h, r) => { const g = new THREE.Group();
    const outer = cyl(0.001, r, h, new THREE.MeshBasicMaterial({ color: lin('#ff9a3c'), transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false })); outer.position.y = h / 2;
    const inner = cyl(0.001, r * 0.55, h * 0.5, new THREE.MeshBasicMaterial({ color: lin('#5ab4ff'), transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })); inner.position.y = h * 0.25;
    g.add(outer, inner); g.userData.flame = true; return g; };

  // ---------- the models: each returns a group roughly 4 units tall, standing on y = 0 ----------
  function tubeMesh(h, r, liq, liqH) { const g = new THREE.Group(), p = roundBottom(r, h, 0.06); g.add(lathe(p, M.glass)); if (liq) { const l = lathe(fill(p, liqH, 0.02), liquid(liq)); l.renderOrder = 1; g.add(l); } return g; }
  function flaskProfile(kind) {
    if (kind === 'erl') return [[0.001, 0], [1.25, 0], [1.32, 0.08], [1.3, 0.22], [0.42, 2.45], [0.38, 2.6], [0.38, 3.25], [0.46, 3.3], [0.46, 3.38], [0.38, 3.4]];
    if (kind === 'beaker') return [[0.001, 0], [1.15, 0], [1.22, 0.1], [1.22, 2.6], [1.32, 2.68], [1.32, 2.74], [1.22, 2.76]];
    const p = [], R = 1.2, cy = kind === 'flat' ? 1.05 : 1.2; for (let i = 0; i <= 24; i++) { const a = -Math.PI / 2 + i / 24 * Math.PI * 0.86, r = Math.cos(a) * R, y = cy + Math.sin(a) * R; if (kind === 'flat' && y < 0.05) { p.push([Math.min(r, 0.7), 0]); continue; } p.push([Math.max(0.001, r), y]); }
    const top = p[p.length - 1][1]; p.push([0.36, top + 0.25], [0.36, top + 1.55], [0.44, top + 1.6], [0.44, top + 1.68], [0.36, top + 1.7]); return p; }
  function flask(kind, liq, level) { const g = new THREE.Group(), p = flaskProfile(kind); g.add(lathe(p, M.glass)); if (liq) { const l = lathe(fill(p, level, 0.03), liquid(liq)); l.renderOrder = 1; g.add(l); } return g; }
  const B = {
    test_tube: () => { const g = tubeMesh(4, 0.32, '#3f8ff0', 1.4); return g; },
    test_tube_rack: () => { const g = new THREE.Group(); const board = (y) => at(new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.12, 0.9), M.wood), 0, y, 0);
      g.add(board(0.06), board(1.6)); [-1.9, 1.9].forEach((x) => g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.65, 0.9), M.wood), x, 0.82, 0)));
      ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'].forEach((c, i) => { const t = tubeMesh(3.2, 0.26, c, 0.9 + i * 0.25); t.position.set(-1.4 + i * 0.7, 0.15, 0); g.add(t); g.add(at(cyl(0.3, 0.3, 0.13, M.blackRubber, 32, true), -1.4 + i * 0.7, 1.6, 0)); }); return g; },
    test_tube_holder: () => { const g = new THREE.Group(), t = tubeMesh(3.4, 0.28, '#e67e22', 1.1); t.position.set(0.9, 0.2, 0); t.rotation.z = 0.12; g.add(t);
      g.add(at(new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.22, 0.22), M.wood), -0.9, 2.6, 0, 0, 0, 0.08));
      [-0.12, 0.12].forEach((z) => g.add(tubeAlong([[0.3, 2.65, z], [0.75, 2.75, z * 3], [1.25, 2.68, z * 3.2], [1.4, 2.6, z]], 0.035, M.steel))); return g; },
    beaker: () => { const g = flask('beaker', '#4fb3e8', 1.4); marks(g, 1.235, 0.5, 2.3, 18, 5); g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12, 0, Math.PI), M.glass), 0, 2.72, 1.24, 0, 0, Math.PI / 2)); return g; },
    erlenmeyer: () => { const g = flask('erl', '#2ecc71', 1.0); marks(g, 1.0, 0.4, 1.4, 4, 1); return g; },
    round_flask: () => { const g = flask('round', '#e74c3c', 1.1); g.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.18, 16, 48), M.cork), 0, 0.06, 0, Math.PI / 2)); g.children[0].position.y = 0.12; if (g.children[1]) g.children[1].position.y = 0.12; return g; },
    flat_flask: () => flask('flat', '#f39c12', 0.9),
    wurtz_flask: () => { const g = flask('round', '#8e44ad', 1.0); g.add(tubeAlong([[0, 3.2, 0], [0.5, 3.15, 0], [1.4, 2.6, 0], [2.0, 2.2, 0]], 0.07, M.glass)); return g; },
    volumetric_flask: () => { const g = new THREE.Group(), p = [[0.001, 0], [1.0, 0], [1.08, 0.1], [1.2, 0.6], [1.0, 1.4], [0.3, 1.9], [0.22, 2.2], [0.22, 4.1], [0.3, 4.15], [0.3, 4.22], [0.22, 4.24]];
      g.add(lathe(p, M.glass)); const l = lathe(fill(p, 3.3, 0.02), liquid('#5dade2')); l.renderOrder = 1; g.add(l); marks(g, 0.225, 3.3, 3.3, 0, 1); g.add(at(cyl(0.2, 0.17, 0.35, M.blue, 24), 0, 4.38, 0)); return g; },
    graduated_cylinder: () => { const g = new THREE.Group(), p = [[0.001, 0.25], [0.42, 0.25], [0.42, 4.3], [0.5, 4.36], [0.5, 4.42], [0.42, 4.44]];
      g.add(lathe(p, M.glass)); const l = lathe(fill(p, 2.6, 0.02), liquid('#1abc9c')); l.renderOrder = 1; g.add(l); marks(g, 0.425, 0.5, 4.1, 36, 5);
      g.add(at(cyl(0.95, 0.95, 0.25, M.glassThick, 6), 0, 0.12, 0)); return g; },
    burette: () => { const g = new THREE.Group(), p = [[0.001, 0.9], [0.13, 0.9], [0.14, 5.4], [0.17, 5.45], [0.14, 5.5]]; g.add(lathe(p, M.glass, 32)); const l = lathe(fill(p, 4.6, 0.01), liquid('#c0392b', 0.8)); l.renderOrder = 1; g.add(l);
      marks(g, 0.142, 1.3, 5.1, 50, 10); g.add(at(cyl(0.06, 0.03, 0.6, M.glass, 16), 0, 0.3, 0)); g.add(at(cyl(0.1, 0.1, 0.42, M.glassThick, 24), 0, 0.7, 0, 0, 0, Math.PI / 2));
      g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.06), M.blue), 0.26, 0.7, 0)); g.add(at(cyl(0.13, 0.1, 0.25, M.glass, 24), 0, 0.88, 0)); g.scale.setScalar(0.8); return g; },
    pipette: () => { const g = new THREE.Group(), p = [[0.001, 0], [0.025, 0], [0.06, 0.5], [0.06, 1.4], [0.28, 1.65], [0.3, 2.1], [0.06, 2.4], [0.06, 4.4]]; g.add(lathe(p, M.glass, 32));
      const l = lathe(fill(p, 3.4, 0.008), liquid('#27ae60', 0.8)); l.renderOrder = 1; g.add(l); marks(g, 0.062, 3.4, 3.4, 0, 1); g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 16), M.rubber), 0, 4.75, 0)); g.add(at(cyl(0.1, 0.12, 0.3, M.rubber, 16), 0, 4.45, 0)); return g; },
    dropper: () => { const g = new THREE.Group(), p = [[0.001, 0], [0.03, 0], [0.12, 0.8], [0.13, 2.4], [0.15, 2.45], [0.13, 2.5]]; g.add(lathe(p, M.glass, 32)); const l = lathe(fill(p, 1.3, 0.01), liquid('#8e44ad', 0.8)); l.renderOrder = 1; g.add(l);
      g.add(lathe([[0.001, 2.35], [0.2, 2.4], [0.32, 2.8], [0.3, 3.3], [0.001, 3.45]], M.blackRubber, 32)); g.scale.setScalar(1.25); return g; },
    funnel: () => { const g = new THREE.Group(), p = [[0.05, 0], [0.07, 0], [0.08, 1.7], [1.3, 3.0], [1.36, 3.06]]; g.add(lathe(p, M.glass));
      g.add(lathe([[0.1, 1.85], [1.15, 2.95]], M.paper, 48)); return g; },
    separatory_funnel: () => { const g = new THREE.Group(), p = [[0.05, 0], [0.07, 0], [0.07, 0.9], [0.12, 1.2], [0.75, 2.3], [0.95, 2.9], [0.8, 3.5], [0.25, 3.85], [0.22, 4.15]]; g.add(lathe(p, M.glass));
      const lo = lathe(fill(p, 2.25, 0.02), liquid('#2e86de', 0.75)); lo.renderOrder = 1; g.add(lo); const hi = lathe(fill(p, 3.05, 0.025).filter((q) => q[1] >= 2.25 || q[0] < 0.01).map((q) => (q[1] < 2.25 ? [q[0], 2.25] : q)), liquid('#f6d365', 0.7)); hi.renderOrder = 1; g.add(hi);
      g.add(at(cyl(0.09, 0.09, 0.5, M.glassThick, 24), 0, 1.05, 0, 0, 0, Math.PI / 2)); g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.36, 0.08), M.blue), 0.3, 1.05, 0)); g.add(at(cyl(0.21, 0.18, 0.35, M.blue, 24), 0, 4.3, 0)); return g; },
    buchner_funnel: () => { const g = new THREE.Group(); g.add(lathe([[0.12, 0], [0.16, 0], [0.18, 1.0], [0.9, 1.5], [1.1, 1.6], [1.1, 2.8], [1.18, 2.85], [1.0, 2.85], [1.0, 1.75], [0.12, 1.75]], M.porcelain));
      g.add(at(cyl(1.0, 1.0, 0.06, M.porcelain, 64), 0, 1.8, 0)); for (let i = 0; i < 40; i++) { const a = i * 2.4, r = 0.13 * Math.sqrt(i) ; if (r > 0.9) break; g.add(at(cyl(0.035, 0.035, 0.07, M.darkSteel, 10), Math.cos(a) * r, 1.82, Math.sin(a) * r)); }
      g.add(at(cyl(0.32, 0.22, 0.45, M.blackRubber, 24, false), 0, 0.5, 0)); return g; },
    filter_flask: () => { const g = flask('erl', null, 0); g.children[0].material = M.glassThick; g.add(tubeAlong([[0.38, 2.95, 0], [0.7, 2.95, 0], [1.1, 2.9, 0]], 0.08, M.glassThick)); const l = lathe(fill(flaskProfile('erl'), 0.7, 0.03), liquid('#d5f5e3', 0.6)); l.renderOrder = 1; g.add(l); return g; },
    liebig_condenser: () => { const g = new THREE.Group(); const inner = cyl(0.08, 0.08, 4.6, M.glass, 24, true), jacket = cyl(0.32, 0.32, 3.4, M.glass, 48, true), water = cyl(0.3, 0.3, 3.38, liquid('#85c1e9', 0.35), 48, true);
      [inner, jacket, water].forEach((m) => { m.renderOrder = m === water ? 1 : 2; g.add(m); }); [[-1.2, 1], [1.2, -1]].forEach(([y, s]) => g.add(at(cyl(0.08, 0.08, 0.6, M.glass, 16, true), 0.5 * s * 0 + 0.55, y, 0, 0, 0, Math.PI / 2)));
      g.add(at(lathe([[0.08, 1.7], [0.32, 1.95]], M.glass), 0, 0, 0)); g.add(at(lathe([[0.32, -1.95], [0.08, -1.7]], M.glass), 0, 0, 0)); g.rotation.z = -0.95; g.position.set(0, 2.0, 0); const w = new THREE.Group(); w.add(g); return w; },
    retort: () => { const g = new THREE.Group(); g.add(at(new THREE.Mesh(new THREE.SphereGeometry(1.15, 48, 32), M.glass), 0, 1.25, 0)); const l = at(new THREE.Mesh(new THREE.SphereGeometry(1.1, 48, 32, 0, Math.PI * 2, Math.PI * 0.62, Math.PI * 0.38), liquid('#a04000', 0.75)), 0, 1.25, 0); l.renderOrder = 1; g.add(l);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 2.2, 0), new THREE.Vector3(0.3, 2.9, 0), new THREE.Vector3(1.2, 3.1, 0), new THREE.Vector3(2.4, 2.4, 0), new THREE.Vector3(3.2, 1.7, 0)]), 64, 0.16, 20, false), M.glass)); g.position.x = -0.9; const w = new THREE.Group(); w.add(g); return w; },
    evaporating_dish: () => { const g = new THREE.Group(); g.add(lathe([[0.001, 0.12], [0.6, 0.1], [1.4, 0.5], [1.62, 0.95], [1.55, 0.97], [1.33, 0.55], [0.58, 0.2], [0.001, 0.2]], M.porcelain)); g.add(at(cyl(0.5, 0.55, 0.1, M.porcelainRough, 48), 0, 0.05, 0)); g.scale.setScalar(1.15); return g; },
    mortar_pestle: () => { const g = new THREE.Group(); g.add(lathe([[0.001, 0], [0.9, 0], [1.25, 0.6], [1.35, 1.25], [1.25, 1.3], [1.12, 0.7], [0.7, 0.35], [0.001, 0.35]], M.porcelain));
      const pe = lathe([[0.001, 0], [0.32, 0.08], [0.36, 0.3], [0.18, 0.7], [0.15, 2.0], [0.2, 2.25], [0.001, 2.35]], M.porcelain); pe.position.set(0.3, 0.4, 0); pe.rotation.z = -0.45; g.add(pe); return g; },
    crucible: () => { const g = new THREE.Group(); g.add(lathe([[0.001, 0], [0.45, 0], [0.75, 1.4], [0.82, 1.45], [0.76, 1.45], [0.68, 1.4], [0.4, 0.1], [0.001, 0.1]], M.porcelain));
      const lid = lathe([[0.001, 0.12], [0.88, 0], [0.9, 0.04], [0.001, 0.16]], M.porcelain); lid.position.set(1.5, 0, 0); lid.rotation.z = 0.2; g.add(lid, at(new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), M.porcelain), 1.5, 0.2, 0)); g.scale.setScalar(1.5); return g; },
    crucible_tongs: () => { const g = new THREE.Group(); [1, -1].forEach((s) => g.add(tubeAlong([[-2.2, 0.2 + s * 0.35, 0], [-0.5, 0.2 + s * 0.12, 0], [0, 0.2, 0], [0.8, 0.2 - s * 0.25, 0], [1.5, 0.2 - s * 0.32, 0], [1.9, 0.2 - s * 0.18, 0]], 0.05, M.steel)));
      g.add(at(cyl(0.12, 0.12, 0.12, M.darkSteel, 16), 0, 0.2, 0, Math.PI / 2)); g.rotation.x = -0.4; g.position.y = 1.2; const w = new THREE.Group(); w.add(g); return w; },
    watch_glass: () => { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.SphereGeometry(3, 64, 16, 0, Math.PI * 2, Math.PI - 0.42, 0.42), M.glass); m.position.y = 3.05; m.renderOrder = 2; g.add(m);
      g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 32), new THREE.MeshStandardMaterial({ color: lin('#f2d23c'), roughness: 0.8 })), 0, 0.12, 0)); g.scale.setScalar(1.1); return g; },
    petri_dish: () => { const g = new THREE.Group(); g.add(cyl(1.6, 1.6, 0.3, M.glass, 64, true)); g.add(at(cyl(1.6, 1.6, 0.02, M.glass, 64), 0, -0.15, 0)); const agar = at(cyl(1.57, 1.57, 0.14, liquid('#f3e5ab', 0.85), 64), 0, -0.07, 0); agar.renderOrder = 1; g.add(agar);
      for (let i = 0; i < 26; i++) { const a = i * 2.39, r = 0.25 * Math.sqrt(i); g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.06 + (i % 3) * 0.03, 12, 8), new THREE.MeshStandardMaterial({ color: lin(['#f5f5dc', '#ffcc80', '#e8f5e9'][i % 3]) })), Math.cos(a) * r, 0.01, Math.sin(a) * r)); }
      const lid = at(cyl(1.68, 1.68, 0.26, M.glass, 64, true), 2.4, 0.9, 0, 0, 0, 0.5); g.add(lid); g.position.y = 0.2; const w = new THREE.Group(); w.add(g); w.scale.setScalar(1.05); return w; },
    bunsen_burner: () => { const g = new THREE.Group(); g.add(lathe([[0.001, 0], [1.0, 0], [1.05, 0.08], [0.95, 0.25], [0.35, 0.4], [0.001, 0.42]], M.darkSteel)); g.add(at(cyl(0.2, 0.2, 2.6, M.brass, 32), 0, 1.7, 0)); g.add(at(cyl(0.26, 0.26, 0.35, M.brass, 32), 0, 0.75, 0));
      g.add(at(cyl(0.06, 0.06, 0.08, M.blackRubber, 12), 0, 0.75, 0.27, Math.PI / 2)); g.add(at(cyl(0.08, 0.08, 0.9, M.brass, 16), 0.65, 0.3, 0, 0, 0, Math.PI / 2)); g.add(at(cyl(0.11, 0.11, 0.5, M.rubber, 16), 1.25, 0.3, 0, 0, 0, Math.PI / 2));
      const f = flameMesh(1.5, 0.22); f.position.y = 3.0; g.add(f); return g; },
    spirit_lamp: () => { const g = new THREE.Group(), p = [[0.001, 0], [0.9, 0], [1.0, 0.1], [1.05, 0.6], [0.8, 1.2], [0.3, 1.35], [0.28, 1.5]]; g.add(lathe(p, M.glassThick)); const l = lathe(fill(p, 0.7, 0.04), liquid('#d6eaf8', 0.45)); l.renderOrder = 1; g.add(l);
      g.add(at(cyl(0.3, 0.32, 0.25, M.steel, 32), 0, 1.6, 0)); g.add(at(cyl(0.06, 0.06, 0.35, new THREE.MeshStandardMaterial({ color: lin('#f2e6c8'), roughness: 1 }), 12), 0, 1.86, 0)); const f = flameMesh(0.9, 0.16); f.position.y = 2.0; g.add(f);
      g.add(at(lathe([[0.001, 0.6], [0.36, 0.55], [0.38, 0], [0.34, 0]], M.glassThick), 1.5, 0, 0)); g.scale.setScalar(1.3); return g; },
    retort_stand: () => { const g = new THREE.Group(); g.add(at(new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 1.5), M.darkSteel), 0.3, 0.09, 0)); g.add(at(cyl(0.07, 0.07, 4.6, M.steel, 20), -0.6, 2.4, 0));
      g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), M.darkSteel), -0.6, 3.4, 0)); g.add(at(cyl(0.04, 0.04, 1.3, M.steel, 12), 0.05, 3.4, 0, 0, 0, Math.PI / 2));
      [0.12, -0.12].forEach((z) => g.add(tubeAlong([[0.7, 3.4, z], [0.95, 3.5, z * 2.2], [1.25, 3.4, z * 2.4]], 0.04, M.steel))); const fl = flask('round', '#3498db', 1.0); fl.scale.setScalar(0.42); fl.position.set(1.0, 2.1, 0); g.add(fl);
      g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), M.darkSteel), -0.6, 1.6, 0)); g.add(at(cyl(0.03, 0.03, 0.7, M.steel, 12), -0.15, 1.6, 0, 0, 0, Math.PI / 2)); g.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 12, 48), M.steel), 0.7, 1.6, 0, Math.PI / 2)); return g; },
    tripod_gauze: () => { const g = new THREE.Group(); g.add(at(new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.06, 12, 64), M.darkSteel), 0, 2.4, 0, Math.PI / 2));
      for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; g.add(tubeAlong([[Math.cos(a), 2.4, Math.sin(a)], [Math.cos(a) * 1.2, 1.2, Math.sin(a) * 1.2], [Math.cos(a) * 1.35, 0.02, Math.sin(a) * 1.35]], 0.05, M.darkSteel)); }
      const gz = new THREE.Group(); for (let i = -10; i <= 10; i++) { gz.add(at(new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.015, 0.015), M.steel), 0, 0, i * 0.115)); gz.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 2.4), M.steel), i * 0.115, 0, 0)); }
      gz.add(at(cyl(0.6, 0.6, 0.03, M.porcelainRough, 48), 0, 0.01, 0)); gz.position.y = 2.48; g.add(gz); return g; },
    kipp_apparatus: () => { const g = new THREE.Group(); g.add(lathe([[0.001, 0], [0.8, 0], [1.05, 0.5], [1.05, 0.9], [0.6, 1.3], [0.45, 1.5], [0.6, 1.7], [1.15, 2.2], [1.15, 2.7], [0.6, 3.2], [0.3, 3.35], [0.5, 3.6], [0.95, 4.1], [0.95, 4.6], [0.5, 4.95], [0.2, 5.1]], M.glassThick));
      const acid = lathe(fill([[0.001, 0], [0.8, 0], [1.05, 0.5], [1.05, 0.9], [0.6, 1.3], [0.45, 1.5]], 1.4, 0.05), liquid('#aed6f1', 0.5)); acid.renderOrder = 1; g.add(acid);
      for (let i = 0; i < 18; i++) g.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), M.steel), Math.cos(i * 2.4) * 0.6 * Math.sqrt((i % 6) / 6), 1.85 + (i % 3) * 0.14, Math.sin(i * 2.4) * 0.6 * Math.sqrt((i % 6) / 6)));
      g.add(at(cyl(0.12, 0.12, 4.3, M.glass, 16, true), 0, 2.75, 0)); g.add(at(cyl(0.07, 0.07, 1.0, M.glassThick, 16), 1.5, 2.45, 0, 0, 0, Math.PI / 2)); g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 0.08), M.blue), 1.65, 2.45, 0));
      g.scale.setScalar(0.8); return g; },
    desiccator: () => { const g = new THREE.Group(); g.add(lathe([[0.001, 0], [0.9, 0], [1.2, 0.5], [1.15, 1.0], [1.6, 1.6], [1.75, 1.7], [1.75, 1.8]], M.glassThick));
      const sil = lathe(fill([[0.001, 0], [0.9, 0], [1.2, 0.5], [1.15, 1.0]], 0.45, 0.05), new THREE.MeshStandardMaterial({ color: lin('#2e86de'), roughness: 0.6 })); g.add(sil);
      const plate = at(cyl(1.3, 1.3, 0.06, M.porcelain, 64), 0, 1.15, 0); g.add(plate); for (let i = 0; i < 20; i++) { const a = i * 2.4, r = 0.25 * Math.sqrt(i); g.add(at(cyl(0.05, 0.05, 0.08, M.darkSteel, 8), Math.cos(a) * r, 1.16, Math.sin(a) * r)); }
      const lid = lathe([[1.75, 1.82], [1.7, 1.9], [1.3, 2.4], [0.4, 2.7], [0.2, 2.75], [0.2, 3.0], [0.001, 3.05]], M.glassThick); g.add(lid); g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), M.glassThick), 0, 3.05, 0)); return g; },
    thermometer: () => { const g = new THREE.Group(); g.add(lathe([[0.001, 0], [0.12, 0.05], [0.14, 0.3], [0.08, 0.5], [0.08, 4.8], [0.001, 4.86]], M.glass, 32)); g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), new THREE.MeshStandardMaterial({ color: lin('#d92b2b') })), 0, 0.2, 0));
      g.add(at(cyl(0.025, 0.025, 2.6, new THREE.MeshBasicMaterial({ color: lin('#d92b2b') }), 8), 0, 1.6, 0)); marks(g, 0.082, 0.7, 4.5, 38, 5); g.scale.setScalar(0.9); return g; },
    dewar_flask: () => { const g = new THREE.Group(); g.add(lathe([[0.001, 0], [0.9, 0], [1.0, 0.1], [1.0, 3.3], [0.75, 3.6], [0.55, 3.7]], M.glass)); g.add(lathe([[0.001, 0.2], [0.82, 0.2], [0.85, 0.3], [0.85, 3.3], [0.55, 3.55]], M.silver));
      g.add(at(cyl(0.5, 0.42, 0.45, M.cork, 32), 0, 3.85, 0)); const n2 = at(new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), new THREE.MeshBasicMaterial({ color: lin('#ffffff'), transparent: true, opacity: 0.25 })), 0.5, 4.4, 0); n2.userData.vapour = true; g.add(n2); return g; },
    soxhlet: () => { const g = new THREE.Group(); const fl = flask('round', '#f5cba7', 0.9); fl.scale.setScalar(0.62); g.add(fl);
      const ex = new THREE.Group(); ex.add(lathe([[0.15, 0], [0.55, 0.3], [0.55, 1.9], [0.25, 2.2]], M.glass)); ex.add(at(cyl(0.38, 0.38, 1.0, M.paper, 32), 0, 1.0, 0)); const solv = at(cyl(0.5, 0.5, 0.9, liquid('#f9e79f', 0.4), 32), 0, 0.85, 0); solv.renderOrder = 1; ex.add(solv);
      ex.add(tubeAlong([[0.55, 0.3, 0], [0.8, 0.5, 0], [0.8, 1.5, 0], [0.95, 1.6, 0], [0.95, 0.15, 0], [0.4, -0.1, 0]], 0.04, M.glass)); ex.position.y = 2.15; g.add(ex);
      const co = new THREE.Group(); co.add(cyl(0.12, 0.12, 1.6, M.glass, 16, true), cyl(0.3, 0.3, 1.2, M.glass, 32, true)); co.position.y = 5.2; g.add(co); g.scale.setScalar(0.72); return g; },
    spatula: () => { const g = new THREE.Group(); g.add(at(new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.04, 0.22), M.steel), 0, 0.3, 0)); g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.steel), -1.95, 0.42, 0)); g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.03, 0.4), M.steel), 2.1, 0.3, 0)); g.rotation.x = -0.5; g.position.y = 1.2; const w = new THREE.Group(); w.add(g); return w; },
    balance: () => { const g = new THREE.Group(); g.add(at(new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.5, 2.4), new THREE.MeshStandardMaterial({ color: lin('#e9edf1'), roughness: 0.5 })), 0, 0.25, 0));
      g.add(at(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.05), new THREE.MeshBasicMaterial({ color: lin('#103020') })), 0, 0.28, 1.21)); g.add(at(cyl(0.7, 0.7, 0.04, M.steel, 48), 0, 0.85, -0.1)); g.add(at(cyl(0.06, 0.06, 0.32, M.steel, 12), 0, 0.66, -0.1));
      const shield = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.2, 2.2), M.glass); shield.position.set(0, 1.6, -0.05); shield.renderOrder = 2; g.add(shield); g.add(at(new THREE.Mesh(new THREE.BoxGeometry(3.04, 0.08, 2.24), new THREE.MeshStandardMaterial({ color: lin('#d5dbe1') })), 0, 2.72, -0.05));
      const w = at(cyl(0.18, 0.18, 0.3, M.brass, 24), 0, 1.02, -0.1); g.add(w); return g; },
    hydrometer: () => { const g = new THREE.Group(); const cy = [[0.001, 0], [0.7, 0], [0.7, 4.6], [0.78, 4.66], [0.7, 4.7]]; g.add(lathe(cy, M.glass)); const l = lathe(fill(cy, 3.6, 0.02), liquid('#f8c471', 0.45)); l.renderOrder = 1; g.add(l);
      const h = new THREE.Group(); h.add(lathe([[0.001, 0], [0.2, 0.1], [0.24, 0.5], [0.26, 1.4], [0.08, 1.7], [0.08, 3.4], [0.001, 3.45]], M.glass, 32)); for (let i = 0; i < 12; i++) h.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), M.darkSteel), Math.cos(i) * 0.1, 0.12 + (i % 3) * 0.06, Math.sin(i) * 0.1));
      h.add(at(cyl(0.07, 0.07, 1.5, M.paper, 16), 0, 2.5, 0)); marks(h, 0.085, 1.8, 3.2, 14, 5); h.position.y = 1.1; g.add(h); return g; },
    wash_bottle: () => { const g = new THREE.Group(); g.add(lathe([[0.001, 0], [0.9, 0], [0.98, 0.1], [0.98, 2.6], [0.6, 3.1], [0.35, 3.25], [0.35, 3.45]], M.plastic)); g.add(at(cyl(0.42, 0.42, 0.4, new THREE.MeshStandardMaterial({ color: lin('#2e86de'), roughness: 0.5 }), 32), 0, 3.6, 0));
      g.add(tubeAlong([[0, 3.8, 0], [0, 4.4, 0], [0.3, 4.75, 0], [1.1, 4.7, 0], [1.6, 4.4, 0]], 0.05, M.plastic)); g.scale.setScalar(0.88); return g; }
  };

  // ---------- 3D stage ----------
  let host, ctx, T, st3, curId = IDS[0], cat = 'all', q = '', auto = true;
  function stage(el) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; el.appendChild(renderer.domElement);
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    // a simple studio around the model gives the glass its reflections
    const env = new THREE.Scene(); env.add(new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: 0x20242c, side: THREE.BackSide })));
    [[0, 9, 0, 14, 0xffffff], [-9, 2, 4, 6, 0xcfe4ff], [9, 3, -2, 6, 0xfff2dd], [0, 2, 9, 8, 0xffffff]].forEach(([x, y, z, s, c]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(s, s * 0.6), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); p.position.set(x, y, z); p.lookAt(0, 0, 0); env.add(p); });
    const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(env, 0.03).texture;
    scene.add(new THREE.HemisphereLight(0xeaf2ff, 0x30343c, 0.65)); const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(4, 7, 6); scene.add(key); const rim = new THREE.DirectionalLight(0x9fc8ff, 0.7); rim.position.set(-6, 3, -5); scene.add(rim);
    // soft shadow disc and a bench top
    const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c2 = cv.getContext('2d'), gr = c2.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c2.fillStyle = gr; c2.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.005; scene.add(shadow);
    const controls = ctx.orbit(cam, renderer.domElement); let raf = 0, alive = true, model = null, t0 = performance.now();
    const size = () => { const w = el.clientWidth || 600, h = el.clientHeight || 420; cam.aspect = w / h; cam.updateProjectionMatrix(); renderer.setSize(w, h); };
    window.addEventListener('resize', size); size();
    const loop = (now) => { if (!alive) return; if (model) { if (auto) model.rotation.y += 0.004; model.traverse((o) => { if (o.userData.flame) { const s = 1 + Math.sin(now / 70 + o.id) * 0.06; o.scale.set(1 / s, s, 1 / s); } if (o.userData.vapour) { o.position.y = 4.4 + ((now - t0) / 1200 % 1) * 0.8; o.material.opacity = 0.3 * (1 - ((now - t0) / 1200 % 1)); } }); }
      controls.update(); renderer.render(scene, cam); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return {
      show(id) { if (model) { scene.remove(model); model.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); } model = (B[id] || B.beaker)(); const box = new THREE.Box3().setFromObject(model), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
        model.position.x -= c.x; model.position.z -= c.z; model.position.y -= box.min.y; scene.add(model); const r = Math.max(s.x, s.y, s.z); cam.position.set(r * 0.9, s.y * 0.75 + r * 0.35, r * 2.35); controls.target && controls.target.set(0, s.y * 0.45, 0); cam.lookAt(0, s.y * 0.45, 0); controls.sync && controls.sync(); shadow.scale.setScalar(Math.max(1, Math.max(s.x, s.z) / 3)); },
      dispose() { alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', size); controls.dispose && controls.dispose(); renderer.dispose(); try { renderer.forceContextLoss(); } catch (e) {} }
    };
  }

  // ---------- screen ----------
  const L = () => ({ uz: 0, en: 1, ru: 2 }[ctx.lang] || 0);
  const data = (id) => { const d = (window.PT_APP || []).find((x) => x.id === id); return d ? d[ctx.lang] || d.uz : null; };
  const meta = (id) => (window.PT_APP || []).find((x) => x.id === id) || {};
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function list() {
    const norm = (s) => String(s || '').toLowerCase().replace(/['‘’ʻ]/g, ''), qq = norm(q);
    const items = IDS.filter((id) => (cat === 'all' || meta(id).cat === cat) && (!qq || norm(id + ' ' + ['uz', 'en', 'ru'].map((l) => (meta(id)[l] || {}).name).join(' ')).includes(qq)));
    host.querySelector('.ap-count').textContent = T.count.replace('{n}', items.length);
    host.querySelector('.ap-list').innerHTML = items.map((id) => { const d = data(id) || {}, on = id === curId;
      return '<button data-id="' + id + '" style="display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:9px 10px;border-radius:10px;border:1px solid ' + (on ? 'rgba(77,210,255,.6)' : 'var(--line)') + ';background:' + (on ? 'rgba(77,210,255,.12)' : 'var(--btn)') + ';color:var(--text);cursor:pointer;font-family:Space Grotesk,sans-serif">'
        + '<span style="font-size:20px;flex:0 0 auto">' + (meta(id).icon || '🧪') + '</span><span style="min-width:0"><span style="display:block;font-weight:700;font-size:13.5px">' + esc(d.name || id) + '</span><span style="display:block;font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(d.short || '') + '</span></span></button>'; }).join('');
  }
  function info() {
    const d = data(curId) || {}, m = meta(curId), row = (k, v) => (v ? '<div style="margin-top:12px"><div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:4px">' + T[k] + '</div><div style="font-size:14px;line-height:1.6;color:var(--body)">' + v + '</div></div>' : '');
    host.querySelector('.ap-info').innerHTML = '<div style="display:flex;align-items:center;gap:10px"><span style="font-size:30px">' + (m.icon || '🧪') + '</span><div><div style="font-size:21px;font-weight:700;color:var(--text);line-height:1.2">' + esc(d.name || curId) + '</div>'
      + '<div style="font-size:12px;color:var(--cyan);margin-top:3px">' + esc(T.cats[m.cat] || '') + '</div></div></div>'
      + (d.inventor || d.year ? '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px"><span style="padding:6px 10px;border-radius:9px;background:rgba(192,139,255,.12);border:1px solid rgba(192,139,255,.4);font-size:12.5px;color:var(--text)">👤 ' + T.inventor + ': <b>' + esc(d.inventor) + '</b></span><span style="padding:6px 10px;border-radius:9px;background:rgba(255,180,84,.12);border:1px solid rgba(255,180,84,.4);font-size:12.5px;color:var(--text)">📅 ' + T.year + ': <b>' + esc(d.year) + '</b></span></div>' : '')
      + row('purpose', esc(d.purpose)) + row('material', esc(d.material)) + (d.use && d.use.length ? row('use', '<ol style="margin:0;padding-left:18px">' + d.use.map((u) => '<li style="margin:3px 0">' + esc(u) + '</li>').join('') + '</ol>') : '')
      + row('history', esc(d.history)) + (d.fact ? '<div style="margin-top:14px;padding:10px 12px;border-radius:10px;background:rgba(46,204,150,.1);border:1px solid rgba(46,204,150,.35);font-size:13.5px;color:var(--body)">💡 <b>' + T.fact + ':</b> ' + esc(d.fact) + '</div>' : '')
      + (d.safety ? '<div style="margin-top:10px;padding:10px 12px;border-radius:10px;background:rgba(255,93,110,.08);border:1px solid rgba(255,93,110,.35);font-size:13.5px;color:var(--body)">⚠️ <b>' + T.safety + ':</b> ' + esc(d.safety) + '</div>' : '');
    host.querySelector('.ap-info').scrollTop = 0;
  }
  function select(id) { curId = id; st3 && st3.show(id); list(); info(); }
  function build() {
    if (st3) { st3.dispose(); st3 = null; }
    const cats = ['all', 'glass', 'measure', 'heat', 'filter', 'porcelain', 'support', 'apparatus'];
    host.innerHTML = '<style>.ap-wrap{display:grid;grid-template-columns:minmax(240px,300px) minmax(0,1.4fr) minmax(280px,1fr);gap:16px;height:100%;padding:16px 20px;box-sizing:border-box}.ap-col{min-height:0;overflow:auto;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px}'
      + '@media (max-width:980px){.ap-wrap{grid-template-columns:1fr;height:auto}.ap-col{overflow:visible}.ap-view{order:-1;height:62vh}.ap-listcol .ap-list{max-height:38vh;overflow:auto}}.ap-wrap button:hover{filter:brightness(1.12)}</style>'
      + '<div class="ap-wrap"><div class="ap-col ap-listcol" style="display:flex;flex-direction:column;gap:10px"><input class="ap-q" value="' + esc(q) + '" placeholder="' + T.find + '" style="width:100%;box-sizing:border-box;background:var(--input);border:1px solid var(--line);border-radius:10px;color:var(--text);font:13px Space Grotesk,sans-serif;padding:9px 12px;outline:none">'
      + '<div style="display:flex;flex-wrap:wrap;gap:5px">' + cats.map((c) => '<button data-c="' + c + '" style="padding:5px 10px;border-radius:16px;border:1px solid ' + (c === cat ? 'rgba(77,210,255,.6)' : 'var(--line)') + ';background:' + (c === cat ? 'rgba(77,210,255,.14)' : 'var(--btn)') + ';color:var(--text);font:600 11.5px Space Grotesk,sans-serif;cursor:pointer">' + (c === 'all' ? T.all : T.cats[c]) + '</button>').join('') + '</div>'
      + '<div class="ap-count" style="font-size:11.5px;color:var(--muted)"></div><div class="ap-list" style="display:flex;flex-direction:column;gap:6px"></div></div>'
      + '<div class="ap-col ap-view" style="position:relative;padding:0;overflow:hidden;background:radial-gradient(700px 480px at 50% 35%,#2a3350,#0b0f1c 75%)"><div class="ap-3d" style="position:absolute;inset:0"></div>'
      + '<div style="position:absolute;left:14px;bottom:12px;font:11px IBM Plex Mono,monospace;color:rgba(210,222,246,.75);pointer-events:none">' + T.drag + '</div>'
      + '<label style="position:absolute;right:12px;bottom:10px;display:flex;align-items:center;gap:6px;font-size:12px;color:#dfe8ff;cursor:pointer"><input class="ap-auto" type="checkbox"' + (auto ? ' checked' : '') + '> ' + T.rotate + '</label></div>'
      + '<div class="ap-col ap-info"></div></div>';
    host.querySelector('.ap-list').addEventListener('click', (e) => { const b = e.target.closest('button[data-id]'); if (b) select(b.dataset.id); });
    host.querySelector('.ap-listcol').addEventListener('click', (e) => { const b = e.target.closest('button[data-c]'); if (b) { cat = b.dataset.c; build(); } });
    host.querySelector('.ap-q').addEventListener('input', (e) => { q = e.target.value; list(); });
    host.querySelector('.ap-auto').addEventListener('change', (e) => { auto = e.target.checked; });
    st3 = stage(host.querySelector('.ap-3d')); select(curId);
  }
  window.PTAPP = {
    ids: IDS,
    mount(h, c) { host = h; ctx = c; THREE = c.THREE; T = S[c.lang] || S.uz; mats(); build(); },
    setCtx(c) { ctx = Object.assign(ctx || {}, c); T = S[ctx.lang] || S.uz; if (host) build(); },
    select(id) { if (IDS.includes(id)) select(id); },
    unmount() { if (st3) st3.dispose(); st3 = null; host = null; }
  };
})();
