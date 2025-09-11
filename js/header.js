// Oculta el nav al bajar y lo muestra al subir
(function headerHideShow(){
  const nav = document.getElementById("navbar");
  if (!nav) return;
  let lastY = window.scrollY;
  let ticking = false;
  function onScroll(){
    const y = window.scrollY;
    const down = y > lastY;
    if (down && y > 100) {
      nav.classList.add("nav--hidden");
    } else {
      nav.classList.remove("nav--hidden");
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", function(){
    if (!ticking){
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive:true });
})();
// Header interactions extracted: progress bar + hide/show
(function headerInit(){
  const bar = document.getElementById("scrollProgress");
  function update(){
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    if (bar) bar.style.width = (scrolled * 100) + "%";
  }
  document.addEventListener("scroll", update, { passive:true });
  update();

  const nav = document.getElementById("navbar");
  if (!nav) return;
  let lastY = window.scrollY; let ticking = false;
  function onScroll(){
    const y = window.scrollY; const down = y > lastY;
    if (down && y > 100) nav.classList.add("nav--hidden"); else nav.classList.remove("nav--hidden");
    lastY = y; ticking = false;
  }
  window.addEventListener("scroll", ()=>{ if (!ticking){ requestAnimationFrame(onScroll); ticking=true } }, { passive:true });
})();
