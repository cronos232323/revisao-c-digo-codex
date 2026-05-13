const STORAGE_KEY = "codex-studio-demo-state";

const defaults = {
  theme: "dark",
  autosave: true,
  compact: false,
  goal: "Criar uma página de vendas simples para um produto digital, com visual profissional e chamada para ação.",
  projectBrief: "Quero lançar uma consultoria online para pequenos negócios, com uma página simples, agenda de diagnóstico e materiais de apoio.",
  tone: "direto",
  channel: "whatsapp",
  plan: [],
  copy: "Clique para gerar uma mensagem.",
  review: "A análise aparecerá aqui.",
  automations: [
    "Verificar erros do site amanhã às 8h",
    "Preparar resumo semanal do projeto"
  ],
  fullOutput: "",
  history: []
};

const state = loadState();
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const planTemplates = [
  "Definir público, promessa principal e resultado esperado.",
  "Criar a primeira tela com título, prova de valor e chamada para ação.",
  "Organizar seções de benefícios, objeções, prova social e próximos passos.",
  "Implementar versão inicial e testar em desktop e celular.",
  "Revisar texto, acessibilidade, links, estados de botão e possíveis quebras."
];

const copyBank = {
  direto: {
    whatsapp: "Oi! Montei uma versão objetiva da página com foco em clareza, benefício e ação. Posso ajustar o tom e deixar pronta para publicação.",
    email: "Segue uma proposta enxuta para a página: foco no benefício principal, prova de valor e uma chamada para ação clara. O próximo passo é revisar a oferta e publicar.",
    landing: "Venda seu produto digital com uma página clara, rápida e orientada a conversão. Mostre o valor, reduza dúvidas e leve o visitante ao próximo passo."
  },
  persuasivo: {
    whatsapp: "Tenho um caminho simples para transformar sua ideia em uma página que convence: promessa forte, visual confiável e CTA sem distração.",
    email: "A página deve fazer uma coisa muito bem: mostrar por que a oferta importa agora. Estruturei uma abordagem com promessa, prova, objeções e chamada final.",
    landing: "Transforme visitantes em compradores com uma página que explica o valor em segundos, responde objeções e conduz a decisão com segurança."
  },
  amigavel: {
    whatsapp: "Oi! Deixei a ideia bem organizada para virar uma página bonita e fácil de entender. A pessoa bate o olho, entende o valor e sabe o que fazer.",
    email: "Preparei uma direção clara e leve para a página. A ideia é comunicar o benefício sem complicar e criar confiança desde a primeira dobra.",
    landing: "Uma página simples, bonita e direta para apresentar seu produto digital, criar confiança e ajudar a pessoa a dar o próximo passo sem esforço."
  }
};

const reviewItems = [
  "Risco: se algum item não tiver `price`, a soma vira `NaN`.",
  "Precisão: dinheiro não deve depender só de ponto flutuante; use centavos inteiros quando possível.",
  "Contrato: `toFixed(2)` retorna string. Se o restante do sistema espera número, isso pode causar bug.",
  "Melhoria: validar `items` como array antes do `forEach`."
];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaults, ...saved };
  } catch {
    return { ...defaults };
  }
}

function saveState() {
  if (!state.autosave) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  $("#saveState").textContent = "Salvo localmente";
}

function addHistory(action) {
  const entry = {
    action,
    at: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  };
  state.history = [entry, ...state.history].slice(0, 30);
  renderHistory();
  saveState();
}

function bumpMetric(selector, value) {
  const node = $(selector);
  node.textContent = value;
  node.classList.remove("flash");
  void node.offsetWidth;
  node.classList.add("flash");
}

function setView(viewId) {
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
  $$(".nav-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === viewId));
  const titles = {
    workspace: "Workspace inteligente",
    ai: "Simulador IA",
    presentation: "Modo apresentação",
    history: "Histórico local",
    settings: "Configurações"
  };
  $("#pageTitle").textContent = titles[viewId] || "Codex Studio";
}

function renderPlan() {
  const output = $("#planOutput");
  output.innerHTML = "";
  state.plan.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    output.appendChild(li);
  });
}

