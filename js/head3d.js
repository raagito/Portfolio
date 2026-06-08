function initHead3D() {
  const canvas = document.getElementById("headCanvas");
  if (!canvas || typeof THREE === "undefined" || typeof THREE.GLTFLoader === "undefined") {
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
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene.add(new THREE.AmbientLight(0xfff5e8, 2.2));
  const key = new THREE.DirectionalLight(0xfff0d0, 2.8);
  key.position.set(2, 3, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd0e8ff, 1.0);
  fill.position.set(-3, 1, 2);
  scene.add(fill);

  let head = null;

  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

  const loader = new THREE.GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load(
    "media/3d/face.glb",
    function(gltf) {
      head = gltf.scene;

      const box    = new THREE.Box3().setFromObject(head);
      const center = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale  = 1.2 / maxDim;

      head.scale.setScalar(scale);
      head.position.sub(center.multiplyScalar(scale));

      scene.add(head);
    },
    undefined,
    function(err) { console.warn("head3d: GLB load failed", err); }
  );

  let tRotY = 0, tRotX = 0;
  window.addEventListener("mousemove", e => {
    tRotY = ((e.clientX / window.innerWidth)  - 0.5) * 2 * 0.6;
    tRotX = ((e.clientY / window.innerHeight) - 0.5) * 2 * 0.35;
  }, { passive: true });

  let rRotY = 0, rRotX = 0;
  (function loop() {
    requestAnimationFrame(loop);
    if (head) {
      rRotY += (tRotY - rRotY) * 0.18;
      rRotX += (tRotX - rRotX) * 0.18;
      head.rotation.y = rRotY;
      head.rotation.x = rRotX;
    }
    renderer.render(scene, camera);
  })();
}

initHead3D();
