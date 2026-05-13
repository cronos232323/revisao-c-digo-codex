const planTemplates = [
  "Definir o público, a promessa principal e o resultado esperado.",
  "Criar a estrutura da primeira tela com título, prova de valor e chamada para ação.",
  "Escolher visual, cores e hierarquia para deixar a página escaneável.",
  "Implementar a versão inicial, testar em desktop e celular.",
  "Revisar texto, estados de botão, links e possíveis quebras antes de entregar."
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

const $ = (selector) => document.querySelector(selector);

function bumpMetric(selector, value) {
  const node = $(selector);
  node.textContent = value;
  node.classList.remove("flash");
  void node.offsetWidth;
  node.classList.add("flash");
}

function renderPlan() {
  const goal = $("#goalInput").value.trim();
  const output = $("#planOutput");
  output.innerHTML = "";

  const firstStep = goal
    ? `Traduzir o objetivo em requisito: "${goal.slice(0, 92)}${goal.length > 92 ? "..." : ""}".`
    : "Descrever o objetivo em uma frase clara.";

  [firstStep, ...planTemplates].forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    output.appendChild(li);
  });

  $("#planBar").style.width = "91%";
  bumpMetric("#tasksCount", "11");
  bumpMetric("#confidenceCount", "97%");
}

function renderCopy() {
  const tone = $("#toneSelect").value;
  const channel = $("#channelSelect").value;
  $("#copyOutput").textContent = copyBank[tone][channel];
  $("#verifyBar").style.width = "72%";
  bumpMetric("#timeCount", "24 min");
}

function renderReview() {
  $("#reviewOutput").innerHTML = reviewItems
    .map((item) => `<p>${item}</p>`)
    .join("");
  $("#verifyBar").style.width = "84%";
}

function addAutomation() {
  const input = $("#automationInput");
  const value = input.value.trim();
  if (!value) return;

  const li = document.createElement("li");
  const mark = document.createElement("span");
  li.appendChild(mark);
  li.append(value);
  $("#automationList").prepend(li);
  input.value = "";
  bumpMetric("#tasksCount", "12");
}

function runAll() {
  renderPlan();
  renderCopy();
  renderReview();
  $("#automationInput").value = "Enviar relatório de progresso toda segunda às 10h";
  addAutomation();
  $("#planBar").style.width = "96%";
  $("#verifyBar").style.width = "92%";
}

function resetDemo() {
  $("#goalInput").value = "Criar uma página de vendas simples para um produto digital, com visual profissional e chamada para ação.";
  $("#planOutput").innerHTML = "";
  $("#copyOutput").textContent = "Clique para gerar uma mensagem.";
  $("#reviewOutput").textContent = "A análise aparecerá aqui.";
  $("#automationList").innerHTML = "<li><span></span>Verificar erros do site amanhã às 8h</li><li><span></span>Preparar resumo semanal do projeto</li>";
  $("#planBar").style.width = "52%";
  $("#verifyBar").style.width = "38%";
  bumpMetric("#tasksCount", "8");
  bumpMetric("#confidenceCount", "94%");
  bumpMetric("#timeCount", "18 min");
}

$("#makePlan").addEventListener("click", renderPlan);
$("#writeCopy").addEventListener("click", renderCopy);
$("#reviewCode").addEventListener("click", renderReview);
$("#addAutomation").addEventListener("click", addAutomation);
$("#runAll").addEventListener("click", runAll);
$("#resetDemo").addEventListener("click", resetDemo);

$("#automationInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") addAutomation();
});