function makePlan() {
  const goal = $("#goalInput").value.trim();
  state.goal = goal;
  const firstStep = goal
    ? `Traduzir o objetivo em requisito: "${goal.slice(0, 96)}${goal.length > 96 ? "..." : ""}".`
    : "Descrever o objetivo em uma frase clara.";

  state.plan = [firstStep, ...planTemplates];
  renderPlan();
  $("#planBar").style.width = "91%";
  bumpMetric("#tasksCount", "11");
  bumpMetric("#confidenceCount", "97%");
  addHistory("Plano aplicado gerado");
  saveState();
}

function writeCopy() {
  state.tone = $("#toneSelect").value;
  state.channel = $("#channelSelect").value;
  state.copy = copyBank[state.tone][state.channel];
  $("#copyOutput").textContent = state.copy;
  $("#verifyBar").style.width = "72%";
  bumpMetric("#timeCount", "24 min");
  addHistory(`Texto gerado para ${state.channel}`);
  saveState();
}

function reviewCode() {
  state.review = reviewItems.map((item) => `<p>${item}</p>`).join("");
  $("#reviewOutput").innerHTML = state.review;
  $("#verifyBar").style.width = "84%";
  addHistory("Trecho de código analisado");
  saveState();
}

function addAutomation() {
  const input = $("#automationInput");
  const value = input.value.trim();
  if (!value) return;
  state.automations = [value, ...state.automations];
  input.value = "";
  renderAutomations();
  bumpMetric("#tasksCount", "12");
  addHistory("Automação adicionada");
  saveState();
}

function renderAutomations() {
  const list = $("#automationList");
  list.innerHTML = "";
  state.automations.forEach((item) => {
    const li = document.createElement("li");
    const mark = document.createElement("span");
    li.appendChild(mark);
    li.append(item);
    list.appendChild(li);
  });
}

function generateFullPackage() {
  const brief = $("#projectBrief").value.trim() || "Projeto sem descrição detalhada";
  state.projectBrief = brief;
  const compactBrief = brief.slice(0, 130) + (brief.length > 130 ? "..." : "");
  const sections = {
    Plano: [
      `Mapear a oferta central: ${compactBrief}`,
      "Definir público prioritário e transformação prometida.",
      "Criar página com headline, benefício, prova, CTA e perguntas frequentes.",
      "Montar fluxo de captura ou agendamento.",
      "Testar, revisar e preparar publicação."
    ],
    Checklist: [
      "Headline clara",
      "CTA visível",
      "Formulário ou link de agenda funcionando",
      "Versão mobile revisada",
      "Métrica principal definida"
    ],
    Copy: [
      "Pare de perder oportunidades por falta de clareza. Apresente sua solução com uma página objetiva, confiável e pronta para converter interessados em conversas reais."
    ],
    Riscos: [
      "Promessa genérica demais",
      "CTA escondido",
      "Página pesada no celular",
      "Falta de prova ou exemplo concreto"
    ],
    "Próximos passos": [
      "Validar a promessa com 3 pessoas do público.",
      "Criar uma primeira versão publicável.",
      "Medir cliques no CTA e ajustar a mensagem."
    ]
  };

  state.fullOutput = Object.entries(sections)
    .map(([title, items]) => `<h4>${title}</h4><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`)
    .join("");

  $("#fullOutput").innerHTML = state.fullOutput;
  $("#planBar").style.width = "96%";
  $("#verifyBar").style.width = "92%";
  bumpMetric("#tasksCount", "16");
  bumpMetric("#confidenceCount", "98%");
  addHistory("Pacote completo de IA simulado");
  saveState();
}

function runAll() {
  makePlan();
  writeCopy();
  reviewCode();
  $("#automationInput").value = "Enviar relatório de progresso toda segunda às 10h";
  addAutomation();
  generateFullPackage();
  addHistory("Demonstração completa executada");
}

function resetDemo() {
  Object.assign(state, { ...defaults, history: state.history });
  hydrate();
  addHistory("Tela reiniciada");
  saveState();
}

