// Kolvo virtual laboratory, 3D view: a bench with a stand, a glass test tube and a spirit lamp drawn with Three.js.
// lab.js owns the chemistry; every frame it hands this view a plain description (getVM) of what is in the tube:
// liquid colour and volume, precipitates and their age, metal pieces, crystals, bubbles, vapour, heating, the hand that adds a reagent.
(function () {
  'use strict';
  let THREE;
  const lin = (c) => new THREE.Color(c).convertSRGBToLinear();
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  // tube geometry (scene units): axis at x = 0, inner radius R, round bottom at BOT
  const R = 0.4, BOT = 1.78, TOPY = 6.7;
  const innerR = (y) => { const h = y - BOT; return h >= R ? R : Math.sqrt(Math.max(0, R * R - (R - h) * (R - h))); };
  function softTexture(c1) { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 2, 32, 32, 32);
    gr.addColorStop(0, c1 || 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); }
  function labelTexture(text) { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const g = cv.getContext('2d');
    g.fillStyle = '#f7f3e6'; g.fillRect(0, 0, 256, 128); g.strokeStyle = '#c9a24a'; g.lineWidth = 6; g.strokeRect(6, 6, 244, 116);
    g.fillStyle = '#1d1d22'; g.font = 'bold 52px IBM Plex Mono, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 128, 66, 232); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t; }
  function roundProfile(r, top, lip) { const p = []; for (let i = 0; i <= 14; i++) { const a = -Math.PI / 2 + (i / 14) * Math.PI / 2; p.push(new THREE.Vector2(Math.max(0.001, Math.cos(a) * r), BOT + r + Math.sin(a) * r)); }
    p.push(new THREE.Vector2(r, top)); if (lip) p.push(new THREE.Vector2(r + lip, top + 0.03), new THREE.Vector2(r + lip, top + 0.09), new THREE.Vector2(r - 0.01, top + 0.1)); return p; }

  function create(el, opt) {
    THREE = opt.THREE;
    const light = !!opt.light;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;border-radius:12px';
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    // studio reflections for the glass
    const env = new THREE.Scene(); env.add(new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: 0x23272f, side: THREE.BackSide })));
    [[0, 12, 2, 16, 0xffffff], [-12, 4, 6, 8, 0xd6e8ff], [12, 5, -2, 8, 0xfff0dc], [0, 4, 13, 10, 0xffffff]].forEach(([x, y, z, s, c]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(s, s * 0.55), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); p.position.set(x, y, z); p.lookAt(0, 3, 0); env.add(p); });
    const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(env, 0.03).texture;
    scene.add(new THREE.HemisphereLight(0xeaf2ff, 0x2a2e36, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.25); key.position.set(5, 11, 7); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -6; key.shadow.camera.right = 6; key.shadow.camera.top = 9; key.shadow.camera.bottom = -2; key.shadow.bias = -0.0004; scene.add(key);
    const rim = new THREE.DirectionalLight(0xa8ccff, 0.55); rim.position.set(-6, 5, -6); scene.add(rim);
    const lampLight = new THREE.PointLight(0xff9a40, 0, 6, 2); lampLight.position.set(0, 1.4, 0.3); scene.add(lampLight);
    const flameLight = new THREE.PointLight(0xffffff, 0, 5, 2); flameLight.position.set(2.6, 3.0, 0.5); scene.add(flameLight);

    // ---------- the bench, the wall, the stand ----------
    const M = {
      glass: new THREE.MeshPhysicalMaterial({ color: lin('#f4fbff'), roughness: 0.02, metalness: 0, transparent: true, opacity: 0.09, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.2, side: THREE.DoubleSide, depthWrite: false }),
      steel: new THREE.MeshStandardMaterial({ color: lin('#c3cad2'), metalness: 0.95, roughness: 0.3, envMapIntensity: 1.3 }),
      dark: new THREE.MeshStandardMaterial({ color: lin('#3c4249'), metalness: 0.7, roughness: 0.45 }),
      wood: new THREE.MeshStandardMaterial({ color: lin('#9a6a3a'), roughness: 0.65 }),
      cork: new THREE.MeshStandardMaterial({ color: lin('#c8a06a'), roughness: 0.95 })
    };
    const bench = new THREE.Mesh(new THREE.BoxGeometry(26, 0.4, 9), new THREE.MeshStandardMaterial({ color: lin(light ? '#d9dde2' : '#262a31'), roughness: 0.55, metalness: 0.05 })); bench.position.set(0, -0.2, 0); bench.receiveShadow = true; scene.add(bench);
    const tcv = document.createElement('canvas'); tcv.width = tcv.height = 256; const tg = tcv.getContext('2d'); tg.fillStyle = light ? '#eef1f4' : '#1b1f27'; tg.fillRect(0, 0, 256, 256); tg.strokeStyle = light ? '#cfd5dc' : '#2b313b'; tg.lineWidth = 4;
    for (let i = 0; i <= 4; i++) { tg.beginPath(); tg.moveTo(i * 64, 0); tg.lineTo(i * 64, 256); tg.stroke(); tg.beginPath(); tg.moveTo(0, i * 64); tg.lineTo(256, i * 64); tg.stroke(); }
    const wt = new THREE.CanvasTexture(tcv); wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(9, 4.5); wt.encoding = THREE.sRGBEncoding;
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(26, 14), new THREE.MeshStandardMaterial({ map: wt, roughness: 0.8 })); wall.position.set(0, 4.6, -3.2); wall.receiveShadow = true; scene.add(wall);
    const stand = new THREE.Group(); const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 1.5), M.dark); base.position.set(-1.5, 0.08, -0.5); const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 7.4, 20), M.steel); rod.position.set(-2.1, 3.8, -0.5);
    const boss = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), M.dark); boss.position.set(-2.1, 6.0, -0.5); const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.6, 12), M.steel); arm.rotation.z = Math.PI / 2; arm.position.set(-1.25, 6.0, -0.25); arm.rotation.y = -0.3;
    const clampA = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.08), M.cork); clampA.position.set(0, 6.0, 0.47); const clampB = clampA.clone(); clampB.position.z = -0.47; const clampBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 1.0), M.steel); clampBar.position.set(-0.3, 6.0, 0);
    [base, rod, boss, arm, clampA, clampB, clampBar].forEach((m) => { m.castShadow = true; stand.add(m); }); scene.add(stand);
    // the test tube
    const tube = new THREE.Mesh(new THREE.LatheGeometry(roundProfile(R + 0.035, TOPY, 0.05), 80), M.glass); tube.renderOrder = 5; scene.add(tube);
    // the spirit lamp under the tube
    const lamp = new THREE.Group(); const lp = [[0.001, 0], [0.62, 0], [0.7, 0.07], [0.72, 0.42], [0.55, 0.78], [0.2, 0.88], [0.19, 0.95]].map(([a, b]) => new THREE.Vector2(a, b));
    const lampGlass = new THREE.Mesh(new THREE.LatheGeometry(lp, 48), new THREE.MeshPhysicalMaterial({ color: lin('#e8f4ff'), transparent: true, opacity: 0.3, roughness: 0.05, clearcoat: 1, envMapIntensity: 2.5, depthWrite: false })); lamp.add(lampGlass);
    const alc = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.62, 0.35, 40), new THREE.MeshPhysicalMaterial({ color: lin('#cfe4ff'), transparent: true, opacity: 0.4, roughness: 0.05 })); alc.position.y = 0.19; lamp.add(alc);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.14, 24), M.steel); cap.position.y = 1.0; lamp.add(cap); const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.16, 12), new THREE.MeshStandardMaterial({ color: lin('#efe2c4'), roughness: 1 })); wick.position.y = 1.12; lamp.add(wick);
    const flame = new THREE.Group(), fOuter = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.62, 24, 1, true), new THREE.MeshBasicMaterial({ color: lin('#ffa040'), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    const fInner = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 20, 1, true), new THREE.MeshBasicMaterial({ color: lin('#5ab8ff'), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    fOuter.position.y = 0.31; fInner.position.y = 0.16; flame.add(fOuter, fInner); flame.position.y = 1.2; lamp.add(flame); lamp.traverse((o) => { if (o.isMesh) o.castShadow = o !== fOuter && o !== fInner; }); scene.add(lamp);
    // a small burner on the right for the flame test
    const burner = new THREE.Group(); const bb = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.15, 32), M.dark); bb.position.y = 0.08; const bt = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 20), new THREE.MeshStandardMaterial({ color: lin('#c9a24a'), metalness: 0.9, roughness: 0.3 })); bt.position.y = 0.9;
    const tf = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.3, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); tf.position.y = 2.3;
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 8, 24), M.steel); loop.position.set(-0.05, 2.1, 0); const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.4, 6), M.steel); wire.position.set(-0.55, 2.55, 0); wire.rotation.z = 1.0;
    burner.add(bb, bt, tf, loop, wire); burner.position.set(2.6, 0, 0.3); bb.castShadow = bt.castShadow = true; scene.add(burner);

    // ---------- contents of the tube ----------
    const contents = new THREE.Group(); scene.add(contents);
    let liquid = null, liqKey = '', cloudMesh = null, mirror = null, ring = null;
    const liqMat = new THREE.MeshPhysicalMaterial({ color: lin('#cfe6ff'), transparent: true, opacity: 0.3, roughness: 0.05, clearcoat: 1, envMapIntensity: 1.4, side: THREE.DoubleSide, depthWrite: false });
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, roughness: 1 });
    function liquidGeom(level, inset) { const p = []; for (let i = 0; i <= 14; i++) { const a = -Math.PI / 2 + (i / 14) * Math.PI / 2, y = BOT + R + Math.sin(a) * R; if (y > level) break; p.push(new THREE.Vector2(Math.max(0.001, Math.cos(a) * R - inset), y)); }
      if (level > BOT + R) p.push(new THREE.Vector2(R - inset, level)); p.push(new THREE.Vector2((R - inset) * 0.75, level - 0.02), new THREE.Vector2(0.001, level - 0.035)); return new THREE.LatheGeometry(p, 64); }
    // particle pools: precipitates, bubbles, crystals, powders, vapour puffs
    const pool = (n, geo, mat) => { const m = new THREE.InstancedMesh(geo, mat, n); m.count = 0; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; contents.add(m); return m; };
    const pptMeshes = []; const bubbleMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, roughness: 0, clearcoat: 1, envMapIntensity: 3, depthWrite: false });
    const bubbles = pool(160, new THREE.SphereGeometry(1, 10, 8), bubbleMat); bubbles.renderOrder = 4;
    const crystals = pool(220, new THREE.BoxGeometry(1, 0.7, 1), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.25, clearcoat: 1 }));
    const powder = pool(220, new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 }));
    const falling = pool(40, new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }));
    const puffTex = softTexture(), puffs = []; for (let i = 0; i < 26; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, opacity: 0, depthWrite: false })); scene.add(sp); puffs.push(sp); }
    const glowTex = softTexture('rgba(255,180,90,1)'); const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); glow.scale.set(1.6, 1.6, 1); glow.position.set(0, 1.5, 0.05); scene.add(glow);
    const hgMat = new THREE.MeshStandardMaterial({ color: lin('#e6eaef'), metalness: 1, roughness: 0.1 }), hgDrops = pool(16, new THREE.SphereGeometry(1, 12, 8), hgMat);
    const metalsG = new THREE.Group(); contents.add(metalsG); let metalKey = '';
    const dummy = new THREE.Object3D(), col = new THREE.Color();

    // metal pieces and the coating they get
    function buildMetals(list, level) {
      const key = list.map((m) => m.f + ':' + (m.dep || '') + ':' + level.toFixed(2)).join('|'); if (key === metalKey) return; metalKey = key;
      while (metalsG.children.length) metalsG.remove(metalsG.children[0]);
      list.forEach((m) => { const mat = new THREE.MeshStandardMaterial({ color: lin({ Fe: '#8b9198', Cu: '#c46a2c', Zn: '#9aa3ad', Mg: '#dfe3e8', Al: '#d3d9df', Na: '#e8e4d4' }[m.f] || '#aaa'), metalness: m.f === 'Na' ? 0.2 : 0.9, roughness: m.f === 'Zn' ? 0.55 : 0.3 });
        const dep = m.dep ? new THREE.MeshStandardMaterial({ color: lin(m.dep), metalness: 0.75, roughness: 0.45 }) : null, wet = Math.min(level, 6.2);
        if (m.f === 'Fe') { const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.6, 16), mat); sh.position.set(0.08, BOT + 0.15 + 1.8, 0); sh.rotation.z = 0.04; metalsG.add(sh); const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 20), mat); hd.position.set(0.15, BOT + 3.95, 0); metalsG.add(hd);
          if (dep && wet > BOT + 0.2) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, wet - BOT - 0.15, 16), dep); c.position.set(0.08, BOT + 0.15 + (wet - BOT - 0.15) / 2, 0); metalsG.add(c); } }
        else if (m.f === 'Cu') { const pts = []; for (let i = 0; i <= 60; i++) { const t = i / 60; pts.push(new THREE.Vector3(Math.sin(t * 18) * 0.18, BOT + 0.12 + t * 3.8, Math.cos(t * 18) * 0.18)); }
          metalsG.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 180, 0.025, 8), mat));
          if (dep && wet > BOT + 0.2) for (let i = 0; i < 70; i++) { const t = rnd(i) * Math.min(1, (wet - BOT - 0.12) / 3.8), x = Math.sin(t * 18) * 0.18, z = Math.cos(t * 18) * 0.18, y = BOT + 0.12 + t * 3.8;
            const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.03 + rnd(i + 3) * 0.04, 0), dep); cr.position.set(x + (rnd(i + 5) - 0.5) * 0.12, y, z + (rnd(i + 7) - 0.5) * 0.12); cr.rotation.set(rnd(i) * 3, rnd(i + 1) * 3, 0); metalsG.add(cr); } }
        else if (m.f === 'Mg') { const r = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 0.015), mat); r.position.set(0, BOT + 1.15, 0); r.rotation.z = 0.08; metalsG.add(r); }
        else if (m.f === 'Al') { const g = new THREE.IcosahedronGeometry(0.2, 1); const pos = g.attributes.position; for (let i = 0; i < pos.count; i++) pos.setXYZ(i, pos.getX(i) * (0.7 + rnd(i) * 0.6), pos.getY(i) * 0.45, pos.getZ(i) * (0.7 + rnd(i + 9) * 0.6)); g.computeVertexNormals();
          const a = new THREE.Mesh(g, mat); a.position.set(0, BOT + 0.15, 0); metalsG.add(a); }
        else if (m.f === 'Zn') { for (let k = 0; k < 3; k++) { const g = new THREE.IcosahedronGeometry(0.13, 1); const pos = g.attributes.position; for (let i = 0; i < pos.count; i++) { const s = 0.75 + rnd(i + k * 50) * 0.5; pos.setXYZ(i, pos.getX(i) * s, pos.getY(i) * s, pos.getZ(i) * s); } g.computeVertexNormals();
          const z = new THREE.Mesh(g, dep && k === 0 ? dep : mat); z.position.set([-0.12, 0.13, 0][k], BOT + [0.13, 0.14, 0.33][k], [0.05, -0.04, 0][k]); metalsG.add(z); } }
        else if (m.f === 'Na') { const n = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.2), mat); n.position.set(0, BOT + 0.1, 0); n.userData.na = true; metalsG.add(n); } });
    }
    // ---------- the hand: bottle, spatula, tweezers, dropper ----------
    const hand = new THREE.Group(); scene.add(hand); let handKey = '', streamMesh = null;
    const streamMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, roughness: 0.05, clearcoat: 1, depthWrite: false });
    function buildHand(a) {
      const key = a ? a.kind + a.id : ''; if (key === handKey) return; handKey = key; while (hand.children.length) hand.remove(hand.children[0]); if (!a) return;
      const g = new THREE.Group(); g.name = 'tool';
      if (a.kind === 'pour') { const bp = [[0.001, -1.5], [0.5, -1.5], [0.55, -1.42], [0.55, -0.45], [0.2, -0.15], [0.14, 0], [0.16, 0.03]].map(([x, y]) => new THREE.Vector2(x, y));
        g.add(new THREE.Mesh(new THREE.LatheGeometry(bp, 40), new THREE.MeshPhysicalMaterial({ color: lin('#eef7ff'), transparent: true, opacity: 0.25, roughness: 0.03, clearcoat: 1, envMapIntensity: 3, depthWrite: false, side: THREE.DoubleSide })));
        const lq = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.7, 32), new THREE.MeshPhysicalMaterial({ color: lin(a.col), transparent: true, opacity: 0.7, roughness: 0.05 })); lq.position.y = -1.12; lq.name = 'liq'; g.add(lq);
        const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.45, 32, 1, true, -0.9, 1.8), new THREE.MeshStandardMaterial({ map: labelTexture(a.label || ''), roughness: 0.8 })); lab.position.y = -0.95; g.add(lab); }
      else if (a.kind === 'powder') { const h = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 0.12), M.steel); h.position.x = 1.25; g.add(h); const sp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.steel); g.add(sp);
        const heap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: lin(a.col), roughness: 0.9 })); heap.name = 'heap'; heap.position.y = -0.02; g.add(heap); }
      else if (a.kind === 'metal') { [-1, 1].forEach((s) => { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.035, 1.8, 0.05), M.steel); arm.position.set(s * 0.06, 0.9, 0); arm.name = 'arm' + s; g.add(arm); });
        const piece = new THREE.Mesh(a.id === 'Fe' ? new THREE.CylinderGeometry(0.05, 0.05, 0.6, 12) : new THREE.IcosahedronGeometry(0.12, 1), new THREE.MeshStandardMaterial({ color: lin({ Fe: '#8b9198', Cu: '#c46a2c', Zn: '#9aa3ad', Mg: '#dfe3e8', Al: '#d3d9df', Na: '#e8e4d4' }[a.id] || '#aaa'), metalness: 0.9, roughness: 0.3 })); piece.name = 'piece'; hand.add(piece); }
      else { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.02, 1.2, 16), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, clearcoat: 1, depthWrite: false })); t.position.y = 0.6; g.add(t);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), new THREE.MeshStandardMaterial({ color: lin('#26262b'), roughness: 0.6 })); bulb.scale.y = 1.6; bulb.position.y = 1.35; g.add(bulb);
        for (let i = 0; i < 3; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), new THREE.MeshPhysicalMaterial({ color: lin(a.col), transparent: true, opacity: 0.85, clearcoat: 1 })); d.name = 'drop' + i; d.scale.y = 1.3; hand.add(d); } }
      g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); hand.add(g);
    }
    function animateHand(a, surf) {
      buildHand(a); if (streamMesh) { contents.remove(streamMesh); streamMesh.geometry.dispose(); streamMesh = null; } if (!a) return;
      const p = Math.min(1, (performance.now() - a.t0p) / a.dur), ease = (x) => x * x * (3 - 2 * x), L = (u, v, t) => u + (v - u) * t;
      const inP = ease(Math.min(1, p / 0.28)), outP = ease(Math.max(0, (p - 0.82) / 0.18)), k = inP * (1 - outP), tool = hand.getObjectByName('tool');
      if (a.kind === 'pour') { tool.position.set(L(3.6, 0.8, k), L(8.4, 7.25, k), L(1.2, 0.0, k)); tool.rotation.z = L(0, 2.05, k);
        const liq = tool.getObjectByName('liq'); const drain = p > 0.3 ? Math.min(1, (p - 0.3) / 0.5) : 0; liq.scale.y = 1 - 0.75 * drain; liq.position.y = -1.47 + 0.35 * liq.scale.y;
        if (p > 0.32 && p < 0.82) { const m = new THREE.Vector3(); tool.localToWorld(m.set(0, 0.02, 0)); const pts = [m.clone(), new THREE.Vector3(m.x * 0.5, m.y - 0.25, m.z * 0.5), new THREE.Vector3(0.04, TOPY - 0.2, 0), new THREE.Vector3(0.03, surf, 0)];
          streamMat.color.copy(lin(a.col)); streamMesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.035, 8, false), streamMat); streamMesh.renderOrder = 3; contents.add(streamMesh); } }
      else if (a.kind === 'powder') { tool.position.set(L(3.4, 0.05, k), L(8.0, TOPY + 0.35, k), L(0.8, 0, k)); tool.rotation.z = L(0.2, 0, k) - (p > 0.32 && p < 0.82 ? 0.55 : 0) * k; tool.rotation.x = 0;
        const heap = tool.getObjectByName('heap'); heap.visible = p < 0.55; falling.count = p > 0.4 && p < 0.86 ? 26 : 0; falling.material.color.copy(lin(a.col));
        for (let i = 0; i < falling.count; i++) { const t = ((p - 0.4) / 0.46 * 1.5 + i / 26) % 1; dummy.position.set((rnd(i) - 0.5) * 0.14, TOPY + 0.2 - t * (TOPY + 0.2 - surf), (rnd(i + 3) - 0.5) * 0.14); dummy.scale.setScalar(0.022 + rnd(i + 5) * 0.015); dummy.rotation.set(i, i * 2, 0); dummy.updateMatrix(); falling.setMatrixAt(i, dummy.matrix); }
        falling.instanceMatrix.needsUpdate = true; }
      else if (a.kind === 'metal') { const y = L(10, TOPY - 0.2, k); tool.position.set(0, y, 0); const open = p > 0.45; ['-1', '1'].forEach((s) => { const arm = tool.getObjectByName('arm' + s); arm.position.x = (open ? 0.11 : 0.06) * +s; });
        const piece = hand.getObjectByName('piece'); piece.visible = p < 0.86; piece.position.set(0, open ? Math.max(surf + 0.1, y - (p - 0.45) / 0.3 * (y - surf)) : y - 0.05, 0); }
      else { const y = L(10, TOPY + 0.6, k); tool.position.set(0, y, 0); for (let i = 0; i < 3; i++) { const d = hand.getObjectByName('drop' + i), t = (p - 0.32) / 0.5 - i * 0.28; d.visible = t > 0 && t < 1; d.position.set(0, y - 0.05 - Math.max(0, t) * (y - surf), 0); } }
    }

    // ---------- per-frame update from the engine's description ----------
    const controls = opt.orbit ? opt.orbit(cam, renderer.domElement) : null; // frame the stand, the tube and the lamp: farther away when the box is narrow
    const place = () => { const d = 15.5 * Math.max(1, 0.85 / Math.max(0.4, cam.aspect)); cam.position.set(0.22 * d, 4.9 + 0.08 * d, d); if (controls) { controls.target.set(0.3, 4.4, 0); controls.sync(); } cam.lookAt(0.3, 4.4, 0); };
    const size = () => { const w = el.clientWidth || 400, h = el.clientHeight || 400; cam.aspect = w / h; cam.updateProjectionMatrix(); renderer.setSize(w, h, false); place(); };
    const ro = new ResizeObserver(size); ro.observe(el); size();
    let raf = 0, alive = true, pptKey = '';
    function frame(now) {
      if (!alive) return; const v = opt.getVM(); if (!v) { raf = requestAnimationFrame(frame); return; }
      const level = v.vol > 0 ? Math.min(TOPY - 0.5, BOT + 0.22 + v.vol * 0.56) : BOT, surf = v.vol > 0 ? level : BOT + 0.1;
      // liquid
      const lk = level.toFixed(3) + (v.boil ? Math.round(now / 90) : ''); if (v.vol > 0) { if (lk !== liqKey) { liqKey = lk; if (liquid) { contents.remove(liquid); liquid.geometry.dispose(); } liquid = new THREE.Mesh(liquidGeom(level + (v.boil ? Math.sin(now / 80) * 0.015 : 0), 0.004), liqMat); liquid.renderOrder = 2; contents.add(liquid); } }
      else if (liquid) { contents.remove(liquid); liquid.geometry.dispose(); liquid = null; liqKey = ''; }
      liqMat.color.copy(lin(v.liqCol || '#cfe6ff')); liqMat.opacity = v.liqCol ? v.liqOp : 0.22;
      // precipitates: particles drift in the liquid and settle into a heap that follows the round bottom
      const pk = v.ppts.map((p) => p.f + p.tex).join('|'); if (pk !== pptKey) { pptKey = pk; pptMeshes.forEach((m) => { contents.remove(m); m.geometry.dispose(); }); pptMeshes.length = 0;
        v.ppts.forEach((p) => { const geo = p.tex === 'cryst' ? new THREE.OctahedronGeometry(1, 0) : p.tex === 'curdy' ? new THREE.DodecahedronGeometry(1, 0) : new THREE.IcosahedronGeometry(1, p.tex === 'gel' || p.tex === 'floc' ? 1 : 0);
          const mat = p.tex === 'gel' ? new THREE.MeshPhysicalMaterial({ color: lin(p.color), transparent: true, opacity: 0.55, roughness: 0.2, clearcoat: 0.6, depthWrite: false }) : p.tex === 'cryst' ? new THREE.MeshPhysicalMaterial({ color: lin(p.color), metalness: 0.35, roughness: 0.15, clearcoat: 1 }) : new THREE.MeshStandardMaterial({ color: lin(p.color), roughness: 0.85, transparent: p.tex === 'floc', opacity: p.tex === 'floc' ? 0.9 : 1 });
          const m = new THREE.InstancedMesh(geo, mat, 420); m.frustumCulled = false; m.renderOrder = 3; contents.add(m); pptMeshes.push(m); }); }
      let base = 0; v.ppts.forEach((p, pi) => { const m = pptMeshes[pi]; if (!m) return; const n = Math.min(420, Math.round(70 + p.n * 210)), age = Math.min(1, p.age / 3.2), e = 1 - Math.pow(1 - age, 2), heapH = Math.min(1.4, 0.12 + p.n * 0.42), sz = p.tex === 'gel' ? 0.06 : p.tex === 'floc' ? 0.045 : p.tex === 'curdy' ? 0.04 : p.tex === 'cryst' ? 0.028 : 0.022;
        m.count = n; for (let i = 0; i < n; i++) { const h = base + rnd(i + pi * 999) * heapH, ry = BOT + 0.02 + h, rr = innerR(ry) * 0.92 * Math.sqrt(rnd(i * 3 + pi)), a = rnd(i * 7 + pi) * 6.283;
          const sx = Math.cos(a) * rr, sz2 = Math.sin(a) * rr, fy = BOT + 0.1 + rnd(i * 11 + pi) * Math.max(0.1, level - BOT - 0.15), fr = innerR(fy) * 0.9 * Math.sqrt(rnd(i * 13 + pi)), fa = a + now / 1800 * (rnd(i) - 0.5);
          const x = Math.cos(fa) * fr * (1 - e) + sx * e, y = fy * (1 - e) + ry * e, z = Math.sin(fa) * fr * (1 - e) + sz2 * e;
          dummy.position.set(x, Math.min(y, level - 0.02), z); dummy.rotation.set(i, i * 1.7, i * 0.3); dummy.scale.setScalar(sz * (0.6 + rnd(i + 17) * 0.9)); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); }
        m.instanceMatrix.needsUpdate = true; if (p.tex === 'cryst') m.material.emissive = new THREE.Color(0x332200).multiplyScalar(0.5 + 0.5 * Math.sin(now / 300)); base += heapH * e * 0.85; });
      // the cloudiness of a fresh precipitate
      const fresh = v.ppts.find((p) => p.age < 3.2); if (fresh && v.vol > 0) { if (!cloudMesh) { cloudMesh = new THREE.Mesh(liquidGeom(level, 0.01), cloudMat); cloudMesh.renderOrder = 2; contents.add(cloudMesh); } cloudMat.color.copy(lin(fresh.color)); cloudMat.opacity = 0.65 * (1 - fresh.age / 3.2); }
      else if (cloudMesh) { contents.remove(cloudMesh); cloudMesh.geometry.dispose(); cloudMesh = null; }
      // dry crystals and powders on the bottom
      let ci = 0; v.crystals.forEach((c, k) => { const n = Math.min(110, Math.round(40 + c.n * 70)); for (let i = 0; i < n && ci < 220; i++, ci++) { const ry = BOT + 0.03 + rnd(i + k * 77) * 0.35, rr = innerR(ry) * 0.85 * Math.sqrt(rnd(i * 5 + k)), a = rnd(i * 3 + k) * 6.283;
        dummy.position.set(Math.cos(a) * rr, ry, Math.sin(a) * rr); dummy.rotation.set(rnd(i) * 3, rnd(i + 1) * 3, rnd(i + 2) * 3); dummy.scale.setScalar(0.04 + rnd(i + 9) * 0.05); dummy.updateMatrix(); crystals.setMatrixAt(ci, dummy.matrix); crystals.setColorAt(ci, col.copy(lin(c.color))); } });
      crystals.count = ci; crystals.instanceMatrix.needsUpdate = true; if (crystals.instanceColor) crystals.instanceColor.needsUpdate = true;
      let wi = 0; v.powders.forEach((c, k) => { const n = c.big ? 9 : 90; for (let i = 0; i < n && wi < 220; i++, wi++) { const ry = BOT + 0.03 + rnd(i + k * 31) * (c.big ? 0.25 : 0.18), rr = innerR(ry) * 0.85 * Math.sqrt(rnd(i * 5 + k + 3)), a = rnd(i * 3 + k + 1) * 6.283;
        dummy.position.set(Math.cos(a) * rr, ry, Math.sin(a) * rr); dummy.rotation.set(i, i * 2, 0); dummy.scale.setScalar(c.big ? 0.1 + rnd(i) * 0.05 : 0.022 + rnd(i) * 0.02); dummy.updateMatrix(); powder.setMatrixAt(wi, dummy.matrix); powder.setColorAt(wi, col.copy(lin(c.color))); } });
      powder.count = wi; powder.instanceMatrix.needsUpdate = true; if (powder.instanceColor) powder.instanceColor.needsUpdate = true;
      buildMetals(v.metals, level);
      metalsG.children.forEach((o) => { if (o.userData.na && v.naBall && v.vol > 0) { o.position.set(Math.sin(now / 160) * 0.22, level + 0.04, Math.cos(now / 210) * 0.1); o.scale.setScalar(Math.max(0.2, 1 - v.naAge / 4)); } });
      // bubbles: from the metal (or the bottom); boiling adds large ones everywhere
      let bi = 0; if (v.vol > 0 && (v.gas > 0 || v.boil)) { const nGas = Math.round(v.gas * 90), nBoil = v.boil ? 50 : 0;
        for (let i = 0; i < nGas + nBoil && bi < 160; i++, bi++) { const big = i >= nGas, spd = big ? 1.6 : 0.8 + rnd(i) * 0.6, t = ((now / 1000) * spd + rnd(i + 5)) % 1;
          const sx = v.gasSrc === 'Fe' ? 0.08 : v.gasSrc === 'Cu' ? Math.sin(i) * 0.18 : (rnd(i + 2) - 0.5) * 0.5, sz2 = v.gasSrc === 'Fe' || v.gasSrc === 'Cu' ? Math.cos(i) * 0.06 : (rnd(i + 4) - 0.5) * 0.5;
          const y0 = v.gasSrc === 'Fe' || v.gasSrc === 'Cu' ? BOT + 0.2 + rnd(i + 8) * Math.max(0.1, level - BOT - 0.4) : BOT + 0.08, y = y0 + t * (level - y0);
          dummy.position.set(sx + Math.sin(t * 9 + i) * 0.02, Math.min(y, level - 0.02), sz2); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar((big ? 0.035 + rnd(i) * 0.05 : 0.012 + rnd(i) * 0.025) * (0.6 + t * 0.6)); dummy.updateMatrix(); bubbles.setMatrixAt(bi, dummy.matrix); } }
      bubbles.count = bi; bubbles.instanceMatrix.needsUpdate = true;
      // silver mirror, NH₄Cl ring, mercury droplets
      if (v.mirror && !mirror) { mirror = new THREE.Mesh(new THREE.LatheGeometry(roundProfile(R + 0.015, TOPY - 0.6, 0), 64), new THREE.MeshStandardMaterial({ color: lin('#e6eaee'), metalness: 1, roughness: 0.06, side: THREE.DoubleSide })); contents.add(mirror); }
      if (!v.mirror && mirror) { contents.remove(mirror); mirror = null; }
      if (v.ring && !ring) { ring = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.012, R + 0.012, 0.35, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0xf6f6f2, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })); ring.position.y = TOPY - 0.9; contents.add(ring); }
      if (!v.ring && ring) { contents.remove(ring); ring = null; }
      hgDrops.count = v.hg ? 14 : 0; for (let i = 0; i < hgDrops.count; i++) { const a = rnd(i) * 6.283, y = BOT + 1.5 + rnd(i + 3) * 2.5; dummy.position.set(Math.cos(a) * (R - 0.01), y, Math.sin(a) * (R - 0.01)); dummy.scale.setScalar(0.02 + rnd(i + 5) * 0.03); dummy.updateMatrix(); hgDrops.setMatrixAt(i, dummy.matrix); } hgDrops.instanceMatrix.needsUpdate = true;
      // vapour: steam while boiling, coloured gases, smoke; puffs rise from the mouth of the tube
      const vap = v.cloud || (v.boil ? '#ffffff' : null);
      puffs.forEach((sp, i) => { if (!vap) { sp.material.opacity = 0; return; } const t = ((now / 2600) + i / puffs.length) % 1, inside = v.cloud && i % 2 === 0;
        sp.material.color.copy(lin(vap)); const y = inside ? surf + 0.2 + t * (TOPY - surf - 0.2) : TOPY + t * 2.6; sp.position.set(Math.sin(i * 1.7 + t * 3) * (inside ? 0.15 : 0.25 + t * 0.6), y, 0.1 + Math.cos(i) * 0.15);
        const s = inside ? 0.45 : 0.4 + t * 1.3; sp.scale.set(s, s, 1); sp.material.opacity = (inside ? 0.35 : 0.45) * Math.sin(t * Math.PI) * (v.cloud === '#ffffff' || !v.cloud ? 0.7 : 1); });
      // the spirit lamp flame and its light
      flame.visible = v.heated; lampLight.intensity = v.heated ? 1.4 + Math.sin(now / 60) * 0.25 : 0; glow.material.opacity = v.heated ? 0.55 : 0;
      if (v.heated) { const s = 1 + Math.sin(now / 55) * 0.07 + Math.sin(now / 23) * 0.03; flame.scale.set(1 / s, s, 1 / s); flame.rotation.z = Math.sin(now / 140) * 0.05; }
      // flame test on the burner
      tf.material.opacity = v.flameTest ? 0.75 : 0; loop.visible = wire.visible = !!v.flameTest; flameLight.intensity = v.flameTest ? 1.6 : 0; if (v.flameTest) { tf.material.color.copy(lin(v.flameTest)); flameLight.color.copy(lin(v.flameTest)); tf.scale.y = 1 + Math.sin(now / 50) * 0.08; }
      animateHand(v.act, surf);
      if (controls) controls.update(); renderer.render(scene, cam); raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return { dispose() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); controls && controls.dispose && controls.dispose(); renderer.dispose(); try { renderer.forceContextLoss(); } catch (e) {} el.innerHTML = ''; } };
  }
  window.PTLAB3D = { create };
})();
