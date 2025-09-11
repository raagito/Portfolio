/* ===================== CONFIG (edita aquí rápido) =====================
   - Colores: puedes sobrescribir CSS variables desde aquí si quieres
   - Textos HERO: hero.*
   - Velocidades/Easing: animations.*
*/
const CONFIG = {
  theme: {
  primary: "#4CC9B1",
  primary2: "#66D9E8",
  },
  hero: {
  kicker: "Frontend • React.js",
  line1: "RICARDO",
  line2: "ALZURUTT",
  line3: "Software Engineer"
  },
  animations: {
    durationMs: 650,
    ease: "cubic-bezier(.22,.8,.28,1)",
    staggerMs: 90
  }
};

// Aplica CONFIG a variables/hero
(function applyConfig(){
  const root = document.documentElement;
  root.style.setProperty("--fx-duration", `${CONFIG.animations.durationMs}ms`);
  root.style.setProperty("--fx-ease", CONFIG.animations.ease);
  root.style.setProperty("--fx-stagger", `${CONFIG.animations.staggerMs}ms`);
  if (CONFIG.theme.primary) root.style.setProperty("--primary", CONFIG.theme.primary);
  if (CONFIG.theme.primary2) root.style.setProperty("--primary-2", CONFIG.theme.primary2);

  document.getElementById("heroKicker").textContent = CONFIG.hero.kicker;
  document.getElementById("h1l1").textContent = CONFIG.hero.line1;
  document.getElementById("h1l2").textContent = CONFIG.hero.line2;
  document.getElementById("h1l3").textContent = CONFIG.hero.line3;

  // Año footer
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

/* ===================== Reveal on Scroll + Stagger ===================== */
(function revealOnScroll(){
  const items = [...document.querySelectorAll(".fx, .fx-zoom")];
  const io = new IntersectionObserver((entries)=>{
    for (const e of entries){
      if (!e.isIntersecting) continue;
      const el = e.target;
      if (el.hasAttribute("data-stagger")){
        const kids = [...el.children];
        kids.forEach((k,i)=>{
          k.style.transitionDelay = `calc(var(--fx-stagger) * ${i})`;
          k.classList.add("fx");
          requestAnimationFrame(()=>k.classList.add("in"));
        });
      }
      el.classList.add("in");
      io.unobserve(el);
    }
  }, { threshold: 0.14 });
  items.forEach(el=>io.observe(el));
})();

/* ===================== Hero headline mask reveal ===================== */
(function heroMask(){
  const lines = document.querySelectorAll(".mask > span");
  lines.forEach((el,i)=>{
    el.style.transition = `transform var(--fx-duration) var(--fx-ease)`;
    el.style.transitionDelay = `${80 * i}ms`;
    requestAnimationFrame(()=>{ el.style.transform = "translateY(0)"; });
  });
})();

/* ===================== Cursor blob parallax ===================== */
(function cursorBlob(){
  const blob = document.getElementById("cursorBlob");
  if (!blob) return;
  window.addEventListener("pointermove", (e)=>{
    blob.style.left = e.clientX + "px";
    blob.style.top  = e.clientY + "px";
  }, { passive:true });
})();

/* ===================== Progress bar scroll ===================== */
(function progressBar(){
  const bar = document.getElementById("scrollProgress");
  function update(){
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    bar.style.width = (scrolled * 100) + "%";
  }
  document.addEventListener("scroll", update, { passive:true });
  update();
})();

/* ===================== Hide/Show Header on scroll ===================== */
(function hideShowHeader(){
  const nav = document.getElementById("navbar");
  let lastY = window.scrollY;
  let ticking = false;
  function onScroll(){
    const y = window.scrollY;
    const down = y > lastY;
    if (down && y > 100) nav.classList.add("nav--hidden");
    else nav.classList.remove("nav--hidden");
    lastY = y; ticking = false;
  }
  window.addEventListener("scroll", ()=>{
    if (!ticking){ requestAnimationFrame(onScroll); ticking = true; }
  }, { passive:true });
})();

/* ===================== Parallax para cards (sutil) ===================== */
(function parallaxCards(){
  const cards = document.querySelectorAll("[data-parallax] .card-inner");
  function onScroll(){
    cards.forEach((c)=>{
      const r = c.getBoundingClientRect();
      const v = Math.min(1, Math.max(0, 1 - Math.abs(r.top + r.height/2 - innerHeight/2) / (innerHeight/2)));
      c.style.filter = `saturate(${0.8 + v*0.4}) brightness(${0.9 + v*0.2})`;
      c.style.transform = `translateY(${(1-v)*10}px)`;
    });
  }
  document.addEventListener("scroll", onScroll, { passive:true });
  onScroll();
})();

/* ===================== Tilt hover (3D leve) ===================== */
(function tilt(){
  const tiltEls = document.querySelectorAll(".tilt");
  tiltEls.forEach(el=>{
    let rect;
    const max = 10; // grados máximos
    function set(e){
      rect = rect || el.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      const dx = (e.clientX - cx) / (rect.width/2);
      const dy = (e.clientY - cy) / (rect.height/2);
      el.style.transform = `rotateX(${-dy*max}deg) rotateY(${dx*max}deg) translateY(-4px)`;
    }
    el.addEventListener("pointermove", set);
    el.addEventListener("pointerleave", ()=>{ el.style.transform = ""; rect = null; });
  });
})();

/* ===================== Counters (about) ===================== */
(function counters(){
  const els = document.querySelectorAll("[data-count]");
  const io = new IntersectionObserver((entries)=>{
    for (const e of entries){
      if (!e.isIntersecting) continue;
      const el = e.target;
      const target = parseInt(el.getAttribute("data-count"), 10) || 0;
      const start = performance.now();
      const dur = 1000;
      function tick(t){
        const p = Math.min(1, (t - start) / dur);
        el.textContent = Math.floor(target * p);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    }
  }, { threshold: 0.4 });
  els.forEach(el=>io.observe(el));
})();

// Carrusel de proyectos
let proyectos = document.querySelectorAll('.proyecto');
let arrowLeft = document.getElementById('arrow-left');
let arrowRight = document.getElementById('arrow-right');
let tooltipLeft = document.getElementById('tooltip-left');
let tooltipRight = document.getElementById('tooltip-right');
let nombres = [
  'Landing Creativa',
  'E-commerce Minimalista',
  'App de Tareas',
  'Portfolio Interactivo'
];
let current = 0;
let animating = false;
function showProyecto(idx, direction) {
  if (animating || idx === current) return;
  animating = true;
  let prev = current;
  let prevProyecto = proyectos[prev];
  let nextProyecto = proyectos[idx];
  proyectos.forEach((p, i) => {
    p.classList.remove('active', 'enter-right', 'enter-left');
    p.style.zIndex = 1;
    p.style.opacity = 0;
    p.style.pointerEvents = 'none';
    p.style.transform = 'translateX(0)';
  });
  prevProyecto.classList.add('active');
  prevProyecto.style.zIndex = 2;
  prevProyecto.style.opacity = 1;
  prevProyecto.style.pointerEvents = 'auto';
  let dirClass = direction === 'right' ? 'enter-right' : direction === 'left' ? 'enter-left' : 'active';
  nextProyecto.classList.add(dirClass);
  nextProyecto.style.zIndex = 3;
  nextProyecto.style.opacity = 1;
  nextProyecto.style.pointerEvents = 'auto';
  setTimeout(() => {
    nextProyecto.classList.remove('enter-right', 'enter-left');
    nextProyecto.classList.add('active');
    prevProyecto.classList.remove('active');
    animating = false;
    current = idx;
    tooltipLeft.textContent = nombres[(current - 1 + proyectos.length) % proyectos.length];
    tooltipRight.textContent = nombres[(current + 1) % proyectos.length];
  }, 600);
}
arrowLeft.addEventListener('click', () => {
  let next = (current - 1 + proyectos.length) % proyectos.length;
  showProyecto(next, 'left');
});
arrowRight.addEventListener('click', () => {
  let next = (current + 1) % proyectos.length;
  showProyecto(next, 'right');
});
// Inicializar tooltips
tooltipLeft.textContent = nombres[(current - 1 + proyectos.length) % proyectos.length];
tooltipRight.textContent = nombres[(current + 1) % proyectos.length];