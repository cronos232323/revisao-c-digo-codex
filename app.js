const API_BASE = location.protocol === "file:" ? "http://127.0.0.1:3000" : "";
const STORAGE_KEY = "cliente-prime-portal-fallback";

const fallbackState = {
  theme: "dark",
  compact: false,
  client: {
    name: "Cliente Prime Demo",
    document: "00.000.000/0001-00",
    manager: "Equipe Prime",
    status: "Ativo"
  },
  metrics: {
    points: 12840,
    cashback: 486,
    tier: "Ouro",
    purchasesGoal: 68,
    referralsGoal: 42,
    usageGoal: 81,
    retention: 88,
    engagement: 74,
    satisfaction: 91
  },
  activities: [
    { at: "09:14", action: "+1.240 pontos por compra qualificada" },
    { at: "Ontem", action: "Resgate: cupom de R$ 50 aprovado" },
    { at: "Seg", action: "Upgrade de nível: Prata para Ouro" }
  ],
  tickets: [
    { id: 1002, at: "Aberto", type: "Financeiro", subject: "Segunda via enviada" },
    { id: 1001, at: "Resolvido", type: "Bonificações", subject: "Pontos ajustados" }
  ],
  products: [
    { name: "Plano Essencial", status: "Ativo", price: "R$ 129/mês", benefit: "Suporte prioritário e painel de consumo", usage: 82, score: 94 },
    { name: "Clube de Benefícios", status: "Ativo", price: "R$ 39/mês", benefit: "Cashback, cupons e campanhas exclusivas", usage: 76, score: 88 },
    { name: "Consultoria Prime", status: "Trial", price: "R$ 0 por 14 dias", benefit: "Diagnóstico e plano de evolução", usage: 44, score: 71 }
  ],
  bonuses: [
    { name: "Cupom R$ 50", cost: 2500, description: "Desconto direto na próxima renovação." },
    { name: "Upgrade por 7 dias", cost: 4200, description: "Libera recursos premium por uma semana." },
    { name: "Consultoria Express", cost: 7800, description: "Sessão de 30 minutos com especialista." }
  ],
  campaigns: [
    "Dobre seus pontos em compras acima de R$ 500",
    "Indique 3 clientes e desbloqueie nível Diamante",
    "Use todos os produtos ativos e ganhe 1.000 pontos extras"
  ],
  ranking: [
    { name: "Ana Martins", tier: "Diamante", points: 28420 },
    { name: "Cliente Prime Demo", tier: "Ouro", points: 12840 },
    { name: "Rafael Lima", tier: "Ouro", points: 11980 },
    { name: "Norte Digital", tier: "Prata", points: 8600 }
  ]
};

let state = structuredClone(fallbackState);
let apiOnline = false;
let autosave = true;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

function nowLabel() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload.error || "Falha na API");
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function loadState() {
  try {
    state = await api("/api/state");
    apiOnline = true;
  } catch {
    const saved = localStorage.getItem(STORAGE_KEY);
    state = saved ? JSON.parse(saved) : structuredClone(fallbackState);
    apiOnline = false;
  }
  hydrate();
}

