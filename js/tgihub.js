// ===== SETTINGS: your links =====
const LINKS = {
  logit: "https://monitor.logit.co.uk/Check",
  audit: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=B3muhmsCDkyoYLuR5PyQHVf7pUYrD8xDswypxakT7kNUMEpDV1FYVzBSTlZWR05LQkRJREZEMjVPNS4u&origin=Invitation&channel=0",
  resdiary: "https://login.resdiary.com/Security/Login/LandingPage?Username=highwycombe%40tgifridays.co.uk&RememberMe=True&ReturnUrl=%2FSecurity%2FLogin%2FRedirectToDefault&IsAccessUser=False&AccessMandatoryMigrationEnabled=False&UserId=0&AccessIdentityMandatoryProviderFeatureEnabled=False&UseSharedIntercomWorkspace=False&IsTurnstileEnabled=False&ShowSignInAsDifferentUser=False",
  deliveroo: "https://partner-hub.deliveroo.com/analytics?orgId=574737&dateRangePreset=last_7_days&branchId=86190",
  ubereats: "https://merchants.ubereats.com/manager/home/6e1851e4-9cd6-535f-8d0e-0b2d68997190?dateRange=this_week",
  tenkites: "https://menus.tenkites.com/tgifridayuk/digitalrecipecard02",
  deliverect: "https://deliverect-enterprise.eu.auth0.com/u/login?state=hKFo2SByRVBKckdMUnl0cl9kcHBrVExOc2ZSSUoxbXlYQ0NsVqFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIGw2TkFPM0s2OUNKNkhvQVNuNFVjQnl2UXhpQURpWkpwo2NpZNkgZVMyRjdFbUJ1SkcwN3NCSUJsdGtwcWNYVW5nSzZudG0",
  feedback: "https://tgi-feedback-flow.lovable.app/store"
};

// Built-in checklist tasks. days: 0 = Sunday ... 6 = Saturday. Leave days out for every day.
const DEFAULT_TASKS = [
  { id: "am-logit", text: "AM logit checks" },
  { id: "delivery", text: "Delivery check", days: [1, 3, 5], tag: "Mon, Wed, Fri" },
  { id: "loomis", text: "Loomis cash collection", days: [2], tag: "Tuesdays" },
  { id: "pm-logit", text: "PM logit checks" }
];
// ================================

const KEY = "manager-hub-v1";
let state = { tasks: [], done: {}, times: [] };
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

