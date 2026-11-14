import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createAppServer, isValidApodDate } from "../server.js";

const servers = new Set();

after(async () => {
  await Promise.all(
    [...servers].map(
      (server) =>
        new Promise((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        }),
    ),
  );
});

async function startServer(options) {
  const server = createAppServer(options);
  servers.add(server);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

function apodFixture(overrides = {}) {
  return {
    date: "2024-02-29",
    title: "Nebulosa de exemplo",
    media_type: "image",
    explanation: "Uma explicacao de exemplo.",
    url: "https://images.example.test/apod.jpg",
    hdurl: "https://images.example.test/apod-hd.jpg",
    ...overrides,
  };
}

test("valida formato, calendario e intervalo de datas APOD", () => {
  assert.equal(isValidApodDate("2024-02-29", "2024-03-01"), true);
  assert.equal(isValidApodDate("2023-02-29", "2024-03-01"), false);
  assert.equal(isValidApodDate("1995-06-15", "2024-03-01"), false);
  assert.equal(isValidApodDate("2024-03-02", "2024-03-01"), false);
  assert.equal(isValidApodDate("01-03-2024", "2024-03-01"), false);
});

test("proxy consulta a NASA e retorna apenas campos APOD seguros", async () => {
  let receivedUrl;
  const origin = await startServer({
    apiKey: "test-key-not-real",
    fetchImpl: async (url) => {
      receivedUrl = new URL(url);
      return new Response(
        JSON.stringify({ ...apodFixture(), api_key: "must-not-be-returned" }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    },
  });

  const response = await fetch(`${origin}/api/apod?date=2024-02-29`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(receivedUrl.origin, "https://api.nasa.gov");
  assert.equal(receivedUrl.pathname, "/planetary/apod");
  assert.equal(receivedUrl.searchParams.get("api_key"), "test-key-not-real");
  assert.equal(receivedUrl.searchParams.get("date"), "2024-02-29");
  assert.deepEqual(body, apodFixture());
  assert.equal(JSON.stringify(body).includes("test-key-not-real"), false);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("solicita o APOD de hoje quando a data nao foi informada", async () => {
  let receivedUrl;
  const origin = await startServer({
    apiKey: "test-key-not-real",
    fetchImpl: async (url) => {
      receivedUrl = new URL(url);
      return new Response(
        JSON.stringify(
          apodFixture({
            date: new Date().toISOString().slice(0, 10),
            media_type: "video",
            url: "https://video.example.test/embed/apod",
          }),
        ),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    },
  });

  const response = await fetch(`${origin}/api/apod`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(receivedUrl.searchParams.has("date"), false);
  assert.equal(body.media_type, "video");
  assert.equal(body.url, "https://video.example.test/embed/apod");
});

test("rejeita data invalida e parametros extras sem chamar a NASA", async () => {
  let calls = 0;
  const origin = await startServer({
    apiKey: "test-key-not-real",
    fetchImpl: async () => {
      calls += 1;
      return new Response(JSON.stringify(apodFixture()), { status: 200 });
    },
  });

  const invalidDate = await fetch(`${origin}/api/apod?date=2023-02-29`);
  const extraParameter = await fetch(`${origin}/api/apod?date=2024-02-29&api_key=client-value`);

  assert.equal(invalidDate.status, 400);
  assert.equal(extraParameter.status, 400);
  assert.equal(calls, 0);
});

test("nao revela o corpo de erro da NASA", async () => {
  const origin = await startServer({
    apiKey: "test-key-not-real",
    fetchImpl: async () =>
      new Response(JSON.stringify({ error: "private-upstream-detail" }), {
        status: 500,
      }),
  });

  const response = await fetch(`${origin}/api/apod`);
  const body = await response.text();

  assert.equal(response.status, 502);
  assert.equal(body.includes("private-upstream-detail"), false);
  assert.equal(body.includes("test-key-not-real"), false);
});

test("informa configuracao ausente da chave sem consultar a NASA", async () => {
  let calls = 0;
  const origin = await startServer({
    apiKey: "",
    fetchImpl: async () => {
      calls += 1;
      return new Response();
    },
  });

  const response = await fetch(`${origin}/api/apod`);
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.match(body.error, /chave da API da NASA não está configurada/);
  assert.equal(calls, 0);
});

test("serve a interface sem expor configuracoes do servidor", async () => {
  const origin = await startServer({ apiKey: "test-key-not-real" });
  const response = await fetch(origin);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-security-policy"), /frame-src https:/);
  assert.match(body, /Diário do Cosmos/);
  assert.equal(body.includes("test-key-not-real"), false);
});
