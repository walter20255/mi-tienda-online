document.addEventListener("DOMContentLoaded", () => {
  const a = document.createElement("a");
  a.href = "https://wa.me/5491123456789";  // Cambia por tu número
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.className = "whatsapp-float";
  a.setAttribute("aria-label", "Contactar por WhatsApp");
  a.textContent = "📱"; // Emoji de teléfono, o aquí podrías poner un SVG
  document.body.appendChild(a);
});

