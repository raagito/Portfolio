(function initHeroSphere() {
  const spin = document.getElementById("heroSphereSpin");
  if (!spin) return;

  const WORDS = [
    "Motion", "3D", "Branding", "Webflow", "Illustration", "Strategy",
    "Design", "Develop", "Create", "Frontend", "UI", "UX", "Code", "Art"
  ];

  // Radio de la esfera: relativo al viewport (estas dentro)
  // mas grande en mobile para que las palabras se lean
  function radius() {
    const m = Math.min(window.innerWidth, window.innerHeight);
    const factor = window.innerWidth < 760 ? 0.95 : 0.62;
    return m * factor;
  }

  // Distribucion tipo espiral de Fibonacci -> reparte uniforme en la esfera
  function build() {
    spin.innerHTML = "";
    const R = radius();
    const N = 60;                 // cantidad de palabras en la esfera
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;      // -1 .. 1
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;

      const lat = Math.asin(y) * 180 / Math.PI;       // grados
      const lon = theta * 180 / Math.PI;              // grados

      const w = document.createElement("span");
      w.className = "hero-sphere__word";
      w.textContent = WORDS[i % WORDS.length];
      // colocar sobre la superficie y mirar hacia afuera (visible desde adentro)
      w.style.transform =
        `translate(-50%, -50%) rotateY(${lon}deg) rotateX(${-lat}deg) translateZ(${R}px) rotateY(180deg)`;
      // las mas lejanas (al fondo) mas tenues -> profundidad
      spin.appendChild(w);
    }
  }

  build();

  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(build, 200);
  }, { passive: true });

  // --- Relleno por cercania del cursor ---
  // Las palabras se rellenan (de outline a solido) cuando el mouse pasa cerca.
  const RADIUS = 160;           // px: distancia de influencia
  let mx = -9999, my = -9999;
  let ticking = false;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateFill);
    }
  }, { passive: true });

  function updateFill() {
    ticking = false;
    const words = spin.children;
    for (let i = 0; i < words.length; i++) {
      const r = words[i].getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const d = Math.hypot(mx - cx, my - cy);
      // 0 (lejos) .. 1 (encima)
      const k = Math.max(0, 1 - d / RADIUS);
      words[i].style.setProperty("--fill", k.toFixed(3));
    }
  }
})();
