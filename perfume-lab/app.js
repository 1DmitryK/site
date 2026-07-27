const navItems = [
  ["home", "Overview", "◌"],
  ["perfumes", "Perfumes", "P"],
  ["accords", "Signature Accords", "A"],
  ["oils", "Essential Oils", "E"],
  ["molecules", "Aroma Molecules", "M"],
  ["experiments", "Experiments", "X"],
  ["journal", "Laboratory Journal", "J"],
  ["knowledge", "Knowledge Base", "K"]
];

const state = {
  perfumes: [],
  materials: [],
  accords: [],
  content: {},
  perfumeFilter: "All",
  oilFilter: "All"
};

const app = document.querySelector("#app");
const nav = document.querySelector("#primary-nav");
const dialog = document.querySelector("#search-dialog");
const searchInput = document.querySelector("#global-search");
const searchResults = document.querySelector("#search-results");

const esc = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);

async function loadData() {
  const [perfumes, materials, accords, content] = await Promise.all([
    fetch("./data/perfumes.json").then((r) => r.json()),
    fetch("./data/materials.json").then((r) => r.json()),
    fetch("./data/accords.json").then((r) => r.json()),
    fetch("./data/content.json").then((r) => r.json())
  ]);
  Object.assign(state, { perfumes, materials, accords, content });
}

function renderNav() {
  nav.innerHTML = navItems.map(([route, label, icon]) => `
    <a class="nav-link" href="#${route}" data-route="${route}">
      <span class="nav-icon">${icon}</span><span>${label}</span>
    </a>
  `).join("");
}

function head(eyebrow, title, lead, date = "") {
  return `
    <header class="page-head">
      <div>
        <div class="eyebrow">${esc(eyebrow)}</div>
        <h1 class="page-title">${esc(title)}</h1>
        <p class="lead">${esc(lead)}</p>
      </div>
      ${date ? `<div class="date-block"><span>Laboratory date</span><strong>${esc(date)}</strong></div>` : ""}
    </header>
  `;
}

function status(value) {
  return `<span class="status ${esc(value)}">${esc(value)}</span>`;
}

function perfumeCard(perfume, index) {
  return `
    <a class="record-card" href="#perfume/${esc(perfume.id)}">
      <div class="record-top"><span class="record-index">${String(index + 1).padStart(2, "0")}</span>${status(perfume.status)}</div>
      <h3>${esc(perfume.name)}</h3>
      <p>${esc(perfume.story)}</p>
      <div class="record-footer">
        <span class="record-notes">${esc(perfume.collection)}<br>${esc(perfume.character)}</span>
        <span class="arrow">↗</span>
      </div>
    </a>
  `;
}

function homeView() {
  const featured = state.perfumes[0];
  return `
    <section class="page">
      ${head("Personal formula archive / public-safe edition", "Olfactory laboratory", "A living workspace for perfumes, accords, materials, experiments and disciplined sensory observation.", "27 · 07 · 26")}
      <div class="hero-grid">
        <a class="feature-card" href="#perfume/${featured.id}">
          <span class="feature-number">FEATURED STUDY / ${esc(featured.version)}</span>
          <h2>${esc(featured.name)}</h2>
          <p>${esc(featured.story)}</p>
          <div class="feature-tags">${featured.character.split(" · ").map((item) => `<span class="tag">${esc(item)}</span>`).join("")}</div>
        </a>
        <div class="stat-stack">
          <div class="stat-card"><span>Formula studies</span><strong>${state.perfumes.length}</strong></div>
          <div class="stat-card"><span>Recorded materials</span><strong>${state.materials.length}</strong></div>
          <div class="stat-card"><span>Signature accords</span><strong>${state.accords.length}</strong></div>
        </div>
      </div>
      <div class="section-head"><h2>Current studies</h2><a class="text-link" href="#perfumes">View catalogue →</a></div>
      <div class="card-grid">${state.perfumes.slice(0, 3).map(perfumeCard).join("")}</div>
    </section>
  `;
}

function perfumesView() {
  const filters = ["All", "Men", "Women", "Unisex"];
  const list = state.perfumeFilter === "All"
    ? state.perfumes
    : state.perfumes.filter((item) => item.collection === state.perfumeFilter);
  return `
    <section class="page">
      ${head("Formula archive", "Perfumes", "Laboratory versions and concepts. Exact ratios are intentionally withheld while this repository is public.")}
      <div class="toolbar">${filters.map((item) => `<button class="filter-button ${state.perfumeFilter === item ? "active" : ""}" data-perfume-filter="${item}">${item}</button>`).join("")}</div>
      <div class="card-grid">${list.map(perfumeCard).join("")}</div>
    </section>
  `;
}

