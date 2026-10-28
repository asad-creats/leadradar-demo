/* LeadRadar charts: declarative specs -> Chart.js, colored from CSS tokens so light/dark both work.
 *
 * Markup: a <canvas data-chart="key"> plus a JSON script tag with id "viz-data" holding {key: spec}.
 * spec = {kind: "line"|"bar"|"hbar"|"stacked", labels: [...], series: [{name, data, color: "--token"}],
 *         format: "int"|"pct"|"min"|"score", colors?: ["--token" per bar]}
 */
(function () {
  "use strict";
  const charts = [];
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || name;
  const color = (c) => (c && c.startsWith("--") ? css(c) : c);

  function fmt(v, f) {
    if (v === null || v === undefined) return "-";
    if (f === "pct") return v + "%";
    if (f === "min") return v < 60 ? Math.round(v) + " min" : v < 1440 ? (v / 60).toFixed(1) + " h" : (v / 1440).toFixed(1) + " d";
    if (f === "score") return Number(v).toFixed(1);
    return Number(v).toLocaleString();
  }

  function build(canvas, spec) {
    const grid = css("--grid"), text2 = css("--text-2"), muted = css("--muted"), surface = css("--surface");
    const kind = spec.kind;
    const horizontal = kind === "hbar";
    const isLine = kind === "line";
    const datasets = spec.series.map((s) => {
      const base = color(s.color || "--s1");
      const ds = { label: s.name, data: s.data };
      if (isLine) {
        Object.assign(ds, {
          borderColor: base, backgroundColor: base, borderWidth: 2, tension: 0.3,
          pointRadius: 0, pointHoverRadius: 5, pointHoverBorderWidth: 2, pointHoverBorderColor: surface,
          fill: false,
        });
      } else {
        const per = spec.colors ? spec.colors.map(color) : base;
        Object.assign(ds, {
          backgroundColor: per, borderColor: surface, borderWidth: kind === "stacked" ? { top: 2 } : 0,
          borderRadius: kind === "stacked" ? 0 : 4, borderSkipped: kind === "stacked" ? false : "start",
          maxBarThickness: horizontal ? 18 : 28, categoryPercentage: 0.8, barPercentage: 0.9,
        });
      }
      return ds;
    });
    const valueAxis = {
      beginAtZero: true, grid: { color: grid, drawTicks: false }, border: { display: false },
      ticks: { color: muted, padding: 6, font: { size: 11 }, maxTicksLimit: 6, callback: (v) => fmt(v, spec.format) },
      stacked: kind === "stacked",
    };
    if (spec.max) valueAxis.max = spec.max;
    const catAxis = {
      grid: { display: false }, border: { color: grid },
      ticks: { color: text2, font: { size: 11.5 }, autoSkip: spec.labels.length > 12, maxRotation: 0, autoSkipPadding: 12 },
      stacked: kind === "stacked",
    };
    return new Chart(canvas, {
      type: isLine ? "line" : "bar",
      data: { labels: spec.labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
        indexAxis: horizontal ? "y" : "x",
        interaction: { mode: "index", intersect: false, axis: horizontal ? "y" : "x" },
        layout: { padding: { right: horizontal ? 8 : 4 } },
        scales: horizontal ? { x: valueAxis, y: catAxis } : { x: catAxis, y: valueAxis },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: css("--text"), titleColor: surface, bodyColor: surface, padding: 10, cornerRadius: 8,
            boxPadding: 4, usePointStyle: true,
            callbacks: { label: (c) => ` ${c.dataset.label}: ${fmt(c.parsed[horizontal ? "x" : "y"], spec.format)}` },
          },
        },
      },
    });
  }

  function renderAll() {
    const el = document.getElementById("viz-data");
    if (!el || typeof Chart === "undefined") return;
    const specs = JSON.parse(el.textContent);
    charts.splice(0).forEach((c) => c.destroy());
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    document.querySelectorAll("canvas[data-chart]").forEach((cv) => {
      const spec = specs[cv.dataset.chart];
      if (spec) charts.push(build(cv, spec));
    });
  }

  window.LeadRadarCharts = { renderAll };
  document.addEventListener("DOMContentLoaded", renderAll);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", renderAll);
  new MutationObserver(renderAll).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
})();
