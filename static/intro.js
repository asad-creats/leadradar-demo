/* LeadRadar first-visit intro: a full-screen, story-style walkthrough shown once
   before a visitor explores the dashboard. Plain-JS port of the ProductIntro
   React component in asad-creats/projects (styles in intro.css).

   Each scene is copy on the left and a small animated mock on the right. Scenes
   auto-advance on a progress bar (paused while pressed and held, while the tab
   is hidden, and entirely under prefers-reduced-motion). Loaded on demand by
   app.js, which calls LeadRadarIntro.open(). */
(function () {
  "use strict";

  const ACCENT = "#3987E5";
  const SCENE_MS = 6000;
  const KEY = "lr_intro_seen_v1";
  const d = (s) => `--d:${s}s`;

  const MARK = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#2a78d6"/><circle cx="16" cy="16" r="9" fill="none" stroke="#fff" stroke-width="2.5" opacity=".55"/><circle cx="16" cy="16" r="4.5" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M16 16 23 9" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>';
  // Every mock screen is stamped as fake, alongside the note above each scene's copy.
  const HEAD = (t) => `<div class="pi-mock-h"><span class="pi-dots"><i></i><i></i><i></i></span>${t}<span class="pi-fake-chip">Fake data</span></div>`;
  const FAKE_NOTE = '<div class="pi-fake-note" role="note"><b>Demo · fake data.</b> Every name, phone number, score and dollar figure here is dummy, AI-generated sample data.</div>';
  const TIER = { Hot: ["#F06A6A", "rgba(240,106,106,.15)"], Warm: ["#F0B43C", "rgba(240,180,60,.15)"], Cold: ["#7AA7FF", "rgba(122,167,255,.15)"] };
  const pill = (tier, delay) => `<span class="pi-pill pi-pop" style="color:${TIER[tier][0]};background:${TIER[tier][1]};${d(delay)}">${tier}</span>`;
  const CHECK = '<svg viewBox="0 0 12 12"><path d="M2 6.5l2.5 2.5L10 3"/></svg>';

  function scored() {
    const leads = [
      ["Maria Gonzalez", "MG", "#e87ba4", 92, "Hot"],
      ["David Chen", "DC", "#1baf7a", 78, "Hot"],
      ["Priya Raman", "PR", "#eb6834", 61, "Warm"],
      ["Tom Becker", "TB", "#2a78d6", 44, "Warm"],
      ["Alicia Moore", "AM", "#a3a7ae", 18, "Cold"],
    ];
    return `<div class="pi-mock">${HEAD("Leads · ranked by score")}${leads.map(([n, i, c, s, t], k) => `
      <div class="pi-row pi-in" style="${d(0.15 + k * 0.12)}">
        <span class="pi-avatar" style="background:${c}">${i}</span>
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>${n}</span><span class="pi-muted">${s}</span></div>
          <div class="pi-track"><span class="pi-fill" style="--w:${s}%;background:${TIER[t][0]};${d(0.5 + k * 0.12)}"></span></div>
        </div>
        ${pill(t, 1.2 + k * 0.12)}
      </div>`).join("")}</div>`;
  }

  function reason() {
    const why = [
      ["🏠", "Viewed 4 listings in the last 48h", 0.9],
      ["📞", "Answered a call yesterday (6 min)", 1.6],
      ["💬", "Replied to a text: “Is Saturday open?”", 2.3],
      ["💰", "Pre-approved up to $520k", 3.0],
    ];
    return `<div class="pi-mock">${HEAD("Lead detail")}
      <div class="pi-row pi-in" style="${d(0.1)};justify-content:space-between">
        <div style="display:flex;align-items:center;gap:10px"><span class="pi-avatar" style="background:#e87ba4">MG</span><div><strong>Maria Gonzalez</strong><div class="pi-muted">Buyer · Austin, TX</div></div></div>
        <div style="text-align:right"><div style="font-size:24px;font-weight:800;color:${TIER.Hot[0]}">92</div>${pill("Hot", 0.4)}</div>
      </div>
      <div class="pi-muted pi-in" style="margin:14px 0 2px;${d(0.6)}">Why she's hot</div>
      ${why.map(([e, t, at]) => `<div class="pi-row pi-slide" style="${d(at)}"><span>${e}</span><span>${t}</span></div>`).join("")}
    </div>`;
  }

  function callList() {
    const calls = [
      ["Maria Gonzalez", "Hot", "Viewing spree — call before noon", true],
      ["David Chen", "Hot", "Asked about a showing", true],
      ["Priya Raman", "Warm", "Quiet 9 days — re-engage", false],
      ["Tom Becker", "Warm", "Open task: send comps", false],
    ];
    return `<div class="pi-mock">${HEAD("Today's call list · 12 leads")}${calls.map(([n, t, why, done], k) => {
      const at = 1.3 + k * 0.6;
      return `<div class="pi-row pi-in" style="${d(0.15 + k * 0.12)}">
        <span class="pi-muted" style="width:16px">${k + 1}</span>
        ${done ? `<span class="pi-check" style="${d(at)}">${CHECK}</span>` : '<span class="pi-check" style="animation:none"></span>'}
        <div style="flex:1;min-width:0"><span class="${done ? "pi-strike" : ""}" style="${done ? d(at + 0.2) : ""}">${n}</span><div class="pi-muted">${why}</div></div>
        ${pill(t, 0.4 + k * 0.12)}
      </div>`;
    }).join("")}</div>`;
  }

  function reports() {
    const bars = [38, 52, 45, 70, 64, 82, 76];
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    return `<div class="pi-mock">${HEAD("Daily report · this week")}
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
        ${[["New leads", "41", ACCENT], ["Calls made", "128", "#1baf7a"], ["Deals", "3", "#F0B43C"]].map(([l, n, c], k) => `
          <div class="pi-row pi-pop" style="display:block;margin-top:0;${d(0.1 + k * 0.12)}"><div style="font-size:22px;font-weight:800;color:${c}">${n}</div><div class="pi-muted">${l}</div></div>`).join("")}
      </div>
      <div class="pi-row" style="display:flex;align-items:flex-end;gap:10px;height:150px;padding:14px 16px 10px">
        ${bars.map((h, k) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end">
          <div style="width:100%;height:${h}%;border-radius:6px 6px 2px 2px;background:linear-gradient(180deg,${ACCENT},#2a78d6);transform-origin:bottom;animation:lr-bar .8s cubic-bezier(.22,1,.36,1) both;animation-delay:${0.6 + k * 0.1}s"></div>
          <span class="pi-muted" style="font-size:11px">${days[k]}</span></div>`).join("")}
      </div>
    </div>`;
  }

  const SCENES = [
    { id: "scored", kicker: "LeadRadar · for Follow Up Boss", title: "Every lead, scored and ranked.",
      body: "LeadRadar syncs your leads, calls, texts and deals from Follow Up Boss and ranks every one Hot, Warm or Cold — so you know exactly who to work first.", visual: scored },
    { id: "reason", kicker: "No black box", title: "A plain-English reason for every score.",
      body: "Each lead shows the signals behind its score — recent viewings, calls, replies, pre-approval — in words you can act on.", visual: reason },
    { id: "calls", kicker: "Start the day focused", title: "A daily call list that builds itself.",
      body: "Every morning you get an ordered call list with why each lead is on it. Work top to bottom and nothing hot goes cold.", visual: callList },
    { id: "reports", kicker: "See the trend", title: "Daily reports with charts.",
      body: "Track new leads, calls and deals over time, with an HTML report for every day. Everything in this demo is fake, AI-generated sample data: no real people, phone numbers or clients. Go explore it.", visual: reports },
  ];

  const seen = () => { try { return !!localStorage.getItem(KEY); } catch (e) { return true; } };
  const markSeen = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) { /* ignore */ } };

  function open() {
    if (document.querySelector(".pi-root")) return;
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = 0;
    let holding = false;

    const root = document.createElement("div");
    root.className = "pi-root" + (reduced ? " pi-reduced" : "");
    root.style.setProperty("--pi-accent", ACCENT);
    root.style.setProperty("--pi-scene-ms", SCENE_MS + "ms");
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "LeadRadar introduction");
    root.innerHTML = `
      <div class="pi-glow"></div>
      <header class="pi-top">
        <div class="pi-brand">${MARK}<span>LeadRadar</span></div>
        <div class="pi-bars" aria-hidden="true">${SCENES.map(() => '<button type="button" class="pi-bar" tabindex="-1"><span class="pi-bar-fill"></span></button>').join("")}</div>
        <button type="button" class="pi-skip" data-act="close">Skip intro</button>
      </header>
      <main class="pi-stage"><section class="pi-copy"></section><section class="pi-visual" aria-hidden="true"></section></main>
      <footer class="pi-nav">
        <button type="button" class="pi-navbtn" data-act="back">← Back</button>
        <span class="pi-count"></span>
        <button type="button" class="pi-navbtn strong" data-act="next">Next →</button>
      </footer>`;

    const bars = Array.from(root.querySelectorAll(".pi-bar"));
    const copy = root.querySelector(".pi-copy");
    const visual = root.querySelector(".pi-visual");
    const count = root.querySelector(".pi-count");
    const backBtn = root.querySelector('[data-act="back"]');
    const nextBtn = root.querySelector('[data-act="next"]');
    const stage = root.querySelector(".pi-stage");

    function syncPause() {
      const fill = bars[index] && bars[index].firstChild;
      if (fill) fill.classList.toggle("paused", holding || document.hidden || reduced);
    }

    function render() {
      const s = SCENES[index];
      const last = index === SCENES.length - 1;
      copy.innerHTML = FAKE_NOTE + `<div class="pi-kicker">${s.kicker}</div><h1 class="pi-title">${s.title}</h1><p class="pi-body">${s.body}</p>` +
        (last ? '<div class="pi-ctas"><button type="button" class="pi-btn primary" data-act="close">Explore the dashboard →</button></div>' : "");
      visual.innerHTML = s.visual();
      // Replay the entrance animations by re-inserting the sections.
      [copy, visual].forEach((el) => { const p = el.parentNode, n = el.nextSibling; p.removeChild(el); p.insertBefore(el, n); });

      bars.forEach((b, i) => {
        const fresh = document.createElement("span");
        fresh.className = "pi-bar-fill" + (i < index ? " done" : "") + (i === index ? " active" : "");
        if (i === index && !last) fresh.addEventListener("animationend", next);
        b.replaceChild(fresh, b.firstChild);
      });
      count.textContent = `${index + 1} / ${SCENES.length}`;
      backBtn.disabled = index === 0;
      nextBtn.style.visibility = last ? "hidden" : "visible";
      syncPause();
    }

    function go(i) { index = Math.max(0, Math.min(SCENES.length - 1, i)); render(); }
    function next() { go(index + 1); }
    function back() { go(index - 1); }

    function close() {
      markSeen();
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", syncPause);
      document.body.style.overflow = prevOverflow;
      root.remove();
    }

    function onKey(e) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") back();
    }

    root.addEventListener("click", (e) => {
      const act = e.target.closest("[data-act]");
      if (act) ({ close, next, back })[act.dataset.act]();
      const bar = e.target.closest(".pi-bar");
      if (bar) go(bars.indexOf(bar));
    });
    // Press and hold anywhere on the scene to pause, like a story viewer.
    stage.addEventListener("pointerdown", () => { holding = true; syncPause(); });
    ["pointerup", "pointerleave", "pointercancel"].forEach((t) => stage.addEventListener(t, () => { holding = false; syncPause(); }));
    document.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", syncPause);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.appendChild(root);
    render();
  }

  window.LeadRadarIntro = { open, seen };
})();
