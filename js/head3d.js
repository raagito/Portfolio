function initHead3D() {
  const canvas = document.getElementById("headCanvas");
  console.log("[head3d] canvas:", canvas, "THREE:", typeof THREE);
  if (!canvas || typeof THREE === "undefined") {
    setTimeout(initHead3D, 300);
    return;
  }

  const S = 108;
  canvas.width = S;
  canvas.height = S;
  canvas.style.width  = "54px";
  canvas.style.height = "54px";

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 3;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(S, S, false);
  renderer.setClearColor(0x000000, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const dl = new THREE.DirectionalLight(0x4cc9b1, 2);
  dl.position.set(2, 3, 4);
  scene.add(dl);

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    new THREE.MeshToonMaterial({ color: 0x4cc9b1 })
  );
  scene.add(cube);

  let tX = 0, tY = 0;
  window.addEventListener("mousemove", e => {
    tY =  ((e.clientX / window.innerWidth)  - 0.5) * 2;
    tX = -((e.clientY / window.innerHeight) - 0.5) * 2;
  }, { passive: true });

  (function loop() {
    requestAnimationFrame(loop);
    cube.rotation.y += (tY - cube.rotation.y) * 0.08;
    cube.rotation.x += (tX - cube.rotation.x) * 0.08;
    renderer.render(scene, camera);
  })();

  console.log("[head3d] running");
}

initHead3D();
