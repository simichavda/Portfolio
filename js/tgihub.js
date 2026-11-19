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
  <div class="cards">
    <a class="card wide" href="#checklist">${ico("checklist")}<div><h3>Manager checklist</h3><p>personal checklist for daily tasks</p></div></a>
    ${linkCard("Logit check", "daily Logit checks", LINKS.logit, "logit")}
    ${linkCard("Audit", "daily BOH audit form", LINKS.audit, "audit")}
    <div class="pair">
      ${halfCard("Deliveroo refunds", "check this week’s refunds", LINKS.deliveroo, "deliveroo")}
      ${halfCard("Uber Eats refunds", "check this week’s refunds", LINKS.ubereats, "ubereats")}
    </div>
    ${linkCard("Feedback", "check Table Talk reviews, sales leads and guest measures", LINKS.feedback, "feedback")}
    ${linkCard("ResDiary", "review bookings and open tables", LINKS.resdiary, "resdiary")}
    ${linkCard("Deliverect", "manage delivery items", LINKS.deliverect, "deliverect")}
    ${linkCard("Tenkites menu recipes", "digital recipe cards", LINKS.tenkites, "tenkites")}
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
