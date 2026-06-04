/* =========================================================
  HERO + GLOBAL ENTRANCE ANIMATIONS
  ========================================================= */
(function initGSAP() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from(".nav", { y: -30, opacity: 0, duration: 0.6, clearProps: "transform" })
    .from(".hero-name .mask > span", { opacity: 0, stagger: 0.12, duration: 0.55, ease: "power1.inOut" }, "-=0.1")
    .from(".hero-sub", { y: 16, opacity: 0, duration: 0.5 }, "-=0.4")
    .from(".hero-actions .btn", { y: 16, opacity: 0, stagger: 0.08, duration: 0.45 }, "-=0.35");
  gsap.from(".proyectos-bg-label span", {
    opacity: 0,
    y: 20,
    duration: 0.7,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".proyectos-section",
      start: "top 85%"
    }
  });
})();

/* =========================================================
   CONTACT PANEL ENTRANCE (RIGHT SIDE)
   ========================================================= */
(function initContactSlideIn() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const panel = document.querySelector(".contact-panel");
  if (!panel) return;

  const links = panel.querySelectorAll(".contact-link");

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    scrollTrigger: {
      trigger: panel,
      start: "top 88%",
      toggleActions: "play none none none"
    }
  });

  tl.from(panel, {
    x: 170,
    opacity: 0,
    duration: 0.78
  }).from(
    links,
    {
      x: 60,
      opacity: 0,
      stagger: 0.1,
      duration: 0.42
    },
    "-=0.42"
  );
})();

/* =========================================================
   PROJECTS — desktop hover shelf + mobile carousel
   ========================================================= */
