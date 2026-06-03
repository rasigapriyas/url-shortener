// Minimal dependency-free toast manager. Renders into a single fixed
// container appended to <body>, so it can be called from anywhere.

let container = null;

function ensureContainer() {
  if (container) return container;
  container = document.createElement("div");
  container.className = "toast-wrap";
  document.body.appendChild(container);
  return container;
}

function show(message, type = "success", timeout = 3200) {
  const root = ensureContainer();
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  root.appendChild(el);

  const remove = () => {
    el.style.transition = "opacity .2s, transform .2s";
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    setTimeout(() => el.remove(), 220);
  };

  el.addEventListener("click", remove);
  setTimeout(remove, timeout);
}

const toast = {
  success: (m) => show(m, "success"),
  error: (m) => show(m, "error"),
};

export default toast;
