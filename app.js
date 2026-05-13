const STORAGE_KEY = "cliente-prime-portal-demo";

const defaults = {
  theme: "dark",
  autosave: true,
  compact: false,
  points: 12840,
  cashback: 486,
  tier: "Ouro",
  purchasesGoal: 68,
  referralsGoal: 42,
  usageGoal: 81,
  retention: 88,
  engagement: 74,
  satisfaction: 91,
  activities: [
    { at: "09:14", action: "+1.240 pontos por compra qualificada" },
    { at: "Ontem", action: "Resgate: cupom de R$ 50 aprovado" },
    { at: "Seg", action: "Upgrade de nível: Prata para Ouro" }
  ],
  tickets: [
    { at: "Aberto", action: "Financeiro: segunda via enviada" },
    { at: "Resolvido", action: "Bonificações: pontos ajustados" }
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

const state = loadState();
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaults, ...saved };
  } catch {
    return structuredClone(defaults);
  }
}

function saveState() {
  if (!state.autosave) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  $("#saveState").textContent = "Salvo localmente";
}

function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

function nowLabel() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function pushActivity(action) {
  state.activities = [{ at: nowLabel(), action }, ...state.activities].slice(0, 12);
  renderActivities();
  saveState();
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

function updateMetrics() {
  $("#pointsCount").textContent = formatNumber(state.points);
  $("#cashbackCount").textContent = formatCurrency(state.cashback);
  $("#tierLabel").textContent = state.tier;
  $("#purchaseGoalBar").style.width = `${Math.min(state.purchasesGoal, 100)}%`;
  $("#referralGoalBar").style.width = `${Math.min(state.referralsGoal, 100)}%`;
  $("#usageGoalBar").style.width = `${Math.min(state.usageGoal, 100)}%`;
  $("#retentionBar").style.width = `${Math.min(state.retention, 100)}%`;
  $("#engagementBar").style.width = `${Math.min(state.engagement, 100)}%`;
  $("#satisfactionBar").style.width = `${Math.min(state.satisfaction, 100)}%`;
}

function renderActivities() {
  const list = $("#activityList");
  list.innerHTML = "";
  state.activities.forEach((entry) => {
    const li = document.createElement("li");
    li.innerHTML = `<time>${entry.at}</time><span>${entry.action}</span>`;
    list.appendChild(li);
  });
}

function renderProducts() {
  const grid = $("#productGrid");
  grid.innerHTML = "";
  state.products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
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
    `;
    grid.appendChild(card);
  });

  $$("[data-product]").forEach((button) => {
    button.addEventListener("click", () => pushActivity(`Detalhes consultados: ${button.dataset.product}`));
  });
}

function renderBonuses() {
  const grid = $("#bonusCatalog");
  grid.innerHTML = "";
  state.bonuses.forEach((bonus) => {
    const card = document.createElement("article");
    card.className = "bonus-card";
    card.innerHTML = `
      <header>
        <h4>${bonus.name}</h4>
        <span class="tag">${formatNumber(bonus.cost)} pts</span>
      </header>
      <p>${bonus.description}</p>
      <button data-bonus="${bonus.name}" data-cost="${bonus.cost}">Resgatar</button>
    `;
    grid.appendChild(card);
  });

  $$("[data-bonus]").forEach((button) => {
    button.addEventListener("click", () => redeemSpecificBonus(button.dataset.bonus, Number(button.dataset.cost)));
  });

  const campaigns = $("#campaignList");
  campaigns.innerHTML = "";
  state.campaigns.forEach((campaign) => {
    const li = document.createElement("li");
    li.innerHTML = `<span></span>${campaign}`;
    campaigns.appendChild(li);
  });
}

function renderRanking() {
  const list = $("#rankingList");
  list.innerHTML = "";
  state.ranking
    .sort((a, b) => b.points - a.points)
    .forEach((person) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="ranking-row">
          <div><strong>${person.name}</strong><span>${person.tier}</span></div>
          <strong>${formatNumber(person.points)} pts</strong>
        </div>
      `;
      list.appendChild(li);
    });

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
  const list = $("#ticketList");
  list.innerHTML = "";
  state.tickets.forEach((ticket) => {
    const li = document.createElement("li");
    li.innerHTML = `<time>${ticket.at}</time><span>${ticket.action}</span>`;
    list.appendChild(li);
  });
}

