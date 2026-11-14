import { createServer as createHttpServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const APOD_ENDPOINT = "https://api.nasa.gov/planetary/apod";
const FIRST_APOD_DATE = "1995-06-16";
const PUBLIC_DIRECTORY = fileURLToPath(new URL("./public/", import.meta.url));
const PUBLIC_FILES = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
]);

export function isValidApodDate(value, today = new Date().toISOString().slice(0, 10)) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === value &&
    value >= FIRST_APOD_DATE &&
    value <= today
  );
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  response.end(JSON.stringify(data));
}

function safeHttpsUrl(value) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

function normalizeApod(data) {
  if (
    data === null ||
    typeof data !== "object" ||
    !isValidApodDate(data.date) ||
    typeof data.title !== "string" ||
    typeof data.explanation !== "string" ||
    !["image", "video"].includes(data.media_type)
  ) {
    return null;
  }

  const url = safeHttpsUrl(data.url);
  if (!url) {
    return null;
  }

  const result = {
    date: data.date,
    title: data.title,
    media_type: data.media_type,
    explanation: data.explanation,
    url,
  };
  const hdurl = safeHttpsUrl(data.hdurl);

  if (hdurl) {
    result.hdurl = hdurl;
  }

  return result;
}

async function serveApod(requestUrl, response, apiKey, fetchImpl) {
  const queryNames = [...requestUrl.searchParams.keys()];
  const requestedDates = requestUrl.searchParams.getAll("date");

  if (queryNames.some((name) => name !== "date") || requestedDates.length > 1) {
    sendJson(response, 400, { error: "Os parâmetros da consulta são inválidos." });
    return;
  }

  const date = requestedDates[0];
  if (date !== undefined && !isValidApodDate(date)) {
    sendJson(response, 400, {
      error: "Escolha uma data entre 1995-06-16 e hoje.",
    });
    return;
  }

  if (typeof apiKey !== "string" || apiKey.trim() === "") {
    sendJson(response, 503, {
      error: "A chave da API da NASA não está configurada no servidor.",
    });
    return;
  }

  const upstreamUrl = new URL(APOD_ENDPOINT);
  upstreamUrl.searchParams.set("api_key", apiKey.trim());
  if (date !== undefined) {
    upstreamUrl.searchParams.set("date", date);
  }

  let upstreamResponse;
  try {
    upstreamResponse = await fetchImpl(upstreamUrl, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    sendJson(response, 502, {
      error: "Não foi possível conectar à API da NASA. Tente novamente.",
    });
    return;
  }

  if (!upstreamResponse.ok) {
    sendJson(response, 502, {
      error: "A API da NASA não conseguiu fornecer esta imagem agora.",
    });
    return;
  }

  let apodData;
  try {
    apodData = await upstreamResponse.json();
  } catch {
    sendJson(response, 502, {
      error: "A API da NASA retornou uma resposta inválida.",
    });
    return;
  }

  const apod = normalizeApod(apodData);
  if (!apod) {
    sendJson(response, 502, {
      error: "A API da NASA retornou dados em um formato inesperado.",
    });
    return;
  }

  sendJson(response, 200, apod);
}

async function serveStaticFile(pathname, response) {
  const asset = PUBLIC_FILES.get(pathname);
  if (!asset) {
    sendJson(response, 404, { error: "Pagina nao encontrada." });
    return;
  }

  let content;
  try {
    content = await readFile(join(PUBLIC_DIRECTORY, asset[0]));
  } catch (error) {
    console.error("Não foi possível ler um arquivo público:", error);
    sendJson(response, 500, { error: "Não foi possível carregar a página." });
    return;
  }

  response.writeHead(200, {
    "content-type": asset[1],
    "cache-control": "no-cache",
    "content-security-policy":
      "default-src 'self'; img-src 'self' https:; style-src 'self'; script-src 'self'; frame-src https:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-content-type-options": "nosniff",
  });
  response.end(content);
}

async function handleRequest(request, response, apiKey, fetchImpl) {
  const requestUrl = new URL(request.url ?? "/", "http://localhost");

  if (request.method !== "GET") {
    response.writeHead(405, { allow: "GET" });
    response.end();
    return;
  }

  if (requestUrl.pathname === "/api/apod") {
    await serveApod(requestUrl, response, apiKey, fetchImpl);
    return;
  }

  await serveStaticFile(requestUrl.pathname, response);
}

export function createAppServer({
  apiKey = process.env.NASA_API_KEY,
  fetchImpl = globalThis.fetch,
} = {}) {
  return createHttpServer((request, response) => {
    void handleRequest(request, response, apiKey, fetchImpl).catch((error) => {
      console.error("Erro inesperado ao processar uma requisicao HTTP:", error);
      if (!response.headersSent) {
        sendJson(response, 500, { error: "Ocorreu um erro interno no servidor." });
      } else {
        response.destroy();
      }
    });
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error("A variavel PORT deve ser um numero entre 0 e 65535.");
  }

  createAppServer().listen(port, () => {
    console.log(`Diario do Cosmos disponivel em http://localhost:${port}`);
  });
}
