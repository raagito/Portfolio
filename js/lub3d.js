function initLub3D() {
  const canvas = document.getElementById("lubCanvas");
  if (!canvas || typeof THREE === "undefined" || typeof THREE.GLTFLoader === "undefined") {
    setTimeout(initLub3D, 300);
    return;
  }

  const card = canvas.closest(".card-wrap");

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.4, 3.6);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // Sombras realistas
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  function resize() {
    const w = canvas.clientWidth  || 200;
    const h = canvas.clientHeight || 320;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  // Luz principal que proyecta sombra
  const key = new THREE.DirectionalLight(0xfff0d0, 3.2);
  key.position.set(2.5, 4, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 20;
  key.shadow.camera.left = -3;
  key.shadow.camera.right = 3;
  key.shadow.camera.top = 3;
  key.shadow.camera.bottom = -3;
  key.shadow.bias = -0.0005;
  key.shadow.radius = 4;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd0e8ff, 0.7);
  fill.position.set(-3, 1, 2);
  scene.add(fill);
  // Luz puntual que orbita el envase -> brillo en movimiento
  const rim = new THREE.PointLight(0xffffff, 1.8, 12);
  scene.add(rim);

  // Suelo invisible que solo recibe sombra
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.ShadowMaterial({ opacity: 0.32 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.1;
  ground.receiveShadow = true;
  scene.add(ground);

  let model = null;
  let baseY = 0;  // posicion vertical base tras centrar el modelo

  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

  const loader = new THREE.GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load(
    "media/3d/lubricante3d.glb",
    function(gltf) {
      model = gltf.scene;

      model.traverse(o => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          if (o.material) o.material.envMapIntensity = 1.0;
        }
      });

      const box    = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3());
      // Escalar por la altura (no maxDim) para que no se vea achatado/ancho
      const scale  = 1.9 / size.y;

      model.scale.setScalar(scale);
      // Centrar en X/Z, apoyar la base en el suelo (y = -1.1)
      model.position.x = -center.x * scale;
      model.position.z = -center.z * scale;
      model.position.y = -box.min.y * scale - 1.1;
      baseY = model.position.y;
      model.rotation.x = -0.25;  // inclinar la parte superior hacia atras/arriba

      scene.add(model);
      resize();
    },
    undefined,
    function(err) { console.warn("lub3d: GLB load failed", err); }
  );

  window.addEventListener("resize", resize, { passive: true });
  resize();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mouse-follow: solo eje Y (posicion horizontal del cursor)
  let tRotY = 0;
  window.addEventListener("mousemove", e => {
    tRotY = ((e.clientX / window.innerWidth) - 0.5) * 2 * 0.9;
  }, { passive: true });

  let rRotY = 0;
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    const t = clock.getElapsedTime();

    // Luz orbital siempre activa (brillo en movimiento)
    rim.position.set(Math.cos(t * 1.2) * 4, 1.5 + Math.sin(t * 0.8) * 1.2, Math.sin(t * 1.2) * 4);

    if (model && card && card.classList.contains("is-active") && !reduceMotion) {
      // Sigue al mouse solo en Y (suavizado)
      rRotY += (tRotY - rRotY) * 0.12;
      model.rotation.y = rRotY;
      // Float / bob suave arriba-abajo
      model.position.y = baseY + Math.sin(t * 1.6) * 0.08;
    }
    renderer.render(scene, camera);
  })();
}

initLub3D();
