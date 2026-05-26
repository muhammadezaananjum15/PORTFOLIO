'use strict';
const EMAILJS_CONFIG = {
  publicKey: 'oLezYcRrHlzjNjhMf',
  serviceID: 'service_jitljbl',
  templateID: 'template_m0w60vd',
};
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const lerp = (start, end, t) => start + (end - start) * t;
function createFollower(initialX = 0, initialY = 0, speed = 0.12) {
  let x = initialX,
    y = initialY;
  let tx = initialX,
    ty = initialY;
  return {
    setTarget(nx, ny) {
      tx = nx;
      ty = ny;
    },
    tick() {
      x = lerp(x, tx, speed);
      y = lerp(y, ty, speed);
    },
    get() {
      return { x, y };
    },
  };
}
(function initLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  document.body.classList.add('loading');
  const canvas = document.getElementById('loader-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W,
      H,
      particles = [];
    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        r: Math.random() * 1.2 + 0.3,
        a: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.2 + 0.05,
        opacity: Math.random() * 0.4 + 0.05,
      });
    }
    let rafId;
    function drawParticles() {
      if (
        !document.getElementById('page-loader') ||
        document.getElementById('page-loader').classList.contains('hidden')
      ) {
        cancelAnimationFrame(rafId);
        return;
      }
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.a += p.speed * 0.008;
        p.x += Math.cos(p.a) * p.speed;
        p.y += Math.sin(p.a) * p.speed * 0.6;
        if (p.x > W + 10) p.x = -10;
        if (p.y > H + 10) p.y = -10;
        if (p.x < -10) p.x = W + 10;
        if (p.y < -10) p.y = H + 10;
        ctx.beginPath();
        ctx.arc(p.x % W, p.y % H, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
      });
      rafId = requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }
  const fill = document.getElementById('loader-progress-fill');
  const pctEl = document.getElementById('loader-pct');
  const statusEl = document.getElementById('loader-status');
  const statuses = ['Initialising', 'Loading assets', 'Building UI', 'Almost ready'];
  let pct = 0;
  let pageLoaded = false;
  const startTime = Date.now();
  const MIN_TIME = 2600;
  function setProgress(val) {
    pct = Math.min(100, Math.max(pct, val));
    if (fill) fill.style.width = pct + '%';
    if (pctEl) pctEl.textContent = Math.round(pct) + '%';
    if (statusEl) {
      const idx = pct < 25 ? 0 : pct < 55 ? 1 : pct < 80 ? 2 : 3;
      statusEl.textContent = statuses[idx];
    }
  }
  let target = 0;
  let animFrame;
  function tweenProgress() {
    const gap = target - pct;
    if (gap > 0.2) {
      setProgress(pct + gap * 0.07);
      animFrame = requestAnimationFrame(tweenProgress);
    } else {
      setProgress(target);
      if (target >= 100) hideLoader();
    }
  }

  const steps = [
    { at: 200, val: 20 },
    { at: 600, val: 45 },
    { at: 1100, val: 65 },
    { at: 1700, val: 82 },
    { at: 2200, val: 92 },
  ];
  steps.forEach((s) =>
    setTimeout(() => {
      target = s.val;
      cancelAnimationFrame(animFrame);
      tweenProgress();
    }, s.at),
  );

  window.addEventListener('load', () => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_TIME - elapsed);
    pageLoaded = true;
    setTimeout(() => {
      target = 100;
      cancelAnimationFrame(animFrame);
      tweenProgress();
    }, remaining);
  });

  function hideLoader() {
    setTimeout(() => {
      loader.classList.add('exiting');
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.classList.remove('loading');
      }, 600);
    }, 200);
  }
})();
(function initNavbar() {
  const navbar = document.getElementById('main-navbar');
  if (!navbar) return;

  const navLinks = navbar.querySelectorAll('.nav-link[data-section]');

  const sectionMap = {};
  navLinks.forEach((link) => {
    const el = document.getElementById(link.dataset.section);
    if (el) sectionMap[link.dataset.section] = el;
  });

  function onScroll() {
    const scrollY = window.scrollY;

    navbar.classList.toggle('scrolled', scrollY > 60);

    let active = '';
    const offset = navbar.offsetHeight + 20;

    for (const [id, el] of Object.entries(sectionMap)) {
      const top = el.getBoundingClientRect().top;
      const bottom = el.getBoundingClientRect().bottom;
      if (top <= offset && bottom >= offset) {
        active = id;
        break;
      }
    }

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.section === active);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const collapse = document.getElementById('navbarNav');
  if (collapse) {
    const bsCol = new bootstrap.Collapse(collapse, { toggle: false });
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 992) bsCol.hide();
      });
    });
    const cta = navbar.querySelector('.btn-nav-cta');
    if (cta)
      cta.addEventListener('click', () => {
        if (window.innerWidth < 992) bsCol.hide();
      });
  }
})();
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      resetParticles();
    }, 150);
  });

  const COUNT = window.innerWidth < 768 ? 50 : 110;
  let particles = [];

  function makeParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.05,
      tier: Math.floor(Math.random() * 3),
    };
  }

  function resetParticles() {
    particles = Array.from({ length: COUNT }, makeParticle);
  }
  resetParticles();

  let mouseX = canvas.width / 2,
    mouseY = canvas.height / 2;
  document.addEventListener(
    'mousemove',
    (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    },
    { passive: true },
  );

  const MAX_DIST_SQ = 130 * 130;

  function drawConnections() {
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dSq = dx * dx + dy * dy;
        if (dSq < MAX_DIST_SQ) {
          const t = 1 - Math.sqrt(dSq) / 130;
          const opacity = t * 0.18;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const dx = (mouseX - cx) / cx;
    const dy = (mouseY - cy) / cy;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      const speed = [0.06, 0.12, 0.2][p.tier];
      const px = dx * speed;
      const py = dy * speed;
      if (p.x + px < 0) p.x = canvas.width;
      else if (p.x + px > canvas.width) p.x = 0;
      if (p.y + py < 0) p.y = canvas.height;
      else if (p.y + py > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x + px, p.y + py, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.fill();
    });

    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();
})();
(function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const words = ['Products', 'Starts with', 'One Developer', 'Who Givves a'];

  let wIdx = 0;
  let cIdx = 0;
  let deleting = false;
  let speed = 110;

  function tick() {
    const word = words[wIdx];

    if (deleting) {
      el.textContent = word.slice(0, cIdx - 1);
      cIdx--;
      speed = 50;
    } else {
      el.textContent = word.slice(0, cIdx + 1);
      cIdx++;
      speed = 110;
    }

    if (!deleting && cIdx === word.length) {
      speed = 1800;
      deleting = true;
    } else if (deleting && cIdx === 0) {
      deleting = false;
      wIdx = (wIdx + 1) % words.length;
      speed = 400;
    }

    setTimeout(tick, speed);
  }
  setTimeout(tick, 1200);
})();

