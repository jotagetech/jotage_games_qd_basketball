# Diretrizes do QD Basketball

Regras obrigatórias para qualquer pessoa ou agente que trabalhe neste repositório. Em conflito com qualquer outra instrução de projeto, este arquivo vence; em conflito com o código, o código descreve o que existe e este arquivo descreve como mudar.

O repositório guarda um produto web só, mobile-first e em pt-BR, feito em conjunto com o parceiro Quádruplo Duplo: palpites sobre jogos de basquete. React, TypeScript estrito, Vite, CSS Modules com tokens, Vitest e Supabase.

## Checklist obrigatório

Antes de agir:

- [ ] Li este arquivo e a nota do card.
- [ ] A mudança tem um card e uma branch própria (seção 3).

Antes de concluir:

- [ ] Os closing checks passam (seção 6).
- [ ] A mudança está em commits pequenos, no formato da seção 3.

## 1. Arquitetura e fronteiras

- O código segue o Feature-Sliced Design, validado pelo Steiger com a configuração `recommended`, sem exceção. Se o Steiger reclamar, a estrutura muda; o `steiger.config.ts` não ganha regra desligada.
- Camadas em `src/`: `app`, `pages`, `widgets`, `features`, `entities`, `shared`. Uma camada só importa das de baixo, e cada slice expõe só o que está no seu `index.ts`.
- `src/app` guarda a entrada e os estilos globais, que contêm só tokens e base.
- Estilo de componente fica em CSS Module ao lado do componente. Cor, espaço e tamanho de fonte vêm sempre de tokens (`var(--...)`); o stylelint recusa valor solto.
- Dependência nova só com motivo explícito na descrição do card.

## 2. Banco, dados e privacidade

- Toda mudança de banco é uma migração em `supabase/migrations/`. Nunca se altera o banco por painel ou comando avulso.
- Toda tabela nasce com RLS ligada e com as políticas explícitas de acesso.
- O teste do banco acontece no Supabase local, com o seed de `supabase/seed.sql`.
- Segredos, chaves e tokens nunca ficam em arquivo versionado. As variáveis públicas do cliente estão listadas em `.env.example`, sem valor; o `.env` fica fora do git.
- O repositório é público: nome de pessoa, e-mail, caminho de máquina e credencial nunca entram em arquivo, commit ou comentário.

## 3. Fluxo de um card

1. Branch a partir da `main`:
   - feature: `feature/3-titulo-em-slug`
   - bug simples e pontual: `bug/4`
   - refactor: `refactor/5-titulo-em-slug`

   O número é o do card.
2. Commits pequenos, em pt-BR, no formato `Área: descrição` (ex.: `Placar: soma dos pontos do palpite`).
3. Com os closing checks verdes, pedir revisão quando o card for de risco; os demais seguem direto.
4. Merge na `main` por squash, pelo autor, com os closing checks verdes na branch.

Um card resolve uma coisa. Bug que cresce e vira mudança de comportamento ganha card novo.

## 4. Escrita no repositório

- pt-BR em commits, comentários e documentação. Identificadores de código em inglês.
- Comentário de código explica o motivo técnico, atemporal: sem data, sem número de card, sem narrar decisão ou reunião.
- Texto, comentário e Markdown sem travessão e sem hífen com espaço dos dois lados como pausa; usar vírgula, ponto ou parênteses.
- Configuração comum do agente é versionada. O que é pessoal fica em arquivos locais, fora do git.

## 5. Código

- TypeScript estrito. Sem `any`, sem asserção de tipo para calar o compilador.
- Funções pequenas, com um propósito. Nomes que dispensam comentário. Constantes nomeadas no lugar de números soltos.
- Lógica nova (função pura, regra de negócio) vem com teste. Correção de bug vem com teste que reproduz o caso.

## 6. Checks obrigatórios

Durante a edição, rodar e deixar limpo:

```bash
npm run check:fast
```

Antes de declarar qualquer coisa pronta, rodar e deixar limpo:

```bash
npm run check
```

- `check:fast` roda CSS, tipos e FSD. `check` roda CSS, FSD, testes e build.
- O `check:fast` roda a cada edição no loop dos agentes; o `check` roda ao fechar cada passo.
