// ===== SETTINGS: your links =====
const LINKS = {
  logit: "https://monitor.logit.co.uk/Check",
  audit: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=B3muhmsCDkyoYLuR5PyQHVf7pUYrD8xDswypxakT7kNUMEpDV1FYVzBSTlZWR05LQkRJREZEMjVPNS4u&origin=Invitation&channel=0",
  resdiary: "https://login.resdiary.com/Security/Login/LandingPage?Username=highwycombe%40tgifridays.co.uk&RememberMe=True&ReturnUrl=%2FSecurity%2FLogin%2FRedirectToDefault&IsAccessUser=False&AccessMandatoryMigrationEnabled=False&UserId=0&AccessIdentityMandatoryProviderFeatureEnabled=False&UseSharedIntercomWorkspace=False&IsTurnstileEnabled=False&ShowSignInAsDifferentUser=False",
  deliveroo: "https://partner-hub.deliveroo.com/analytics?orgId=574737&dateRangePreset=last_7_days&branchId=86190",
  ubereats: "https://merchants.ubereats.com/manager/home/6e1851e4-9cd6-535f-8d0e-0b2d68997190?dateRange=this_week",
  tenkites: "https://menus.tenkites.com/tgifridayuk/digitalrecipecard02",
  deliverect: "https://enterprise.deliverect.com/home",
  feedback: "https://tgi-feedback-flow.lovable.app/store",
  hive: "https://tgifridays.elementsuite.net/portal.php?site=portal&page=spa"
};

// Built-in checklist tasks. days: 0 = Sunday ... 6 = Saturday. Leave days out for every day.
const DEFAULT_TASKS = [
  { id: "am-logit", text: "AM logit checks" },
  { id: "delivery", text: "Delivery check", days: [1, 3, 5], tag: "Mon, Wed, Fri" },
  { id: "loomis", text: "Loomis cash collection", days: [2], tag: "Tuesdays" },
  { id: "pm-logit", text: "PM logit checks" }
];
// ================================

// Codes / info page. Edit the rows below: name = left column, value = copyable right column.
const USERNAME = "highwycombe@tgifridays.co.uk";
const INFO = [
  { name: "Set Alarm Code", value: "250681A" },
  { name: "Allergy Tablet", value: "0642" },
  { name: "Table Talk", value: "HighFD!23" },
  { name: "Resdiary Login", value: "Fridays#1" },
  { name: "UberEats Manager", value: "Fridays#1" },
  { name: "Deliveroo Manager", value: "Fridays#11" },
  { name: "Deliverect", value: "Fridays#11" },
  { name: "Expo Login", value: "2026" },
  { name: "Logit Login", value: "Fridays642!" }
];

// Store contact details shown at the bottom of the Codes / info / contacts page.
const CONTACTS = [
  { label: "Store Phone Number", value: "0330 175 9255", href: "tel:03301759255" },
  { label: "Store Email Address", value: "highwycombe@tgifridays.co.uk", href: "mailto:highwycombe@tgifridays.co.uk" },
  { label: "Store Address", value: "Crest Rd, High Wycombe HP11 1UA" }
];

const KEY = "manager-hub-v1";
let state = { tasks: [], done: {} };
try {
  const s = localStorage.getItem(KEY);
  if (s) state = Object.assign(state, JSON.parse(s));
} catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };

const pad = n => String(n).padStart(2, "0");
const dkey = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const parseKey = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

let selected = dkey(new Date());
let viewMonth = parseKey(selected);
viewMonth.setDate(1);

const repeatTag = t => t.repeat === "once" ? "One-time" : t.repeat === "weekly" ? "Weekly" : "Daily";

