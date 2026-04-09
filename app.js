const HOME_HASH = "#home";

const state = {
  data: null,
};

const el = {
  homeView: document.getElementById("home-view"),
  paperView: document.getElementById("paper-view"),
  homeHeroLabel: document.getElementById("home-hero-label"),
  homeHeroTitle: document.getElementById("home-hero-title"),
  homeHeroSubtitle: document.getElementById("home-hero-subtitle"),
  homeGoalSections: document.getElementById("home-goal-sections"),
  homeCriteria: document.getElementById("home-criteria"),
  graphIntro: document.getElementById("graph-intro"),
  caseStudySubtitle: document.getElementById("case-study-subtitle"),
  caseStudySections: document.getElementById("case-study-sections"),
  paperGraph: document.getElementById("paper-graph"),
  backHome: document.getElementById("back-home"),
  paperStage: document.getElementById("paper-stage"),
  paperTitle: document.getElementById("paper-title"),
  paperMeta: document.getElementById("paper-meta"),
  paperOverview: document.getElementById("paper-overview"),
  paperScoreCards: document.getElementById("paper-score-cards"),
  schemaNote: document.getElementById("schema-note"),
  schemaIntroCard: document.getElementById("schema-intro-card"),
  paperSchema: document.getElementById("paper-schema"),
};

function getPaper(paperId) {
  return state.data.papers.find((paper) => paper.paper_id === paperId);
}

function getRoute() {
  const hash = window.location.hash || HOME_HASH;
  if (hash === HOME_HASH || hash === "#") {
    return { name: "home" };
  }
  if (hash.startsWith("#paper/")) {
    return { name: "paper", paperId: decodeURIComponent(hash.slice("#paper/".length)) };
  }
  return { name: "home" };
}

function setRoute(route) {
  if (route.name === "paper") {
    window.location.hash = `#paper/${encodeURIComponent(route.paperId)}`;
    return;
  }
  window.location.hash = HOME_HASH;
}

function showView(name) {
  el.homeView.classList.toggle("is-hidden", name !== "home");
  el.paperView.classList.toggle("is-hidden", name !== "paper");
}

function formatSchemaValue(value) {
  if (value === null || value === undefined || value === "") {
    return '<span class="schema-empty">未提供</span>';
  }
  if (Array.isArray(value)) {
    return `<ul class="schema-list">${value.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  return `<p>${value}</p>`;
}

function renderHomeView() {
  const { home, benchmark_explanations: benchmarkExplanations, graph } = state.data;
  el.homeHeroLabel.textContent = home.hero.label;
  el.homeHeroTitle.textContent = home.hero.title;
  el.homeHeroSubtitle.textContent = home.hero.subtitle;
  el.graphIntro.textContent = home.graph_intro.body;
  el.caseStudySubtitle.textContent = home.case_study.subtitle;

  el.homeGoalSections.innerHTML = home.goal_sections
    .map(
      (section) => `
        <article class="content-card">
          <h3>${section.title}</h3>
          <p>${section.body}</p>
        </article>
      `,
    )
    .join("");

  el.homeCriteria.innerHTML = Object.entries(benchmarkExplanations)
    .map(
      ([benchmarkKey, benchmark]) => `
        <article class="criteria-card">
          <div class="criteria-head">
            <h3>${benchmark.label}</h3>
            <span class="criteria-key">${benchmarkKey}</span>
          </div>
          <p>${benchmark.purpose}</p>
          <p class="criteria-source"><strong>来源逻辑：</strong>${benchmark.source_logic}</p>
          <div class="criteria-dimensions">
            ${Object.values(benchmark.dimensions)
              .map(
                (dimension) => `
                  <div class="mini-card">
                    <strong>${dimension.label}</strong>
                    <p>${dimension.purpose}</p>
                    <span>${dimension.source_type}</span>
                  </div>
                `,
              )
              .join("")}
          </div>
        </article>
      `,
    )
    .join("");

  el.caseStudySections.innerHTML = home.case_study.sections
    .map(
      (section) => `
        <article class="content-card">
          <h3>${section.title}</h3>
          <p>${section.body}</p>
        </article>
      `,
    )
    .join("");

  const svgWidth = 100;
  const svgHeight = 100;
  const edgeLines = graph.edges
    .map((edge) => {
      const source = graph.nodes.find((node) => node.paper_id === edge.source);
      const target = graph.nodes.find((node) => node.paper_id === edge.target);
      return `<line x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" />`;
    })
    .join("");

  const nodeButtons = graph.nodes
    .map(
      (node) => `
        <button
          class="graph-node"
          type="button"
          data-paper-id="${node.paper_id}"
          style="left:${node.x}%; top:${node.y}%"
        >
          <span class="graph-node-year">${node.year}</span>
          <strong>${node.short_label}</strong>
          <span>${node.stage_label}</span>
        </button>
      `,
    )
    .join("");

  el.paperGraph.innerHTML = `
    <svg class="graph-lines" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="none" aria-hidden="true">
      ${edgeLines}
    </svg>
    ${nodeButtons}
  `;

  [...el.paperGraph.querySelectorAll(".graph-node")].forEach((button) => {
    button.addEventListener("click", () => {
      setRoute({ name: "paper", paperId: button.dataset.paperId });
    });
  });
}

