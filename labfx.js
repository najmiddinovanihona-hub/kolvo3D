// Kolvo laboratory effects: fire, a hydrogen "pop", an explosion with flying glass, an elephant-toothpaste foam fountain
// and the blinding light of burning magnesium, as Three.js particles plus a little WebAudio sound.
// window.PTLABFX(THREE, scene) → { spawn(event, origin, opts), update(now, dt) → camera shake amount }
(function () {
  'use strict';
  let actx = null;
  // short synthesised sounds: a pop, a boom, a whoosh of flame
  function sound(kind) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume();
      const dur = kind === 'boom' ? 1.4 : kind === 'pop' ? 0.25 : 1.0, n = Math.floor(actx.sampleRate * dur), buf = actx.createBuffer(1, n, actx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) { const t = i / n; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, kind === 'boom' ? 2.2 : kind === 'pop' ? 6 : 1.2) * (kind === 'whoosh' ? Math.sin(Math.PI * t) : 1); }
      const src = actx.createBufferSource(); src.buffer = buf; const f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = kind === 'boom' ? 420 : kind === 'pop' ? 2400 : 900;
      const g = actx.createGain(); g.gain.value = kind === 'boom' ? 0.9 : kind === 'pop' ? 0.7 : 0.25; src.connect(f); f.connect(g); g.connect(actx.destination); src.start();
    } catch (e) { /* sound is optional */ }
  }
  window.PTLABFX = function (THREE, scene) {
    const lin = (c) => new THREE.Color(c).convertSRGBToLinear();
    const tex = (stops) => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 1, 32, 32, 32); stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); };
    const T_FIRE = tex([[0, 'rgba(255,255,230,1)'], [0.25, 'rgba(255,200,90,.95)'], [0.6, 'rgba(255,90,20,.45)'], [1, 'rgba(255,40,0,0)']]);
    const T_SMOKE = tex([[0, 'rgba(255,255,255,.9)'], [0.5, 'rgba(255,255,255,.35)'], [1, 'rgba(255,255,255,0)']]);
    const T_RING = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d'), gr = g.createRadialGradient(64, 64, 40, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.8, 'rgba(255,240,220,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(cv); })();
    const parts = [], lights = [], shards = [], foams = []; let shake = 0;
    const sprite = (map, color, add) => { const m = new THREE.SpriteMaterial({ map, color: lin(color), transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending }); const s = new THREE.Sprite(m); scene.add(s); return s; };
    const flash = (o, color, peak, life) => { const l = new THREE.PointLight(lin(color), 0, 14, 2); l.position.copy(o); scene.add(l); lights.push({ l, peak, life, t: 0 }); };
    const emit = (o, kind, color, n, spread, speed, life, size, rise) => { for (let i = 0; i < n; i++) { const s = sprite(kind === 'smoke' ? T_SMOKE : T_FIRE, color, kind !== 'smoke');
      const a = Math.random() * 6.283, r = Math.random() * spread; s.position.set(o.x + Math.cos(a) * r, o.y + Math.random() * 0.1, o.z + Math.sin(a) * r);
      parts.push({ s, v: new THREE.Vector3((Math.random() - 0.5) * speed, rise * (0.6 + Math.random() * 0.8), (Math.random() - 0.5) * speed), life: life * (0.6 + Math.random() * 0.8), t: -Math.random() * 0.4, size: size * (0.6 + Math.random() * 0.8), kind }); } };
    const foamGeo = new THREE.SphereGeometry(1, 10, 8), foamMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });
    return {
      spawn(ev, origin, opt) {
        const o = origin.clone(), big = (opt && opt.scale) || 1;
        if (ev.type === 'fire') { emit(o, 'fire', ev.color || '#ffa040', Math.round(46 * ev.size), 0.12 * big, 0.5, 1.4, 0.6 * big * ev.size, 1.6); emit(o, 'fire', '#ffd27a', 20, 0.08, 0.3, 0.9, 0.45 * big, 1.2);
          emit(new THREE.Vector3(o.x, o.y + 0.6, o.z), 'smoke', '#5d5d66', 14, 0.15, 0.4, 3.0, 0.9 * big, 0.7); flash(o, ev.color || '#ffa040', 4 * ev.size, 2.2); sound('whoosh'); }
        if (ev.type === 'pop') { emit(o, 'fire', ev.color || '#ffd27a', 26, 0.1, 2.6, 0.35, 0.55 * big, 0.6); flash(o, '#fff1c4', 7, 0.35); emit(o, 'smoke', '#cfd3da', 8, 0.1, 0.8, 1.5, 0.6, 0.6); shake = Math.max(shake, 0.06); sound('pop'); }
        if (ev.type === 'bright') { flash(o, '#ffffff', 14, 3.2); emit(o, 'fire', '#ffffff', 60, 0.15, 0.6, 2.8, 0.7 * big, 0.6); emit(new THREE.Vector3(o.x, o.y + 0.5, o.z), 'smoke', '#f2f2f2', 22, 0.2, 0.5, 3.5, 1.0, 0.8); sound('whoosh'); }
        if (ev.type === 'explosion') {
          flash(o, '#ffd9a0', 30, 0.9); shake = 0.45; sound('boom');
          emit(o, 'fire', '#ffb347', 90, 0.3, 7, 0.9, 1.6 * big, 1.2); emit(o, 'fire', '#ffffff', 30, 0.1, 5, 0.35, 1.2 * big, 0.5);
          emit(o, 'smoke', '#55555c', 40, 0.4, 3, 4.5, 2.2 * big, 1.0);
          const ring = sprite(T_RING, '#fff2dc', true); ring.position.copy(o); parts.push({ s: ring, v: new THREE.Vector3(), life: 0.6, t: 0, size: 0.4, grow: 14, kind: 'ring' });
          // glass shards fly out, spin, fall and bounce on the bench
          const sm = new THREE.MeshPhysicalMaterial({ color: lin('#eaf6ff'), transparent: true, opacity: 0.55, roughness: 0.05, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });
          for (let i = 0; i < 46; i++) { const g = new THREE.BufferGeometry(), s = 0.05 + Math.random() * 0.16; g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, s, Math.random() * s, 0, Math.random() * s, s * 1.4, 0], 3)); g.computeVertexNormals();
            const m = new THREE.Mesh(g, sm); m.position.set(o.x + (Math.random() - 0.5) * 0.4, o.y - 1 + Math.random() * 2.4, o.z + (Math.random() - 0.5) * 0.4); scene.add(m);
            const a = Math.random() * 6.283; shards.push({ m, v: new THREE.Vector3(Math.cos(a) * (2 + Math.random() * 5), 2 + Math.random() * 5, Math.sin(a) * (2 + Math.random() * 5)), w: new THREE.Vector3(Math.random() * 12, Math.random() * 12, Math.random() * 12), t: 0 }); }
        }
        if (ev.type === 'foam') { foams.push({ o, t: 0, n: 0, color: ev.color || '#fff6e0', mesh: (() => { const m = new THREE.InstancedMesh(foamGeo, foamMat.clone(), 520); m.material.color.copy(lin(ev.color || '#fff6e0')); m.count = 0; m.frustumCulled = false; scene.add(m); return m; })(), p: [] }); emit(o, 'smoke', '#ffffff', 16, 0.2, 0.5, 2.5, 0.8, 0.8); }
      },
      update(now, dt) {
        for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.t += dt; if (p.t < 0) { p.s.material.opacity = 0; continue; } const k = p.t / p.life;
          if (k >= 1) { scene.remove(p.s); p.s.material.dispose(); parts.splice(i, 1); continue; }
          if (p.kind === 'ring') { const s = p.size + p.grow * k; p.s.scale.set(s, s, 1); p.s.material.opacity = 1 - k; continue; }
          p.s.position.addScaledVector(p.v, dt); p.v.multiplyScalar(p.kind === 'smoke' ? 0.985 : 0.95); p.v.y += (p.kind === 'smoke' ? 0.35 : 0.9) * dt; p.v.x += (Math.random() - 0.5) * dt; p.v.z += (Math.random() - 0.5) * dt;
          const s = p.size * (p.kind === 'smoke' ? 0.6 + k * 1.8 : 1 - k * 0.6); p.s.scale.set(s, s, 1); p.s.material.opacity = p.kind === 'smoke' ? 0.55 * Math.sin(Math.PI * k) : (1 - k) * 0.95; }
        for (let i = lights.length - 1; i >= 0; i--) { const L = lights[i]; L.t += dt; const k = L.t / L.life; if (k >= 1) { scene.remove(L.l); lights.splice(i, 1); continue; } L.l.intensity = L.peak * (1 - k) * (0.85 + Math.random() * 0.3); }
        for (const s of shards) { if (s.t > 6) continue; s.t += dt; s.v.y -= 9.8 * dt; s.m.position.addScaledVector(s.v, dt); s.m.rotation.x += s.w.x * dt; s.m.rotation.y += s.w.y * dt;
          if (s.m.position.y < 0.02) { s.m.position.y = 0.02; s.v.y *= -0.3; s.v.x *= 0.6; s.v.z *= 0.6; s.w.multiplyScalar(0.6); } }
        // the foam column grows out of the mouth, then slumps down the outside and spreads on the bench
        const d = new THREE.Object3D();
        foams.forEach((f) => { f.t += dt; if (f.t < 4 && f.n < 520) { const add = Math.min(520 - f.n, Math.round(dt * 150)); for (let i = 0; i < add; i++) f.p.push({ x: 0, y: 0, z: 0, vy: 1.2 + Math.random() * 0.8, a: Math.random() * 6.283, r: 0, s: 0.07 + Math.random() * 0.08 }); f.n += add; }
          f.p.forEach((q, i) => { if (q.y < 0.9 + i * 0.002) { q.y += q.vy * dt; } else { q.r = Math.min(0.55 + Math.random() * 0.02, q.r + dt * 0.4); q.y -= dt * 0.5; }
            const wy = Math.max(0.05 + q.s, f.o.y + q.y); d.position.set(f.o.x + Math.cos(q.a) * q.r, wy, f.o.z + Math.sin(q.a) * q.r); d.scale.setScalar(q.s); d.updateMatrix(); f.mesh.setMatrixAt(i, d.matrix); });
          f.mesh.count = f.p.length; f.mesh.instanceMatrix.needsUpdate = true; });
        const out = shake; shake *= Math.pow(0.02, dt); return out;
      },
      clear() { parts.forEach((p) => scene.remove(p.s)); parts.length = 0; lights.forEach((L) => scene.remove(L.l)); lights.length = 0; shards.forEach((s) => scene.remove(s.m)); shards.length = 0; foams.forEach((f) => scene.remove(f.mesh)); foams.length = 0; }
    };
  };
})();
