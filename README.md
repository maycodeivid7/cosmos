# Diário do Cosmos

Aplicação web responsiva que exibe a Astronomy Picture of the Day (APOD) da NASA. É possível consultar a imagem ou o vídeo do dia e escolher outra data.

## Requisitos

- Node.js 20.6 ou superior.
- Uma chave gratuita da API da NASA, disponível em [api.nasa.gov](https://api.nasa.gov/).

## Como executar

1. Copie `.env.example` para `.env`.
2. Abra `.env` e substitua `COLOQUE_SUA_CHAVE_NASA_AQUI` pela sua chave:

   ```text
   NASA_API_KEY=sua_chave_da_nasa
   ```

3. Inicie o servidor:

   ```sh
   npm start
   ```

4. Acesse [http://localhost:3000](http://localhost:3000).

O arquivo `.env` é local e ignorado pelo Git. Não publique nem compartilhe sua chave.

## Testes

Execute os testes automatizados com:

```sh
npm test
```

Os testes verificam a validação de datas, a rota intermediária e o tratamento de erros sem depender de chamadas reais à NASA.

## Organização

- `server.js`: serve os arquivos do frontend e consulta a API da NASA pelo endpoint local `/api/apod`.
- `public/`: contém HTML, CSS e JavaScript nativos da interface.
- `tests/`: contém testes com o executor nativo `node:test`.

O navegador chama somente o servidor local. A chave da NASA é lida do ambiente do servidor e nunca é enviada ao navegador.
