function initHero3D() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas || typeof THREE === "undefined" || typeof THREE.GLTFLoader === "undefined") {
    setTimeout(initHero3D, 300);
    return;
  }

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(40, 1, 0.1, 500);
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize() {
    const parent = canvas.parentElement;
    const w = parent.offsetWidth  || 600;
    const h = parent.offsetHeight || 600;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });

  scene.add(new THREE.AmbientLight(0xffffff, 1.6));
  const key = new THREE.DirectionalLight(0xfff0d0, 2.4);
  key.position.set(4, 6, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd0e8ff, 1.0);
  fill.position.set(-4, -2, 4);
  scene.add(fill);

  let model = null;
  let mixer = null;
  const clock = new THREE.Clock();

  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

  const loader = new THREE.GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load(
    "media/3d/hero.glb",
    function(gltf) {
      model = gltf.scene;

      const box    = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale  = 3.5 / maxDim;

      model.scale.setScalar(scale);
      model.position.sub(center.multiplyScalar(scale));
      model.rotation.y = Math.PI;
      scene.add(model);

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play();
      }

      resize();
    },
    undefined,
    function(err) { console.warn("hero3d: GLB load failed", err); }
  );

  /* ---- drag / touch rotation ---- */
  let isDragging = false;
  let prevX = 0, prevY = 0;
  let rotY = Math.PI, rotX = 0;
  let velY = 0, velX = 0;

  function onDown(x, y) {
    isDragging = true;
    prevX = x; prevY = y;
    velY = 0; velX = 0;
    canvas.style.cursor = "grabbing";
  }
  function onMove(x, y) {
    if (!isDragging || !model) return;
    const dx = x - prevX;
    const dy = y - prevY;
    velY = dx * 0.008;
    velX = dy * 0.008;
    rotY += velY;
    rotX = Math.max(-0.8, Math.min(0.8, rotX + velX));
    prevX = x; prevY = y;
  }
  function onUp() {
    isDragging = false;
    canvas.style.cursor = "grab";
  }

  canvas.addEventListener("mousedown",  e => onDown(e.clientX, e.clientY));
  window.addEventListener("mousemove",  e => onMove(e.clientX, e.clientY));
  window.addEventListener("mouseup",    onUp);

  canvas.addEventListener("touchstart", e => { e.preventDefault(); onDown(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  canvas.addEventListener("touchmove",  e => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  canvas.addEventListener("touchend",   onUp);

  /* ---- render loop ---- */
  (function loop() {
    requestAnimationFrame(loop);
    if (mixer) mixer.update(clock.getDelta());
    if (model) {
      if (!isDragging) {
        velY *= 0.92;
        velX *= 0.92;
        rotY += velY;
        rotX += velX;
      }
      model.rotation.y = rotY;
      model.rotation.x = rotX;
    }
    renderer.render(scene, camera);
  })();
}

initHero3D();