function renderSchemaAccordion(schemaViews) {
  return Object.values(schemaViews)
    .map(
      (view, index) => `
        <details class="schema-accordion" ${index === 0 ? "open" : ""}>
          <summary class="schema-summary">
            <div class="schema-summary-copy">
              <strong>${view.label}</strong>
              <span>${view.description}</span>
            </div>
            <span class="schema-summary-meta">${view.fields.length} 个字段</span>
          </summary>
          <article class="schema-card">
            <div class="schema-field-list">
              ${view.fields
                .map(
                  (field) => `
                    <div class="schema-field">
                      <div class="schema-field-head">
                        <span class="schema-field-label">${field.label}</span>
                        ${field.origin_label ? `<span class="origin-badge">${field.origin_label}</span>` : ""}
                      </div>
                      <div class="schema-field-value schema-value-scroll">
                        ${formatSchemaValue(field.value)}
                      </div>
                    </div>
                  `,
                )
                .join("")}
            </div>
          </article>
        </details>
      `,
    )
    .join("");
}

function renderBenchmarkDetailCard(benchmarkKey, benchmarkMeta, score) {
  const scoreSummary = score.display_summary || score.summary;
  const displayDimensionRationales = score.display_dimension_rationales || score.dimension_rationales;
  return `
    <article class="score-card">
      <div class="score-card-head">
        <div>
          <span class="metric-label">${benchmarkMeta.label}</span>
          <h3>${score.overall_score.toFixed(2)}</h3>
        </div>
        <p class="score-summary">${scoreSummary}</p>
      </div>
      <div class="dimension-list">
        ${Object.entries(benchmarkMeta.dimensions)
          .map(([dimensionKey, dimensionMeta]) => {
            const value = score.dimension_scores[dimensionKey];
            const rationale = displayDimensionRationales[dimensionKey] || score.dimension_rationales[dimensionKey];
            const percentage = `${(value / 5) * 100}%`;
            return `
              <article class="dimension-card">
                <div class="dimension-row">
                  <div class="dimension-name">
                    <span>${dimensionMeta.label}</span>
                    <div class="dimension-bar">
                      <div class="dimension-fill" style="width:${percentage}"></div>
                    </div>
                  </div>
                  <span class="dimension-score">${value.toFixed(2)}</span>
                </div>
                <p class="dimension-meta"><strong>为什么是这个分：</strong> ${rationale}</p>
              </article>
            `;
          })
          .join("")}
      </div>
    </article>
  `;
}

function renderPaperView(paperId) {
  const paper = getPaper(paperId);
  if (!paper) {
    setRoute({ name: "home" });
    return;
  }

  el.paperStage.textContent = `${paper.order}. ${paper.stage_label}`;
  el.paperTitle.textContent = paper.title;
  el.paperMeta.textContent = `${paper.year} · ${paper.graph_teaser}`;
  el.schemaNote.textContent = state.data.display_notes.schema_note;
  el.schemaIntroCard.innerHTML = `
    <h3>${state.data.display_notes.schema_intro.title}</h3>
    <p>${state.data.display_notes.schema_intro.body}</p>
  `;

  el.paperOverview.innerHTML = `
    <article class="content-card">
      <h3>问题 P</h3>
      <p>${paper.problem.summary}</p>
    </article>
    <article class="content-card">
      <h3>工作 W</h3>
      <p>${paper.work.summary}</p>
    </article>
    <article class="content-card">
      <h3>更新 P → P'</h3>
      <p>${paper.update.transition_rationale}</p>
    </article>
    <article class="content-card">
      <h3>当前 Frontier</h3>
      <p>${state.data.frontier.next_value_question}</p>
    </article>
  `;

  el.paperScoreCards.innerHTML = `
    ${renderBenchmarkDetailCard("p_value", state.data.benchmark_explanations.p_value, paper.score_summary.p_value)}
    ${renderBenchmarkDetailCard("w_update", state.data.benchmark_explanations.w_update, paper.score_summary.w_update)}
  `;

  el.paperSchema.innerHTML = renderSchemaAccordion(paper.schema_views);
}

function renderRoute() {
  const route = getRoute();
  if (route.name === "paper") {
    showView("paper");
    renderPaperView(route.paperId);
    return;
  }
  showView("home");
  renderHomeView();
}

async function bootstrap() {
  try {
    const response = await fetch("./data/topic_chain.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    state.data = await response.json();
    if (!window.location.hash || window.location.hash === "#") {
      window.location.hash = HOME_HASH;
    }
    renderRoute();
  } catch (error) {
    el.homeHeroTitle.textContent = "加载失败";
    el.homeHeroSubtitle.textContent = error.message;
  }
}

el.backHome.addEventListener("click", () => {
  setRoute({ name: "home" });
});

window.addEventListener("hashchange", () => {
  if (state.data) {
    renderRoute();
  }
});

bootstrap();