function renderHistory() {
  const list = $("#historyList");
  list.innerHTML = "";
  if (!state.history.length) {
    list.innerHTML = "<li><time>--:--</time><span>Nenhuma ação registrada ainda.</span></li>";
    return;
  }
  state.history.forEach((entry) => {
    const li = document.createElement("li");
    li.innerHTML = `<time>${entry.at}</time><span>${entry.action}</span>`;
    list.appendChild(li);
  });
}

function exportPlan(format) {
  const payload = {
    objetivo: state.goal,
    plano: state.plan,
    texto: state.copy,
    automacoes: state.automations,
    geradoEm: new Date().toISOString()
  };

  let content = "";
  let type = "text/plain";
  let filename = `codex-plano.${format}`;

  if (format === "json") {
    content = JSON.stringify(payload, null, 2);
    type = "application/json";
  } else if (format === "md") {
    content = `# Plano Codex\n\n## Objetivo\n${payload.objetivo}\n\n## Plano\n${payload.plano.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n\n## Texto\n${payload.texto}\n`;
    type = "text/markdown";
  } else {
    content = `Plano Codex\n\nObjetivo: ${payload.objetivo}\n\n${payload.plano.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n\nTexto:\n${payload.texto}\n`;
  }

  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  addHistory(`Plano exportado em ${format.toUpperCase()}`);
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(state, { ...defaults });
  hydrate();
  addHistory("Dados locais apagados");
}

function hydrate() {
  document.body.dataset.theme = state.theme;
  document.body.classList.toggle("compact", state.compact);
  $("#themeToggle").textContent = state.theme === "dark" ? "Tema claro" : "Tema escuro";
  $("#autosaveToggle").checked = state.autosave;
  $("#compactToggle").checked = state.compact;
  $("#goalInput").value = state.goal;
  $("#projectBrief").value = state.projectBrief;
  $("#toneSelect").value = state.tone;
  $("#channelSelect").value = state.channel;
  $("#copyOutput").textContent = state.copy;
  $("#reviewOutput").innerHTML = state.review;
  $("#fullOutput").innerHTML = state.fullOutput || "<p>Use o botão para gerar uma simulação completa.</p>";
  renderPlan();
  renderAutomations();
  renderHistory();
}

function bindEvents() {
  $$(".nav-tab").forEach((tab) => tab.addEventListener("click", () => setView(tab.dataset.view)));
  $("#themeToggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    hydrate();
    addHistory(`Tema alterado para ${state.theme === "dark" ? "escuro" : "claro"}`);
    saveState();
  });
  $("#makePlan").addEventListener("click", makePlan);
  $("#writeCopy").addEventListener("click", writeCopy);
  $("#reviewCode").addEventListener("click", reviewCode);
  $("#addAutomation").addEventListener("click", addAutomation);
  $("#runAll").addEventListener("click", runAll);
  $("#resetDemo").addEventListener("click", resetDemo);
  $("#generateFull").addEventListener("click", generateFullPackage);
  $("#exportTxt").addEventListener("click", () => exportPlan("txt"));
  $("#exportMd").addEventListener("click", () => exportPlan("md"));
  $("#exportJson").addEventListener("click", () => exportPlan("json"));
  $("#clearHistory").addEventListener("click", () => {
    state.history = [];
    renderHistory();
    saveState();
  });
  $("#clearStorage").addEventListener("click", clearStorage);
  $("#autosaveToggle").addEventListener("change", (event) => {
    state.autosave = event.target.checked;
    $("#saveState").textContent = state.autosave ? "Salvo localmente" : "Autosave pausado";
    saveState();
  });
  $("#compactToggle").addEventListener("change", (event) => {
    state.compact = event.target.checked;
    document.body.classList.toggle("compact", state.compact);
    addHistory(state.compact ? "Modo compacto ativado" : "Modo compacto desativado");
    saveState();
  });
  $("#automationInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") addAutomation();
  });
  ["goalInput", "projectBrief", "toneSelect", "channelSelect"].forEach((id) => {
    $(`#${id}`).addEventListener("input", (event) => {
      const map = { goalInput: "goal", projectBrief: "projectBrief", toneSelect: "tone", channelSelect: "channel" };
      state[map[id]] = event.target.value;
      saveState();
    });
  });
}

bindEvents();
hydrate();
