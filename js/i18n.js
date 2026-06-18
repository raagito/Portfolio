(function initI18N() {
  const DICT = {
    es: {
      "nav.projects": "PROYECTOS",
      "nav.about": "SOBRE MÍ",
      "nav.cta": "TRABAJEMOS",
      "hero.kicker": "Desarrollador Frontend",
      "hero.sub": "Ingeniero de Software",
      "hero.viewProjects": "Ver Proyectos",
      "hero.letsWork": "Trabajemos",
      "proyectos.label": "PROYECTOS",
      "proj.view": "Ver proyecto",
      "proj.soon": "Demo Próximamente",
      "proj.domino.tag": "Juego",
      "proj.domino.desc": "Juego de mesa digital con interfaz intuitiva y jugabilidad emocionante.",
      "proj.gasli.tag": "App Móvil",
      "proj.gasli.desc": "Aplicación móvil, diseñada para gestión de gasolina.",
      "proj.protinal.tag": "Web App",
      "proj.protinal.desc": "Actualización visual del sector abogacía.",
      "proj.vmlub.tag": "Landing",
      "proj.vmlub.desc": "Página web para una empresa de lubricantes.",
      "why.title": "¿POR QUÉ YO?",
      "why.mode": "MODO",
      "why.designer.sub": "Identidad visual",
      "why.developer.sub": "Código limpio",
      "why.friendly.sub": "Trabajo en equipo",
      "why.desc.designer": "Diseño interfaces que convierten. Cada pixel tiene intención y propósito visual.",
      "why.desc.developer": "Escribo código limpio y escalable. Arquitectura sólida que crece con el proyecto.",
      "why.desc.friendly": "Comunicación clara y colaboración real. Hago que trabajar juntos sea fácil.",
      "stack.title": "Stack Developer",
      "stack.footer": "Stack adaptable según proyecto.",
      "qualities.title": "Cualidades",
      "qualities.business": "Orientado a negocio",
      "qualities.architecture": "Arquitectura limpia",
      "qualities.identity": "Identidad visual",
      "qualities.scalable": "Código escalable",
      "qualities.uiux": "UI/UX consciente",
      "qualities.fast": "Entrega rápida",
      "footer.write": "Escríbeme",
      "footer.rights": "Todos los derechos reservados",
      "mail.title": "¿Con qué quieres escribirme?",
      "mail.default": "App de correo"
    },
    en: {
      "nav.projects": "PROJECTS",
      "nav.about": "ABOUT ME",
      "nav.cta": "LET'S WORK",
      "hero.kicker": "Frontend Developer",
      "hero.sub": "Software Engineer",
      "hero.viewProjects": "View Projects",
      "hero.letsWork": "Let's Work",
      "proyectos.label": "PROJECTS",
      "proj.view": "View project",
      "proj.soon": "Demo Coming Soon",
      "proj.domino.tag": "Game",
      "proj.domino.desc": "Digital board game with an intuitive interface and exciting gameplay.",
      "proj.gasli.tag": "Mobile App",
      "proj.gasli.desc": "Mobile application designed for fuel management.",
      "proj.protinal.tag": "Web App",
      "proj.protinal.desc": "Visual refresh for the legal sector.",
      "proj.vmlub.tag": "Landing",
      "proj.vmlub.desc": "Website for a lubricants company.",
      "why.title": "WHY ME?",
      "why.mode": "MODE",
      "why.designer.sub": "Visual identity",
      "why.developer.sub": "Clean code",
      "why.friendly.sub": "Team player",
      "why.desc.designer": "I design interfaces that convert. Every pixel has intention and visual purpose.",
      "why.desc.developer": "I write clean, scalable code. Solid architecture that grows with the project.",
      "why.desc.friendly": "Clear communication and real collaboration. I make working together easy.",
      "stack.title": "Developer Stack",
      "stack.footer": "Stack adapted to each project.",
      "qualities.title": "Qualities",
      "qualities.business": "Business-minded",
      "qualities.architecture": "Clean architecture",
      "qualities.identity": "Visual identity",
      "qualities.scalable": "Scalable code",
      "qualities.uiux": "UI/UX aware",
      "qualities.fast": "Fast delivery",
      "footer.write": "Write me",
      "footer.rights": "All rights reserved",
      "mail.title": "How do you want to reach me?",
      "mail.default": "Mail app"
    }
  };

  // Expuesto para que otros scripts (whyme3d) lean traducciones
  window.I18N = {
    lang: "es",
    t(key) { return (DICT[this.lang] && DICT[this.lang][key]) || (DICT.es[key]) || key; }
  };

  function detect() {
    const saved = localStorage.getItem("lang");
    if (saved === "es" || saved === "en") return saved;
    return (navigator.language || "es").toLowerCase().startsWith("en") ? "en" : "es";
  }

  function apply(lang) {
    window.I18N.lang = lang;
    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const val = window.I18N.t(key);
      if (val != null) el.textContent = val;
    });

    // label de fondo PROYECTOS
    const bg = document.getElementById("proyectosBgLabel");
    if (bg) bg.textContent = window.I18N.t("proyectos.label");

    // estado visual del toggle (knob a la derecha = ingles)
    const sw = document.getElementById("langToggle");
    if (sw) {
      sw.classList.toggle("is-en", lang === "en");
      sw.setAttribute("aria-checked", lang === "en" ? "true" : "false");
    }

    // avisa a otros scripts (whyme descripciones)
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  }

  function toggle() {
    const next = window.I18N.lang === "es" ? "en" : "es";
    localStorage.setItem("lang", next);
    apply(next);
  }

  const btn = document.getElementById("langToggle");
  if (btn) btn.addEventListener("click", toggle);

  apply(detect());
})();