function earnBonus() {
  state.points += 1240;
  state.cashback += 42;
  state.purchasesGoal = Math.min(100, state.purchasesGoal + 8);
  state.engagement = Math.min(100, state.engagement + 4);
  updateTier();
  updateMetrics();
  bump("#pointsCount");
  bump("#cashbackCount");
  pushActivity("+1.240 pontos e R$ 42 de cashback por compra simulada");
}

function redeemSpecificBonus(name, cost) {
  if (state.points < cost) {
    pushActivity(`Tentativa de resgate sem saldo: ${name}`);
    return;
  }
  state.points -= cost;
  state.satisfaction = Math.min(100, state.satisfaction + 3);
  updateMetrics();
  bump("#pointsCount");
  pushActivity(`Resgate aprovado: ${name}`);
}

function redeemBonus() {
  redeemSpecificBonus("Cupom R$ 50", 2500);
}

function openTicket() {
  const type = $("#ticketType").value;
  const subject = $("#ticketSubject").value.trim() || "Novo atendimento";
  state.tickets = [{ at: "Aberto", action: `${type}: ${subject}` }, ...state.tickets].slice(0, 10);
  state.satisfaction = Math.max(60, state.satisfaction - 2);
  renderTickets();
  updateMetrics();
  pushActivity(`Chamado aberto: ${type}`);
}

function runScenario() {
  earnBonus();
  state.referralsGoal = Math.min(100, state.referralsGoal + 18);
  state.usageGoal = Math.min(100, state.usageGoal + 7);
  state.retention = Math.min(100, state.retention + 3);
  state.ranking.find((item) => item.name === "Cliente Prime Demo").points = state.points;
  updateTier();
  updateMetrics();
  renderRanking();
  pushActivity("Simulação mensal executada: metas, ranking e indicadores atualizados");
}

function updateTier() {
  if (state.points >= 20000) state.tier = "Diamante";
  else if (state.points >= 10000) state.tier = "Ouro";
  else if (state.points >= 5000) state.tier = "Prata";
  else state.tier = "Bronze";

  const demo = state.ranking.find((item) => item.name === "Cliente Prime Demo");
  if (demo) {
    demo.points = state.points;
    demo.tier = state.tier;
  }
}

function exportReport() {
  const report = {
    cliente: "Cliente Prime Demo",
    pontos: state.points,
    nivel: state.tier,
    cashback: state.cashback,
    produtos: state.products,
    bonificacoes: state.bonuses,
    chamados: state.tickets,
    atividades: state.activities,
    geradoEm: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "relatorio-cliente-prime.json";
  link.click();
  URL.revokeObjectURL(url);
  pushActivity("Relatório JSON exportado");
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(state, structuredClone(defaults));
  hydrate();
  pushActivity("Dados locais apagados e demo reiniciada");
}

function hydrate() {
  document.body.dataset.theme = state.theme;
  document.body.classList.toggle("compact", state.compact);
  $("#themeToggle").textContent = state.theme === "dark" ? "Tema claro" : "Tema escuro";
  $("#autosaveToggle").checked = state.autosave;
  $("#compactToggle").checked = state.compact;
  updateTier();
  updateMetrics();
  renderActivities();
  renderProducts();
  renderBonuses();
  renderRanking();
  renderTickets();
}

function bindEvents() {
  $$(".nav-tab").forEach((tab) => tab.addEventListener("click", () => setView(tab.dataset.view)));
  $("#themeToggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    hydrate();
    pushActivity(`Tema alterado para ${state.theme === "dark" ? "escuro" : "claro"}`);
    saveState();
  });
  $("#runScenario").addEventListener("click", runScenario);
  $("#earnBonus").addEventListener("click", earnBonus);
  $("#redeemBonus").addEventListener("click", redeemBonus);
  $("#openTicket").addEventListener("click", openTicket);
  $("#exportReport").addEventListener("click", exportReport);
  $("#clearStorage").addEventListener("click", clearStorage);
  $("#autosaveToggle").addEventListener("change", (event) => {
    state.autosave = event.target.checked;
    $("#saveState").textContent = state.autosave ? "Salvo localmente" : "Autosave pausado";
    saveState();
  });
  $("#compactToggle").addEventListener("change", (event) => {
    state.compact = event.target.checked;
    document.body.classList.toggle("compact", state.compact);
    pushActivity(state.compact ? "Modo compacto ativado" : "Modo compacto desativado");
    saveState();
  });
}

bindEvents();
hydrate();