function tasksFor(k) {
  const dow = parseKey(k).getDay();
  const list = DEFAULT_TASKS
    .filter(x => !x.days || x.days.includes(dow))
    .map(x => ({ id: x.id, text: x.text, tag: x.tag, fixed: true }));
  // Custom tasks. Older tasks have no "repeat" or "start", so they stay daily on every date.
  const custom = state.tasks.filter(t => {
    if (t.repeat === "once") return t.date === k;
    if (t.start && k < t.start) return false;
    if (t.repeat === "weekly") return t.dow === dow;
    return true;
  }).map(t => ({ id: t.id, text: t.text, tag: repeatTag(t) }));
  return list.concat(custom);
}
function progress(k) {
  const t = tasksFor(k), d = state.done[k] || {};
  return { n: t.filter(x => d[x.id]).length, total: t.length };
}
// Icons (phone layout only). Simple line icons, drawn inline so no internet is needed.
const ICONS = {
  checklist: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  logit: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
  audit: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/>',
  deliveroo: '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
  ubereats: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  feedback: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  resdiary: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  deliverect: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  tenkites: '<path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/>',
  hive: '<rect x="9" y="3" width="6" height="3" rx="1.5"/><rect x="7" y="7" width="10" height="3.5" rx="1.75"/><rect x="5" y="11.5" width="14" height="3.5" rx="1.75"/><rect x="4" y="16" width="16" height="4.5" rx="2.25"/><path d="M10.5 20.5v-1.5a1.5 1.5 0 0 1 3 0v1.5"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'
};
const ico = n => `<span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</svg></span>`;

function linkCard(title, desc, url, icon) {
  return url
    ? `<a class="card tile" href="${esc(url)}" target="_blank" rel="noopener">${ico(icon)}<h3>${title}</h3><p>${desc}</p></a>`
    : `<div class="card tile off">${ico(icon)}<h3>${title}</h3><p>${desc} Link not set yet.</p></div>`;
}

function halfCard(title, desc, url, icon) {
  return url
    ? `<a class="card half tile" href="${esc(url)}" target="_blank" rel="noopener">${ico(icon)}<h3>${title}</h3><p>${desc}</p></a>`
    : `<div class="card half tile off">${ico(icon)}<h3>${title}</h3><p>${desc}</p></div>`;
}

function viewHub() {
  return `<h2>Today’s hub</h2>
  <p class="sub">${new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
  ${metricsHTML()}
  <div class="cards">
    <a class="card wide" href="#checklist">${ico("checklist")}<div><h3>Manager checklist</h3><p>personal checklist for daily tasks</p></div></a>
    ${linkCard("Logit check", "daily Logit checks", LINKS.logit, "logit")}
    ${linkCard("Audit", "daily BOH audit form", LINKS.audit, "audit")}
    <div class="pair">
      ${halfCard("Deliveroo Manager", "check this week’s refunds", LINKS.deliveroo, "deliveroo")}
      ${halfCard("Uber Eats Manager", "check this week’s refunds", LINKS.ubereats, "ubereats")}
    </div>
    ${linkCard("Feedback", "check Table Talk reviews, sales leads and guest measures", LINKS.feedback, "feedback")}
    ${linkCard("ResDiary", "review bookings and open tables", LINKS.resdiary, "resdiary")}
    ${linkCard("Deliverect", "manage delivery items", LINKS.deliverect, "deliverect")}
    ${linkCard("Tenkites menu recipes", "digital recipe cards", LINKS.tenkites, "tenkites")}
    ${linkCard("Hive", "access Hive platform", LINKS.hive, "hive")}
    <a class="card tile" href="#codes-info-contacts">${ico("info")}<h3>Codes / info / contacts</h3><p>handy codes, information and contact details.</p></a>
  </div>`;
}

