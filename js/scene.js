/* ============================================================
   scene.js — the glass prism
   ============================================================
   An inverted triangular prism in real transmissive glass,
   with a blueprint wireframe echo and three fragments that
   split off and reform. Environment map is generated
   procedurally, so the glass has something to refract.
   ============================================================ */

const PrismScene = (() => {
  let scene, prismGroup, prism, wire, frags = [], envRT;

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
    mk(0xffffff, 14, 3, [0, 8, 0], [Math.PI / 2, 0, 0]);        // ceiling strip
    mk(0x24406e, 8, 10, [-9, 0, 0], [0, Math.PI / 2, 0]);       // deep blue wall
    mk(0x8d94a3, 8, 10, [9, 0, 0], [0, -Math.PI / 2, 0]);       // silver wall
    mk(0x101018, 30, 30, [0, -6, 0], [-Math.PI / 2, 0, 0]);     // floor
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
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0xf4f6fa,
      transmission: 0.92,
      thickness: 1.8,
      roughness: 0.05,
      metalness: 0,
      ior: 1.45,
      envMap: env,
      envMapIntensity: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      attenuationColor: new THREE.Color(0x9fb4e8),
      attenuationDistance: 3.2,
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

    return prismGroup;
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

  return { build, setSplit, group: () => prismGroup };
})();