(function initScrollReveal() {
  const selectors = [
    '.reveal-element',
    '.reveal-left',
    '.reveal-right',
    '.reveal-scale',
    '.stagger-children',
  ];

  const elements = document.querySelectorAll(selectors.join(','));
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        el.classList.add('revealed');

        activateSkillBars(el);

        activateCounters(el);
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px',
    },
  );

  elements.forEach((el) => observer.observe(el));
})();
function activateCounters(parent) {
  const counters = parent.querySelectorAll('.stat-number, .exp-number');
  counters.forEach((counter) => {
    if (counter.dataset.counted) return;
    counter.dataset.counted = 'true';

    const target = parseInt(counter.dataset.count, 10);
    const duration = 2000;
    const frameTime = 1000 / 60;
    const totalFrames = Math.round(duration / frameTime);
    let frame = 0;
    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    const timer = setInterval(() => {
      frame++;
      const progress = easeOutExpo(frame / totalFrames);
      counter.textContent = Math.round(progress * target).toLocaleString();

      if (frame >= totalFrames) {
        counter.textContent = target.toLocaleString();
        clearInterval(timer);
      }
    }, frameTime);
  });
}
function activateSkillBars(parent) {
  const bars = parent.querySelectorAll('.skill-bar');
  bars.forEach((bar) => {
    const fill = bar.querySelector('.skill-bar-fill');
    if (!fill || fill.dataset.animated) return;
    fill.dataset.animated = 'true';
    setTimeout(() => {
      fill.style.width = bar.dataset.width + '%';
    }, 250);
  });
}
(function observeSkillCards() {
  const cards = document.querySelectorAll('.skill-badge-card');
  if (!cards.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activateSkillBars(entry.target);
          activateCounters(entry.target);
        }
      });
    },
    { threshold: 0.25 },
  );

  cards.forEach((c) => obs.observe(c));
  setTimeout(() => {
    const front = document.getElementById('cat-frontend');
    if (front) activateSkillBars(front);
  }, 2400);
})();

