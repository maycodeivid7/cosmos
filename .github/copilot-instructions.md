# Instrucoes do GitHub Copilot

Este repositorio implementa um Diario do Cosmos: uma aplicacao web que consulta a Astronomy Picture of the Day (APOD) da NASA para uma data escolhida.

## Tecnologias utilizadas

- Use Node.js 20.6 ou superior no servidor. A versao minima permite carregar variaveis de ambiente com `--env-file` e usar `fetch` nativo, sem dependencias para essas tarefas.
- Use HTML semantico, CSS e JavaScript nativo no navegador. Nao use frameworks de frontend, bibliotecas de interface, TypeScript ou ferramentas de compilacao.
- Use apenas modulos nativos do Node.js no servidor e nos testes (`node:test`). Nao adicione dependencias de producao ou desenvolvimento sem necessidade aprovada.
- Consulte a APOD com `GET https://api.nasa.gov/planetary/apod`, passando `api_key` e, quando informado, `date` no formato `YYYY-MM-DD`.
- Considere os campos `date`, `title`, `media_type`, `explanation`, `url` e `hdurl` da resposta. Exiba uma imagem para `media_type: "image"` e um video incorporado para `media_type: "video"`; nao trate todo conteudo como imagem.

## Arquitetura do sistema

- `server.js`: inicia o servidor HTTP, serve os arquivos estaticos de `public/` e implementa `GET /api/apod`. Esse endpoint valida a data, consulta a API da NASA no servidor e retorna ao navegador somente os campos necessarios.
- `public/index.html`: define a estrutura semantica da pagina, o seletor de data e as regioes de estado e resultado.
- `public/styles.css`: contem todos os estilos e regras de layout responsivo.
- `public/app.js`: solicita dados somente a `/api/apod`, atualiza a interface e apresenta estados de carregamento, sucesso e erro.
- `tests/`: contem testes automatizados usando `node:test`; cubra a validacao de datas e os principais resultados do endpoint sem depender de chamadas reais a NASA.
- `package.json`: define `start` e `test`. O comando de inicio deve carregar `.env` com o recurso nativo `--env-file`.
- Mantenha cada responsabilidade no arquivo indicado. Nao coloque chamadas a NASA, chave de API ou logica de servidor em arquivos de `public/`.
- Escreva mensagens de commit semanticas no formato Conventional Commits: `tipo(escopo): descricao` (escopo opcional). Use um tipo coerente com a mudanca, como `feat`, `fix`, `docs`, `test`, `refactor` ou `chore`, e uma descricao clara; nao use mensagens vagas como `ajustes`.
- Datas devem ser datas reais no formato `YYYY-MM-DD`, entre `1995-06-16` e a data atual em UTC, inclusive. Rejeite datas invalidas ou futuras com resposta HTTP 400; uma data ausente solicita o APOD de hoje.
- Represente erros da NASA com um status HTTP de erro e uma mensagem segura para a interface. Nao substitua erros por dados falsos ou respostas de sucesso.
- Atualize `README.md` com os passos para configurar e executar o projeto. Registre em `docs/interacoes.md` pelo menos cinco interacoes importantes com o Copilot, incluindo pedido, resposta e alteracao feita.

## Estilizacao do frontend

- Apresente titulo, data, midia e explicacao do APOD, com a data escolhida visivel.
- Use uma identidade visual inspirada no espaco, com fundo escuro, texto de alto contraste e a midia como foco. Use CSS proprio; nao carregue fontes, imagens decorativas ou bibliotecas externas desnecessarias.
- Organize o conteudo em uma coluna central com largura maxima e espacamento consistente. Em telas estreitas, use uma coluna sem rolagem horizontal; em telas largas, mantenha a leitura confortavel e a midia dimensionada ao espaco disponivel.
- Aplique `max-width: 100%` a imagens e videos, preserve a proporcao da midia e nao deixe que conteudo longo ultrapasse a tela.
- Use elementos semanticos, rotulos associados aos campos, controles acessiveis por teclado, foco visivel e contraste legivel. Informe carregamento com `role="status"` e erros com `role="alert"`.
- Mostre um estado de carregamento enquanto a consulta esta em andamento, uma mensagem compreensivel em caso de erro e o resultado quando a consulta for concluida. O resultado anterior nao deve ser apresentado como se fosse a resposta da nova data.

## Seguranca

- Leia a chave exclusivamente da variavel de ambiente `NASA_API_KEY` no servidor. Use `.env` apenas para desenvolvimento local e mantenha-o fora do Git; `.env.example` pode conter somente um valor ficticio e instrucoes.
- Nunca inclua a chave em HTML, CSS, JavaScript do navegador, respostas HTTP, mensagens de erro, logs, README, testes, capturas de tela ou commits. O navegador deve chamar somente `/api/apod`; apenas o servidor pode chamar a API da NASA com a chave.
- Construa a URL de destino a partir do endereco fixo da APOD e dos parametros validados. Nao aceite do cliente uma URL de destino, um nome de parametro arbitrario ou a chave da API.
- Valide a data no servidor, mesmo que o formulario tambem a valide no navegador. Nao confie em dados recebidos do cliente.
- Insira texto da API na pagina com `textContent` e atributos DOM apropriados; nao interprete titulo ou explicacao como HTML com `innerHTML`.
- Para videos, incorpore a URL retornada pela APOD em um `iframe` com titulo acessivel e permissao minima necessaria. Nao use HTML arbitrario retornado pela API.
- Nao exponha ao navegador o corpo bruto de erros da NASA; apresente uma mensagem clara sem dados internos nem segredos.

## Referencias e justificativas

- A documentacao da APOD descreve o endpoint, os parametros de data e os campos de resposta usados pelo projeto: [NASA APOD API](https://github.com/nasa/apod-api#docs) e [NASA APIs](https://api.nasa.gov/).
- O servidor intermediario e necessario para manter a chave fora do navegador. Node.js com `fetch` nativo evita dependencias para um projeto pequeno, e HTML/CSS/JavaScript nativos mantem a interface simples de estudar e executar.
- O arquivo segue o local e o formato de instrucoes de repositorio documentados pelo GitHub: [Repository custom instructions](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions).
