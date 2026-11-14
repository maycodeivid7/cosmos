# Registro de interações com o Copilot

## Interação 1 — Instruções do repositório

**O que pedi:** Antes de gerar código, criar instruções do Copilot para a atividade do Diário do Cosmos, cobrindo tecnologias, arquitetura, frontend e segurança.

**O que o Copilot respondeu:** Propôs Node.js com módulos nativos no servidor e HTML, CSS e JavaScript no navegador, usando um endpoint local para manter a chave da NASA no servidor.

**O que foi alterado:** Criado `.github/copilot-instructions.md` com as decisões, regras de implementação e referências consultadas.

## Interação 2 — Regra para mensagens semânticas

**O que pedi:** “Também adicione no @attachment:copilot-instructions.md a informação de que as mensagens dos commits devem serem semânticas.”

**O que o Copilot respondeu:** Sugeriu registrar o padrão Conventional Commits, com tipos como `feat`, `fix`, `docs`, `test`, `refactor` e `chore`.

**O que foi alterado:** Acrescentada à seção de arquitetura de `.github/copilot-instructions.md` a regra para usar mensagens claras no formato `tipo(escopo): descrição` e evitar mensagens vagas.

## Interação 3 — Mensagem do primeiro commit

**O que pedi:** “crie uma mensagem semântica para este primeiro commit”.

**O que o Copilot respondeu:** `docs: adiciona instruções iniciais do Copilot`.

**O que foi alterado:** Nenhum arquivo foi alterado por essa solicitação; a mensagem foi usada no commit das instruções.

## Interação 4 — Commit das instruções

**O que pedi:** “faça o commit das alterações atuais.”

**O que o Copilot respondeu:** Ao verificar o histórico, informou que o commit `14e199e docs: adiciona instruções iniciais do Copilot` já existia e que a árvore estava limpa.

**O que foi alterado:** Nenhum arquivo foi alterado nessa interação; foi confirmado que as instruções estavam commitadas antes do desenvolvimento da aplicação.

## Interação 5 — Commit deste registro

**O que pedi:** “Faça o commit das alterações atuais.”

**O que o Copilot respondeu:** Criou o commit `222ea91 docs: registra interação sobre commits semânticos`.

**O que foi alterado:** Adicionado este registro em `docs/interacoes.md`, incluindo a interação sobre a regra de commits semânticos.

## Interação 6 — Aplicação APOD

**O que pedi:** “Construa uma aplicação web pequena que mostra a imagem astronômica do dia da NASA.”

**O que o Copilot respondeu:** Implementou o servidor intermediário da APOD, a interface responsiva com suporte a imagem e vídeo, e testes sem chamadas reais à NASA.

**O que foi alterado:** Criados `server.js`, `public/index.html`, `public/styles.css`, `public/app.js`, `tests/server.test.js`, `package.json`, `.env.example`, `.gitignore` e `README.md`. A chave permanece no servidor; o registro desta interação completa os entregáveis da atividade.
