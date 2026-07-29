/* ============================================================
   scene.js — the glass prism
   ============================================================
   An inverted triangular prism in real transmissive glass,
   with a blueprint wireframe echo and three fragments that
   split off and reform. Environment map is generated
   procedurally, so the glass has something to refract.
   ============================================================ */

const PrismScene = (() => {
  let scene, prismGroup, prism, wire, frags = [], envRT, stars, billboard, billMat;

  /* procedural studio environment: dark room, one white strip
     light, one deep-blue wall, one silver bounce. This is what
     the glass reflects and refracts. */
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
    mk(0xffffff, 16, 4, [0, 8, 0], [Math.PI / 2, 0, 0]);        // ceiling strip
    mk(0x6a4fd8, 9, 11, [-9, 0, 0], [0, Math.PI / 2, 0]);       // violet wall
    mk(0x3e5fbf, 9, 11, [9, 0, 0], [0, -Math.PI / 2, 0]);       // blue wall
    mk(0xd9def0, 6, 7, [0, 0, -10], [0, 0, 0]);                 // bright back panel
    mk(0x14141e, 30, 30, [0, -6, 0], [-Math.PI / 2, 0, 0]);     // floor
    envRT = new THREE.WebGLCubeRenderTarget(256);
    const cam = new THREE.CubeCamera(0.1, 100, envRT);
    cam.update(renderer, envScene);
    return envRT.texture;
  }

  function build(parentScene, renderer) {
    scene = parentScene;
    const env = makeEnv(renderer);

    prismGroup = new THREE.Group();
    scene.add(prismGroup);

    // inverted triangular prism: wide triangular top, point down
    const geo = new THREE.CylinderGeometry(1.25, 0.02, 2.1, 3, 1).toNonIndexed();
    geo.computeVertexNormals();
    // streaky frost: canvas noise drives roughness + bump
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

    const glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1,
      thickness: 2.2,
      roughness: 0.14,
      roughnessMap: noiseTex,
      bumpMap: noiseTex,
      bumpScale: 0.012,
      metalness: 0,
      ior: 1.45,
      envMap: env,
      envMapIntensity: 2.2,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      iridescence: 1,
      iridescenceIOR: 1.6,
      attenuationColor: new THREE.Color(0xcfd8ff),
      attenuationDistance: 4.5,
      side: THREE.DoubleSide,
    });
    prism = new THREE.Mesh(geo, glass);
    prismGroup.add(prism);

    // blueprint echo: hairline edges, slightly larger
    wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.CylinderGeometry(1.32, 0.02, 2.2, 3, 1)),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16 })
    );
    prismGroup.add(wire);

    // fragments: three small glass shards, hidden inside until the process act
    const fgeo = new THREE.TetrahedronGeometry(0.2);
    for (let i = 0; i < 3; i++) {
      const f = new THREE.Mesh(fgeo, glass.clone());
      f.userData.angle = (i / 3) * Math.PI * 2;
      prismGroup.add(f);
      frags.push(f);
    }

    // faint star specks drifting in the room
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

    // curved project billboard (bent plane, like a wall screen)
    const bg = new THREE.PlaneGeometry(5.4, 3.1, 32, 1);
    const pos = bg.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, -(x * x) * 0.055);
    }
    bg.computeVertexNormals();
    billMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, toneMapped: false });
    billboard = new THREE.Mesh(bg, billMat);
    billboard.position.set(1.55, 0.1, -0.6);
    billboard.rotation.y = -0.22;
    scene.add(billboard);

    return prismGroup;
  }

  /* generative billboard art per project (replaced by a real
     image texture automatically when data.image is set) */
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
    // pure visual: the DOM card owns the words, the screen owns the mood
    x.fillStyle = "rgba(255,255,255,0.08)";
    x.font = "800 430px Archivo, Arial";
    x.fillText(pr.num, 560, 500);
    x.fillStyle = pr.accent + "66";
    x.fillRect(56, 500, 260, 4);
    return new THREE.CanvasTexture(c);
  }

  const billCache = {};
  function setBillboard(i, k) {
    if (i != null && billCache[i] === undefined) {
      const pr = DATA.projects[i];
      billCache[i] = pr.image
        ? new THREE.TextureLoader().load(pr.image)
        : projectTexture(pr);
    }
    if (i != null && billMat.map !== billCache[i]) {
      billMat.map = billCache[i];
      billMat.needsUpdate = true;
    }
    billMat.opacity = k;
    billboard.visible = k > 0.02;
  }

  /* k = 0 fragments hidden inside; k = 1 fully split out */
  function setSplit(k, t) {
    frags.forEach((f, i) => {
      const a = f.userData.angle + t * 0.35;
      const r = 0.2 + k * 1.7;
      f.position.set(Math.cos(a) * r, Math.sin(t * 0.8 + i) * 0.35 * k, Math.sin(a) * r);
      f.rotation.set(t * 0.5 + i, t * 0.7, i);
      f.scale.setScalar(0.4 + k * 0.85);
      f.visible = k > 0.02;
    });
    // the prism itself calms while fragments are out
    prism.scale.setScalar(1 - k * 0.12);
    wire.scale.setScalar(1 - k * 0.12);
  }

  return { build, setSplit, setBillboard, group: () => prismGroup };
})();
