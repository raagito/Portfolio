(function initGSAP() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from(".nav", { y: -30, opacity: 0, duration: 0.6 })
    .from("#heroKicker", { y: 20, opacity: 0, duration: 0.5 }, "-=0.25")
    .from(".hero-name .mask > span", { yPercent: 110, stagger: 0.08, duration: 0.8 }, "-=0.2")
    .from(".hero-sub", { y: 16, opacity: 0, duration: 0.5 }, "-=0.4")
    .from(".hero-actions .btn", { y: 16, opacity: 0, stagger: 0.08, duration: 0.45 }, "-=0.35");

  gsap.utils.toArray(".proyecto").forEach((card) => {
    gsap.from(card, {
      opacity: 0,
      y: 40,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });
  });

  const mm = gsap.matchMedia();
  mm.add("(max-width: 979px)", () => {
    gsap.from(".proyectos-section h2", { opacity: 0, y: 20, duration: 0.5 });
  });

  mm.add("(min-width: 980px)", () => {
    gsap.from(".proyectos-section h2", { opacity: 0, y: 40, duration: 0.7 });
  });
})();

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