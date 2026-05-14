const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const SEED_DB_PATH = path.join(ROOT, "data", "db.json");
const DEFAULT_DATA_DIR = process.env.LOCALAPPDATA
  ? path.join(process.env.LOCALAPPDATA, "PortalClientePrime")
  : path.join(ROOT, "data");
const DATA_DIR = process.env.DATA_DIR || DEFAULT_DATA_DIR;
const DB_PATH = path.join(DATA_DIR, "db.json");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon"
};

async function readDb() {
  await ensureDb();
  const content = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(content);
}

async function writeDb(db) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, `${JSON.stringify(db, null, 2)}\n`, "utf8");
}

async function ensureDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    const seed = await fs.readFile(SEED_DB_PATH, "utf8");
    await fs.writeFile(DB_PATH, seed, "utf8");
  }
}

function tierFor(points) {
  if (points >= 20000) return "Diamante";
  if (points >= 10000) return "Ouro";
  if (points >= 5000) return "Prata";
  return "Bronze";
}

function nowLabel() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function addActivity(db, action) {
  db.activities = [{ at: nowLabel(), action }, ...(db.activities || [])].slice(0, 20);
}

function syncRanking(db) {
  db.metrics.tier = tierFor(db.metrics.points);
  const clientName = db.client.name;
  const row = db.ranking.find((item) => item.name === clientName);
  if (row) {
    row.points = db.metrics.points;
    row.tier = db.metrics.tier;
  } else {
    db.ranking.push({ name: clientName, tier: db.metrics.tier, points: db.metrics.points });
  }
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) body += chunk;
  if (!body) return {};
  return JSON.parse(body);
}

function send(response, status, payload, type = "application/json; charset=utf-8") {
  response.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  response.end(type.includes("application/json") ? JSON.stringify(payload) : payload);
}

async function handleApi(request, response, url) {
  if (request.method === "OPTIONS") return send(response, 204, {});

  const db = await readDb();

  if (request.method === "GET" && url.pathname === "/api/state") {
    syncRanking(db);
    return send(response, 200, db);
  }

  if (request.method === "GET" && url.pathname === "/api/report") {
    syncRanking(db);
    return send(response, 200, {
      generatedAt: new Date().toISOString(),
      client: db.client,
      metrics: db.metrics,
      products: db.products,
      bonuses: db.bonuses,
      tickets: db.tickets,
      activities: db.activities
    });
  }

  if (request.method === "POST" && url.pathname === "/api/actions/purchase") {
    db.metrics.points += 1240;
    db.metrics.cashback += 42;
    db.metrics.purchasesGoal = Math.min(100, db.metrics.purchasesGoal + 8);
    db.metrics.engagement = Math.min(100, db.metrics.engagement + 4);
    syncRanking(db);
    addActivity(db, "+1.240 pontos e R$ 42 de cashback por compra registrada");
    await writeDb(db);
    return send(response, 200, db);
  }

  if (request.method === "POST" && url.pathname === "/api/actions/redeem") {
    const body = await readBody(request);
    const cost = Number(body.cost || 2500);
    const name = String(body.name || "Cupom R$ 50");
    if (db.metrics.points < cost) {
      addActivity(db, `Tentativa de resgate sem saldo: ${name}`);
      await writeDb(db);
      return send(response, 409, { error: "Saldo insuficiente", state: db });
    }
    db.metrics.points -= cost;
    db.metrics.satisfaction = Math.min(100, db.metrics.satisfaction + 3);
    syncRanking(db);
    addActivity(db, `Resgate aprovado: ${name}`);
    await writeDb(db);
    return send(response, 200, db);
  }

  if (request.method === "POST" && url.pathname === "/api/actions/month") {
    db.metrics.points += 1240;
    db.metrics.cashback += 42;
    db.metrics.purchasesGoal = Math.min(100, db.metrics.purchasesGoal + 8);
    db.metrics.referralsGoal = Math.min(100, db.metrics.referralsGoal + 18);
    db.metrics.usageGoal = Math.min(100, db.metrics.usageGoal + 7);
    db.metrics.retention = Math.min(100, db.metrics.retention + 3);
    db.metrics.engagement = Math.min(100, db.metrics.engagement + 4);
    syncRanking(db);
    addActivity(db, "Simulação mensal executada no backend");
    await writeDb(db);
    return send(response, 200, db);
  }

  if (request.method === "POST" && url.pathname === "/api/tickets") {
    const body = await readBody(request);
    const nextId = Math.max(1000, ...db.tickets.map((ticket) => Number(ticket.id || 0))) + 1;
    const ticket = {
      id: nextId,
      at: "Aberto",
      type: String(body.type || "Suporte"),
      subject: String(body.subject || "Novo atendimento")
    };
    db.tickets = [ticket, ...db.tickets].slice(0, 20);
    db.metrics.satisfaction = Math.max(60, db.metrics.satisfaction - 2);
    addActivity(db, `Chamado aberto: ${ticket.type}`);
    await writeDb(db);
    return send(response, 201, db);
  }

  if (request.method === "PATCH" && url.pathname === "/api/settings") {
    const body = await readBody(request);
    if (body.theme === "dark" || body.theme === "light") db.theme = body.theme;
    if (typeof body.compact === "boolean") db.compact = body.compact;
    addActivity(db, "Configurações atualizadas");
    await writeDb(db);
    return send(response, 200, db);
  }

  return send(response, 404, { error: "Rota de API não encontrada" });
}

async function serveStatic(response, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(ROOT, requested));
  if (!filePath.startsWith(ROOT)) return send(response, 403, "Acesso negado", "text/plain; charset=utf-8");

  try {
    const file = await fs.readFile(filePath);
    const type = mimeTypes[path.extname(filePath)] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": type });
    response.end(file);
  } catch {
    send(response, 404, "Arquivo não encontrado", "text/plain; charset=utf-8");
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (url.pathname.startsWith("/api/")) return await handleApi(request, response, url);
    return await serveStatic(response, decodeURIComponent(url.pathname));
  } catch (error) {
    console.error(error);
    send(response, 500, { error: "Erro interno do servidor" });
  }
});

server.listen(PORT, () => {
  console.log(`Portal Cliente Prime rodando em http://localhost:${PORT}`);
});
