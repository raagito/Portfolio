(function initMailModal() {
  const EMAIL  = "alzuruttricardo@gmail.com";
  const modal  = document.getElementById("mailModal");
  if (!modal) return;

  const subject = encodeURIComponent("Hola Ricardo");
  document.getElementById("mailGmail").href   =
    `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}&su=${subject}`;
  document.getElementById("mailOutlook").href =
    `https://outlook.live.com/mail/0/deeplink/compose?to=${EMAIL}&subject=${subject}`;
  document.getElementById("mailDefault").href = `mailto:${EMAIL}`;

  function open() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }
  function close() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  // interceptar los enlaces de correo
  document.querySelectorAll(".js-mail").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      open();
    });
  });

  // cerrar
  modal.querySelectorAll("[data-mail-close]").forEach(el => el.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  // al elegir una opcion, cerrar
  modal.querySelectorAll(".mail-modal__opt").forEach(o => o.addEventListener("click", close));
})();