function viewChecklist() {
  const t = tasksFor(selected), d = state.done[selected] || {}, p = progress(selected);
  const isToday = selected === dkey(new Date());
  const label = parseKey(selected).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const items = t.map(x => `<li class="${d[x.id] ? "done" : ""}">
      <input type="checkbox" id="c-${x.id}" data-act="toggle" data-id="${x.id}" ${d[x.id] ? "checked" : ""}>
      <label for="c-${x.id}">${esc(x.text)}${x.tag ? `<span class="tag">${x.tag}</span>` : ""}</label>
      ${x.fixed ? "" : `<button class="ghost" data-act="remove" data-id="${x.id}" aria-label="Remove ${esc(x.text)}">Remove</button>`}
    </li>`).join("");

  const first = viewMonth.getDay();
  const days = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  let cells = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(x => `<div class="dow">${x}</div>`).join("");
  for (let i = 0; i < first; i++) cells += `<div class="day blank"></div>`;
  const todayK = dkey(new Date());
  for (let i = 1; i <= days; i++) {
    const k = viewMonth.getFullYear() + "-" + pad(viewMonth.getMonth() + 1) + "-" + pad(i), pr = progress(k);
    const cls = pr.total && pr.n === pr.total ? "full" : pr.n ? "part" : "";
    cells += `<button class="day ${cls} ${k === todayK ? "today" : ""} ${k === selected ? "sel" : ""}" data-act="pick" data-k="${k}" aria-label="${k}, ${pr.n} of ${pr.total} done">${i}</button>`;
  }

  return `<h2>Manager checklist</h2>
  <p class="sub">${label}${isToday ? " (today)" : ""}</p>
  <div class="panel">
    <strong>${p.n} of ${p.total} done</strong>
    <div class="bar"><i style="width:${p.total ? (p.n / p.total * 100) : 0}%"></i></div>
    ${items ? `<ul class="list">${items}</ul>` : `<p class="empty">No tasks yet. Add your first one below.</p>`}
    <div class="addtask">
      <div class="addrow">
        <input type="text" id="newTask" placeholder="Add a new task" maxlength="120" aria-label="New task">
        <button class="addbtn" data-act="add">+ Add</button>
      </div>
      <div class="seg" role="radiogroup" aria-label="How often">
        <label><input type="radio" name="repeat" value="once" checked><span>One-time</span></label>
        <label><input type="radio" name="repeat" value="daily"><span>Daily</span></label>
        <label><input type="radio" name="repeat" value="weekly"><span>Weekly</span></label>
      </div>
    </div>
  </div>
  <div class="panel">
    ${dayTargetsHTML(selected)}
    <div class="cal-head">
      <button class="ghost" data-act="prev" aria-label="Previous month">Prev</button>
      <strong>${viewMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</strong>
      <button class="ghost" data-act="next" aria-label="Next month">Next</button>
    </div>
    <div class="grid">${cells}</div>
    <p class="legend">Solid red: all tasks done. Tinted: some done. White ring: today.</p>
  </div>`;
}

function viewInfo() {
  const rows = INFO.map(x => `<tr data-name="${esc(x.name.toLowerCase())}">
      <td class="nm">${esc(x.name)}</td>
      <td class="pw"><div class="pwcell"><span>${esc(x.value)}</span><button class="ghost" data-act="copy" data-text="${esc(x.value)}">Copy</button></div></td>
    </tr>`).join("");
  return `<h2>Codes / info / contacts</h2>
  <p class="sub"><a class="lk" href="#">Back to hub</a></p>
  <div class="panel user-row">
    <div><span class="note">Username (used for most logins)</span><br><strong>${esc(USERNAME)}</strong></div>
    <button data-act="copy" data-text="${esc(USERNAME)}">Copy username</button>
  </div>
  <div class="panel">
    <input type="text" id="infoSearch" placeholder="Search codes and info" autocomplete="off" aria-label="Search codes and info" style="width:100%">
    <table class="info"><tbody>${rows}</tbody></table>
    <p class="empty" id="noMatch" hidden style="margin:12px 0 0">No matches.</p>
  </div>
  <div class="panel">
    <h3 style="margin:0 0 4px;font-size:1.05rem">Store contact details</h3>
    <table class="info"><tbody>${CONTACTS.map(c => `<tr>
      <td class="nm">${esc(c.label)}</td>
      <td>${c.href ? `<a href="${esc(c.href)}">${esc(c.value)}</a>` : esc(c.value)}</td>
    </tr>`).join("")}</tbody></table>
  </div>`;
}

