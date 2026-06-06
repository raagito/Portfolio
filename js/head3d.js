function initHead3D() {
  const canvas = document.getElementById("headCanvas");
  if (!canvas || typeof THREE === "undefined") {
    setTimeout(initHead3D, 300);
    return;
  }

  const S = 108;
  canvas.width  = S;
  canvas.height = S;
  canvas.style.width  = "54px";
  canvas.style.height = "54px";

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.05, 3.0);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(S, S, false);
  renderer.setClearColor(0x000000, 0);

  scene.add(new THREE.AmbientLight(0xfff5e8, 2.2));
  const key = new THREE.DirectionalLight(0xfff0d0, 2.8);
  key.position.set(2, 3, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd0e8ff, 1.0);
  fill.position.set(-3, 1, 2);
  scene.add(fill);

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

  const head = new THREE.Group();
  scene.add(head);

  function add(geo, mat) {
    const m = new THREE.Mesh(geo, mat);
    head.add(m);
    return m;
  }

  /* skull */
  const sk = new THREE.SphereGeometry(0.62, 32, 32);
  sk.scale(1, 1.1, 0.96);
  add(sk, M.skin);

  /* jaw */
  const jg = new THREE.SphereGeometry(0.46, 24, 24);
  jg.scale(0.92, 0.65, 0.85);
  add(jg, M.skin).position.set(0, -0.4, 0.06);

  /* ears */
  [-1, 1].forEach(s => {
    const g = new THREE.SphereGeometry(0.13, 14, 14);
    g.scale(0.5, 0.8, 0.45);
    add(g, M.skin).position.set(s * 0.63, 0.02, -0.02);
  });

  /* hair top */
  const hg = new THREE.SphereGeometry(0.64, 32, 32);
  hg.scale(1, 1.1, 0.96);
  add(hg, M.hair).position.y = 0.12;

  /* hair blocker — skin-colored box hides lower hair sphere */
  const hb = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 1.5), M.skin);
  hb.position.set(0, -0.16, 0);
  head.add(hb);

  /* side puffs */
  [-1, 1].forEach(s => {
    const g = new THREE.SphereGeometry(0.24, 14, 14);
    g.scale(0.7, 0.55, 0.55);
    add(g, M.hair).position.set(s * 0.52, 0.46, -0.08);
  });

  /* tuft */
  const tg = new THREE.SphereGeometry(0.2, 12, 12);
  tg.scale(0.65, 1.3, 0.65);
  const tm = add(tg, M.hair);
  tm.position.set(0.06, 0.74, 0.12);
  tm.rotation.z = -0.28;

  /* eyes */
  [-0.22, 0.22].forEach(x => {
    const wg = new THREE.SphereGeometry(0.115, 20, 20);
    wg.scale(1, 0.9, 0.65);
    add(wg, M.white).position.set(x, 0.1, 0.5);

    add(new THREE.SphereGeometry(0.065, 14, 14), M.eye).position.set(x, 0.098, 0.555);

    add(new THREE.SphereGeometry(0.02, 8, 8), M.white).position.set(x + 0.032, 0.118, 0.578);
  });

  /* eyebrows */
  [-0.22, 0.22].forEach(x => {
    const g = new THREE.CylinderGeometry(0.018, 0.018, 0.14, 8);
    g.rotateZ(Math.PI / 2);
    const m = add(g, M.brow);
    m.position.set(x, 0.265, 0.49);
    m.rotation.z = x < 0 ? 0.3 : -0.3;
  });

  /* nose */
  const ng = new THREE.SphereGeometry(0.072, 16, 16);
  ng.scale(0.85, 0.72, 1.0);
  add(ng, M.nose).position.set(0, -0.065, 0.595);

  /* glasses rings */
  [-0.22, 0.22].forEach(x => {
    add(new THREE.TorusGeometry(0.148, 0.024, 10, 40), M.frame).position.set(x, 0.1, 0.52);
    add(new THREE.CircleGeometry(0.128, 32), M.glass).position.set(x, 0.1, 0.521);
  });

  /* bridge */
  const bg = new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8);
  bg.rotateZ(Math.PI / 2);
  add(bg, M.frame).position.set(0, 0.1, 0.52);

  /* temples */
  [-1, 1].forEach(s => {
    const tg = new THREE.CylinderGeometry(0.011, 0.011, 0.36, 8);
    tg.rotateZ(Math.PI / 2);
    const tm = add(tg, M.frame);
    tm.position.set(s * 0.39, 0.1, 0.43);
    tm.rotation.y = s * 0.42;
  });

  /* mouth */
  const pts = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.11, -0.22, 0.575),
    new THREE.Vector3(0,    -0.175, 0.6),
    new THREE.Vector3( 0.11, -0.22, 0.575)
  ).getPoints(20);
  head.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), M.lip));

  /* mouse tracking — follows directly like eye contact */
  let tX = 0, tY = 0;
  window.addEventListener("mousemove", e => {
    tY =  ((e.clientX / window.innerWidth)  - 0.5) * 2 * 0.7;
    tX =  ((e.clientY / window.innerHeight) - 0.5) * 2 * 0.45;
  }, { passive: true });

  head.rotation.x = 0.05;

  (function loop() {
    requestAnimationFrame(loop);
    head.rotation.y += (tY      - head.rotation.y) * 0.18;
    head.rotation.x += (tX + 0.05 - head.rotation.x) * 0.18;
    renderer.render(scene, camera);
  })();
}

initHead3D();