(function initProjects() {
  const wraps = Array.from(document.querySelectorAll(".card-wrap"));
  const cardsContainer = document.querySelector(".cards");
  const circleEl = document.querySelector(".projects-transition-circle");
  const bgLabel = document.getElementById("proyectosBgLabel");
  if (!wraps.length || !cardsContainer) return;

  /* ---- color helpers ---- */
  function hexToHsl(hex) {
    let r = parseInt(hex.slice(1,3),16)/255;
    let g = parseInt(hex.slice(3,5),16)/255;
    let b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max+min)/2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case r: h=((g-b)/d+(g<b?6:0))/6; break;
        case g: h=((b-r)/d+2)/6; break;
        default: h=((r-g)/d+4)/6;
      }
    }
    return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
  }
  function darkerHsl(hex, off) {
    const [h,s,l] = hexToHsl(hex);
    return `hsl(${h},${s}%,${Math.max(0,l-off)}%)`;
  }
  let lastActiveColor = null;

  function applyColor(color, expandCircle) {
    if (circleEl && window.gsap) {
      gsap.to(circleEl, { fill: color, duration: 0.45, ease: "power2.out" });
      if (expandCircle) {
        gsap.to(circleEl, { attr: { r: 145 }, duration: 1.4, ease: "power1.out" });
        lastActiveColor = color;
      } else {
        gsap.to(circleEl, { attr: { r: 0 }, duration: 0.9, ease: "power2.in" });
      }
    }
    const span = bgLabel ? bgLabel.querySelector("span") : null;
    if (expandCircle) {
      if (span) span.style.textShadow = "none";
    } else {
      const shadowColor = lastActiveColor || color;
      if (span) span.style.textShadow = `0 0 60px ${shadowColor}22, 0 0 120px ${shadowColor}11`;
    }
    if (bgLabel) bgLabel.style.color = null;
  }

  const defaultColor = wraps[0].dataset.circleColor || "#4CC9B1";
  applyColor(defaultColor);

  /* ---- layout mode ---- */
  const DESKTOP_BP = 700;

  /* ===================== DESKTOP: centered expand on click ===================== */
  function initDesktop() {
    const section = document.getElementById("projects");

    wraps.forEach((wrap) => {
      function activate() {
        wraps.forEach(w => w.classList.remove("is-active"));
        wrap.classList.add("is-active");
        if (section) section.classList.add("has-active");
        applyColor(wrap.dataset.circleColor || defaultColor, true);
      }
      function deactivate() {
        wrap.classList.remove("is-active");
        if (section) section.classList.remove("has-active");
        applyColor(defaultColor, false);
      }

      wrap.addEventListener("click", () => {
        if (wrap.classList.contains("is-active")) {
          deactivate();
        } else {
          activate();
        }
      });
    });
  }

  /* ===================== MOBILE: carousel ===================== */
  function initMobile() {
    const state = { current: 0, animating: false };

    gsap.set(wraps, {
      xPercent: -50, yPercent: -50,
      left: "50%", top: "48%",
      transformOrigin: "center center"
    });

    function relativeIndex(index) {
      const total = wraps.length;
      let delta = index - state.current;
      if (delta >  total/2) delta -= total;
      if (delta < -total/2) delta += total;
      return delta;
    }

    function getStepDistance(abs) {
      const w = window.innerWidth;
      if (abs === 1) return w * 0.33;
      if (abs === 2) return w * 0.56;
      return w * 0.70;
    }

    function stateFromDelta(delta) {
      const abs = Math.abs(delta);
      const dir = delta === 0 ? 0 : delta / abs;
      if (abs === 0) return { x:0, scale:1,    opacity:1,    zIndex:40, pointerEvents:"auto" };
      if (abs === 1) return { x:dir*getStepDistance(1), scale:0.78, opacity:0.6, zIndex:30, pointerEvents:"none" };
      return               { x:dir*getStepDistance(3), scale:0.66, opacity:0,   zIndex:10, pointerEvents:"none" };
    }

    function render(immediate) {
      wraps.forEach((wrap, i) => {
        const vs = stateFromDelta(relativeIndex(i));
        gsap.to(wrap, { x:vs.x, scale:vs.scale, opacity:vs.opacity, zIndex:vs.zIndex,
          duration: immediate ? 0 : 0.34, ease:"power2.out",
          onStart() { wrap.style.pointerEvents = vs.pointerEvents; }
        });
      });
    }

    function go(dir) {
      if (state.animating) return;
      state.animating = true;
      state.current = (state.current + dir + wraps.length) % wraps.length;
      render(false);
      applyColor(wraps[state.current].dataset.circleColor || defaultColor);
      setTimeout(() => { state.animating = false; }, 360);
    }

    /* touch swipe */
    let tStartX=0, tStartY=0, tDX=0, tDY=0, tracking=false;
    cardsContainer.addEventListener("touchstart", e => {
      if (!e.touches.length) return;
      tStartX = e.touches[0].clientX; tStartY = e.touches[0].clientY;
      tDX = tDY = 0; tracking = true;
    }, { passive: true });
    cardsContainer.addEventListener("touchmove", e => {
      if (!tracking || !e.touches.length) return;
      tDX = e.touches[0].clientX - tStartX;
      tDY = e.touches[0].clientY - tStartY;
      if (Math.abs(tDX) > Math.abs(tDY) * 1.2) e.preventDefault();
    }, { passive: false });
    function onTouchEnd() {
      if (!tracking) return; tracking = false;
      if (Math.abs(tDX) > Math.abs(tDY)*1.2 && Math.abs(tDX) > 45) go(tDX < 0 ? 1 : -1);
    }
    cardsContainer.addEventListener("touchend",   onTouchEnd, { passive: true });
    cardsContainer.addEventListener("touchcancel", onTouchEnd, { passive: true });

    /* mouse drag */
    let mStartX=null, mDX=0, mTracking=false;
    cardsContainer.addEventListener("mousedown", e => {
      e.preventDefault(); mStartX = e.clientX; mDX = 0; mTracking = false;
    });
    window.addEventListener("mousemove", e => {
      if (mStartX === null) return;
      mDX = e.clientX - mStartX;
      if (!mTracking && Math.abs(mDX) > 6) {
        mTracking = true;
        cardsContainer.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
      }
    });
    window.addEventListener("mouseup", () => {
      if (mStartX === null) return;
      mStartX = null;
      if (mTracking) {
        mTracking = false;
        cardsContainer.style.cursor = "";
        document.body.style.userSelect = "";
        if (Math.abs(mDX) > 45) go(mDX < 0 ? 1 : -1);
      }
    });

    window.addEventListener("resize", () => render(true));
    render(true);
  }

  /* ---- init by breakpoint ---- */
  if (window.innerWidth >= DESKTOP_BP) {
    initDesktop();
  } else {
    initMobile();
  }
})();



/* =========================================================
   HERO DISSOLVE ON SCROLL
   ========================================================= */