async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    const t = document.createElement("textarea");
    t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select();
    try { document.execCommand("copy"); } catch (_) {}
    t.remove();
  }
  const old = btn.textContent;
  btn.textContent = "Copied";
  setTimeout(() => { btn.textContent = old; }, 1200);
}

// ===== Key metrics (read from data/metrics.csv: ASPH, Sales, Covers, Date) =====
const METRICS_URL = "data/metrics.csv";
const METRICS_KEY = "manager-hub-metrics-csv";
let metricsMap = null;      // date (YYYY-MM-DD) -> { asph, sales, covers }
let metricsText = "";
let metricsSource = "none"; // "file" = read from the CSV, "cache"/"picked" = remembered copy, "none" = nothing yet

function parseCSV(text) {
  const rows = [];
  let row = [], cur = "", q = false;
  text = text.replace(/^\uFEFF/, "");
  const endRow = () => { row.push(cur); cur = ""; if (row.some(x => x.trim() !== "")) rows.push(row); row = []; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; endRow(); }
    else cur += c;
  }
  endRow();
  return rows;
}
function parseDateKey(s) {
  s = String(s || "").trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return m[1] + "-" + pad(+m[2]) + "-" + pad(+m[3]);
  m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/); // UK style day/month/year, as Excel saves it
  return m ? m[3] + "-" + pad(+m[2]) + "-" + pad(+m[1]) : null;
}
function parseNum(s) {
  const n = parseFloat(String(s || "").replace(/[£,\s]/g, ""));
  return isNaN(n) ? null : n;
}
function ingestMetrics(text, source) {
  const rows = parseCSV(text);
  if (!rows.length) return;
  const head = rows[0].map(x => x.trim().toLowerCase());
  const hasHead = head.includes("date") || head.includes("asph");
  const col = (name, fallback) => { const i = head.indexOf(name); return hasHead && i >= 0 ? i : fallback; };
  const iA = col("asph", 0), iS = col("sales", 1), iC = col("covers", 2), iD = col("date", 3);
  const map = {};
  rows.slice(hasHead ? 1 : 0).forEach(r => {
    const k = parseDateKey(r[iD]);
    if (k) map[k] = { asph: parseNum(r[iA]), sales: parseNum(r[iS]), covers: parseNum(r[iC]) };
  });
  metricsMap = map;
  metricsSource = source;
}
function setMetrics(text, source) {
  const changed = text !== metricsText || source !== metricsSource;
  metricsText = text;
  ingestMetrics(text, source);
  return changed;
}
function refreshView() { // only redraw pages that show the figures, and only if they changed
  const r = location.hash.replace("#", "");
  if (r === "" || r === "checklist") render();
}
async function loadMetrics() {
  let changed = false;
  try {
    const r = await fetch(METRICS_URL + "?t=" + Date.now(), { cache: "no-store" });
    if (!r.ok) throw new Error(r.status);
    const text = await r.text();
    changed = setMetrics(text, "file");
    try { localStorage.setItem(METRICS_KEY, text); } catch (e) {}
  } catch (e) {
    if (metricsSource !== "file") {
      let cached = null;
      try { cached = localStorage.getItem(METRICS_KEY); } catch (_) {}
      if (cached) changed = setMetrics(cached, "cache");
    }
  }
  if (changed) refreshView();
}
function pickMetricsFile() {
  const f = document.createElement("input");
  f.type = "file";
  f.accept = ".csv,text/csv";
  f.onchange = () => {
    const file = f.files[0];
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      const text = String(rd.result);
      setMetrics(text, "picked");
      try { localStorage.setItem(METRICS_KEY, text); } catch (e) {}
      refreshView();
    };
    rd.readAsText(file);
  };
  f.click();
}
function metricCards(m) {
  const gbp2 = v => v == null ? "—" : "£" + v.toFixed(2);
  const gbp0 = v => v == null ? "—" : "£" + Math.round(v).toLocaleString("en-GB");
  const num = v => v == null ? "—" : Math.round(v).toLocaleString("en-GB");
  return `<div class="card metric"><div class="lbl">ASPH</div><div class="val">${gbp2(m && m.asph)}</div></div>
    <div class="card metric"><div class="lbl">Sales</div><div class="val">${gbp0(m && m.sales)}</div></div>
    <div class="card metric"><div class="lbl">Covers</div><div class="val">${num(m && m.covers)}</div></div>`;
}
function metricsHTML() {
  const m = metricsMap && metricsMap[dkey(new Date())];
  let note = "";
  if (metricsSource !== "file") {
    note = (metricsSource === "none"
      ? "Couldn’t read data/metrics.csv automatically (browsers block this when a page is opened straight from a folder). "
      : "Couldn’t read data/metrics.csv automatically, so these come from the last file you loaded. ")
      + '<button class="ghost" data-act="loadcsv">Load metrics file</button>';
  } else if (!m) {
    note = "No figures for today in the CSV yet.";
  }
  return `<h3 class="subhead">Key Metrics and Targets</h3>
  <div class="metrics">${metricCards(m)}</div>
  ${note ? `<p class="note metric-note">${note}</p>` : ""}`;
}
function dayTargetsHTML(k) {
  const m = metricsMap && metricsMap[k];
  const title = parseKey(k).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  const body = m
    ? `<div class="metrics small">${metricCards(m)}</div>`
    : `<p class="note" style="margin:0">${metricsMap ? "No figures for this day in the CSV." : "Figures haven’t loaded yet. Check the hub page."}</p>`;
  return `<div class="day-targets"><h4>Targets for ${title}</h4>${body}</div>`;
}

