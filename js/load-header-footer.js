async function loadHTML(url, containerId) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`No se pudo cargar ${url}`);
    const html = await resp.text();
    document.getElementById(containerId).innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadHTML("/header.html", "headerPlaceholder");
  loadHTML("/footer.html", "footerPlaceholder");
});
