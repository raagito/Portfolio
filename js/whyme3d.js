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
     MODE: DESIGNER
     Floating geometric shapes — clean editorial feel
     ================================================ */
  function buildDesigner() {
    const g = new THREE.Group();
    scene.add(g);
    activeGroup = g;

    const palette = [0x4cc9b1, 0x66d9e8, 0x0b2433, 0xf97316, 0xe8956a];
    const shapes  = [];

    function mat(c) {
      return new THREE.MeshToonMaterial({ color: c });
    }

    /* torus */
    const t1 = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.28, 16, 60), mat(0x4cc9b1));
    t1.position.set(0, 0.5, 0);
    g.add(t1); shapes.push({ m: t1, rx: 0.4, ry: 0.6, phase: 0 });

    const t2 = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.16, 12, 40), mat(0xf97316));
    t2.position.set(2.2, -1.2, -1);
    g.add(t2); shapes.push({ m: t2, rx: 0.7, ry: -0.4, phase: 1.2 });

    /* icosahedron */
    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 0), mat(0x0b2433));
    ico.position.set(-2.4, 1.0, 0.5);
    g.add(ico); shapes.push({ m: ico, rx: 0.3, ry: 0.8, phase: 0.6 });

    /* octahedron */
    const oct = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), mat(0x66d9e8));
    oct.position.set(2.0, 1.8, -0.8);
    g.add(oct); shapes.push({ m: oct, rx: -0.5, ry: 0.5, phase: 2.0 });

    /* sphere */
    const sp = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), mat(0xe8956a));
    sp.position.set(-1.5, -2.0, 0.2);
    g.add(sp); shapes.push({ m: sp, rx: 0.2, ry: -0.6, phase: 1.6 });

    /* box */
    const bx = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), mat(0x4cc9b1));
    bx.position.set(0.4, -1.8, 1.0);
    g.add(bx); shapes.push({ m: bx, rx: 0.6, ry: 0.4, phase: 0.4 });

    /* wireframe ring around scene */
    const wire = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.04, 8, 80),
      new THREE.MeshBasicMaterial({ color: 0x4cc9b1, wireframe: false, transparent: true, opacity: 0.25 })
    );
    wire.rotation.x = Math.PI / 3;
    g.add(wire);

    animFn = (t) => {
      g.rotation.y = t * 0.12;
      shapes.forEach(s => {
        s.m.rotation.x = t * s.rx + s.phase;
        s.m.rotation.y = t * s.ry + s.phase;
        s.m.position.y += Math.sin(t * 0.8 + s.phase) * 0.002;
      });
      wire.rotation.z = t * 0.05;
    };
  }

  /* ================================================
     MODE: DEVELOPER
     Code rain — 3D floating glyphs falling
     ================================================ */
  function buildDeveloper() {
    const g = new THREE.Group();
    scene.add(g);
    activeGroup = g;

    const glyphs  = "{}[]()<>/;=_#01".split("");
    const items   = [];
    const mat     = new THREE.MeshToonMaterial({ color: 0x4cc9b1 });
    const matDim  = new THREE.MeshToonMaterial({ color: 0x0b2433, transparent: true, opacity: 0.5 });

    for (let i = 0; i < 60; i++) {
      /* use tiny boxes as glyph placeholders */
      const w  = 0.08 + Math.random() * 0.22;
      const h  = 0.08 + Math.random() * 0.18;
      const geo = new THREE.BoxGeometry(w, h, 0.04);
      const m   = Math.random() > 0.35 ? mat : matDim;
      const mesh = new THREE.Mesh(geo, m);

      mesh.position.set(
        (Math.random() - 0.5) * 7,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 3
      );
      mesh.userData.speed  = 0.4 + Math.random() * 1.2;
      mesh.userData.startY = mesh.position.y;
      mesh.userData.phase  = Math.random() * Math.PI * 2;
      g.add(mesh);
      items.push(mesh);
    }

    /* central glowing sphere */
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 32, 32),
      new THREE.MeshToonMaterial({ color: 0x0b2433 })
    );
    g.add(core);

    /* orbit ring */
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.03, 8, 80),
      new THREE.MeshBasicMaterial({ color: 0x4cc9b1, transparent: true, opacity: 0.5 })
    );
    ring.rotation.x = Math.PI / 2.2;
    g.add(ring);

    animFn = (t) => {
      items.forEach(mesh => {
        mesh.position.y -= mesh.userData.speed * 0.018;
        if (mesh.position.y < -4.5) mesh.position.y = 4.5;
        mesh.rotation.z = t * 0.3 + mesh.userData.phase;
        /* pulse opacity */
        if (mesh.material.transparent) {
          mesh.material.opacity = 0.25 + 0.35 * Math.abs(Math.sin(t * 0.5 + mesh.userData.phase));
        }
      });
      ring.rotation.z = t * 0.4;
      core.rotation.y = t * 0.3;
    };
  }

  /* ================================================
     MODE: FRIENDLY
     Bouncy spheres orbiting — warm, organic
     ================================================ */
  function buildFriendly() {
    const g = new THREE.Group();
    scene.add(g);
    activeGroup = g;

    const colors = [0x4cc9b1, 0x66d9e8, 0xf97316, 0xe8956a, 0xffd166, 0xa78bfa];
    const balls  = [];

    /* central big sphere */
    const center = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 32, 32),
      new THREE.MeshToonMaterial({ color: 0x4cc9b1 })
    );
    g.add(center);

    /* orbiting spheres */
    const orbits = [
      { r: 2.2, speed: 0.55, size: 0.45, phase: 0,    tilt: 0.3,  color: 0xf97316 },
      { r: 2.8, speed: 0.38, size: 0.38, phase: 2.1,  tilt: -0.5, color: 0x66d9e8 },
      { r: 1.8, speed: 0.72, size: 0.28, phase: 4.2,  tilt: 0.7,  color: 0xffd166 },
      { r: 3.2, speed: 0.28, size: 0.55, phase: 1.05, tilt: -0.2, color: 0xa78bfa },
      { r: 2.4, speed: 0.50, size: 0.22, phase: 3.14, tilt: 0.9,  color: 0xe8956a },
    ];

    orbits.forEach(o => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(o.size, 20, 20),
        new THREE.MeshToonMaterial({ color: o.color })
      );
      g.add(mesh);
      balls.push({ mesh, ...o });
    });

    /* connecting lines */
    const lineMat = new THREE.LineBasicMaterial({ color: 0x4cc9b1, transparent: true, opacity: 0.15 });
    balls.forEach(b => {
      const pts = [new THREE.Vector3(0,0,0), b.mesh.position.clone()];
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat);
      line.userData.ball = b;
      g.add(line);
      b.line = line;
    });

    animFn = (t) => {
      center.rotation.y = t * 0.3;
      /* squash/stretch bounce */
      const bounce = 1 + 0.06 * Math.sin(t * 2.2);
      center.scale.set(bounce, 2 - bounce, bounce);

      balls.forEach(b => {
        const angle = t * b.speed + b.phase;
        b.mesh.position.set(
          Math.cos(angle) * b.r,
          Math.sin(angle * 0.7 + b.tilt) * b.r * 0.4,
          Math.sin(angle) * b.r
        );
        /* bobbing scale */
        const s = 1 + 0.12 * Math.sin(t * 1.8 + b.phase);
        b.mesh.scale.setScalar(s);
        b.mesh.rotation.y = t * 0.8;

        /* update line */
        if (b.line) {
          const pos = b.line.geometry.attributes.position;
          pos.setXYZ(1, b.mesh.position.x, b.mesh.position.y, b.mesh.position.z);
          pos.needsUpdate = true;
        }
      });

      g.rotation.y = t * 0.08;
    };
  }

  /* ---- mode descriptions ---- */
  const descriptions = {
    designer:  "Diseño interfaces que convierten. Cada pixel tiene intención y propósito visual.",
    developer: "Código limpio, arquitectura sólida. Soluciones que escalan sin romper.",
    friendly:  "Colaboro, comunico y entrego. Parte del equipo desde el primer día.",
  };

  /* ---- switch mode ---- */
  let currentMode = "designer";

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
        desc.textContent = descriptions[mode];
        gsap.to(desc, { opacity: 1, y: 0, duration: 0.3 });
      }});
    } else if (desc) {
      desc.textContent = descriptions[mode];
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
