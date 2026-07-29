/* ============================================================
   scene.js — glass prism, WebGL word, project ring
   ============================================================
   The word KAVYA lives inside WebGL as a glowing texture
   plane BEHIND the prism, so the transmissive glass really
   refracts and magnifies the letters through it.
   Projects sit on a rotating ring of curved screens, like a
   globe turning as you scroll. The prism never stops.
   ============================================================ */

const PrismScene = (() => {
  let scene, prismGroup, prism, wire, frags = [], envRT, stars;
  let wordTex, wordPlane, wordCtx, glowTex, glowPlane, glowCtx, lastM = -1, lastF = -1;
  let ring, panels = [], backdropTex;
  const RSTEP = 1.3, RRAD = 6.4, RCZ = -6.8;

  /* bright violet/blue studio the glass refracts */
  function makeEnv(renderer) {
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x050507);
    const mk = (c, w, h, pos, rot) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })
      );
      m.position.set(...pos); m.rotation.set(...rot);
      envScene.add(m);
    };
    mk(0xffffff, 16, 4, [0, 8, 0], [Math.PI / 2, 0, 0]);
    mk(0x6a4fd8, 9, 11, [-9, 0, 0], [0, Math.PI / 2, 0]);
    mk(0x3e5fbf, 9, 11, [9, 0, 0], [0, -Math.PI / 2, 0]);
    mk(0xd9def0, 6, 7, [0, 0, -10], [0, 0, 0]);
    mk(0x14141e, 30, 30, [0, -6, 0], [-Math.PI / 2, 0, 0]);
    envRT = new THREE.WebGLCubeRenderTarget(256);
    new THREE.CubeCamera(0.1, 100, envRT).update(renderer, envScene);
    return envRT.texture;
  }

  function build(parentScene, renderer) {
    scene = parentScene;
    const env = makeEnv(renderer);

    /* ── the word, in-scene so the glass can bend it ───────── */
    const wc = document.createElement("canvas");
    wc.width = 2048; wc.height = 640;
    wordCtx = wc.getContext("2d");
    wordTex = new THREE.CanvasTexture(wc);
    wordTex.anisotropy = 4;
    const wordGeo = new THREE.PlaneGeometry(5.42, 5.42 * 640 / 2048);
    // crisp core: alphaTest keeps it in the opaque pass, which is
    // what the glass transmission buffer samples and magnifies
    wordPlane = new THREE.Mesh(
      wordGeo,
      new THREE.MeshBasicMaterial({ map: wordTex, alphaTest: 0.5, transparent: false, toneMapped: false })
    );
    wordPlane.position.set(0, 0.02, -1.7);
    scene.add(wordPlane);
    // soft glow: separate additive layer (doesn't need to refract)
    const gc = document.createElement("canvas");
    gc.width = 2048; gc.height = 640;
    glowCtx = gc.getContext("2d");
    glowTex = new THREE.CanvasTexture(gc);
    glowPlane = new THREE.Mesh(
      wordGeo,
      new THREE.MeshBasicMaterial({
        map: glowTex, transparent: true, blending: THREE.AdditiveBlending,
        depthWrite: false, toneMapped: false,
      })
    );
    glowPlane.position.set(0, 0.02, -1.72);
    scene.add(glowPlane);

    /* ── prism group ───────────────────────────────────────── */
    prismGroup = new THREE.Group();
    scene.add(prismGroup);

    const geo = new THREE.CylinderGeometry(1.25, 0.02, 2.1, 3, 1).toNonIndexed();
    geo.computeVertexNormals();

    // streaky frost noise drives roughness + bump
    const nc = document.createElement("canvas");
    nc.width = nc.height = 256;
    const nx = nc.getContext("2d");
    nx.fillStyle = "#7a7a7a"; nx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      const g = 90 + Math.random() * 130;
      nx.strokeStyle = `rgba(${g},${g},${g},0.5)`;
      nx.lineWidth = 0.6 + Math.random() * 1.8;
      const x = Math.random() * 256, y = Math.random() * 256;
      nx.beginPath(); nx.moveTo(x, y);
      nx.lineTo(x + (Math.random() - 0.5) * 26, y + 18 + Math.random() * 42);
      nx.stroke();
    }
    const noiseTex = new THREE.CanvasTexture(nc);
    noiseTex.wrapS = noiseTex.wrapT = THREE.RepeatWrapping;

    // clear optical glass, pure transmission: the renderer's
    // transmission buffer now contains the word and the LED room,
    // so the prism visibly refracts and magnifies both
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1,
      thickness: 1.1,
      roughness: 0.04,
      metalness: 0,
      ior: 1.5,
      envMap: env,
      envMapIntensity: 1.15,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      iridescence: 0.45,
      iridescenceIOR: 1.6,
      attenuationColor: new THREE.Color(0xe6ecff),
      attenuationDistance: 10,
      side: THREE.DoubleSide,
    });
    prism = new THREE.Mesh(geo, glass);
    prismGroup.add(prism);

    wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.CylinderGeometry(1.32, 0.02, 2.2, 3, 1)),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.14 })
    );
    prismGroup.add(wire);

    const fgeo = new THREE.TetrahedronGeometry(0.2);
    for (let i = 0; i < 3; i++) {
      const f = new THREE.Mesh(fgeo, glass.clone());
      f.userData.angle = (i / 3) * Math.PI * 2;
      prismGroup.add(f);
      frags.push(f);
    }

    /* ── star specks ───────────────────────────────────────── */
    const starGeo = new THREE.BufferGeometry();
    const pts = [];
    for (let i = 0; i < 220; i++) {
      pts.push((Math.random() - 0.5) * 22, (Math.random() - 0.5) * 13, -2 - Math.random() * 9);
    }
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
      color: 0xaebbdd, size: 0.025, transparent: true, opacity: 0.55,
    }));
    scene.add(stars);

    /* ── project ring: a globe of curved screens ───────────── */
    ring = new THREE.Group();
    ring.position.set(0.9, 0.05, RCZ);
    scene.add(ring);
    const bg = new THREE.PlaneGeometry(3.55, 2.06, 32, 1);
    const bpos = bg.attributes.position;
    for (let i = 0; i < bpos.count; i++) {
      const x = bpos.getX(i);
      bpos.setZ(i, -(x * x) * 0.05);
    }
    bg.computeVertexNormals();
    DATA.projects.forEach((pr, i) => {
      const mat = new THREE.MeshBasicMaterial({
        map: projectTexture(pr), transparent: true, opacity: 0, toneMapped: false,
      });
      if (pr.image) new THREE.TextureLoader().load(pr.image, (t) => {
        t.encoding = THREE.sRGBEncoding;
        t.anisotropy = 4;
        mat.map = t; mat.needsUpdate = true;
      });
      const p = new THREE.Mesh(bg, mat);
      p.userData.slot = i;
      ring.add(p);
      panels.push(p);
    });

    // the word WORKS revolves around the prism, one slot ahead
    const wt = document.createElement("canvas");
    wt.width = 2048; wt.height = 512;
    const wx = wt.getContext("2d");
    wx.font = "800 340px Archivo, Arial, sans-serif";
    const ww = wx.measureText("WORKS").width;
    wx.shadowColor = "rgba(210,220,255,0.85)";
    wx.shadowBlur = 70;
    wx.fillStyle = "#ffffff";
    wx.fillText("WORKS", (2048 - ww) / 2, 380);
    const wpGeo = new THREE.PlaneGeometry(6.6, 6.6 * 512 / 2048, 32, 1);
    const wpos2 = wpGeo.attributes.position;
    for (let i = 0; i < wpos2.count; i++) {
      const px = wpos2.getX(i);
      wpos2.setZ(i, -(px * px) * 0.05);
    }
    const worksPanel = new THREE.Mesh(wpGeo, new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(wt), transparent: true, opacity: 0, toneMapped: false,
    }));
    worksPanel.userData.slot = -1;
    ring.add(worksPanel);
    panels.push(worksPanel);

    /* the LED room as an in-scene backdrop: the painted DOM
       canvas becomes a texture, so the glass refracts the room */
    const roomCanvas = document.getElementById("room");
    backdropTex = new THREE.CanvasTexture(roomCanvas);
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 17),
      new THREE.MeshBasicMaterial({ map: backdropTex, toneMapped: false })
    );
    backdrop.position.set(0, 0, -14);
    scene.add(backdrop);

    return prismGroup;
  }

  function updateBackdrop() { if (backdropTex) backdropTex.needsUpdate = true; }

  /* redraw the word only when the morph state changes.
     KAVYA fills the full canvas width; on scroll it dissolves
     and hands over to the revolving WORKS panel on the ring. */
  function drawWord(m, fade) {
    if (Math.abs(m - lastM) < 0.004 && Math.abs(fade - lastF) < 0.004) return;
    lastM = m; lastF = fade;
    const word = "KAVYA";
    const x = wordCtx;
    x.font = "800 300px Archivo, Arial, sans-serif";
    let widths = word.split("").map((ch) => x.measureText(ch).width);
    let total = widths.reduce((a, b) => a + b, 0) + 40 * (word.length - 1);
    const fit = 1960 / total;
    const fontPx = Math.floor(300 * fit), spacing = 40 * fit;
    const font = `800 ${fontPx}px Archivo, Arial, sans-serif`;
    x.font = font;
    widths = word.split("").map((ch) => x.measureText(ch).width);
    total = widths.reduce((a, b) => a + b, 0) + spacing * (word.length - 1);
    const startX = (2048 - total) / 2;
    const baseY = 320 + fontPx * 0.36;

    // pass 1: crisp core (opaque pass, refracted by the glass)
    x.clearRect(0, 0, 2048, 640);
    // pass 2: soft glow (additive layer)
    glowCtx.clearRect(0, 0, 2048, 640);
    glowCtx.font = font;
    let cx = startX;
    word.split("").forEach((ch, i) => {
      const d = i * 0.07;
      const k = Math.max(0, Math.min(1, m * 1.6 - d));
      const a = (1 - k) * fade;
      if (a > 0.01) {
        x.save();
        x.globalAlpha = a;
        x.filter = `blur(${k * 10}px)`;
        x.fillStyle = "#ffffff";
        x.fillText(ch, cx, baseY - k * 60);
        x.restore();
        glowCtx.save();
        glowCtx.globalAlpha = a * 0.7;
        glowCtx.filter = `blur(${18 + k * 12}px)`;
        glowCtx.fillStyle = "rgba(200,212,255,0.9)";
        glowCtx.fillText(ch, cx, baseY - k * 60);
        glowCtx.restore();
      }
      cx += widths[i] + spacing;
    });
    wordTex.needsUpdate = true;
    glowTex.needsUpdate = true;
  }
  function setWordVisible(v) { wordPlane.visible = v; glowPlane.visible = v; }

  /* the globe: angle spins the ring, facing panels glow */
  function setRing(angle, k) {
    ring.visible = k > 0.02;
    if (!ring.visible) return;
    panels.forEach((p) => {
      const a = p.userData.slot * RSTEP + angle;
      p.position.set(Math.sin(a) * RRAD, Math.sin(a * 2) * 0.04, Math.cos(a) * RRAD);
      p.rotation.y = a;
      const facing = Math.max(0, Math.cos(a));
      p.material.opacity = k * (0.08 + 0.92 * facing * facing * facing);
    });
  }

  function projectTexture(pr) {
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 588;
    const x = c.getContext("2d");
    x.fillStyle = "#0b0b12"; x.fillRect(0, 0, 1024, 588);
    const rg = x.createRadialGradient(200, 80, 40, 200, 80, 900);
    rg.addColorStop(0, pr.accent + "55"); rg.addColorStop(1, "transparent");
    x.fillStyle = rg; x.fillRect(0, 0, 1024, 588);
    x.strokeStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i < 1024; i += 52) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 588); x.stroke(); }
    for (let i = 0; i < 588; i += 52) { x.beginPath(); x.moveTo(0, i); x.lineTo(1024, i); x.stroke(); }
    x.fillStyle = "rgba(255,255,255,0.08)";
    x.font = "800 430px Archivo, Arial";
    x.fillText(pr.num, 560, 500);
    x.fillStyle = pr.accent + "66";
    x.fillRect(56, 500, 260, 4);
    return new THREE.CanvasTexture(c);
  }

  function setSplit(k, t) {
    frags.forEach((f, i) => {
      const a = f.userData.angle + t * 0.35;
      const r = 0.2 + k * 1.7;
      f.position.set(Math.cos(a) * r, Math.sin(t * 0.8 + i) * 0.35 * k, Math.sin(a) * r);
      f.rotation.set(t * 0.5 + i, t * 0.7, i);
      f.scale.setScalar(0.4 + k * 0.85);
      f.visible = k > 0.02;
    });
    prism.scale.setScalar(1 - k * 0.12);
    wire.scale.setScalar(1 - k * 0.12);
  }

  return { build, drawWord, setWordVisible, setRing, setSplit, updateBackdrop, group: () => prismGroup };
})();
