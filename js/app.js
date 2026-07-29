/* ============================================================
   app.js — renderer, scroll film, cursor light, morphing type,
   acts, accessibility, fallback
   ============================================================ */

(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (s = "") => String(s).replace(/\[(ADD|CONFIRM)[^\]]*\]/g, (m) => `<span class="ph">${m}</span>`);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = matchMedia("(max-width: 760px)").matches;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const seg = (p, a, b) => clamp01((p - a) / (b - a));
  const ease = (t) => t * t * (3 - 2 * t);

  /* ── acts ─────────────────────────────────────────────────── */
  const ACTS = [
    { key: "hero", from: 0.00, to: 0.08 },
    { key: "morph", from: 0.08, to: 0.16 },
    { key: "w0", from: 0.16, to: 0.25, project: 0 },
    { key: "w1", from: 0.25, to: 0.34, project: 1 },
    { key: "w2", from: 0.34, to: 0.43, project: 2 },
    { key: "w3", from: 0.43, to: 0.52, project: 3 },
    { key: "philosophy", from: 0.52, to: 0.60 },
    { key: "about", from: 0.60, to: 0.68 },
    { key: "process", from: 0.68, to: 0.78 },
    { key: "achieve", from: 0.78, to: 0.86 },
    { key: "cta", from: 0.86, to: 0.94 },
    { key: "footer", from: 0.94, to: 1.001 },
  ];
  const NAMES = {
    hero: "Kavya", morph: "Work", w0: "Work 01", w1: "Work 02", w2: "Work 03", w3: "Work 04",
    philosophy: "Philosophy", about: "About", process: "Process", achieve: "Achievements",
    cta: "Contact", footer: "Kavya",
  };
  const resolveAct = (p) => ACTS.find((a) => p >= a.from && p < a.to) || ACTS[ACTS.length - 1];

  /* keyframe track helper */
  function track(keys, p) {
    if (p <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [pa, va] = keys[i], [pb, vb] = keys[i + 1];
      if (p <= pb) return va + (vb - va) * ease(seg(p, pa, pb));
    }
    return keys[keys.length - 1][1];
  }
  // prism position x, scale, y across the whole journey
  const PX = [[0, 0], [0.16, 0], [0.545, 0], [0.60, 0], [0.63, -2.2], [0.67, -2.2], [0.71, 0], [0.80, 2.2], [0.845, 2.2], [0.88, 0], [1, 0]];
  // prism retreats early so WORKS makes its front pass IN FRONT
  // of the glass, exactly like the project panels after it
  const PZ = [[0, 0], [0.085, 0], [0.13, -4.6], [0.50, -4.6], [0.56, 0], [1, 0]];
  const PSC = [[0, 0.86], [0.10, 0.86], [0.18, 0.9], [0.50, 0.9], [0.56, 1.05], [0.62, 0.55], [0.70, 0.9], [0.80, 0.5], [0.87, 0.62], [0.95, 0.5], [1, 0.5]];
  const PYY = [[0, 0], [0.86, 0], [0.90, 0.35], [0.94, 0.55], [1, 0.7]];

  /* ── DOM build ────────────────────────────────────────────── */
  function chars(word, gapAfter) {
    return word.split("").map((c, i) =>
      `<span class="ch" data-i="${i + (gapAfter ? 0 : 3)}">${c}</span>`).join("");
  }

  function buildDOM() {
    $("#w-kavya .l").innerHTML = chars("KA");
    $("#w-kavya .r").innerHTML = chars("YA", false);
    $("#w-work .l").innerHTML = chars("WO");
    $("#w-work .r").innerHTML = chars("RK", false);
    $("#tagline").textContent = DATA.hero.tagline;
    $("#cueword").textContent = DATA.hero.cue;
    $("#worksub").textContent = DATA.work.sub;

    // project acts
    const wrap = $("#pcards");
    DATA.projects.forEach((pr, i) => {
      const card = document.createElement("article");
      card.className = "pcard";
      card.dataset.idx = i;
      card.innerHTML = `
        <span class="ghost" aria-hidden="true">${pr.num}</span>
        <div class="pframe" style="--pa:${pr.accent};${pr.image ? `background-image:url('${pr.image}')` : ""}">
          ${pr.image ? "" : '<span class="pframe-note mono">[ADD PROJECT IMAGE]</span>'}
        </div>
        <div class="pmeta">
          <span class="mono pnum">${pr.num} / 0${DATA.projects.length}</span>
          <h2>${pr.title}</h2>
          <p class="pcat mono">${pr.category}</p>
          <p class="pdesc">${fmt(pr.desc)}</p>
          <div class="plinks">${pr.links.map((l) => `<a class="lnk" href="${l.href}" target="_blank" rel="noopener">${l.label} ↗</a>`).join("")}</div>
        </div>`;
      wrap.appendChild(card);
    });

    $("#philo .big-serif").textContent = DATA.philosophy.line;
    $("#philo .sub").textContent = DATA.philosophy.sub;
    $("#about h2").textContent = DATA.about.name;
    $("#about .meta").textContent = DATA.about.meta;
    $("#about .lines").innerHTML = DATA.about.lines.map((l) => `<p>${fmt(l)}</p>`).join("");
    $("#process .pwords").innerHTML = DATA.process.map((w, i) => `<span class="pw" style="--d:${i * 90}ms">${w}</span>`).join("");
    $("#process .sub").textContent = DATA.processLine;
    $("#achieve .rows").innerHTML = DATA.achievements.map((a) =>
      `<div class="arow"><span class="an">${fmt(a.n)}</span><span class="al">${fmt(a.label)}</span></div>`).join("");
    $("#cta h2").textContent = DATA.cta.line;
    $("#cta .sub").textContent = DATA.cta.sub;
    $("#cta .mail").textContent = DATA.profile.email;
    $("#cta .mail").href = `mailto:${DATA.profile.email}?subject=${encodeURIComponent("Let's build something beautiful")}`;
    $("#footer .final").textContent = DATA.footer.line;
    $$("#footer [data-mail]").forEach((a) => (a.href = `mailto:${DATA.profile.email}`));
    $$("#footer [data-li]").forEach((a) => (a.href = DATA.profile.linkedin));
    $$("#footer [data-gh]").forEach((a) => (a.href = DATA.profile.github));

    // accessible document
    $("#doc").innerHTML = `
      <h1>Kavya Bahety. ${DATA.hero.tagline}</h1>
      <p>${DATA.about.lines.join(" ")}</p>
      ${DATA.projects.map((pr) => `
        <article><h2>${pr.num} · ${pr.title}</h2><p>${pr.category}</p><p>${pr.desc}</p>
        ${pr.links.map((l) => `<a href="${l.href}">${l.label}</a>`).join(" · ")}</article>`).join("")}
      <h2>Process</h2><p>${DATA.process.join(" → ")}. ${DATA.processLine}</p>
      <h2 id="doc-contact">${DATA.cta.line}</h2>
      <p><a href="mailto:${DATA.profile.email}">${DATA.profile.email}</a> ·
         <a href="${DATA.profile.linkedin}">LinkedIn</a> · <a href="${DATA.profile.github}">GitHub</a></p>`;
  }

  /* ── boot ─────────────────────────────────────────────────── */
  buildDOM();
  const canvas = $("#stage");
  let gl = null;
  try { gl = canvas.getContext("webgl2") || canvas.getContext("webgl"); } catch { /* no-op */ }
  if (!gl || !window.THREE) {
    document.body.classList.add("fallback");
    $("#loader").classList.add("done");
    return;
  }

  /* the LED room: painted once, sits behind the typography */
  function paintRoom() {
    const rc = document.getElementById("room");
    const w = (rc.width = innerWidth), h = (rc.height = innerHeight);
    const x = rc.getContext("2d");
    x.fillStyle = "#07070c"; x.fillRect(0, 0, w, h);
    const tile = Math.max(46, w / 26);
    for (let ty = -1; ty < h / tile + 1; ty++) {
      for (let tx = -1; tx < w / tile + 1; tx++) {
        const px = tx * tile, py = ty * tile;
        // edge tiles glow more, centre stays dark for the type
        const dx = Math.abs(px + tile / 2 - w / 2) / (w / 2);
        const dy = Math.abs(py + tile / 2 - h / 2) / (h / 2);
        const edge = Math.max(dx, dy);
        const r = Math.random();
        let col = "#0d0d16";
        if (r > 0.955 - edge * 0.12) col = ["#6a4fd8", "#3e5fbf", "#8f9dff", "#2a2a44"][Math.floor(Math.random() * 4)];
        x.fillStyle = col;
        x.globalAlpha = col === "#0d0d16" ? 1 : 0.24 + edge * 0.5;
        x.fillRect(px + 1.5, py + 1.5, tile - 3, tile - 3);
        x.globalAlpha = 1;
      }
    }
    // washes + vignette
    const wg = x.createRadialGradient(w * 0.15, h * 0.1, 60, w * 0.15, h * 0.1, w * 0.7);
    wg.addColorStop(0, "rgba(106,79,216,0.18)"); wg.addColorStop(1, "transparent");
    x.fillStyle = wg; x.fillRect(0, 0, w, h);
    const bg2 = x.createRadialGradient(w * 0.9, h * 0.85, 60, w * 0.9, h * 0.85, w * 0.7);
    bg2.addColorStop(0, "rgba(62,95,191,0.16)"); bg2.addColorStop(1, "transparent");
    x.fillStyle = bg2; x.fillRect(0, 0, w, h);
    const vg = x.createRadialGradient(w / 2, h / 2, h * 0.28, w / 2, h / 2, h * 0.95);
    vg.addColorStop(0, "rgba(4,4,6,0.55)"); vg.addColorStop(1, "rgba(4,4,6,0.05)");
    x.fillStyle = vg; x.fillRect(0, 0, w, h);
  }
  let roomBase = null;
  function snapRoom() {
    roomBase = document.createElement("canvas");
    const rc = document.getElementById("room");
    roomBase.width = rc.width; roomBase.height = rc.height;
    roomBase.getContext("2d").drawImage(rc, 0, 0);
  }
  paintRoom(); snapRoom();
  addEventListener("resize", () => { paintRoom(); snapRoom(); PrismScene.updateBackdrop?.(); });

  // LED ticker: tiles flicker with project names and fragments
  const LEDWORDS = [
    ...DATA.projects.map((p) => p.title.split(" ")[0].toUpperCase()),
    "KAVYA", "GROWTH OPS", "CRM", "UTM", "BUILD", "SHIP", "AI", "KOLKATA", "2026", "LIVE",
  ];
  if (!reduced) setInterval(() => {
    if (document.hidden || !roomBase) return;
    const rc = document.getElementById("room");
    const x = rc.getContext("2d");
    x.drawImage(roomBase, 0, 0);
    const tile = Math.max(46, rc.width / 26);
    for (let n = 0; n < 9; n++) {
      const tx = Math.floor(Math.random() * (rc.width / tile));
      const ty = Math.floor(Math.random() * (rc.height / tile));
      const px = tx * tile, py = ty * tile;
      const edge = Math.max(
        Math.abs(px + tile / 2 - rc.width / 2) / (rc.width / 2),
        Math.abs(py + tile / 2 - rc.height / 2) / (rc.height / 2));
      if (edge < 0.45) continue; // keep the centre calm for the type
      if (Math.random() < 0.45) {
        x.fillStyle = ["#6a4fd8", "#3e5fbf", "#8f9dff"][Math.floor(Math.random() * 3)];
        x.globalAlpha = 0.2 + Math.random() * 0.4;
        x.fillRect(px + 1.5, py + 1.5, tile - 3, tile - 3);
      } else {
        x.globalAlpha = 0.34 + edge * 0.3;
        x.fillStyle = "rgba(175,185,255,0.9)";
        x.font = `${Math.round(tile * 0.17)}px 'IBM Plex Mono', monospace`;
        x.textAlign = "center";
        x.fillText(LEDWORDS[Math.floor(Math.random() * LEDWORDS.length)], px + tile / 2, py + tile / 2 + 3);
        x.textAlign = "start";
      }
      x.globalAlpha = 1;
    }
    PrismScene.updateBackdrop?.();
  }, 340);

  /* hover: the LED tile under the cursor lights up, a new colour
     every tile. The room canvas shows through the WebGL backdrop
     plane (34×17 at z −14, camera z 7.2, fov 34°), so the cursor
     is projected through the frustum to find its tile. */
  const hoverTiles = new Map();
  let hoverHue = Math.random() * 360, lastHoverKey = "";
  if (!reduced && !mobile) addEventListener("mousemove", (e) => {
    const rc = document.getElementById("room");
    if (!rc.width) return;
    const halfH = Math.tan(17 * Math.PI / 180) * 21.2;
    const nx = (e.clientX / innerWidth) * 2 - 1;
    const ny = 1 - (e.clientY / innerHeight) * 2;
    const cx = (0.5 + (nx * halfH * (innerWidth / innerHeight)) / 34) * rc.width;
    const cy = (0.5 - (ny * halfH) / 17) * rc.height;
    const tile = Math.max(46, rc.width / 26);
    const tx = Math.floor(cx / tile), ty = Math.floor(cy / tile);
    const key = tx + "," + ty;
    if (key === lastHoverKey || hoverTiles.has(key)) return;
    lastHoverKey = key;
    hoverHue = (hoverHue + 47 + Math.random() * 130) % 360;
    hoverTiles.set(key, { tx, ty, hue: Math.round(hoverHue), life: 1.25 });
  });
  function paintHover(dt) {
    if (!hoverTiles.size || !roomBase) return;
    const rc = document.getElementById("room");
    const x = rc.getContext("2d");
    const tile = Math.max(46, rc.width / 26);
    hoverTiles.forEach((h, key) => {
      const px = h.tx * tile, py = h.ty * tile;
      x.drawImage(roomBase, px, py, tile, tile, px, py, tile, tile);
      const a = Math.min(1, h.life);
      x.globalAlpha = a * 0.85;
      x.fillStyle = `hsl(${h.hue} 85% 62%)`;
      x.fillRect(px + 1.5, py + 1.5, tile - 3, tile - 3);
      x.globalAlpha = a * 0.5;
      x.fillStyle = `hsl(${h.hue} 95% 80%)`;
      x.fillRect(px + tile * 0.2, py + tile * 0.2, tile * 0.6, tile * 0.6);
      x.globalAlpha = 1;
      h.life -= dt * 1.1;
      if (h.life <= 0) {
        x.drawImage(roomBase, px, py, tile, tile, px, py, tile, tile);
        hoverTiles.delete(key);
      }
    });
    PrismScene.updateBackdrop?.();
  }

  document.body.classList.add("webgl");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  cam.position.set(0, 0, 7.2);

  scene.add(new THREE.HemisphereLight(0xaebbdd, 0x0a0a10, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(3, 5, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0x5f7bd8, 0.8); rim.position.set(-5, -2, -4); scene.add(rim);

  const prismGroup = PrismScene.build(scene, renderer);

  /* ── water: a real ripple field follows the cursor ────────── */
  const ripple = (() => {
    if (reduced || mobile) return null;
    const c = document.getElementById("ripple");
    let W, H, cur, prev, img, rctx;
    function init() {
      W = 170; H = Math.max(60, Math.round(170 * innerHeight / innerWidth));
      c.width = W; c.height = H;
      rctx = c.getContext("2d");
      cur = new Float32Array(W * H);
      prev = new Float32Array(W * H);
      img = rctx.createImageData(W, H);
    }
    init();
    addEventListener("resize", init);
    function drop(nx, ny, s) {
      if (nx > 1 && nx < W - 2 && ny > 1 && ny < H - 2) cur[ny * W + nx] += s;
    }
    addEventListener("pointermove", (e) => {
      drop(Math.round(e.clientX / innerWidth * W), Math.round(e.clientY / innerHeight * H), 1.9);
    }, { passive: true });
    addEventListener("click", (e) => {
      drop(Math.round(e.clientX / innerWidth * W), Math.round(e.clientY / innerHeight * H), 7);
    });
    function step() {
      for (let y = 1; y < H - 1; y++) {
        const row = y * W;
        for (let x = 1; x < W - 1; x++) {
          const i = row + x;
          let v = (cur[i - 1] + cur[i + 1] + cur[i - W] + cur[i + W]) / 2 - prev[i];
          prev[i] = v * 0.972;
        }
      }
      const tmp = cur; cur = prev; prev = tmp;
      const d = img.data;
      for (let i = 0; i < W * H; i++) {
        const lum = Math.min(255, Math.abs(cur[i]) * 110);
        const o = i * 4;
        d[o] = lum * 0.72; d[o + 1] = lum * 0.82; d[o + 2] = Math.min(255, lum * 1.15);
        d[o + 3] = Math.min(150, lum * 1.35);
      }
      rctx.putImageData(img, 0, 0);
    }
    return { step };
  })();

  /* ── cursor: light bend + liquid type + prism tilt ────────── */
  let mx = 0, my = 0, vx = 0, lastX = 0, dispScale = 0;
  const light = $("#cursorlight");
  addEventListener("pointermove", (e) => {
    mx = (e.clientX / innerWidth) * 2 - 1;
    my = (e.clientY / innerHeight) * 2 - 1;
    vx = Math.abs(e.clientX - lastX); lastX = e.clientX;
    dispScale = Math.min(26, dispScale + vx * 0.35);
    if (light) light.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  }, { passive: true });
  addEventListener("click", (e) => {
    if (reduced || e.target.closest("a, button")) return;
    const r = document.createElement("i");
    r.className = "ripple";
    r.style.left = e.clientX + "px"; r.style.top = e.clientY + "px";
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 900);
  });

  /* ── act state → DOM ──────────────────────────────────────── */
  let currentKey = null;
  function setAct(a, p) {
    if (a.key !== currentKey) {
      currentKey = a.key;
      document.body.dataset.act = a.key;
      $("#actname").textContent = NAMES[a.key];
      $("#sr-live").textContent = NAMES[a.key];
    }
    $("#progress i").style.height = (p * 100).toFixed(1) + "%";
    // active project card
    if (a.project != null) {
      $$(".pcard").forEach((c) => c.classList.toggle("on", +c.dataset.idx === a.project));
    } else {
      $$(".pcard").forEach((c) => c.classList.remove("on"));
    }
  }

  /* ── morph KAVYA → WORK, drawn inside WebGL so the glass
        genuinely refracts and magnifies the letters ─────────── */
  function morph(p) {
    const m = ease(seg(p, 0.08, 0.15));
    // KAVYA hands over just before WORKS reaches the ring's front
    const heroFade = 1 - ease(seg(p, 0.078, 0.112));
    PrismScene.drawWord(m, heroFade);
    PrismScene.setWordVisible(heroFade > 0.01);
    $("#worksub").style.opacity = m * heroFade;
  }
  document.fonts?.ready.then(() => PrismScene.drawWord(0.02, 1));

  /* ── loop ─────────────────────────────────────────────────── */
  let pS = 0, t = 0, lastT = performance.now(), hudTick = 0;
  const quatEl = $("#quat"),
    gx = $("#gx"), gy = $("#gy"), gz = $("#gz"),
    gx1 = $("#gx1"), gy1 = $("#gy1"), gz1 = $("#gz1");
  function progress() {
    const doc = document.body.scrollHeight - innerHeight;
    return doc > 0 ? clamp01(scrollY / doc) : 0;
  }

  function frame() {
    requestAnimationFrame(frame);
    if (document.hidden) { lastT = performance.now(); return; }
    const now = performance.now();
    const dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
    t += dt;

    pS += (progress() - pS) * (reduced ? 1 : 1 - Math.exp(-6.5 * dt));
    paintHover(dt);

    // prism choreography: it never disappears, it travels
    const g = prismGroup;
    g.position.x = (mobile ? 0 : track(PX, pS));
    g.position.y = track(PYY, pS) + Math.sin(t * 0.8) * 0.06;
    g.position.z = track(PZ, pS);
    g.scale.setScalar(track(PSC, pS) * (mobile ? 0.78 : 1));
    g.rotation.y = t * 0.22 + pS * 5.2 + mx * 0.18;
    g.rotation.x = 0.12 + my * 0.12 + Math.sin(t * 0.5) * 0.03;

    // fragments during the process act
    const split = Math.sin(ease(seg(pS, 0.68, 0.72)) * Math.PI / 2) * (1 - ease(seg(pS, 0.745, 0.78)));
    PrismScene.setSplit(reduced ? 0 : split, t);

    morph(pS);
    const act = resolveAct(pS);
    setAct(act, pS);

    // the project globe: WORKS revolves in first (slot -1),
    // then each project rests centred at its act's centre
    const ringK = Math.min(ease(seg(pS, 0.075, 0.105)), 1 - ease(seg(pS, 0.52, 0.56)));
    const ci = Math.max(-1.7, Math.min(3.6, (pS - 0.205) / 0.09));
    PrismScene.setRing(-ci * 1.3, mobile ? ringK * 0.85 : ringK);

    // engine HUD: live quaternion + axis gizmo
    hudTick += dt;
    if (hudTick > 0.12) {
      hudTick = 0;
      const q = g.quaternion;
      quatEl.textContent = `${q.x.toFixed(2)} ${q.y.toFixed(2)} ${q.z.toFixed(2)} ${q.w.toFixed(2)}`;
      const axes = [
        [new THREE.Vector3(1, 0, 0), gx, gx1],
        [new THREE.Vector3(0, 1, 0), gy, gy1],
        [new THREE.Vector3(0, 0, 1), gz, gz1],
      ];
      for (const [v, dot, ln] of axes) {
        v.applyQuaternion(q);
        const sx = (v.x * 30).toFixed(1), sy = (-v.y * 30).toFixed(1);
        dot.setAttribute("cx", sx); dot.setAttribute("cy", sy);
        ln.setAttribute("x2", sx); ln.setAttribute("y2", sy);
      }
    }

    // liquid type decay
    dispScale *= Math.exp(-3 * dt);
    if (!reduced) $("#liquid feDisplacementMap")?.setAttribute("scale", dispScale.toFixed(1));

    if (frameNo++ % 2 === 0) ripple?.step();
    renderer.render(scene, cam);
  }
  let frameNo = 0;

  /* ── act snapping: settle on clean states ─────────────────── */
  const CENTERS = ACTS.map((a) => (a.from + a.to) / 2);
  let idleTimer = null, snapRAF = null;
  function tweenScrollTo(p) {
    cancelAnimationFrame(snapRAF);
    const doc = document.body.scrollHeight - innerHeight;
    const from = scrollY, to = p * doc, t0 = performance.now();
    const dur = Math.min(700, 240 + Math.abs(to - from) * 0.35);
    (function step(now) {
      const k = Math.min(1, (now - t0) / dur);
      scrollTo(0, from + (to - from) * (k * k * (3 - 2 * k)));
      if (k < 1) snapRAF = requestAnimationFrame(step);
    })(t0);
  }
  ["wheel", "touchstart", "keydown"].forEach((ev) =>
    addEventListener(ev, () => cancelAnimationFrame(snapRAF), { passive: true }));
  addEventListener("scroll", () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (reduced) return;
      const p = progress();
      let best = CENTERS[0];
      for (const c of CENTERS) if (Math.abs(c - p) < Math.abs(best - p)) best = c;
      if (Math.abs(best - p) > 0.004 && Math.abs(best - p) < 0.05) tweenScrollTo(best);
    }, 190);
  }, { passive: true });

  /* keyboard: arrows step acts */
  addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea")) return;
    const idx = ACTS.indexOf(resolveAct(progress()));
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); tweenScrollTo(CENTERS[Math.min(ACTS.length - 1, idx + 1)]); }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); tweenScrollTo(CENTERS[Math.max(0, idx - 1)]); }
  });

  /* nav jumps */
  $$("[data-jump]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    tweenScrollTo(+a.dataset.jump);
  }));

  function resize() {
    renderer.setSize(innerWidth, innerHeight);
    cam.aspect = innerWidth / innerHeight;
    cam.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  resize();
  frame();
  setTimeout(() => $("#loader").classList.add("done"), reduced ? 50 : 900);

  console.log("%cCreating experiences that are remembered.", "color:#9fb4e8;font-weight:bold");
  console.log("Say hi: " + DATA.profile.email);
})();
