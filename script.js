/* ============================================
   PORTFOLIO — ANIMATION ENGINE
   GSAP + ScrollTrigger + Lenis + SplitType
   ============================================ */

(() => {
  'use strict';

  // ---- Register GSAP plugins ----
  gsap.registerPlugin(ScrollTrigger);

  // ---- DOM References ----
  const cursor = document.getElementById('cursor');
  const preloader = document.getElementById('preloader');
  const preloaderNumber = document.getElementById('preloader-number');
  const preloaderBarFill = document.getElementById('preloader-bar-fill');
  const nav = document.getElementById('nav');
  const navHamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const backToTop = document.getElementById('back-to-top');

  // ---- State ----
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  const cursorSpeed = 0.15;
  let isMobile = window.innerWidth <= 768;

  /* ==========================================
     1. LENIS SMOOTH SCROLL
     ========================================== */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Connect Lenis to GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  /* ==========================================
     2. CUSTOM CURSOR + MAGNIFICATION LENS
     ========================================== */
  const lens = document.getElementById('cursor-lens');
  let lensX = 0, lensY = 0;
  let lensCurrentScale = 1;
  let lensTargetScale = 1;
  const lensSpeed = 0.12;

  if (!isMobile && cursor && lens) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      // Cursor dot — fast follow
      cursorX += (mouseX - cursorX) * cursorSpeed;
      cursorY += (mouseY - cursorY) * cursorSpeed;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;

      // Lens — slightly lagged follow
      lensX += (mouseX - lensX) * lensSpeed;
      lensY += (mouseY - lensY) * lensSpeed;
      lensCurrentScale += (lensTargetScale - lensCurrentScale) * 0.1;
      lens.style.transform = `translate3d(${lensX}px, ${lensY}px, 0) scale(${lensCurrentScale.toFixed(3)})`;

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover states — links, buttons, magnetic elements → show lens
    document.querySelectorAll('a, button, [data-cursor-magnetic]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('is-hovering');
        lens.classList.add('is-visible', 'is-hovering');
        lensTargetScale = 1.2;
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-hovering');
        lens.classList.remove('is-visible', 'is-hovering');
        lensTargetScale = 1;
      });
    });

    // View label on project cards → show larger lens
    document.querySelectorAll('[data-cursor-view]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('is-view', 'is-hovering');
        lens.classList.add('is-visible', 'is-view', 'is-hovering');
        lensTargetScale = 1.4;
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-view', 'is-hovering');
        lens.classList.remove('is-visible', 'is-view', 'is-hovering');
        lensTargetScale = 1;
      });
    });

    // Glow follow on work cards
    document.querySelectorAll('.work-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');
      });
    });
  }

  /* ==========================================
     3. PRELOADER
     ========================================== */
  function runPreloader() {
    const tl = gsap.timeline({
      onComplete: () => {
        preloader.style.pointerEvents = 'none';
        initAnimations();
      }
    });

    // Logo fade in
    tl.to('.preloader-logo', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out'
    });

    // Counter animation
    const counter = { val: 0 };
    tl.to(counter, {
      val: 100,
      duration: 2,
      ease: 'power2.inOut',
      onUpdate: () => {
        preloaderNumber.textContent = Math.floor(counter.val);
      }
    }, '-=0.3');

    // Bar fill
    tl.to(preloaderBarFill, {
      width: '100%',
      duration: 2,
      ease: 'power2.inOut'
    }, '<');

    // Hold
    tl.to({}, { duration: 0.3 });

    // Fade out inner content
    tl.to('.preloader-inner', {
      opacity: 0,
      y: -30,
      duration: 0.4,
      ease: 'power2.in'
    });

    // Wipe up
    tl.to(preloader, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.8,
      ease: 'power3.inOut'
    });

    // Remove preloader
    tl.set(preloader, { display: 'none' });
  }

  /* ==========================================
     4. SPLIT TEXT REVEALS
     ========================================== */
  function initSplitTextAnimations() {
    document.querySelectorAll('[data-split-text]').forEach(el => {
      const split = new SplitType(el, {
        types: 'chars',
        tagName: 'span'
      });

      const isHero = el.closest('.hero');

      if (isHero) {
        // Hero text will be animated in the hero timeline
        return;
      }

      gsap.from(split.chars, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'top 40%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 40,
        rotateX: -30,
        stagger: 0.02,
        duration: 0.8,
        ease: 'power3.out'
      });
    });
  }

  /* ==========================================
     5. HERO ANIMATIONS
     ========================================== */
  function initHeroAnimations() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;

    const split = new SplitType(heroTitle, {
      types: 'chars',
      tagName: 'span'
    });

    const heroTl = gsap.timeline({ delay: 0.2 });

    heroTl.to('.hero-overtitle', {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out'
    });

    // Typewriter / Writing effect
    heroTl.from(split.chars, {
      opacity: 0,
      x: -15, /* Slides in slightly from the left as if being written */
      stagger: 0.04, /* Speed of the writing */
      duration: 0.4,
      ease: 'power1.out'
    }, '-=0.3');

    heroTl.to('.hero-subtitle', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.4');

    heroTl.to('.hero-scroll-indicator', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.3');
  }

  /* ==========================================
     6. ABOUT SECTION ANIMATIONS
     ========================================== */
  function initAboutAnimations() {
    // Image parallax
    gsap.to('.about-image-wrap', {
      scrollTrigger: {
        trigger: '.about',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      },
      y: -60,
      ease: 'none'
    });

    // Text paragraphs
    gsap.utils.toArray('.about-text p').forEach((p, i) => {
      gsap.to(p, {
        scrollTrigger: {
          trigger: p,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power3.out'
      });
    });

    // Stats
    document.querySelectorAll('.stat').forEach((stat, i) => {
      gsap.to(stat, {
        scrollTrigger: {
          trigger: stat,
          start: 'top 90%',
          toggleActions: 'play none none none'
        },
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: i * 0.15,
        ease: 'power3.out'
      });
    });

    // Count up numbers
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count);
      const counter = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        onEnter: () => {
          gsap.to(counter, {
            val: target,
            duration: 1.5,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.floor(counter.val);
            }
          });
        },
        once: true
      });
    });

    // Divider line
    gsap.to('.about-divider', {
      scrollTrigger: {
        trigger: '.about-divider',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      scaleX: 1,
      duration: 1.2,
      ease: 'power3.inOut'
    });
  }

  /* ==========================================
     7. WORK / PROJECTS ANIMATIONS
     ========================================== */
  function initWorkAnimations() {
    document.querySelectorAll('.work-card').forEach((card, i) => {
      gsap.to(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 1,
        y: 0,
        duration: 0.9,
        delay: i * 0.1,
        ease: 'power3.out'
      });
    });
  }

  /* ==========================================
     8. SERVICES ACCORDION
     ========================================== */
  function initServicesAnimations() {
    // Reveal items
    document.querySelectorAll('.service-item').forEach((item, i) => {
      gsap.to(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay: i * 0.08,
        ease: 'power3.out'
      });
    });

    // Accordion toggle
    document.querySelectorAll('.service-item-header').forEach(header => {
      header.addEventListener('click', () => {
        const item = header.parentElement;
        const isOpen = item.classList.contains('is-open');

        // Close all
        document.querySelectorAll('.service-item').forEach(si => {
          si.classList.remove('is-open');
        });

        // Open clicked (if it wasn't already open)
        if (!isOpen) {
          item.classList.add('is-open');
        }

        // Refresh ScrollTrigger after accordion change
        setTimeout(() => ScrollTrigger.refresh(), 400);
      });
    });
  }

  /* ==========================================
     9. CONTACT ANIMATIONS
     ========================================== */
  function initContactAnimations() {
    gsap.to('.contact-subtext', {
      scrollTrigger: {
        trigger: '.contact-subtext',
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    });

    gsap.to('.contact-socials', {
      scrollTrigger: {
        trigger: '.contact-socials',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: 0.2,
      ease: 'power3.out'
    });

    // Magnetic email link
    const emailLink = document.getElementById('contact-email');
    if (emailLink && !isMobile) {
      emailLink.addEventListener('mousemove', (e) => {
        const rect = emailLink.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(emailLink, {
          x: x * 0.2,
          y: y * 0.3,
          duration: 0.4,
          ease: 'power2.out'
        });
      });

      emailLink.addEventListener('mouseleave', () => {
        gsap.to(emailLink, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)'
        });
      });
    }
  }

  /* ==========================================
     10. NAVIGATION
     ========================================== */
  function initNav() {
    let lastScroll = 0;
    const scrollThreshold = 100;

    lenis.on('scroll', ({ scroll }) => {
      // Add scrolled class
      if (scroll > 50) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }
    });

    // Hamburger toggle
    navHamburger.addEventListener('click', () => {
      navHamburger.classList.toggle('is-active');
      mobileMenu.classList.toggle('is-open');
      document.body.style.overflow = mobileMenu.classList.contains('is-open') ? 'hidden' : '';
    });

    // Close menu on link click
    document.querySelectorAll('.mobile-menu-link').forEach(link => {
      link.addEventListener('click', () => {
        navHamburger.classList.remove('is-active');
        mobileMenu.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });

    // Smooth scroll to sections
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          lenis.scrollTo(target, { offset: -80 });
        }
      });
    });

    // Back to top
    backToTop.addEventListener('click', () => {
      lenis.scrollTo(0);
    });
  }

  /* ==========================================
     11. PARALLAX EFFECTS
     ========================================== */
  function initParallax() {
    document.querySelectorAll('[data-parallax]').forEach(el => {
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        },
        y: -40,
        ease: 'none'
      });
    });
  }

  /* ==========================================
     12. INIT ALL
     ========================================== */
  function initAnimations() {
    initHeroAnimations();
    initSplitTextAnimations();
    initAboutAnimations();
    initWorkAnimations();
    initServicesAnimations();
    initContactAnimations();
    initParallax();
    initNav();
  }

  /* ==========================================
     11. AMBIENT FLUID BACKGROUND (APPLE STYLE)
     ========================================== */
  function initAmbientBackground() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const blobs = document.querySelectorAll('.ambient-blob');
    if (!blobs.length) return;

    const blobTweens = [];

    // Organic continuous movement
    blobs.forEach((blob) => {
      // X, Y and Scale morphing
      blobTweens.push(gsap.to(blob, {
        x: "random(-25vw, 25vw)",
        y: "random(-25vh, 25vh)",
        scale: "random(0.7, 1.4)",
        duration: "random(10, 20)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        yoyoEase: "sine.inOut"
      }));
      
      // Orbiting / Rotation
      blobTweens.push(gsap.to(blob, {
        rotation: 360,
        duration: "random(25, 45)",
        ease: "linear",
        repeat: -1
      }));
    });

    // Scroll speed reaction (fast scroll = faster liquid flow)
    let scrollTimeout;
    lenis.on('scroll', ({ velocity }) => {
      // Velocity is usually 0 to ~20-50 on heavy scrolls
      const v = Math.abs(velocity || 0);
      const targetTimeScale = 1 + Math.min(v * 0.15, 3.5); // Cap speed multiplier
      
      blobTweens.forEach(t => gsap.to(t, { timeScale: targetTimeScale, duration: 0.3, ease: "power1.out", overwrite: "auto" }));

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Return to slow ambient motion smoothly
        blobTweens.forEach(t => gsap.to(t, { timeScale: 1, duration: 1.5, ease: "power2.out", overwrite: "auto" }));
      }, 100);
    });

    // Section Colors (Change CSS Variables on root dynamically)
    const root = document.documentElement;
    
    const sectionColors = {
      '#hero':     ['#1e183a', '#c9a96e', '#140c24', '#0d1829'],
      '#about':    ['#182a5c', '#331363', '#0a1024', '#280447'],
      '#work':     ['#5c1414', '#70240b', '#2e0606', '#542308'],
      '#services': ['#043326', '#09524c', '#011c16', '#0b423f'],
      '#contact':  ['#331363', '#c9a96e', '#1e0a47', '#590e2b']
    };

    Object.keys(sectionColors).forEach(selector => {
      const section = document.querySelector(selector);
      if (section) {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 50%',
          end: 'bottom 50%',
          onEnter: () => applyColors(sectionColors[selector]),
          onEnterBack: () => applyColors(sectionColors[selector])
        });
      }
    });

    function applyColors(colors) {
      gsap.to(root, {
        '--blob-1': colors[0],
        '--blob-2': colors[1],
        '--blob-3': colors[2],
        '--blob-4': colors[3],
        duration: 2.5,
        ease: "power2.out"
      });
    }
  }

  initAmbientBackground();


  // ---- Start ----
  window.addEventListener('DOMContentLoaded', () => {
    // Stop Lenis during preloader
    lenis.stop();

    runPreloader();

    // Start Lenis after preloader (with buffer)
    setTimeout(() => {
      lenis.start();
    }, 3500);
  });

  // ---- Resize handler ----
  window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 768;
    ScrollTrigger.refresh();
  });

})();
