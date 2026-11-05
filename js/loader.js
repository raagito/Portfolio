/* =========================================================
   PANTALLA DE CARGA
   Se ejecuta antes que el resto de scripts. La barra avanza con
   lo que de verdad falta: pagina, fuentes, video del hero y cara 3D.
   head3d.js le pasa el modelo para no descargarlo dos veces.
   ========================================================= */
window.SiteLoader = (function () {
  const MIN_FACE_MS = 1200;  // tiempo minimo viendo la cara en 3D
  const MAX_WAIT_MS = 10000; // pase lo que pase, a los 10s se muestra el sitio

  const root   = document.documentElement;
  const el     = document.getElementById("siteLoader");
  const fill   = document.getElementById("siteLoaderFill");
  const pct    = document.getElementById("siteLoaderPct");
  const canvas = document.getElementById("loaderCanvas");

  const weights = { page: 0.4, fonts: 0.1, video: 0.2, face: 0.3 };
  const parts   = { page: 0,   fonts: 0,   video: 0,   face: 0 };

  const callbacks = [];
  let finished = false;
  let shown = 0;
  let faceShownAt = 0;
  let renderer = null;
  let drawFace = null;

  if (!el) return { faceProgress() {}, faceLoaded() {}, whenDone(fn) { fn(); } };

  root.classList.add("is-loading");

  function complete(name) { parts[name] = 1; }
  function allComplete() { return Object.keys(parts).every(k => parts[k] === 1); }

  function finish() {
    if (finished) return;
    finished = true;

    fill.style.transform = "scaleX(1)";
    pct.textContent = "100%";
    el.setAttribute("aria-valuenow", "100");
    el.classList.add("is-done");
    root.classList.remove("is-loading");

    // Al quitar el bloqueo de scroll vuelve la barra y cambian las medidas
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    callbacks.splice(0).forEach(fn => fn());

    setTimeout(() => {
      drawFace = null;
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
      }
      el.remove();
    }, 600);
  }

  function tick() {
    if (finished) return;
    requestAnimationFrame(tick);

    // Lo que no informa progreso avanza despacio, sin llegar nunca al final
    if (parts.page < 1) parts.page += (0.9 - parts.page) * 0.01;
    if (parts.face < 1) parts.face += (0.9 - parts.face) * 0.004;

    let target = 0;
    for (const k in parts) target += parts[k] * weights[k];
    shown += (target - shown) * 0.1;
    if (target === 1 && shown > 0.995) shown = 1;

    const value = Math.round(shown * 100);
    fill.style.transform = `scaleX(${shown})`;
    pct.textContent = `${value}%`;
    el.setAttribute("aria-valuenow", String(value));

    if (drawFace) drawFace();

    const faceSeen = !faceShownAt || performance.now() - faceShownAt >= MIN_FACE_MS;
    if (allComplete() && shown === 1 && faceSeen) finish();
  }

  function showFace(model) {
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0.05, 3.0);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene.add(new THREE.AmbientLight(0xfff5e8, 2.2));
    const key = new THREE.DirectionalLight(0xfff0d0, 2.8);
    key.position.set(2, 3, 5);
    scene.add(key);
    const fill2 = new THREE.DirectionalLight(0xd0e8ff, 1.0);
    fill2.position.set(-3, 1, 2);
    scene.add(fill2);

    const box    = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const scale  = 1.2 / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));

    const pivot = new THREE.Group();
    pivot.add(model);
    scene.add(pivot);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    drawFace = () => {
      if (!still) {
        const t = (performance.now() - t0) / 1000;
        pivot.rotation.y = Math.sin(t * 1.4) * 0.45;
        pivot.rotation.x = Math.sin(t * 0.9) * 0.08;
      }
      renderer.render(scene, camera);
    };

    drawFace();
    el.classList.add("has-3d");
    faceShownAt = performance.now();
  }

  /* ---- lo que hay que esperar ---- */
  window.addEventListener("load", () => complete("page"), { once: true });

  document.addEventListener("DOMContentLoaded", () => {
    const video = document.querySelector(".hero-illustration");
    if (!video || video.readyState >= 3) {
      complete("video");
    } else {
      video.addEventListener("canplay", () => complete("video"), { once: true });
      video.addEventListener("error", () => complete("video"), { once: true });
    }

    if (document.fonts && document.fonts.load) {
      Promise.allSettled([
        document.fonts.load('1em "akira"'),
        document.fonts.load('1em "bebas"'),
      ]).then(() => complete("fonts"));
    } else {
      complete("fonts");
    }
  }, { once: true });

  setTimeout(finish, MAX_WAIT_MS);
  requestAnimationFrame(tick);

  return {
    faceProgress(e) {
      if (e.total > 0) parts.face = Math.max(parts.face, Math.min(e.loaded / e.total, 0.99));
    },
    faceLoaded(model) {
      complete("face");
      if (!model || finished) return;
      try {
        showFace(model);
      } catch (err) {
        console.warn("loader: no se pudo mostrar la cara 3D", err);
      }
    },
    whenDone(fn) {
      if (finished) fn();
      else callbacks.push(fn);
    },
  };
})();