function persistFallback() {
  if (!apiOnline && autosave) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function serviceLabel() {
  $("#saveState").textContent = apiOnline ? "Backend conectado" : "Modo local";
}

function pushLocalActivity(action) {
  state.activities = [{ at: nowLabel(), action }, ...(state.activities || [])].slice(0, 20);
  persistFallback();
}

function bump(selector) {
  const node = $(selector);
  node.classList.remove("flash");
  void node.offsetWidth;
  node.classList.add("flash");
}

function setView(viewId) {
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
  $$(".nav-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === viewId));
  const titles = {
    dashboard: "Visão geral do cliente",
    products: "Produtos contratados",
    bonuses: "Bonificações e campanhas",
    ranking: "Ranking e níveis",
    support: "Atendimento ao cliente",
    settings: "Configurações da demo"
  };
  $("#pageTitle").textContent = titles[viewId] || "Portal Cliente Prime";
}

function updateTier() {
  if (state.metrics.points >= 20000) state.metrics.tier = "Diamante";
  else if (state.metrics.points >= 10000) state.metrics.tier = "Ouro";
  else if (state.metrics.points >= 5000) state.metrics.tier = "Prata";
  else state.metrics.tier = "Bronze";

  const row = state.ranking.find((item) => item.name === state.client.name);
  if (row) {
    row.points = state.metrics.points;
    row.tier = state.metrics.tier;
  }
}

function updateMetrics() {
  updateTier();
  $("#pointsCount").textContent = formatNumber(state.metrics.points);
  $("#cashbackCount").textContent = formatCurrency(state.metrics.cashback);
  $("#tierLabel").textContent = state.metrics.tier;
  $("#purchaseGoalBar").style.width = `${Math.min(state.metrics.purchasesGoal, 100)}%`;
  $("#referralGoalBar").style.width = `${Math.min(state.metrics.referralsGoal, 100)}%`;
  $("#usageGoalBar").style.width = `${Math.min(state.metrics.usageGoal, 100)}%`;
  $("#retentionBar").style.width = `${Math.min(state.metrics.retention, 100)}%`;
  $("#engagementBar").style.width = `${Math.min(state.metrics.engagement, 100)}%`;
  $("#satisfactionBar").style.width = `${Math.min(state.metrics.satisfaction, 100)}%`;
}

function renderActivities() {
  $("#activityList").innerHTML = state.activities.map((entry) => (
    `<li><time>${entry.at}</time><span>${entry.action}</span></li>`
  )).join("");
}

function renderProducts() {
  $("#productGrid").innerHTML = state.products.map((product) => `
    <article class="product-card">
      <header>
        <h4>${product.name}</h4>
        <span class="tag">${product.status}</span>
      </header>
      <p>${product.benefit}</p>
      <div class="price-line">
        <strong>${product.price}</strong>
        <span>${product.usage}% uso</span>
      </div>
      <div class="metric-row">
        <div class="metric-mini"><strong>${product.score}</strong><span>score</span></div>
        <div class="metric-mini"><strong>${product.usage}%</strong><span>adoção</span></div>
      </div>
      <button data-product="${product.name}">Ver detalhes</button>
    </article>
  `).join("");

  $$("[data-product]").forEach((button) => {
    button.addEventListener("click", () => {
      pushLocalActivity(`Detalhes consultados: ${button.dataset.product}`);
      renderActivities();
    });
  });
}

function renderBonuses() {
  $("#bonusCatalog").innerHTML = state.bonuses.map((bonus) => `
    <article class="bonus-card">
      <header>
        <h4>${bonus.name}</h4>
        <span class="tag">${formatNumber(bonus.cost)} pts</span>
      </header>
      <p>${bonus.description}</p>
      <button data-bonus="${bonus.name}" data-cost="${bonus.cost}">Resgatar</button>
    </article>
  `).join("");

  $$("[data-bonus]").forEach((button) => {
    button.addEventListener("click", () => redeemBonus(button.dataset.bonus, Number(button.dataset.cost)));
  });

  $("#campaignList").innerHTML = state.campaigns.map((campaign) => `<li><span></span>${campaign}</li>`).join("");
}

function renderRanking() {
  $("#rankingList").innerHTML = [...state.ranking]
    .sort((a, b) => b.points - a.points)
    .map((person) => `
      <li>
        <div class="ranking-row">
          <div><strong>${person.name}</strong><span>${person.tier}</span></div>
          <strong>${formatNumber(person.points)} pts</strong>
        </div>
      </li>
    `).join("");

  $("#tierList").innerHTML = [
    ["Bronze", "0 a 4.999 pontos", "Entrada no programa e campanhas básicas."],
    ["Prata", "5.000 a 9.999 pontos", "Cashback ampliado e suporte preferencial."],
    ["Ouro", "10.000 a 19.999 pontos", "Bonificações exclusivas e upgrades mensais."],
    ["Diamante", "20.000+ pontos", "Consultoria, campanhas especiais e atendimento VIP."]
  ].map(([title, range, description]) => `
    <article class="tier-card">
      <header><h4>${title}</h4><span class="tag">${range}</span></header>
      <p>${description}</p>
    </article>
  `).join("");
}

function renderTickets() {
  $("#ticketList").innerHTML = state.tickets.map((ticket) => (
    `<li><time>${ticket.at}</time><span>${ticket.type}: ${ticket.subject}</span></li>`
  )).join("");
}

function hydrate() {
  document.body.dataset.theme = state.theme || "dark";
  document.body.classList.toggle("compact", Boolean(state.compact));
  $("#themeToggle").textContent = state.theme === "dark" ? "Tema claro" : "Tema escuro";
  $("#autosaveToggle").checked = autosave;
  $("#compactToggle").checked = Boolean(state.compact);
  serviceLabel();
  updateMetrics();
  renderActivities();
  renderProducts();
  renderBonuses();
  renderRanking();
  renderTickets();
}

async function refreshFromAction(action, fallback) {
  try {
    state = await action();
    apiOnline = true;
  } catch (error) {
    if (error.payload?.state) state = error.payload.state;
    else fallback?.();
    apiOnline = false;
    persistFallback();
  }
  hydrate();
}

async function earnBonus() {
  await refreshFromAction(
    () => api("/api/actions/purchase", { method: "POST", body: "{}" }),
    () => {
      state.metrics.points += 1240;
      state.metrics.cashback += 42;
      state.metrics.purchasesGoal = Math.min(100, state.metrics.purchasesGoal + 8);
      state.metrics.engagement = Math.min(100, state.metrics.engagement + 4);
      pushLocalActivity("+1.240 pontos e R$ 42 de cashback por compra local");
    }
  );
  bump("#pointsCount");
  bump("#cashbackCount");
}

async function redeemBonus(name = "Cupom R$ 50", cost = 2500) {
  await refreshFromAction(
    () => api("/api/actions/redeem", { method: "POST", body: JSON.stringify({ name, cost }) }),
    () => {
      if (state.metrics.points >= cost) {
        state.metrics.points -= cost;
        state.metrics.satisfaction = Math.min(100, state.metrics.satisfaction + 3);
        pushLocalActivity(`Resgate local aprovado: ${name}`);
      } else {
        pushLocalActivity(`Saldo insuficiente para resgate: ${name}`);
      }
    }
  );
  bump("#pointsCount");
}

async function runScenario() {
  await refreshFromAction(
    () => api("/api/actions/month", { method: "POST", body: "{}" }),
    () => {
      state.metrics.points += 1240;
      state.metrics.cashback += 42;
      state.metrics.purchasesGoal = Math.min(100, state.metrics.purchasesGoal + 8);
      state.metrics.referralsGoal = Math.min(100, state.metrics.referralsGoal + 18);
      state.metrics.usageGoal = Math.min(100, state.metrics.usageGoal + 7);
      state.metrics.retention = Math.min(100, state.metrics.retention + 3);
      state.metrics.engagement = Math.min(100, state.metrics.engagement + 4);
      pushLocalActivity("Simulação mensal executada em modo local");
    }
  );
}

async function openTicket() {
  const payload = {
    type: $("#ticketType").value,
    subject: $("#ticketSubject").value.trim() || "Novo atendimento",
    message: $("#ticketMessage").value.trim()
  };
  await refreshFromAction(
    () => api("/api/tickets", { method: "POST", body: JSON.stringify(payload) }),
    () => {
      const nextId = Math.max(1000, ...state.tickets.map((ticket) => Number(ticket.id || 0))) + 1;
      state.tickets = [{ id: nextId, at: "Aberto", type: payload.type, subject: payload.subject }, ...state.tickets].slice(0, 20);
      state.metrics.satisfaction = Math.max(60, state.metrics.satisfaction - 2);
      pushLocalActivity(`Chamado local aberto: ${payload.type}`);
    }
  );
}

async function updateSettings(next) {
  Object.assign(state, next);
  try {
    state = await api("/api/settings", { method: "PATCH", body: JSON.stringify(next) });
    apiOnline = true;
  } catch {
    apiOnline = false;
    persistFallback();
  }
  hydrate();
}

async function exportReport() {
  let report = state;
  try {
    report = await api("/api/report");
    apiOnline = true;
  } catch {
    apiOnline = false;
  }
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "relatorio-cliente-prime.json";
  link.click();
  URL.revokeObjectURL(url);
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
  state = structuredClone(fallbackState);
  hydrate();
}

function bindEvents() {
  $$(".nav-tab").forEach((tab) => tab.addEventListener("click", () => setView(tab.dataset.view)));
  $("#themeToggle").addEventListener("click", () => updateSettings({ theme: state.theme === "dark" ? "light" : "dark" }));
  $("#runScenario").addEventListener("click", runScenario);
  $("#earnBonus").addEventListener("click", earnBonus);
  $("#redeemBonus").addEventListener("click", () => redeemBonus());
  $("#openTicket").addEventListener("click", openTicket);
  $("#exportReport").addEventListener("click", exportReport);
  $("#clearStorage").addEventListener("click", clearStorage);
  $("#autosaveToggle").addEventListener("change", (event) => {
    autosave = event.target.checked;
    serviceLabel();
  });
  $("#compactToggle").addEventListener("change", (event) => updateSettings({ compact: event.target.checked }));
}

bindEvents();
loadState();