const app = document.getElementById("app");
const home = document.getElementById("homeLink");

function render() {
  const r = location.hash.replace("#", "");
  home.hidden = !r;
  app.innerHTML = r === "checklist" ? viewChecklist() : r === "codes-info-contacts" ? viewInfo() : viewHub();
}

app.addEventListener("click", e => {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  const a = b.dataset.act;
  if (a === "copy") { copyText(b.dataset.text, b); return; }
  if (a === "loadcsv") { pickMetricsFile(); return; }
  if (a === "toggle") {
    (state.done[selected] = state.done[selected] || {})[b.dataset.id] = b.checked;
    save();
  } else if (a === "remove") {
    state.tasks = state.tasks.filter(x => x.id !== b.dataset.id);
    save();
  } else if (a === "add") {
    const v = document.getElementById("newTask").value.trim();
    if (!v) return;
    const repeat = document.querySelector('input[name="repeat"]:checked').value; // once (default), daily or weekly
    state.tasks.push({ id: uid(), text: v, repeat, start: selected, date: selected, dow: parseKey(selected).getDay() });
    save();
  } else if (a === "pick") {
    selected = b.dataset.k;
  } else if (a === "prev") {
    viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1);
  } else if (a === "next") {
    viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
  }
  render();
});

app.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.id === "newTask") {
    e.preventDefault();
    app.querySelector('[data-act="add"]').click();
  }
});

app.addEventListener("input", e => {
  if (e.target.id !== "infoSearch") return;
  const q = e.target.value.trim().toLowerCase();
  let shown = 0;
  app.querySelectorAll("tr[data-name]").forEach(r => {
    const show = r.dataset.name.includes(q);
    r.hidden = !show;
    if (show) shown++;
  });
  document.getElementById("noMatch").hidden = shown > 0;
});

window.addEventListener("hashchange", render);

// Refresh log check statuses, and roll over to the new day at midnight
let lastDay = dkey(new Date());
setInterval(() => {
  const t = dkey(new Date());
  if (t !== lastDay) {
    lastDay = t;
    selected = t;
    viewMonth = parseKey(t);
    viewMonth.setDate(1);
    render();
  }
}, 30000);

// Footer year
const yr = document.getElementById("year");
if (yr) yr.textContent = new Date().getFullYear();

render();
loadMetrics();
setInterval(loadMetrics, 5 * 60 * 1000); // pick up CSV edits every 5 minutes
document.addEventListener("visibilitychange", () => { if (!document.hidden) loadMetrics(); });
