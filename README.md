# Portal Cliente Prime - Demo de Servico

Demo estatica e interativa em portugues para apresentar um portal de cliente com produtos, fidelidade e atendimento:

- dashboard de pontos, cashback, metas e saude da carteira;
- produtos contratados com status, uso, score e beneficios;
- catalogo de bonificacoes e campanhas ativas;
- ranking de clientes e niveis de fidelidade;
- abertura e acompanhamento de chamados;
- tema claro/escuro;
- backend Node.js com API REST;
- dados persistidos em `data/db.json`;
- fallback local no navegador quando a API nao estiver rodando;
- exportacao de relatorio em JSON.

## Como rodar com backend

```bash
npm start
```

Depois acesse:

```text
http://localhost:3000
```

Por padrao, no Windows, o backend usa `data/db.json` como base inicial e salva os dados de execucao em:

```text
%LOCALAPPDATA%\PortalClientePrime\db.json
```

Em servidor, voce pode definir outra pasta com:

```bash
DATA_DIR=/caminho/para/dados npm start
```

## Rotas principais

- `GET /api/state` - retorna o estado completo do portal.
- `POST /api/actions/purchase` - registra compra e pontuacao.
- `POST /api/actions/redeem` - resgata bonificacao.
- `POST /api/actions/month` - simula fechamento mensal.
- `POST /api/tickets` - abre chamado.
- `PATCH /api/settings` - atualiza tema e modo compacto.
- `GET /api/report` - gera relatorio JSON.

## Como hospedar

Com backend, o projeto deve ser publicado em um ambiente Node.js como Render, Railway, Fly.io, VPS, Azure, AWS ou similar. GitHub Pages nao executa backend Node.js.
