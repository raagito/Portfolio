/* =========================================================
   HEAD 3D — procedural cartoon head with mouse tracking
   To swap for a .glb model later, see SWAP POINT below
   ========================================================= */
function initHead3D() {
  const canvas = document.getElementById("headCanvas");
  if (!canvas || !window.THREE) {
    /* THREE not ready yet — retry once scripts settle */
    setTimeout(initHead3D, 200);
    return;
  }

  /* render at 2× the display size for sharpness */
  const DISPLAY = 54;
  const SIZE    = DISPLAY * 2;
  const DPR     = 1; /* we handle scaling manually */

  canvas.width        = SIZE;
  canvas.height       = SIZE;
  canvas.style.width  = DISPLAY + "px";
  canvas.style.height = DISPLAY + "px";

  /* ---- scene ---- */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.05, 3.0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(SIZE, SIZE, false);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  /* ---- lights ---- */
  scene.add(new THREE.AmbientLight(0xfff5e8, 2.2));

  const key = new THREE.DirectionalLight(0xfff0d0, 2.8);
  key.position.set(2, 3, 5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xd0e8ff, 1.0);
  fill.position.set(-3, 1, 2);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffeedd, 0.5);
  rim.position.set(0, -2, -3);
  scene.add(rim);

  /* ---- materials ---- */
  const M = {
    skin:  new THREE.MeshToonMaterial({ color: 0xe8956a }),
    hair:  new THREE.MeshToonMaterial({ color: 0x251508 }),
    glass: new THREE.MeshToonMaterial({ color: 0x060606, transparent: true, opacity: 0.5 }),
    frame: new THREE.MeshToonMaterial({ color: 0x111111 }),
    white: new THREE.MeshToonMaterial({ color: 0xffffff }),
    eye:   new THREE.MeshToonMaterial({ color: 0x1a0e04 }),
    brow:  new THREE.MeshToonMaterial({ color: 0x1a0e04 }),
    nose:  new THREE.MeshToonMaterial({ color: 0xc97048 }),
    lip:   new THREE.LineBasicMaterial({ color: 0x7a3520 }),
  };

  /* ---- head group (this rotates with mouse) ---- */
  const head = new THREE.Group();
  scene.add(head);

  function mesh(geo, mat) {
    const m = new THREE.Mesh(geo, mat);
    head.add(m);
    return m;
  }

  /* skull */
  const sk = new THREE.SphereGeometry(0.62, 32, 32);
  sk.scale(1, 1.1, 0.96);
  mesh(sk, M.skin);

  /* chin/jaw */
  const jaw = new THREE.SphereGeometry(0.46, 24, 24);
  jaw.scale(0.92, 0.65, 0.85);
  const jawM = mesh(jaw, M.skin);
  jawM.position.set(0, -0.4, 0.06);

  /* ears */
  [-1, 1].forEach(s => {
    const g = new THREE.SphereGeometry(0.13, 14, 14);
    g.scale(0.5, 0.8, 0.45);
    const m = mesh(g, M.skin);
    m.position.set(s * 0.63, 0.02, -0.02);
  });

  /* ---- hair ---- */
  /* top cap */
  const hTop = new THREE.SphereGeometry(0.64, 32, 32);
  hTop.scale(1, 1.1, 0.96);
  const hm = mesh(hTop, M.hair);
  hm.position.y = 0.12;

  /* hair blocker box — covers lower half of sphere */
  const hBlock = new THREE.BoxGeometry(1.5, 0.55, 1.5);
  const hbm = new THREE.Mesh(hBlock, M.skin); /* skin color hides lower sphere */
  hbm.position.set(0, -0.16, 0);
  head.add(hbm);

  /* side puffs */
  [-1, 1].forEach(s => {
    const g = new THREE.SphereGeometry(0.24, 14, 14);
    g.scale(0.7, 0.55, 0.55);
    const m = mesh(g, M.hair);
    m.position.set(s * 0.52, 0.46, -0.08);
  });

  /* front tuft */
  const tuft = new THREE.SphereGeometry(0.2, 12, 12);
  tuft.scale(0.65, 1.3, 0.65);
  const tm = mesh(tuft, M.hair);
  tm.position.set(0.06, 0.74, 0.12);
  tm.rotation.z = -0.28;

  /* ---- eyes ---- */
  [-0.22, 0.22].forEach(x => {
    /* white */
    const wg = new THREE.SphereGeometry(0.115, 20, 20);
    wg.scale(1, 0.9, 0.65);
    const wm = mesh(wg, M.white);
    wm.position.set(x, 0.1, 0.5);

    /* pupil */
    const pg = new THREE.SphereGeometry(0.065, 14, 14);
    const pm = mesh(pg, M.eye);
    pm.position.set(x, 0.098, 0.555);

    /* shine */
    const sg = new THREE.SphereGeometry(0.02, 8, 8);
    const sm = mesh(sg, M.white);
    sm.position.set(x + 0.032, 0.118, 0.578);
  });

  /* ---- eyebrows ---- */
  [-0.22, 0.22].forEach(x => {
    const g = new THREE.CapsuleGeometry(0.018, 0.12, 4, 8);
    const m = mesh(g, M.brow);
    m.position.set(x, 0.265, 0.49);
    m.rotation.z = x < 0 ? 0.3 : -0.3;
  });

  /* ---- nose ---- */
  const ng = new THREE.SphereGeometry(0.072, 16, 16);
  ng.scale(0.85, 0.72, 1.0);
  const nm = mesh(ng, M.nose);
  nm.position.set(0, -0.065, 0.595);

  /* ---- glasses ---- */
  [-0.22, 0.22].forEach(x => {
    /* ring */
    const rg = new THREE.TorusGeometry(0.148, 0.024, 10, 40);
    const rm = mesh(rg, M.frame);
    rm.position.set(x, 0.1, 0.52);

    /* lens */
    const lg = new THREE.CircleGeometry(0.128, 32);
    const lm = mesh(lg, M.glass);
    lm.position.set(x, 0.1, 0.521);
  });

  /* bridge */
  const bg = new THREE.CapsuleGeometry(0.012, 0.1, 4, 8);
  bg.rotateZ(Math.PI / 2);
  const bm = mesh(bg, M.frame);
  bm.position.set(0, 0.1, 0.52);

  /* temples */
  [-1, 1].forEach(s => {
    const tg = new THREE.CapsuleGeometry(0.011, 0.34, 4, 6);
    tg.rotateZ(Math.PI / 2);
    const tm = mesh(tg, M.frame);
    tm.position.set(s * 0.39, 0.1, 0.43);
    tm.rotation.y = s * 0.42;
  });

  /* ---- mouth ---- */
  const pts = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.11, -0.22, 0.575),
    new THREE.Vector3(0,     -0.175, 0.6),
    new THREE.Vector3( 0.11, -0.22, 0.575)
  ).getPoints(20);
  head.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    M.lip
  ));

  /* ---- mouse tracking ---- */
  let tX = 0, tY = 0;
  const MAX_X = 0.35, MAX_Y = 0.2;

  window.addEventListener("mousemove", e => {
    tY =  ((e.clientX / window.innerWidth)  - 0.5) * 2 * MAX_X;
    tX = -((e.clientY / window.innerHeight) - 0.5) * 2 * MAX_Y;
  }, { passive: true });

  head.rotation.x = 0.05;

  /* ---- render loop ---- */
  (function animate() {
    requestAnimationFrame(animate);
    head.rotation.y += (tY      - head.rotation.y) * 0.08;
    head.rotation.x += (tX + 0.05 - head.rotation.x) * 0.08;
    renderer.render(scene, camera);
  })();
}

/* run after DOM + scripts loaded */
if (document.readyState === "complete") {
  initHead3D();
} else {
  window.addEventListener("load", initHead3D, { once: true });
}