(function initHeroDissolveLite() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const hero = document.getElementById("hero");
  const heroGrid = hero ? hero.querySelector(".hero-grid") : null;
  const marquee = hero ? hero.querySelector(".marquee") : null;
  const blob = document.getElementById("cursorBlob");
  if (!hero || !heroGrid) return;

  let dustLayer = null;
  let dissolveTimeline = null;

  function getDustLayer() {
    if (dustLayer && hero.contains(dustLayer)) return dustLayer;
    dustLayer = document.createElement("div");
    dustLayer.className = "hero-dust-layer";
    hero.appendChild(dustLayer);
    return dustLayer;
  }

  function clearEffect() {
    if (dissolveTimeline) {
      dissolveTimeline.kill();
      dissolveTimeline = null;
    }

    if (dustLayer) {
      dustLayer.innerHTML = "";
      dustLayer.style.opacity = "0";
    }

    gsap.set([heroGrid, marquee, blob], {
      clearProps: "opacity,visibility,transform,filter"
    });
  }

  function createDustParticles(layer, count) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("span");
      dot.className = "hero-dust";
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.top = `${Math.random() * 100}%`;
      dot.style.width = `${2 + Math.random() * 6}px`;
      dot.style.height = dot.style.width;
      dot.style.opacity = "0";
      layer.appendChild(dot);
      particles.push(dot);
    }
    return particles;
  }

  function buildEffect() {
    clearEffect();

    ScrollTrigger.getAll()
      .filter((trigger) => trigger.vars && trigger.vars.id === "hero-dissolve-lite")
      .forEach((trigger) => trigger.kill());

    const layer = getDustLayer();
    const particleCount = window.innerWidth >= 980 ? 34 : 18;
    const particles = createDustParticles(layer, particleCount);
    const motionTargets = [heroGrid, marquee, blob].filter(Boolean);

    dissolveTimeline = gsap.timeline({
      scrollTrigger: {
        id: "hero-dissolve-lite",
        trigger: hero,
        start: "top top",
        end: () => `+=${window.innerHeight * 0.95}`,
        scrub: 1,
        invalidateOnRefresh: true
      }
    });

    dissolveTimeline.to(layer, { opacity: 1, duration: 0.15, ease: "none" }, 0);
    dissolveTimeline.to(
      motionTargets,
      {
        opacity: 0,
        y: -28,
        filter: "blur(8px)",
        stagger: 0.03,
        ease: "none",
        duration: 0.85
      },
      0
    );

    particles.forEach((particle, index) => {
      const angle = (Math.random() - 0.5) * Math.PI * 2;
      const distance = 24 + Math.random() * 64;
      dissolveTimeline.to(
        particle,
        {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          opacity: 0,
          scale: 0.35,
          ease: "none",
          duration: 0.9
        },
        0.03 + index * 0.007
      );
    });

    ScrollTrigger.refresh();
  }

  let resizeTimeout;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(buildEffect, 200);
  });

  window.addEventListener("beforeunload", clearEffect);

  if (document.readyState === "complete") {
    buildEffect();
  } else {
    window.addEventListener("load", buildEffect, { once: true });
  }
})();

/* =========================================================
   ABOUT CENTER IMAGE ZOOM ON SCROLL
   - Pins gallery while zooming focus item
   - Unpins when zoom completes so content continues naturally
   ========================================================= */
(function initAboutCenterZoom() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  let zoomCtx;

  function createZoomTimeline() {
    const section = document.getElementById("about");
    const galleryWrap = section ? section.querySelector(".about-gallery-wrap") : null;
    const gallery = section ? section.querySelector("#about-gallery-1") : null;
    const titleOverlay = section ? section.querySelector(".about-title-overlay") : null;
    if (!section || !galleryWrap || !gallery) return;

    const items = Array.from(gallery.querySelectorAll(".about-gallery__item"));
    if (!items.length) return;

    const focusItem = gallery.querySelector(".about-gallery__item--focus") || items[Math.floor(items.length / 2)];
    const isMobileViewport = window.innerWidth < 981;

    if (zoomCtx) {
      zoomCtx.revert();
      zoomCtx = null;
    }

    if (isMobileViewport) {
      // On mobile, keep WHY ME as a regular static image block (no pin / no scroll animation).
      gsap.set(items, { clearProps: "all" });
      const focusImg = focusItem.querySelector("img");
      if (focusImg) gsap.set(focusImg, { clearProps: "all" });
      if (titleOverlay) gsap.set(titleOverlay, { clearProps: "all" });
      gsap.set([galleryWrap, gallery], { clearProps: "all" });
      return;
    }

    zoomCtx = gsap.context(() => {
      gsap.set(items, { transformOrigin: "50% 50%" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: galleryWrap,
          start: "top top",
          end: "+=80%",
          scrub: 1,
          invalidateOnRefresh: true
        }
      });

      tl.to(
        focusItem,
        {
          scale: 3.2,
          zIndex: 12,
          filter: "blur(0px)",
          ease: "none",
          duration: 1
        },
        0
      );

      tl.to(
        gallery,
        {
          scale: 1.05,
          ease: "none",
          duration: 1
        },
        0
      );

      const focusImg = focusItem.querySelector("img");
      if (focusImg) {
        tl.to(
          focusImg,
          {
            opacity: 1,
            scale: 1.12,
            ease: "none",
            duration: 1
          },
          0
        );

        tl.to(
          focusImg,
          {
            opacity: 0,
            ease: "none",
            duration: 0.45
          },
          1
        );
      }

      return () => {
        gsap.set(items, { clearProps: "all" });
        if (focusImg) gsap.set(focusImg, { clearProps: "all" });
        if (titleOverlay) gsap.set(titleOverlay, { clearProps: "all" });
      };
    }, section);
  }

  createZoomTimeline();

  let resizeTimer;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(createZoomTimeline, 180);
  });
})();

