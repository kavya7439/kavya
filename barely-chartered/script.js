// ============================================
// barely chartered v5 — interactions
// ============================================

(() => {
  // nav shrink
  const nav = document.getElementById('nav');
  const handleScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ambient cursor light
  const light = document.getElementById('cursorLight');
  let lx = 0, ly = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
  (function tick() {
    lx += (tx - lx) * 0.1;
    ly += (ty - ly) * 0.1;
    if (light) light.style.transform = `translate(${lx}px, ${ly}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  })();

  // reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const parent = entry.target.parentElement;
        const siblings = Array.from(parent.querySelectorAll(':scope > .reveal'));
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${Math.min(idx, 6) * 80}ms`;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // ============================================
  // INTRO — the email from CFA Institute
  // paper-open sound + result reveal, then enter
  // ============================================
  const intro = document.getElementById('intro');
  const introOpen = document.getElementById('introOpen');
  const introEnv = document.getElementById('introEnv');

  // top scroll-progress bar
  const scrollProgress = document.getElementById('scrollProgress');
  const setScrollProgress = () => {
    if (!scrollProgress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    scrollProgress.style.width = (p * 100).toFixed(2) + '%';
  };
  window.addEventListener('scroll', setScrollProgress, { passive: true });
  setScrollProgress();

  // lime spark burst (fires when the score crosses 1600)
  function sparkBurst(x, y) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const N = 18;
    for (let i = 0; i < N; i++) {
      const s = document.createElement('span');
      s.className = 'spark';
      const ang = (Math.PI * 2 * i) / N + Math.random() * 0.5;
      const dist = 55 + Math.random() * 70;
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      s.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 860);
    }
  }

  // envelope-open sound: soft paper swell + a two-note reveal chime
  let audioCtx = null;
  const playOpenSound = () => {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const t0 = audioCtx.currentTime;
      const dur = 0.5;
      const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * dur, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const p = i / d.length;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - p, 1.4) * Math.min(p * 6, 1);
      }
      const noise = audioCtx.createBufferSource(); noise.buffer = buf;
      const hp = audioCtx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1300;
      const g = audioCtx.createGain(); g.gain.value = 0.16;
      noise.connect(hp); hp.connect(g); g.connect(audioCtx.destination); noise.start(t0);
      [[880, 0.85], [1318.5, 0.98]].forEach(([f, t]) => {
        const o = audioCtx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const gg = audioCtx.createGain();
        gg.gain.setValueAtTime(0, t0 + t);
        gg.gain.linearRampToValueAtTime(0.15, t0 + t + 0.02);
        gg.gain.exponentialRampToValueAtTime(0.001, t0 + t + 0.5);
        o.connect(gg); gg.connect(audioCtx.destination);
        o.start(t0 + t); o.stop(t0 + t + 0.55);
      });
    } catch (e) { /* no audio, fail silently */ }
  };

  if (intro) {
    document.body.style.overflow = 'hidden';

    const enter = () => {
      if (intro.classList.contains('opening')) return;
      playOpenSound();
      intro.classList.add('opening');
      setTimeout(() => {
        intro.classList.add('opened');
        document.body.style.overflow = '';
        setTimeout(() => {
          updateMpsRail();
          setTimeout(() => { intro.remove(); }, 500);
        }, 100);
      }, 1700);
    };

    intro.addEventListener('click', enter);
    [introOpen, introEnv].forEach((el) => {
      if (el) el.addEventListener('click', (e) => { e.stopPropagation(); enter(); });
    });
    if (introEnv) {
      introEnv.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(); }
      });
    }
    document.addEventListener('keydown', function onKey(e) {
      if (!intro || intro.classList.contains('opening') || intro.classList.contains('opened')) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        enter();
      }
    });
  }

  // ============================================
  // MPS RAIL — left side, drop falls 1000 → 1900
  // 1600 lands precisely when Book section centers
  // ============================================
  const mpsRail = document.getElementById('mpsRail');
  const mpsDrop = document.getElementById('mpsDrop');
  const mpsDropScore = document.getElementById('mpsDropScore');
  const mpsTrackFill = document.getElementById('mpsTrackFill');
  const mpsPopup = document.getElementById('mpsPopup');
  const mpsPopupClose = document.getElementById('mpsPopupClose');
  const bookSection = document.getElementById('book');

  // Crossing-based popup: fires every time score crosses 1600 going up.
  // Closing it just hides — next upward crossing fires it again.
  let lastScore = 1000;
  let popupVisibleNow = false;

  const closePopup = () => {
    mpsPopup?.classList.remove('visible');
    popupVisibleNow = false;
  };

  if (mpsPopupClose) mpsPopupClose.addEventListener('click', closePopup);
  document.getElementById('mpsPopupCta')?.addEventListener('click', closePopup);

  const updateMpsRail = () => {
    if (!mpsRail || !bookSection) return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    // Anchor: 1600 should land exactly when Book section centers in viewport
    const bookCenterPx = bookSection.offsetTop + bookSection.offsetHeight / 2 - window.innerHeight / 2;
    const bookCenter = Math.max(0, Math.min(bookCenterPx, docHeight));

    let score;
    if (scrollTop <= bookCenter && bookCenter > 0) {
      // 1000 → 1600 over the first segment
      const pct = scrollTop / bookCenter;
      score = 1000 + pct * 600;
    } else {
      // 1600 → 1900 over the remaining segment
      const remaining = Math.max(1, docHeight - bookCenter);
      const pct = (scrollTop - bookCenter) / remaining;
      score = 1600 + Math.min(pct, 1) * 300;
    }

    score = Math.max(1000, Math.min(1900, Math.round(score)));
    if (mpsDropScore) mpsDropScore.textContent = score.toLocaleString();

    // Position the drop on the rail at its NUMERICAL position
    // (matches the tick layout: 1000=0%, 1900=100% from top)
    const railHeight = mpsRail.offsetHeight;
    const dropPct = (score - 1000) / 900; // 0 → 1
    const dropY = dropPct * railHeight;
    if (mpsDrop) mpsDrop.style.transform = `translateY(${dropY}px)`;

    if (mpsTrackFill) mpsTrackFill.style.height = `${dropPct * 100}%`;

    if (score >= 1600) mpsRail.classList.add('passed');
    else mpsRail.classList.remove('passed');

    // Popup logic: fire on EVERY upward crossing of 1600 when book is visible
    const bookRect = bookSection.getBoundingClientRect();
    const bookVisible = bookRect.top < window.innerHeight * 0.65 && bookRect.bottom > 0;
    const crossedUp = lastScore < 1600 && score >= 1600;
    const crossedDown = lastScore >= 1600 && score < 1600;

    if (crossedUp && bookVisible) {
      mpsPopup?.classList.add('visible');
      popupVisibleNow = true;
      if (mpsDrop) {
        const r = mpsDrop.getBoundingClientRect();
        sparkBurst(r.left + r.width / 2, r.top + r.height / 2);
      }
    }
    // If score drops below 1600 and the popup is still open, hide it.
    // Next upward crossing will show it again.
    if (crossedDown && popupVisibleNow) {
      closePopup();
    }
    lastScore = score;

    // Show the rail after a small scroll (only after intro is gone)
    const introGone = !intro || intro.classList.contains('opened') || !document.body.contains(intro);
    if (introGone && scrollTop > 80) {
      mpsRail.classList.add('visible');
    } else if (scrollTop <= 80) {
      mpsRail.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', updateMpsRail, { passive: true });
  window.addEventListener('resize', updateMpsRail, { passive: true });
  updateMpsRail();

  // ============================================
  // TORCHLIGHT report card
  // ============================================
  const stage = document.getElementById('reportStage');
  const overlay = document.getElementById('reportOverlay');
  if (stage && overlay) {
    let rect = stage.getBoundingClientRect();
    const refresh = () => { rect = stage.getBoundingClientRect(); };
    window.addEventListener('resize', refresh, { passive: true });
    window.addEventListener('scroll', refresh, { passive: true });

    const set = (clientX, clientY) => {
      overlay.style.setProperty('--mx', `${clientX - rect.left}px`);
      overlay.style.setProperty('--my', `${clientY - rect.top}px`);
    };

    stage.addEventListener('mousemove', (e) => {
      stage.classList.add('touched');
      set(e.clientX, e.clientY);
    });
    stage.addEventListener('touchmove', (e) => {
      if (!e.touches[0]) return;
      stage.classList.add('touched');
      set(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    overlay.style.setProperty('--mx', '50%');
    overlay.style.setProperty('--my', '20%');
  }

  // ============================================
  // ENVELOPE click to open
  // ============================================
  const envelope = document.getElementById('envelope');
  if (envelope) {
    const open = () => envelope.classList.add('opened');
    const close = () => envelope.classList.remove('opened');

    envelope.addEventListener('click', (e) => {
      // ignore clicks on the close button — handled below
      if (e.target.closest('.env-close')) return;
      if (envelope.classList.contains('opened')) return;
      open();
    });

    envelope.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (envelope.classList.contains('opened')) close();
        else open();
      }
      if (e.key === 'Escape' && envelope.classList.contains('opened')) close();
    });

    const closeBtn = envelope.querySelector('.env-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        close();
      });
    }
  }

  // ============================================
  // BROADCAST clock
  // ============================================
  const clockEl = document.getElementById('broadcastTime');
  if (clockEl) {
    const updateClock = () => {
      const d = new Date();
      clockEl.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };
    updateClock();
    setInterval(updateClock, 30000);
  }

  // ============================================
  // counters
  // ============================================
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.counter);
      const duration = 1500;
      const start = performance.now();
      const tickFn = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(eased * target).toLocaleString();
        if (t < 1) requestAnimationFrame(tickFn);
      };
      requestAnimationFrame(tickFn);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-counter]').forEach((c) => counterIO.observe(c));

  // ============================================
  // magnetic buttons
  // ============================================
  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mouseenter', () => { btn.style.transition = 'transform 0.15s ease-out'; });
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
      btn.style.transform = 'translate(0, 0)';
    });
  });

  // ============================================
  // 3D tilt
  // ============================================
  document.querySelectorAll('.tilt').forEach((card) => {
    let r;
    card.addEventListener('mouseenter', () => {
      r = card.getBoundingClientRect();
      card.style.transition = 'transform 0.2s ease-out, border-color 0.4s';
    });
    card.addEventListener('mousemove', (e) => {
      if (!r) return;
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(1000px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s';
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  // ============================================
  // hero parallax
  // ============================================
  const heroHeadline = document.querySelector('.hero-headline');
  if (heroHeadline) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < 900) {
        heroHeadline.style.transform = `translateY(${y * 0.1}px)`;
        heroHeadline.style.opacity = Math.max(0, 1 - y / 700);
      }
    }, { passive: true });
  }

  // ============================================
  // form submit (mockup behavior)
  // ============================================
  const handleForm = (form, label) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // simple HTML5 validity check
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.innerHTML = 'sending...';
      btn.disabled = true;
      btn.style.opacity = '0.7';
      setTimeout(() => {
        btn.innerHTML = '✓ got it, check your inbox';
        btn.style.background = 'var(--pop)';
        btn.style.color = '#000';
        setTimeout(() => {
          form.reset();
          btn.innerHTML = original;
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.style.background = '';
          btn.style.color = '';
        }, 2800);
      }, 900);
      // production: POST to Make.com webhook → Google Sheet
      console.log(`[${label}] submitted`, Object.fromEntries(new FormData(form)));
    });
  };
  const trackerForm = document.getElementById('trackerForm');
  const bookForm = document.getElementById('bookForm');
  if (trackerForm) handleForm(trackerForm, 'tracker');
  if (bookForm) handleForm(bookForm, 'book');

  // ============================================
  // subtle scroll parallax on big section numbers (depth)
  // ============================================
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    const pxEls = document.querySelectorAll('.sec-num, .gap-icon');
    let pxTicking = false;
    const runParallax = () => {
      const vh = window.innerHeight;
      pxEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const off = (r.top + r.height / 2 - vh / 2) / vh; // -0.5..0.5
        el.style.transform = `translateY(${(off * 26).toFixed(1)}px)`;
      });
      pxTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!pxTicking) { pxTicking = true; requestAnimationFrame(runParallax); }
    }, { passive: true });
    runParallax();
  }
})();