function perfumeView(id) {
  const item = state.perfumes.find((perfume) => perfume.id === id);
  if (!item) return notFound();
  const noteRow = (label, values) => `
    <div class="note-row">
      <span class="note-label">${label}</span>
      <div class="ingredient-list">${values.map((value) => `<span class="tag">${esc(value)}</span>`).join("")}</div>
    </div>`;
  return `
    <section class="page">
      ${head(`${item.collection} / ${item.version}`, item.name, item.story)}
      <div class="formula-view">
        <article class="formula-panel">
          <div class="record-top"><span class="eyebrow">Olfactory architecture</span>${status(item.status)}</div>
          ${noteRow("Opening", item.top)}
          ${noteRow("Heart", item.heart)}
          ${noteRow("Foundation", item.base)}
          <div class="privacy-notice">⌁ ${esc(item.privacy)} This page documents direction and version identity without exposing the author formula.</div>
        </article>
        <aside class="info-panel">
          <h2>Study record</h2>
          <div class="metric"><span>Version</span><strong>${esc(item.version)}</strong></div>
          <div class="metric"><span>Category</span><strong>${esc(item.collection)}</strong></div>
          <div class="metric"><span>Format</span><strong>${esc(item.concentration)}</strong></div>
          <div class="metric"><span>Formula data</span><strong>Private</strong></div>
          <div class="metric"><span>Next gate</span><strong>Blotter test</strong></div>
        </aside>
      </div>
    </section>
  `;
}

function accordsView() {
  return `
    <section class="page">
      ${head("Reusable olfactory structures", "Signature Accords", "A small library of recognisable ideas that can recur across different perfumes without making them smell identical.")}
      <div class="card-grid">${state.accords.map((item, index) => `
        <article class="record-card">
          <div class="record-top"><span class="record-index">${String(index + 1).padStart(2, "0")}</span>${status(item.status)}</div>
          <h3>${esc(item.name)}</h3>
          <p>${esc(item.description)}</p>
          <div class="ingredient-list">${item.materials.map((name) => `<span class="tag">${esc(name)}</span>`).join("")}</div>
          <div class="record-footer"><span class="record-notes">${esc(item.family)}<br>${esc(item.version)}</span></div>
        </article>`).join("")}
      </div>
    </section>
  `;
}

function oilsView() {
  const filters = ["All", "citrus", "wood", "floral", "aromatic", "resin", "spice"];
  const list = state.oilFilter === "All" ? state.materials : state.materials.filter((item) => item.family === state.oilFilter);
  return `
    <section class="page">
      ${head("Recorded inventory", "Essential Oils", `${state.materials.length} materials transcribed from the known inventory. Two previously mentioned items still need identification before they are added.`)}
      <div class="toolbar">${filters.map((item) => `<button class="filter-button ${state.oilFilter === item ? "active" : ""}" data-oil-filter="${item}">${item}</button>`).join("")}</div>
      <div class="material-grid">${list.map((item, index) => `
        <article class="material-card family-${item.family}">
          <span class="material-code">EO–${String(index + 1).padStart(3, "0")}</span>
          <h3>${esc(item.name)}</h3>
          <p><em>${esc(item.botanical)}</em></p>
          <div class="material-meta"><span>${esc(item.family)}</span><span>${esc(item.note)}</span></div>
          <p>${esc(item.profile)}</p>
        </article>`).join("")}
      </div>
    </section>
  `;
}

function moleculesView() {
  return `
    <section class="page">
      ${head("Professional material shortlist", "Aroma Molecules", "A future purchasing and evaluation list. No material is marked as owned until its supplier, identity and documentation are recorded.")}
      <div class="card-grid">${state.content.molecules.map((item, index) => `
        <article class="record-card">
          <div class="record-top"><span class="record-index">M–${String(index + 1).padStart(2, "0")}</span><span class="status concept">${esc(item.status)}</span></div>
          <h3>${esc(item.name)}</h3>
          <p>${esc(item.note)}</p>
          <div class="record-footer"><span class="record-notes">${esc(item.family)}<br>${esc(item.role)}</span></div>
        </article>`).join("")}
      </div>
    </section>
  `;
}

function experimentsView() {
  return `
    <section class="page">
      ${head("Controlled trials", "Experiments", "Questions before recipes: each experiment defines what changes, what stays constant and when the result will be evaluated.")}
      <div class="card-grid">${state.content.experiments.map((item) => `
        <article class="record-card">
          <div class="record-top"><span class="record-index">${esc(item.code)}</span><span class="status concept">${esc(item.status)}</span></div>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.question)}</p>
          <div class="record-footer"><span class="record-notes">Next<br>${esc(item.next)}</span></div>
        </article>`).join("")}
      </div>
    </section>
  `;
}

