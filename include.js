/* ============================================================
   include.js — pulls the shared header and footer into each page.
   Edit partials/header.html and partials/footer.html in ONE place.
   Injected partials fade in gently (class .ready) so they don't
   pop in abruptly on load / navigation.
   ============================================================ */

async function injectPartial(id, url) {
  const slot = document.getElementById(id);
  if (!slot) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    slot.innerHTML = await res.text();
  } catch (err) {
    console.error("Could not load " + url, err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await injectPartial("site-header", "/partials/header.html");
  await injectPartial("site-footer", "/partials/footer.html");

  // Highlight the current page in the nav.
  const current = document.body.getAttribute("data-page");
  if (current) {
    const link = document.querySelector('.site-nav a[data-nav="' + current + '"]');
    if (link) link.setAttribute("aria-current", "page");
  }

  // Fill the current year in the footer (if present).
  const yearSlot = document.querySelector("[data-year]");
  if (yearSlot) yearSlot.textContent = new Date().getFullYear();

  // Fade the injected header/footer in.
  requestAnimationFrame(() => {
    document.getElementById("site-header")?.classList.add("ready");
    document.getElementById("site-footer")?.classList.add("ready");
  });
});
