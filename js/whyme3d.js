/* =========================================================
   WHY ME — 3D animated viewer with 3 modes
   SWAP POINT: replace each mode's buildScene() with GLTFLoader
   ========================================================= */
(function initWhyMe() {
  if (typeof THREE === "undefined") { setTimeout(initWhyMe, 300); return; }

  const canvas = document.getElementById("whyCanvas");
  if (!canvas) return;

  /* ---- sizing ---- */
  function setSize() {
    const r = canvas.getBoundingClientRect();
    const w = Math.round(r.width)  || 480;
    const h = Math.round(r.height) || 520;
    canvas.width  = w * 2;
    canvas.height = h * 2;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w * 2, h * 2, false);
  }

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(1);

  /* lights shared */
  const ambient = new THREE.AmbientLight(0xffffff, 1.8);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xfff0d0, 2.4);
  sun.position.set(4, 6, 8);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xd0e8ff, 1.0);
  fill.position.set(-4, -2, 4);
  scene.add(fill);

  /* ---- mode content groups ---- */
  let activeGroup = null;
  let animFn      = null;
  let clock       = new THREE.Clock();

  function clearScene() {
    if (activeGroup) {
      scene.remove(activeGroup);
      /* dispose geometries + materials */
      activeGroup.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      activeGroup = null;
    }
    animFn = null;
    clock  = new THREE.Clock();
  }

  /* ================================================
     Icono 3D extruido desde SVG (representa cada modo)
     designer  -> pincel
     developer -> laptop con codigo
     friendly  -> apreton de manos
     ================================================ */
  const ICONS = {
    // glb: modelo 3D real (ponlos en media/3d/). svg: fallback extruido.
    designer:  { glb: "media/3d/designer.glb",  file: "media/svg/icon_paintbrush.svg",  color: 0xf97316, rotY: Math.PI },
    developer: { glb: "media/3d/developer.glb", file: "media/svg/icon_laptop-code.svg", color: 0x4cc9b1 },
    friendly:  { file: "media/svg/icon_handshake.svg",   color: 0xffd166 },
  };

  const svgLoader = (typeof THREE.SVGLoader !== "undefined") ? new THREE.SVGLoader() : null;
  const gltfLoader = (typeof THREE.GLTFLoader !== "undefined") ? new THREE.GLTFLoader() : null;
  const svgCache  = {};
  const glbCache  = {};

  // Textura radial reutilizable para la sombra del objeto
  let _shadowTex = null;
  function softShadowTex() {
    if (_shadowTex) return _shadowTex;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0,   "rgba(11,36,51,0.55)");
    grad.addColorStop(0.5, "rgba(11,36,51,0.22)");
    grad.addColorStop(1,   "rgba(11,36,51,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    _shadowTex = new THREE.CanvasTexture(c);
    return _shadowTex;
  }

  function buildIcon(mode) {
    const def = ICONS[mode];
    const g = new THREE.Group();
    scene.add(g);
    activeGroup = g;

    // Sombra suave debajo del objeto (plano con textura radial)
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 3.2),
      new THREE.MeshBasicMaterial({
        map: softShadowTex(),
        transparent: true,
        opacity: 0.35,
        depthWrite: false
      })
    );
    shadow.rotation.x = -Math.PI / 2;     // horizontal
    shadow.position.y = -2.0;             // debajo del objeto
    shadow.scale.set(1, 0.5, 1);         // elipse aplastada
    g.add(shadow);

    const iconHolder = new THREE.Group();
    g.add(iconHolder);

    // --- coloca un GLB centrado y escalado ---
    function placeGLB(srcScene) {
      const model = srcScene.clone(true);
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const scale = 3.0 / Math.max(size.x, size.y, size.z);
      model.scale.setScalar(scale);
      model.position.copy(center).multiplyScalar(-scale);  // centra tras escalar
      // voltea el modelo si su orientacion viene invertida
      if (def.rotY) {
        const pivot = new THREE.Group();
        pivot.rotation.y = def.rotY;
        pivot.add(model);
        iconHolder.add(pivot);
      } else {
        iconHolder.add(model);
      }
    }

    // --- fallback: extruye el SVG ---
    function place(shapes) {
      const mat = new THREE.MeshToonMaterial({ color: def.color, side: THREE.DoubleSide });
      const extrude = { depth: 28, bevelEnabled: true, bevelThickness: 6, bevelSize: 4, bevelSegments: 2 };
      const mesh = new THREE.Group();

      shapes.forEach(sh => {
        const geo = new THREE.ExtrudeGeometry(sh, extrude);
        mesh.add(new THREE.Mesh(geo, mat));
      });

      // medir en coords SVG y CENTRAR moviendo cada geometria (no el grupo)
      const box = new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      mesh.children.forEach(c => c.geometry.translate(-center.x, -center.y, -center.z));

      const scale = 3.6 / Math.max(size.x, size.y);
      mesh.scale.set(scale, -scale, scale);   // -Y: el SVG tiene el eje Y invertido
      iconHolder.add(mesh);
    }

    function loadSVGFallback() {
      if (svgCache[mode]) { place(svgCache[mode]); return; }
      if (!svgLoader) return;
      svgLoader.load(def.file, (data) => {
        const shapes = [];
        data.paths.forEach(p => THREE.SVGLoader.createShapes(p).forEach(s => shapes.push(s)));
        svgCache[mode] = shapes;
        if (activeGroup === g) place(shapes);
      });
    }

    // Intenta GLB real; si no existe, cae al SVG extruido
    if (!def.glb) {
      loadSVGFallback();
    } else if (glbCache[mode]) {
      placeGLB(glbCache[mode]);
    } else if (gltfLoader) {
      gltfLoader.load(def.glb,
        (gltf) => {
          glbCache[mode] = gltf.scene;
          if (activeGroup === g) placeGLB(gltf.scene);
        },
        undefined,
        () => loadSVGFallback()   // GLB no encontrado -> fallback
      );
    } else {
      loadSVGFallback();
    }

    animFn = (t) => {
      const float = Math.sin(t * 1.2);
      iconHolder.rotation.y = Math.sin(t * 0.5) * 0.6;     // vaiven suave
      iconHolder.position.y = float * 0.12;                // flotar
      // sombra reacciona al flote: mas chica/tenue cuando el objeto sube
      const s = 1 - float * 0.12;
      shadow.scale.set(s, 0.5 * s, 1);
      shadow.material.opacity = 0.35 - float * 0.06;
    };
  }

  function buildDesigner()  { buildIcon("designer"); }
  function buildDeveloper() { buildIcon("developer"); }
  function buildFriendly()  { buildIcon("friendly"); }

  /* ---- mode descriptions (via i18n) ---- */
  function descFor(mode) {
    const key = "why.desc." + mode;
    if (window.I18N) return window.I18N.t(key);
    return "";
  }

  /* ---- switch mode ---- */
  let currentMode = "designer";

  // al cambiar idioma, actualizar la descripcion del modo activo
  document.addEventListener("langchange", () => {
    const desc = document.getElementById("whymePanelDesc");
    if (desc) desc.textContent = descFor(currentMode);
  });

  function switchMode(mode) {
    if (mode === currentMode) return;
    currentMode = mode;

    if (window.gsap) {
      gsap.to(canvas, {
        opacity: 0, duration: 0.28, ease: "power2.in",
        onComplete() {
          clearScene();
          buildMode(mode);
          gsap.to(canvas, { opacity: 1, duration: 0.4, ease: "power2.out" });
        }
      });
    } else {
      clearScene();
      buildMode(mode);
    }

    /* update description */
    const desc = document.getElementById("whymePanelDesc");
    if (desc && window.gsap) {
      gsap.to(desc, { opacity: 0, y: 6, duration: 0.2, onComplete() {
        desc.textContent = descFor(mode);
        gsap.to(desc, { opacity: 1, y: 0, duration: 0.3 });
      }});
    } else if (desc) {
      desc.textContent = descFor(mode);
    }
  }

  function buildMode(mode) {
    if (mode === "designer")  buildDesigner();
    if (mode === "developer") buildDeveloper();
    if (mode === "friendly")  buildFriendly();
  }

  /* ---- buttons ---- */
  document.querySelectorAll(".whyme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".whyme-btn").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      switchMode(btn.dataset.mode);
    });
  });

  /* ---- render loop ---- */
  setSize();
  window.addEventListener("resize", setSize, { passive: true });

  buildMode("designer");

  (function loop() {
    requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    if (animFn) animFn(t);
    renderer.render(scene, camera);
  })();

  /* =========================================================
     SWAP POINT — replace buildDesigner/Developer/Friendly with:

     const loader = new GLTFLoader(); // needs GLTFLoader addon
     loader.load('media/glb/designer.glb', gltf => {
       activeGroup = gltf.scene;
       scene.add(activeGroup);
       animFn = (t) => { activeGroup.rotation.y = t * 0.5; };
     });
     ========================================================= */
})();
