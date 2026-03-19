/* ===================== CONFIG =====================
   Edita aqui textos y timing base de animaciones.
*/
const CONFIG = {
  theme: {
    primary: "#4CC9B1",
    primary2: "#66D9E8"
  },
  hero: {
    kicker: "Frontend Developer",
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

(function applyConfig() {
  const root = document.documentElement;
  root.style.setProperty("--fx-duration", `${CONFIG.animations.durationMs}ms`);
  root.style.setProperty("--fx-ease", CONFIG.animations.ease);
  root.style.setProperty("--fx-stagger", `${CONFIG.animations.staggerMs}ms`);

  if (CONFIG.theme.primary) root.style.setProperty("--primary", CONFIG.theme.primary);
  if (CONFIG.theme.primary2) root.style.setProperty("--primary-2", CONFIG.theme.primary2);

  const heroKicker = document.getElementById("heroKicker");
  const h1l1 = document.getElementById("h1l1");
  const h1l2 = document.getElementById("h1l2");
  const h1l3 = document.getElementById("h1l3");

  if (heroKicker) heroKicker.textContent = CONFIG.hero.kicker;
  if (h1l1) h1l1.textContent = CONFIG.hero.line1;
  if (h1l2) h1l2.textContent = CONFIG.hero.line2;
  if (h1l3) h1l3.textContent = CONFIG.hero.line3;

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();

(function revealOnScroll() {
  const items = Array.from(document.querySelectorAll(".fx, .fx-zoom"));
  if (!items.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const el = entry.target;
        if (el.hasAttribute("data-stagger")) {
          Array.from(el.children).forEach((child, i) => {
            child.style.transitionDelay = `calc(var(--fx-stagger) * ${i})`;
            child.classList.add("fx");
            requestAnimationFrame(() => child.classList.add("in"));
          });
        }

        el.classList.add("in");
        io.unobserve(el);
      }
    },
    { threshold: 0.14 }
  );

  items.forEach((el) => io.observe(el));
})();

(function cursorBlob() {
  const blob = document.getElementById("cursorBlob");
  if (!blob) return;

  window.addEventListener(
    "pointermove",
    (e) => {
      blob.style.left = `${e.clientX}px`;
      blob.style.top = `${e.clientY}px`;
    },
    { passive: true }
  );
})();

(function headerBehavior() {
  const nav = document.getElementById("navbar");
  const bar = document.getElementById("scrollProgress");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("primaryNav");
  if (!nav || !bar) return;

  let lastY = window.scrollY;
  let ticking = false;

  function updateProgress() {
    const doc = document.documentElement;
    const total = doc.scrollHeight - doc.clientHeight;
    const ratio = total > 0 ? doc.scrollTop / total : 0;
    bar.style.width = `${ratio * 100}%`;
  }

  function onScrollFrame() {
    if (nav.classList.contains("nav--open")) {
      ticking = false;
      return;
    }

    const currentY = window.scrollY;
    const goingDown = currentY > lastY;

    if (goingDown && currentY > 100) {
      nav.classList.add("nav--hidden");
    } else {
      nav.classList.remove("nav--hidden");
    }

    lastY = currentY;
    ticking = false;
  }

  document.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(onScrollFrame);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateProgress();

  function closeMobileMenu() {
    nav.classList.remove("nav--open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("nav--open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 760) closeMobileMenu();
    });

    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target)) {
        closeMobileMenu();
      }
    });
  }
})();

