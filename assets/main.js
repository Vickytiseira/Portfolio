(function () {
  var root = document.documentElement;

  /* ---------- Idioma ---------- */
  /* ---------- Volver arriba al cambiar de página ---------- */
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  function toTop() { if (!location.hash) { root.style.scrollBehavior = "auto"; window.scrollTo(0, 0); root.style.scrollBehavior = ""; } }
  toTop();
  window.addEventListener("pageshow", toTop);

  function setLang(lang, save) {
    root.dataset.lang = lang;
    root.lang = lang;
    var title = document.querySelector("title");
    if (title && title.dataset[lang]) document.title = title.dataset[lang];
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.setLang === lang));
    });
    if (save) { try { localStorage.setItem("lang", lang); } catch (e) {} }
    try {
      var url = new URL(location.href);
      if (url.searchParams.has("lang")) { url.searchParams.delete("lang"); history.replaceState(null, "", url); }
    } catch (e) {}
  }
  document.querySelectorAll("[data-set-lang]").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.setLang, true); });
  });
  setLang(root.dataset.lang || "en");

  /* ---------- Menú mobile ---------- */
  var burger = document.getElementById("navBurger");
  var menu = document.getElementById("mobileMenu");
  function toggleMenu(open) {
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
  }
  if (burger && menu) {
    burger.addEventListener("click", function () { toggleMenu(!menu.classList.contains("is-open")); });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { toggleMenu(false); }); });
  }

  /* ---------- Aparición al hacer scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Carrusel de proyectos ---------- */
  var rail = document.getElementById("worksRail");
  if (rail) {
    var cards = Array.prototype.slice.call(rail.querySelectorAll(".card"));
    var pad = function (n) { return String(n).padStart(2, "0"); };
    var cur = document.getElementById("worksCurrent");
    var currentIndex = function () {
      var x = rail.scrollLeft, best = 0, dist = Infinity;
      cards.forEach(function (c, i) { var d = Math.abs(c.offsetLeft - rail.offsetLeft - x); if (d < dist) { dist = d; best = i; } });
      return best;
    };
    rail.addEventListener("scroll", function () { cur.textContent = pad(currentIndex() + 1); }, { passive: true });
    var goTo = function (i) {
      var c = cards[Math.max(0, Math.min(cards.length - 1, i))];
      rail.scrollTo({ left: c.offsetLeft - rail.offsetLeft, behavior: "smooth" });
    };
    document.getElementById("worksPrev").addEventListener("click", function () { goTo(currentIndex() - 1); });
    document.getElementById("worksNext").addEventListener("click", function () { goTo(currentIndex() + 1); });

    var down = false, startX = 0, startScroll = 0, moved = false;
    rail.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; startX = e.clientX; startScroll = rail.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 5) { moved = true; rail.classList.add("is-dragging"); }
      rail.scrollLeft = startScroll - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false; rail.classList.remove("is-dragging");
      if (moved) goTo(currentIndex());
    });
    rail.addEventListener("click", function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    rail.addEventListener("dragstart", function (e) { e.preventDefault(); });
  }

  /* ---------- Año ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Microinteracciones ---------- */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Letras del título que entran una por una
  document.querySelectorAll("[data-split]").forEach(function (el, li) {
    var txt = el.textContent; el.textContent = "";
    Array.prototype.forEach.call(txt, function (c, i) {
      var s = document.createElement("span"); s.className = "ch"; s.textContent = c === " " ? "\u00a0" : c;
      s.style.animationDelay = (li * 0.25 + i * 0.045) + "s"; el.appendChild(s);
    });
  });

  // Onda al hacer click
  document.addEventListener("pointerdown", function (e) {
    if (reduce) return;
    var r = document.createElement("span"); r.className = "ripple";
    r.style.left = e.clientX + "px"; r.style.top = e.clientY + "px";
    document.body.appendChild(r); setTimeout(function () { r.remove(); }, 700);
  });

  // Cursor que sigue al mouse y crece sobre links
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    var c = document.createElement("div"); c.className = "cursor"; document.body.appendChild(c);
    var mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; c.classList.add("is-on"); });
    document.addEventListener("mouseleave", function () { c.classList.remove("is-on"); });
    (function loop() { cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2; c.style.transform = "translate(" + cx + "px," + cy + "px)"; requestAnimationFrame(loop); })();
    document.querySelectorAll("a, button, .card, .gitem").forEach(function (el) {
      el.addEventListener("mouseenter", function () { c.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { c.classList.remove("is-hover"); });
    });
    // Elementos magnéticos
    document.querySelectorAll("[data-magnetic], .nav__cta").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var b = el.getBoundingClientRect();
        el.style.transform = "translate(" + (e.clientX - b.left - b.width / 2) * 0.15 + "px," + (e.clientY - b.top - b.height / 2) * 0.3 + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  // Barra de progreso de lectura en los casos
  if (document.querySelector(".case") && !reduce) {
    var pb = document.createElement("div"); pb.className = "progress"; document.body.appendChild(pb);
    var upd = function () { var h = document.documentElement.scrollHeight - innerHeight; pb.style.transform = "scaleX(" + (h > 0 ? scrollY / h : 0) + ")"; };
    window.addEventListener("scroll", upd, { passive: true }); upd();
  }

  /* ---------- Nav con fondo al hacer scroll ---------- */
  (function () {
    var nav = document.querySelector(".nav"); if (!nav) return;
    var on = function () { nav.classList.toggle("is-scrolled", window.scrollY > 24); };
    window.addEventListener("scroll", on, { passive: true }); on();
  })();
})();
