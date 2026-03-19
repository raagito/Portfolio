(function initGSAP() {
  if (!window.gsap) return;

  gsap.registerPlugin(ScrollTrigger);

  // Respeta accesibilidad
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  // Animacion de entrada del hero
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".nav", { y: -30, opacity: 0, duration: 0.6 })
    .from("#heroKicker", { y: 20, opacity: 0, duration: 0.5 }, "-=0.25")
    .from(".hero-name .mask > span", { yPercent: 110, stagger: 0.08, duration: 0.8 }, "-=0.2")
    .from(".hero-sub", { y: 16, opacity: 0, duration: 0.5 }, "-=0.4")
    .from(".hero-actions .btn", { y: 16, opacity: 0, stagger: 0.08, duration: 0.45 }, "-=0.35");
})();

gsap.utils.toArray(".proyecto").forEach((card) => {
  gsap.from(card, {
    opacity: 0,
    y: 40,
    duration: 0.7,
    ease: "power2.out",
    scrollTrigger: {
      trigger: card,
      start: "top 85%",
      toggleActions: "play none none reverse"
    }
  });
});


const mm = gsap.matchMedia();

mm.add("(max-width: 979px)", () => {
  gsap.from(".proyectos-section h2", { opacity: 0, y: 20, duration: 0.5 });
});

mm.add("(min-width: 980px)", () => {
  gsap.from(".proyectos-section h2", { opacity: 0, y: 40, duration: 0.7 });
});