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
  gsap.from(".proyectos-section h2", {
    opacity: 0,
    y: 26,
    duration: 0.6,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".proyectos-section",
      start: "top 85%"
    }
  });
})();

/* =========================================================
   PROJECTS CAROUSEL (CLICK + SWIPE NAVIGATION)
   ========================================================= */
(function initProjectsGallery() {
  if (!window.gsap) return;

  const projectsSection = document.getElementById("projects");
  const cards = gsap.utils.toArray(".cards li");
  const cardsContainer = document.querySelector(".cards");
  const nextButton = document.querySelector(".next");
  const prevButton = document.querySelector(".prev");
  if (!projectsSection || !cards.length || !cardsContainer || !nextButton || !prevButton) return;

  gsap.fromTo(
    cardsContainer,
    { scale: 0.82, opacity: 0.86 },
    {
      scale: 1,
      opacity: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: projectsSection,
        start: "top 30%",
        end: "top -20%",
        scrub: 1.2,
        invalidateOnRefresh: true
      }
    }
  );

  const state = {
    current: 0,
    animating: false
  };

  gsap.set(cards, {
    xPercent: -50,
    yPercent: -50,
    left: "50%",
    top: "48%",
    transformOrigin: "center center"
  });

  function relativeIndex(index) {
    const total = cards.length;
    let delta = index - state.current;
    if (delta > total / 2) delta -= total;
    if (delta < -total / 2) delta += total;
    return delta;
  }

  function getStepDistance(absDelta) {
    const mobile = window.innerWidth < 980;
    if (absDelta === 1) return mobile ? window.innerWidth * 0.33 : 290;
    if (absDelta === 2) return mobile ? window.innerWidth * 0.56 : 520;
    return mobile ? window.innerWidth * 0.7 : 640;
  }

  function getStateFromDelta(delta) {
    const abs = Math.abs(delta);
    const direction = delta === 0 ? 0 : delta / abs;

    if (abs === 0) {
      return {
        x: 0,
        scale: 1,
        opacity: 1,
        zIndex: 40,
        filter: "brightness(1) saturate(1)",
        pointerEvents: "auto"
      };
    }

    if (abs === 1) {
      return {
        x: direction * getStepDistance(1),
        scale: 0.86,
        opacity: 0.78,
        zIndex: 30,
        filter: "brightness(1.16) saturate(0.9)",
        pointerEvents: "none"
      };
    }

    // Keep all non-adjacent cards hidden until navigation brings them near center.
    return {
      x: direction * getStepDistance(3),
      scale: 0.66,
      opacity: 0,
      zIndex: 10,
      filter: "brightness(1.18)",
      pointerEvents: "none"
    };
  }

  function render(immediate) {
    cards.forEach((card, index) => {
      const delta = relativeIndex(index);
      const visualState = getStateFromDelta(delta);

      gsap.to(card, {
        x: visualState.x,
        scale: visualState.scale,
        opacity: visualState.opacity,
        zIndex: visualState.zIndex,
        filter: visualState.filter,
        duration: immediate ? 0 : 0.34,
        ease: "power2.out",
        onStart() {
          card.style.pointerEvents = visualState.pointerEvents;
        }
      });
    });
  }

  function go(direction) {
    if (state.animating) return;
    state.animating = true;
    state.current = (state.current + direction + cards.length) % cards.length;
    render(false);
    window.setTimeout(() => {
      state.animating = false;
    }, 360);
  }

  nextButton.addEventListener("click", () => go(1));
  prevButton.addEventListener("click", () => go(-1));

  // Mobile UX: horizontal swipe over cards triggers prev/next.
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaX = 0;
  let touchDeltaY = 0;
  let trackingTouch = false;

  cardsContainer.addEventListener(
    "touchstart",
    (event) => {
      if (!event.touches.length) return;
      const touch = event.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchDeltaX = 0;
      touchDeltaY = 0;
      trackingTouch = true;
    },
    { passive: true }
  );

  cardsContainer.addEventListener(
    "touchmove",
    (event) => {
      if (!trackingTouch || !event.touches.length) return;
      const touch = event.touches[0];
      touchDeltaX = touch.clientX - touchStartX;
      touchDeltaY = touch.clientY - touchStartY;

      // Prevent accidental page scroll only when the gesture is clearly horizontal.
      if (Math.abs(touchDeltaX) > Math.abs(touchDeltaY) * 1.2) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  function handleSwipeEnd() {
    if (!trackingTouch) return;
    trackingTouch = false;

    const isHorizontalIntent = Math.abs(touchDeltaX) > Math.abs(touchDeltaY) * 1.2;
    const passedThreshold = Math.abs(touchDeltaX) > 45;
    if (!isHorizontalIntent || !passedThreshold) return;

    if (touchDeltaX < 0) {
      go(1);
    } else {
      go(-1);
    }
  }

  cardsContainer.addEventListener("touchend", handleSwipeEnd, { passive: true });
  cardsContainer.addEventListener("touchcancel", handleSwipeEnd, { passive: true });

  window.addEventListener("resize", () => render(true));

  render(true);
})();

/* =========================================================
   PROJECTS SECTION ENTRY TRANSITION (SVG WAVE)
   - Circle grows with scroll progress in projects section
   - Works as persistent background reveal
   ========================================================= */
(function initProjectsEntryTransition() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const projectsSection = document.getElementById("projects");
  const circle = document.querySelector(".projects-transition-circle");
  if (!projectsSection || !circle) return;

  gsap.fromTo(
    circle,
    { attr: { r: 0 } },
    {
      attr: { r: 145 },
      ease: "none",
      scrollTrigger: {
        trigger: projectsSection,
        start: "top 40%",
        end: "top -10%",
        scrub: 1.2,
        invalidateOnRefresh: true
      }
    }
  );
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

    if (zoomCtx) zoomCtx.revert();

    zoomCtx = gsap.context(() => {
      gsap.set(items, { transformOrigin: "50% 50%" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: galleryWrap,
          start: "top top",
          end: "+=170%",
          scrub: 1,
          pin: galleryWrap,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      tl.to(
        focusItem,
        {
          scale: window.innerWidth < 980 ? 2.4 : 3.2,
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
   ABOUT STACKED CARDS (FOLDER OVERLAP ON SCROLL)
   ========================================================= */
(function initAboutStackCards() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const stackSection = document.getElementById("aboutStackFlow");
  const stage = stackSection ? stackSection.querySelector(".about-stack-stage") : null;
  const cards = stackSection ? Array.from(stackSection.querySelectorAll(".about-stack-card")) : [];
  if (!stackSection || !stage || cards.length < 3) return;

  const mm = gsap.matchMedia();

  mm.add("(min-width: 981px)", () => {
    gsap.set(cards, {
      y: (index) => (index === 0 ? 0 : 170 + index * 18),
      opacity: (index) => (index === 0 ? 1 : 0),
      zIndex: (index) => index + 1
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stackSection,
        start: "top top",
        end: "+=180%",
        scrub: 1,
        pin: stage,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    tl.to(cards[1], { y: 18, opacity: 1, duration: 0.34, ease: "none" }, 0.24);
    tl.to(cards[2], { y: 36, opacity: 1, duration: 0.34, ease: "none" }, 0.66);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set(cards, { clearProps: "all" });
    };
  });

  mm.add("(max-width: 980px)", () => {
    gsap.set(cards, { clearProps: "all" });
  });
})();