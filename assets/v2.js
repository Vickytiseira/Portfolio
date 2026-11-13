(function () {
  var root = document.documentElement;
  function setLang(lang, save) {
    root.dataset.lang = lang; root.lang = lang;
    var t = document.querySelector("title");
    if (t && t.dataset[lang]) document.title = t.dataset[lang];
    document.querySelectorAll("[data-set-lang]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.setLang === lang)); });
    if (save) { try { localStorage.setItem("lang", lang); } catch (e) {} }
    try { var u = new URL(location.href); if (u.searchParams.has("lang")) { u.searchParams.delete("lang"); history.replaceState(null, "", u); } } catch (e) {}
  }
  document.querySelectorAll("[data-set-lang]").forEach(function (b) { b.addEventListener("click", function () { setLang(b.dataset.setLang, true); }); });
  setLang(root.dataset.lang || "en");
})();