function tasksFor(k) {
  const dow = parseKey(k).getDay();
  const list = DEFAULT_TASKS
    .filter(x => !x.days || x.days.includes(dow))
    .map(x => ({ id: x.id, text: x.text, tag: x.tag, fixed: true }));
  return list.concat(state.tasks);
}
function progress(k) {
  const t = tasksFor(k), d = state.done[k] || {};
  return { n: t.filter(x => d[x.id]).length, total: t.length };
}
function fmt(t) { const [h, m] = t.split(":").map(Number); return ((h % 12) || 12) + ":" + pad(m) + " " + (h < 12 ? "AM" : "PM"); }
function mins(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function statusOf(x) {
  const now = new Date(), c = now.getHours() * 60 + now.getMinutes(), s = mins(x.start), e = mins(x.end);
  if (e >= s) return c < s ? "up" : c <= e ? "open" : "closed";
  return c >= s || c <= e ? "open" : "up"; // window that runs past midnight
}

function linkCard(title, desc, url) {
  return url
    ? `<a class="card" href="${esc(url)}" target="_blank" rel="noopener"><h3>${title}</h3><p>${desc}</p></a>`
    : `<div class="card off"><h3>${title}</h3><p>${desc} Link not set yet.</p></div>`;
}

function halfCard(title, url) {
  return url
    ? `<a class="card half" href="${esc(url)}" target="_blank" rel="noopener"><h3>${title}</h3></a>`
    : `<div class="card half off"><h3>${title}</h3></div>`;
}

function viewHub() {
  return `<h2>Today’s hub</h2>
  <p class="sub">${new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
  <div class="cards">
    ${linkCard("Logit check", "Open the Logit check website.", LINKS.logit)}
    <a class="card" href="#checklist"><h3>Manager checklist</h3><p>Daily tasks, delivery checks and your calendar.</p></a>
    ${linkCard("Audit", "Open the audit form.", LINKS.audit)}
    ${linkCard("ResDiary", "Open the ResDiary login.", LINKS.resdiary)}
    <div class="pair">
      ${halfCard("Deliveroo refunds", LINKS.deliveroo)}
      ${halfCard("Uber Eats refunds", LINKS.ubereats)}
    </div>
    ${linkCard("Tenkites menu recipes", "Open the digital recipe cards.", LINKS.tenkites)}
    ${linkCard("Deliverect", "Open the Deliverect login.", LINKS.deliverect)}
    ${linkCard("Feedback", "Open the feedback flow.", LINKS.feedback)}
    <a class="card" href="#codes-info-contacts"><h3>Codes / info / contacts</h3><p>Handy codes, information and contact details.</p></a>
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
  <p class="sub">${label}${isToday ? " (today)" : ""} &nbsp;|&nbsp; <a class="lk" href="#logit-times">Logit Time Check</a></p>
  <div class="panel">
    <strong>${p.n} of ${p.total} done</strong>
    <div class="bar"><i style="width:${p.total ? (p.n / p.total * 100) : 0}%"></i></div>
    ${items ? `<ul class="list">${items}</ul>` : `<p class="empty">No tasks yet. Add your first one below.</p>`}
    <div class="row"><input type="text" id="newTask" placeholder="Add a daily task" maxlength="120"><button data-act="add">Add task</button></div>
    <p class="note">Tasks you add repeat every day. Check-offs are saved separately for each date.</p>
  </div>
  <div class="panel">
    <div class="cal-head">
      <button class="ghost" data-act="prev" aria-label="Previous month">Prev</button>
      <strong>${viewMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</strong>
      <button class="ghost" data-act="next" aria-label="Next month">Next</button>
    </div>
    <div class="grid">${cells}</div>
    <p class="legend">Solid red: all tasks done. Tinted: some done. White ring: today.</p>
  </div>`;
}

function viewTimes() {
  const rows = state.times.slice().sort((a, b) => mins(a.start) - mins(b.start)).map(x => {
    const s = statusOf(x), txt = { open: "Open now", up: "Upcoming", closed: "Closed" }[s];
    return `<li><label style="cursor:default"><strong>${esc(x.name)}</strong><br><span class="note">${fmt(x.start)} to ${fmt(x.end)}</span></label>
      <span class="status s-${s}">${txt}</span>
      <button class="ghost" data-act="rmtime" data-id="${x.id}" aria-label="Remove ${esc(x.name)}">Remove</button></li>`;
  }).join("");
  return `<h2>Logit Time Check</h2>
  <p class="sub"><a class="lk" href="#checklist">Back to checklist</a></p>
  <div class="panel">
    ${rows ? `<ul class="list">${rows}</ul>` : `<p class="empty">No log checks yet. Add one with its submission window.</p>`}
    <div class="row"><input type="text" id="tName" placeholder="Log check name" maxlength="80"></div>
    <div class="row" style="margin-top:8px">
      <label class="note" style="flex:1;min-width:120px">Window starts<br><input type="time" id="tStart" style="width:100%"></label>
      <label class="note" style="flex:1;min-width:120px">Window ends<br><input type="time" id="tEnd" style="width:100%"></label>
    </div>
    <div class="row" style="margin-top:10px"><button data-act="addtime">Add log check</button></div>
  </div>`;
}

function viewInfo() {
  return `<h2>Codes / info / contacts</h2>
  <p class="sub"><a class="lk" href="#">Back to hub</a></p>
  <div class="panel"><p class="empty" style="margin:0">Nothing here yet. Codes, info and contacts will be added soon.</p></div>`;
}

const app = document.getElementById("app");
const home = document.getElementById("homeLink");

function render() {
  const r = location.hash.replace("#", "");
  home.hidden = !r;
  app.innerHTML = r === "checklist" ? viewChecklist() : r === "logit-times" ? viewTimes() : r === "codes-info-contacts" ? viewInfo() : viewHub();
}

app.addEventListener("click", e => {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  const a = b.dataset.act;
  if (a === "toggle") {
    (state.done[selected] = state.done[selected] || {})[b.dataset.id] = b.checked;
    save();
  } else if (a === "remove") {
    state.tasks = state.tasks.filter(x => x.id !== b.dataset.id);
    save();
  } else if (a === "add") {
    const v = document.getElementById("newTask").value.trim();
    if (!v) return;
    state.tasks.push({ id: uid(), text: v });
    save();
  } else if (a === "pick") {
    selected = b.dataset.k;
  } else if (a === "prev") {
    viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1);
  } else if (a === "next") {
    viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
  } else if (a === "addtime") {
    const name = document.getElementById("tName").value.trim();
    const s = document.getElementById("tStart").value;
    const en = document.getElementById("tEnd").value;
    if (!name || !s || !en) return;
    state.times.push({ id: uid(), name, start: s, end: en });
    save();
  } else if (a === "rmtime") {
    state.times = state.times.filter(x => x.id !== b.dataset.id);
    save();
  }
  render();
});

app.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.id === "newTask") {
    e.preventDefault();
    app.querySelector('[data-act="add"]').click();
  }
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
  } else if (location.hash === "#logit-times") {
    render();
  }
}, 30000);

render();