/* =========================================================
   TECH STACK SEQUENTIAL REVEAL ON SCROLL
   Stack title → Frontend label + logos → Backend label + logos → Qualities + tags
   ========================================================= */
(function initTechStackReveal() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const section    = document.getElementById("techStackSection");
  const stackTitle = section?.querySelector(".tech-header h1");
  const stackSub   = section?.querySelector(".tech-footer");
  const feTitle    = section?.querySelector(".tech-content--frontend h2");
  const feLogos    = section ? Array.from(section.querySelectorAll(".tech-content--frontend .tech-logo-item")) : [];
  const beTitle    = section?.querySelector(".tech-content--backend h2");
  const beLogos    = section ? Array.from(section.querySelectorAll(".tech-content--backend .tech-logo-item")) : [];
  const qBlock     = document.getElementById("qualitiesBlock");
  const qTitle     = qBlock?.querySelector(".qualities-title");
  const qTags      = qBlock ? Array.from(qBlock.querySelectorAll(".quality-tag")) : [];

  if (!section || !stackTitle) return;

  const ease = "power3.out";

  /* Set initial hidden state via JS — CSS stays visible as fallback */
  const hideTargets = [stackTitle, stackSub, feTitle, beTitle, qBlock]
    .filter(Boolean);
  gsap.set(hideTargets, { opacity: 0, y: 24 });
  gsap.set([...feLogos, ...beLogos], { opacity: 0, y: 24 });
  gsap.set(qTags, { opacity: 0, y: 14, scale: 0.94 });

  function makeReveal(targets, delay) {
    return gsap.to(targets, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.55,
      ease,
      stagger: 0.08,
      delay
    });
  }

  /* All triggers use section as root — safe against pin offsets from gallery above */
  ScrollTrigger.create({
    trigger: section,
    start: "top 80%",
    once: true,
    onEnter() {
      gsap.to(stackTitle, { opacity: 1, y: 0, duration: 0.6, ease });
      if (stackSub) gsap.to(stackSub, { opacity: 1, y: 0, duration: 0.5, ease, delay: 0.3 });

      /* Frontend: label → logos stagger */
      if (feTitle) gsap.to(feTitle, { opacity: 1, y: 0, duration: 0.5, ease, delay: 0.55 });
      feLogos.forEach((logo, i) => {
        gsap.to(logo, { opacity: 1, y: 0, duration: 0.42, ease, delay: 0.72 + i * 0.08 });
      });

      /* Backend: label → logos stagger */
      if (beTitle) gsap.to(beTitle, { opacity: 1, y: 0, duration: 0.5, ease, delay: 0.55 });
      beLogos.forEach((logo, i) => {
        gsap.to(logo, { opacity: 1, y: 0, duration: 0.42, ease, delay: 0.72 + i * 0.08 });
      });

      /* Qualities: title → tags stagger */
      if (qBlock) gsap.to(qBlock, { opacity: 1, y: 0, duration: 0.5, ease, delay: 1.1 });
      if (qTitle) gsap.to(qTitle, { opacity: 1, y: 0, duration: 0.5, ease, delay: 1.2 });
      qTags.forEach((tag, i) => {
        gsap.to(tag, { opacity: 1, y: 0, scale: 1, duration: 0.42, ease, delay: 1.38 + i * 0.07 });
      });
    }
  });
})();