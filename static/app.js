/* LeadRadar dashboard interactions: theme toggle, table filter/sort, call-list agent filter. */
(function () {
  "use strict";
  const root = document.documentElement;
  // Directory this script was served from, so the intro loads correctly from
  // both the live app and the static export (where lead pages sit one level down).
  const base = ((document.currentScript && document.currentScript.src) || "").replace(/app\.js(\?.*)?$/, "");
  try {
    const saved = localStorage.getItem("lr-theme");
    if (saved) root.dataset.theme = saved;
  } catch (e) { /* storage unavailable */ }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", () => {
        const dark = root.dataset.theme
          ? root.dataset.theme === "dark"
          : window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.dataset.theme = dark ? "light" : "dark";
        try { localStorage.setItem("lr-theme", root.dataset.theme); } catch (e) { /* ignore */ }
      });
    }

    // ---- filterable tables: <table data-filterable> + inputs with data-filter="attr" ----
    document.querySelectorAll("[data-filter-scope]").forEach((scope) => {
      const rows = Array.from(scope.querySelectorAll("[data-row]"));
      const inputs = Array.from(scope.querySelectorAll("[data-filter]"));
      const counter = scope.querySelector("[data-count]");
      const params = new URLSearchParams(location.search);
      inputs.forEach((i) => { if (params.get(i.dataset.filter)) i.value = params.get(i.dataset.filter); });

      function apply() {
        let shown = 0;
        rows.forEach((r) => {
          const ok = inputs.every((i) => {
            const v = i.value.trim().toLowerCase();
            if (!v) return true;
            if (i.dataset.filter === "q") return (r.dataset.search || "").includes(v);
            return (r.dataset[i.dataset.filter] || "").toLowerCase() === v;
          });
          r.hidden = !ok;
          if (ok) shown++;
        });
        if (counter) counter.textContent = `${shown} of ${rows.length}`;
      }
      inputs.forEach((i) => i.addEventListener("input", apply));
      apply();

      // sortable headers
      const tbody = scope.querySelector("tbody");
      scope.querySelectorAll("th[data-sort]").forEach((th) => {
        th.addEventListener("click", () => {
          const key = th.dataset.sort;
          const desc = !th.classList.contains("sorted-desc");
          scope.querySelectorAll("th").forEach((h) => h.classList.remove("sorted-asc", "sorted-desc"));
          th.classList.add(desc ? "sorted-desc" : "sorted-asc");
          const val = (r) => { const v = r.dataset["s" + key]; const n = parseFloat(v); return isNaN(n) ? (v || "") : n; };
          rows.sort((a, b) => {
            const x = val(a), y = val(b);
            const c = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
            return desc ? -c : c;
          });
          rows.forEach((r) => tbody.appendChild(r));
        });
      });
    });

    // ---- report iframe auto-height ----
    document.querySelectorAll("iframe.report-frame").forEach((f) => {
      const fit = () => { try { f.style.height = f.contentDocument.documentElement.scrollHeight + "px"; } catch (e) { /* cross-origin */ } };
      f.addEventListener("load", () => { fit(); setTimeout(fit, 600); });
    });
  });

  // ---- first-visit intro: intro.js/.css load only when needed ----
  let introLoading = false;
  function openIntro() {
    if (window.LeadRadarIntro) return window.LeadRadarIntro.open();
    if (introLoading) return;
    introLoading = true;
    // Open only once BOTH files have arrived: if intro.js wins the race, the
    // intro shows unstyled (a full-size logo) until intro.css catches up.
    let pending = 2;
    const ready = () => { if (--pending === 0 && window.LeadRadarIntro) window.LeadRadarIntro.open(); };
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = base + "intro.css";
    css.onload = ready;
    css.onerror = () => { pending = -1; }; // no styles: skip the intro rather than show it broken
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = base + "intro.js";
    js.onload = ready;
    document.head.appendChild(js);
  }
  document.addEventListener("DOMContentLoaded", () => {
    const foot = document.querySelector(".side-foot");
    if (foot) {
      const replay = document.createElement("button");
      replay.type = "button";
      replay.className = "theme-btn";
      replay.textContent = "▶ Watch the intro";
      replay.addEventListener("click", openIntro);
      foot.insertBefore(replay, foot.querySelector("#theme-toggle"));
    }
    let seen = true;
    try { seen = !!localStorage.getItem("lr_intro_seen_v1"); } catch (e) { /* storage unavailable: skip */ }
    if (!seen || new URLSearchParams(location.search).has("intro")) openIntro();
  });
})();
