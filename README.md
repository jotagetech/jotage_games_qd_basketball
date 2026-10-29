# QD Basketball

Aplicação web mobile-first, em pt-BR, desenvolvida em conjunto com a página Quádruplo Duplo. A versão atual é um esqueleto: uma página única informando que o produto está em construção.

## Requisitos

- Node.js 20 ou superior
- Docker e a CLI do Supabase, para o banco local (a partir dos cards de dados)

## Execução local

```bash
npm install
npm run dev
```

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Checagem de tipos e build em `dist/` |
| `npm run preview` | Serve o build localmente |
| `npm run typecheck` | Checagem de tipos |
| `npm test` | Testes |
| `npm run lint:css` | Regras de CSS (tokens em cor e espaço) |
| `npm run check:fsd` | Estrutura Feature-Sliced Design |
| `npm run check:fast` | CSS, tipos e FSD |
| `npm run check` | CSS, FSD, testes e build |

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Descrição |
| --- | --- |
| `VITE_SUPABASE_URL` | URL pública do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima (pública) do projeto Supabase |

O `.env` não é versionado. Nenhum segredo entra no repositório.

## Deploy

O `vercel.json` redireciona qualquer rota para o `index.html`, como numa SPA. O build usa `npm run build` e publica `dist/`.

## Regras do repositório

Veja o `AGENTS.md`.