(function observeStats() {
  const row = document.querySelector('.about-stats-row');
  if (!row) return;
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activateCounters(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 },
  );
  obs.observe(row);
})();

(function observeExpBadge() {
  const badge = document.querySelector('.about-exp-badge');
  if (!badge) return;
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activateCounters(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );
  obs.observe(badge);
})();
(function initSkillTabs() {
  const tabs = document.querySelectorAll('.skill-tab');
  const categories = document.querySelectorAll('.skills-category');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.category;
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      categories.forEach((cat) => {
        const isTarget = cat.id === 'cat-' + target;
        cat.classList.toggle('active', isTarget);
        if (isTarget) {
          const revealEls = cat.querySelectorAll('.reveal-element');
          revealEls.forEach((el, i) => {
            el.classList.remove('revealed');
            setTimeout(() => {
              el.classList.add('revealed');
              activateSkillBars(el);
            }, i * 70);
          });
        }
      });
    });
  });
})();
(function initTimeline() {
  const entries = document.querySelectorAll('.timeline-entry');
  if (!entries.length) return;

  const obs = new IntersectionObserver(
    (obsEntries) => {
      obsEntries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -50px 0px' },
  );

  entries.forEach((e) => obs.observe(e));
})();
(function initCardTilt() {
  if (!window.matchMedia('(min-width: 769px) and (pointer: fine)').matches) return;

  const cards = document.querySelectorAll('.project-card');
  const MAX_TILT = 8;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const tiltX = clamp(-dy * MAX_TILT, -MAX_TILT, MAX_TILT);
      const tiltY = clamp(dx * MAX_TILT, -MAX_TILT, MAX_TILT);

      card.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-12px) scale(1.01)`;
      card.style.transition = 'transform 0.1s linear, box-shadow 0.1s linear';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition =
        'transform 0.55s var(--ease-bounce), box-shadow 0.4s var(--ease), border-color 0.4s var(--ease)';
    });
  });
})();
(function initSkillCardGlow() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  document.addEventListener(
    'mousemove',
    (e) => {
      const cards = document.querySelectorAll('.skill-badge-card:hover');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const mx = ((e.clientX - rect.left) / rect.width) * 100;
        const my = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', mx + '%');
        card.style.setProperty('--my', my + '%');
      });
    },
    { passive: true },
  );
})();
(function initMagneticButtons() {
  if (!window.matchMedia('(min-width: 769px) and (pointer: fine)').matches) return;

  const MAGNETISM = 0.35;
  const THRESHOLD = 50;

  const btns = document.querySelectorAll(
    '.btn-primary-cta, .btn-secondary-cta, .btn-nav-cta, .hero-social-link, .footer-social, .contact-social-icon',
  );

  btns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < THRESHOLD) {
        const ox = dx * MAGNETISM;
        const oy = dy * MAGNETISM;
        btn.style.setProperty('--mx', ox + 'px');
        btn.style.setProperty('--my', oy + 'px');
        btn.style.transform = `translate(${ox}px, ${oy}px)`;
      }
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();
(function initContactForm() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_CONFIG.publicKey);
  }

  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const msgDiv = document.getElementById('form-message');
  if (!form) return;

  function setError(fieldId, message) {
    document.getElementById(fieldId)?.classList.add('input-error');
    const errId = fieldId.replace('form-', '') + '-error';
    const errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = message;
  }

  function clearError(fieldId) {
    document.getElementById(fieldId)?.classList.remove('input-error');
    const errId = fieldId.replace('form-', '') + '-error';
    const errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = '';
  }

  function validate(data) {
    let valid = true;
    ['form-name', 'form-email', 'form-subject', 'form-msg-area'].forEach(clearError);

    if (!data.from_name?.trim()) {
      setError('form-name', 'Please enter your full name.');
      valid = false;
    } else if (data.from_name.trim().length < 2) {
      setError('form-name', 'Name must be at least 2 characters.');
      valid = false;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.reply_to?.trim()) {
      setError('form-email', 'Please enter your email address.');
      valid = false;
    } else if (!emailRe.test(data.reply_to.trim())) {
      setError('form-email', 'Please enter a valid email address.');
      valid = false;
    }

    if (!data.subject?.trim()) {
      setError('form-subject', 'Please enter a subject.');
      valid = false;
    }

    if (!data.message?.trim()) {
      setError('form-msg-area', 'Please enter your message.');
      valid = false;
    } else if (data.message.trim().length < 20) {
      setError('form-msg-area', 'Message must be at least 20 characters.');
      valid = false;
    }

    return valid;
  }
  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.querySelector('.submit-text').style.display = loading ? 'none' : 'inline-flex';
    submitBtn.querySelector('.submit-loading').style.display = loading ? 'inline-flex' : 'none';
  }
  function showMessage(type, text) {
    const icon =
      type === 'success'
        ? '<i class="fa-solid fa-circle-check"></i>'
        : '<i class="fa-solid fa-circle-exclamation"></i>';
    msgDiv.className = 'form-message ' + type;
    msgDiv.innerHTML = icon + ' ' + text;
    msgDiv.style.animation = 'fadeUp 0.4s var(--ease) both';
    msgDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    setTimeout(() => {
      msgDiv.className = 'form-message';
      msgDiv.innerHTML = '';
    }, 7000);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Build data object for validation only
    const data = {
      from_name: form.querySelector('#form-name')?.value ?? '',
      reply_to: form.querySelector('#form-email')?.value ?? '',
      subject: form.querySelector('#form-subject')?.value ?? '',
      message: form.querySelector('#form-msg-area')?.value ?? '',
    };

    if (!validate(data)) return;

    setLoading(true);
    msgDiv.className = 'form-message';
    msgDiv.innerHTML = '';

    try {
      if (typeof emailjs === 'undefined') {
        throw new Error('EmailJS SDK not loaded. Check the CDN script tag.');
      }
const t = document.createElement('input');
t.type = 'hidden';
t.name = 'time';
t.value = new Date().toLocaleString();
form.appendChild(t);
await emailjs.sendForm(EMAILJS_CONFIG.serviceID, EMAILJS_CONFIG.templateID, form);
form.removeChild(t);
      showMessage('success', "Message sent! I'll get back to you within 24 hours.");
      form.reset();
    } catch (err) {
      console.error('[EmailJS]', err);
      showMessage(
        'error',
        'Something went wrong. Please email me directly at <strong>muhammadezaananjum.15@gmail.com</strong>',
      );
    } finally {
      setLoading(false);
    }
  });

  form.querySelectorAll('.form-control-custom').forEach((input) => {
    input.addEventListener('input', () => clearError(input.id));
    input.addEventListener('focus', () => {
      const label = input.previousElementSibling;
      if (label?.classList.contains('form-label-custom')) {
        label.style.color = 'var(--clr-white)';
      }
    });
    input.addEventListener('blur', () => {
      const label = input.previousElementSibling;
      if (label?.classList.contains('form-label-custom')) {
        label.style.color = '';
      }
    });
  });
})();
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener(
    'scroll',
    () => {
      btn.classList.toggle('visible', window.scrollY > 500);
    },
    { passive: true },
  );

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
(function updateYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const hash = anchor.getAttribute('href');

      if (hash === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      const navH = document.getElementById('main-navbar')?.offsetHeight ?? 76;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
(function initRipple() {
  if (!document.getElementById('ripple-kf')) {
    const style = document.createElement('style');
    style.id = 'ripple-kf';
    style.textContent = `
      @keyframes rippleAnim {
        to { transform: scale(100); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  const targets = document.querySelectorAll(
    '.btn-primary-cta, .btn-secondary-cta, .btn-form-submit, .btn-nav-cta, .project-link-btn, .btn-outline-view-all',
  );

  targets.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const ripple = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      const size = 6;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position:absolute;
        width:${size}px; height:${size}px;
        left:${x}px; top:${y}px;
        background:currentColor;
        opacity:0.25;
        border-radius:50%;
        transform:scale(0);
        animation:rippleAnim 0.55s linear forwards;
        pointer-events:none;
        z-index:0;
      `;
      btn.style.overflow = 'hidden';
      btn.style.position = btn.style.position || 'relative';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
})();
(function initTestimonialTilt() {
  if (!window.matchMedia('(min-width: 769px) and (pointer: fine)').matches) return;

  document.querySelectorAll('.testimonial-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      card.style.transform = `perspective(700px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg) translateY(-8px)`;
      card.style.transition = 'transform 0.1s linear';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = '';
    });
  });
})();
(function initBadgeHover() {
  document.querySelectorAll('.floating-badge').forEach((b) => {
    b.addEventListener('mouseenter', () => {
      b.style.animationPlayState = 'paused';
    });
    b.addEventListener('mouseleave', () => {
      b.style.animationPlayState = '';
    });
  });
})();
(function initNavLinkHoverEffect() {
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') link.click();
    });
  });
})();
