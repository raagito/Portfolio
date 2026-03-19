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

(function initHeroDisintegration() {
  if (!window.gsap || !window.ScrollTrigger || !window.html2canvas) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const hero = document.getElementById("hero");
  if (!hero) return;

  const heroParts = hero.querySelectorAll(".hero-grid, .marquee, #cursorBlob");
  const SHARD_COUNT = 55;
  const REPEAT_COUNT = 2;
  let shardLayer = null;
  let shardCanvases = [];
  let disintegrateTimeline = null;
  let buildToken = 0;

  function getShardLayer() {
    if (shardLayer && hero.contains(shardLayer)) return shardLayer;
    shardLayer = document.createElement("div");
    shardLayer.className = "hero-shard-layer";
    hero.appendChild(shardLayer);
    return shardLayer;
  }

  function clearShards() {
    if (disintegrateTimeline) {
      disintegrateTimeline.kill();
      disintegrateTimeline = null;
    }

    shardCanvases.forEach((canvas) => canvas.remove());
    shardCanvases = [];

    if (shardLayer) {
      shardLayer.innerHTML = "";
      shardLayer.style.opacity = "0";
    }
  }

  async function buildShards() {
    const token = ++buildToken;

    clearShards();
    ScrollTrigger.getAll()
      .filter((trigger) => trigger.vars && trigger.vars.id === "hero-disintegrate")
      .forEach((trigger) => trigger.kill());

    hero.style.opacity = "1";
    heroParts.forEach((part) => {
      part.style.opacity = "1";
      part.style.visibility = "visible";
    });

    const layer = getShardLayer();
    const snapshot = await html2canvas(hero, {
      backgroundColor: null,
      useCORS: true,
      scale: Math.min(window.devicePixelRatio || 1, 2),
      ignoreElements: (element) => {
        return element.classList && element.classList.contains("hero-shard-layer");
      }
    });

    if (token !== buildToken) return;

    const width = snapshot.width;
    const height = snapshot.height;
    const sourceCtx = snapshot.getContext("2d");
    if (!sourceCtx) return;

    const imageData = sourceCtx.getImageData(0, 0, width, height);
    const dataList = Array.from({ length: SHARD_COUNT }, () => sourceCtx.createImageData(width, height));

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const pixelIndex = (x + y * width) * 4;
        for (let repeat = 0; repeat < REPEAT_COUNT; repeat++) {
          const randomBias = Math.random() + (x * 1.8) / width;
          const shardIndex = Math.min(SHARD_COUNT - 1, Math.floor((SHARD_COUNT * randomBias) / 2.8));
          for (let channel = 0; channel < 4; channel++) {
            dataList[shardIndex].data[pixelIndex + channel] = imageData.data[pixelIndex + channel];
          }
        }
      }
    }

    dataList.forEach((data, index) => {
      const shard = document.createElement("canvas");
      shard.width = width;
      shard.height = height;
      shard.className = "hero-shard-canvas";

      const shardCtx = shard.getContext("2d");
      if (!shardCtx) return;
      shardCtx.putImageData(data, 0, 0);

      layer.appendChild(shard);
      shardCanvases.push(shard);
    });

    disintegrateTimeline = gsap.timeline({
      scrollTrigger: {
        id: "hero-disintegrate",
        trigger: hero,
        start: "top top",
        end: () => `+=${window.innerHeight * 1.2}`,
        scrub: 1
      }
    });

    disintegrateTimeline.to(layer, { opacity: 1, duration: 0.08, ease: "none" }, 0);
    disintegrateTimeline.to(heroParts, { autoAlpha: 0, duration: 0.2, ease: "none" }, 0);

    shardCanvases.forEach((shard, index) => {
      const angle = (Math.random() - 0.5) * Math.PI * 2;
      const moveDistance = 35 + Math.random() * 65;
      const rotateAmount = (Math.random() - 0.5) * 48;

      disintegrateTimeline.to(
        shard,
        {
          x: Math.sin(angle) * moveDistance,
          y: Math.cos(angle) * moveDistance,
          rotate: rotateAmount,
          opacity: 0,
          ease: "none",
          duration: 0.95
        },
        index * 0.003
      );
    });

    ScrollTrigger.refresh();
  }

  let resizeTimeout;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      buildShards();
    }, 250);
  });

  window.addEventListener("beforeunload", clearShards);

  if (document.readyState === "complete") {
    buildShards();
  } else {
    window.addEventListener("load", buildShards, { once: true });
  }
})();