function journalView() {
  return `
    <section class="page">
      ${head("Chronological observations", "Laboratory Journal", "A disciplined record of decisions, exclusions, evaluations and next steps.")}
      <div class="timeline">${state.content.journal.map((item) => `
        <article class="timeline-item">
          <span class="timeline-date">${esc(item.date)}</span>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.text)}</p>
        </article>`).join("")}
      </div>
    </section>
  `;
}

function knowledgeView() {
  return `
    <section class="page">
      ${head("Learning library", "Knowledge Base", "A growing, evidence-minded guide to formulation, evaluation, safety and professional perfumery practice.")}
      <div class="card-grid">${state.content.knowledge.map((item, index) => `
        <article class="record-card">
          <div class="record-top"><span class="record-index">KB–${String(index + 1).padStart(2, "0")}</span><span class="tag">${esc(item.topic)}</span></div>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.summary)}</p>
          <div class="record-footer"><span class="record-notes">Draft article<br>Sources to be reviewed</span></div>
        </article>`).join("")}
      </div>
    </section>
  `;
}

function notFound() {
  return `<section class="page"><div class="empty-state"><strong>Record not found</strong><span>Return to the laboratory overview.</span></div></section>`;
}

function route() {
  const raw = location.hash.replace(/^#/, "") || "home";
  const [name, id] = raw.split("/");
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.route === (name === "perfume" ? "perfumes" : name)));
  const views = {
    home: homeView,
    perfumes: perfumesView,
    perfume: () => perfumeView(id),
    accords: accordsView,
    oils: oilsView,
    molecules: moleculesView,
    experiments: experimentsView,
    journal: journalView,
    knowledge: knowledgeView
  };
  app.innerHTML = (views[name] || notFound)();
  window.scrollTo({ top: 0, behavior: "instant" });
  document.querySelector(".sidebar").classList.remove("open");
  document.querySelector("#menu-button").setAttribute("aria-expanded", "false");
}

function searchableRecords() {
  return [
    ...state.perfumes.map((item) => ({ title: item.name, type: "Perfume", detail: `${item.collection} · ${item.character}`, href: `#perfume/${item.id}`, text: JSON.stringify(item) })),
    ...state.accords.map((item) => ({ title: item.name, type: "Accord", detail: item.family, href: "#accords", text: JSON.stringify(item) })),
    ...state.materials.map((item) => ({ title: item.name, type: "Essential oil", detail: `${item.family} · ${item.profile}`, href: "#oils", text: JSON.stringify(item) })),
    ...state.content.molecules.map((item) => ({ title: item.name, type: "Molecule", detail: item.role, href: "#molecules", text: JSON.stringify(item) })),
    ...state.content.knowledge.map((item) => ({ title: item.title, type: "Knowledge", detail: item.topic, href: "#knowledge", text: JSON.stringify(item) }))
  ];
}

function renderSearch(query = "") {
  const normalized = query.trim().toLowerCase();
  const results = searchableRecords()
    .filter((item) => !normalized || item.text.toLowerCase().includes(normalized))
    .slice(0, 10);
  searchResults.innerHTML = results.length ? results.map((item) => `
    <a class="search-result" href="${item.href}">
      <span><strong>${esc(item.title)}</strong><span>${esc(item.detail)}</span></span>
      <em>${esc(item.type)}</em>
    </a>`).join("") : `<div class="empty-state"><strong>No matches</strong><span>Try a material, accord or formula name.</span></div>`;
}

function openSearch() {
  renderSearch();
  dialog.showModal();
  requestAnimationFrame(() => searchInput.focus());
}

document.addEventListener("click", (event) => {
  const perfumeFilter = event.target.closest("[data-perfume-filter]");
  const oilFilter = event.target.closest("[data-oil-filter]");
  if (perfumeFilter) { state.perfumeFilter = perfumeFilter.dataset.perfumeFilter; route(); }
  if (oilFilter) { state.oilFilter = oilFilter.dataset.oilFilter; route(); }
  if (event.target.closest(".search-result")) dialog.close();
});

document.querySelector("#search-button").addEventListener("click", openSearch);
document.querySelector("#menu-button").addEventListener("click", () => {
  const sidebar = document.querySelector(".sidebar");
  const open = sidebar.classList.toggle("open");
  document.querySelector("#menu-button").setAttribute("aria-expanded", String(open));
});
searchInput.addEventListener("input", () => renderSearch(searchInput.value));
window.addEventListener("hashchange", route);
window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
  }
});

renderNav();
loadData().then(route).catch(() => {
  app.innerHTML = `<section class="page"><div class="empty-state"><strong>Laboratory data could not be loaded</strong><span>Serve this folder over HTTP and reload.</span></div></section>`;
});
