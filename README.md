# Materiais — gestão de materiais (PWA para Android e PC)

App irmão da Ferramentaria: controla **consumíveis, peças de reposição e EPI** da equipe de manutenção de vagões.
A equipe conta o estoque, o app calcula o consumo e, na análise semanal, gera a reserva para repor até o estoque padrão. Mesmos logins e níveis de acesso da Ferramentaria.

## Arquivos
- `index.html` — o app inteiro (funciona sem internet)
- `manifest.webmanifest`, `sw.js`, `icon-*.png` — instalação na tela inicial e uso offline (só valem hospedado em HTTPS)
- `supabase/01-tabelas-materiais.sql` — tabelas `mat_config`, `mat_itens`, `mat_movs`, regras de acesso e visões

## Como funciona (v3.0 — caixas amarelas)
- **Caixas**: 10 caixas amarelas, uma por posto (Ajustes → "número; posto"). Todo material ativo existe em todas as
  caixas, com o mesmo mínimo e máximo (lista atual: 12 itens, mín. 5 / máx. 15 — `importar-caixas-amarelas.txt`).
- **Contagem**: caixa por caixa, como no formulário em papel — caixa, turno, nome e matrícula CS de quem contou
  (equipe em Ajustes: "nome; matrícula"). Todos os itens da caixa precisam ser contados (zero se não tiver).
  Usado = anterior − contado. Primeira contagem de uma caixa não gera consumo.
- **Saldo por caixa** = última contagem da caixa + abastecimentos registrados depois dela.
- **Reserva — análise semanal** (supervisor/programador): por caixa, máximo − saldo − já reservado e não recebido
  (regra do usuário: **sempre completa até o máximo**; o mínimo é só alerta). A reserva soma as caixas e guarda quanto
  é de cada uma. Caixa **nunca contada fica fora** da conta (aviso). Total editável; o que passar da soma fica "sem caixa".
  Nº SAP opcional; compartilhar em texto e CSV.
- **Recebimento**: informa o total que chegou por item; o app distribui nas caixas na ordem da reserva e soma ao saldo
  de cada uma. Parcial → "Recebida em parte"; "Encerrar" devolve o restante para a próxima sugestão.
  **Abastecimento avulso** na tela da caixa para material fora de reserva.
- **Estorno** (supervisor): de contagem (saldo da caixa volta ao da anterior) e de abastecimento (volta a constar como falta).
- **Relatórios**: consumo por caixa e por turno, materiais mais usados com média semanal, reservas, aguardando
  recebimento; filtro por caixa; CSV de consumo e de saldo das caixas; imprimir/PDF; resumo em texto.
- **PC**: menu lateral a partir de 900 px. No celular, Ajustes fica no ícone do topo.

## Nuvem (Supabase) — mesmo projeto da Ferramentaria
- Projeto `blizyewnlcyaxizwlzdk`. Usa `perfis` e `eh_supervisor()` do script 04 da Ferramentaria: supervisor lá é
  supervisor aqui (também faz o papel de programador). Rodar `supabase/01-tabelas-materiais.sql` (pode rodar de novo).
- Caixas ficam em `mat_config` (dados->caixas). Tabelas: `mat_config`, `mat_itens`, `mat_contagens`, `mat_reservas`, `mat_movs` (recebimentos/entradas).
  Técnico grava só contagens e só altera as que ele mesmo lançou (coluna `autor`); estorno só supervisor.
- Sincronização igual à da Ferramentaria; estorno sempre prevalece. Chaves locais com prefixo `materiais_`.
- Excel/Power BI: `v_mat_caixas_saldo` (saldo, reservado e repor por caixa), `v_mat_contagem_linhas`, `v_mat_reserva_linhas`,
  `v_mat_movimentacoes`.

## Versão 1.0 (05/10/2026)
- Primeira versão: cadastro/importação, retirada em lote, devolução, entrada, inventário, estorno, alertas,
  relatórios com CSV/PDF, nuvem com níveis de acesso, layout celular + PC.
- Testada localmente (Playwright, Pixel 7 e 1366×860, modo sem nuvem). Nuvem ainda não testada: depende do script SQL.

## Versão 2.0 (05/10/2026)
- Pedido do usuário: em vez de lançar retiradas, a equipe **conta** e o sistema calcula a diferença e a **reserva**.
- Sai a tela de retirada/devolução e o EPI por colaborador. Entram contagem, análise semanal de reserva com
  acompanhamento até o recebimento, estoque padrão e setor no cadastro.
- Testada localmente (Playwright, Pixel 7 e 1366×860, sem nuvem). Nuvem ainda não testada.

## Versão 3.0 (05/10/2026)
- Lista real recebida (formulário "Materiais das caixas amarelas"): 12 itens, mín. 5 / máx. 15, 10 caixas por posto.
- Saldo, contagem, reserva e recebimento passam a ser por caixa. Setores saem (o posto fica na caixa).
- SQL atualizado (visão `v_mat_caixas_saldo`). Testada localmente com os 12 itens reais e 10 caixas.
- Caixas 01 a 10 já vêm cadastradas (sem nome de posto). Programador da reserva: caique@ferramentaria.app (supervisor).
- Publicado em 05/10/2026: https://mausan2013-dotcom.github.io/materiais/ (atualizar com `publica-materiais`).
- v3.1 (05/10/2026): botão "Carregar os 12 materiais das caixas amarelas" (supervisor, lista embutida, ids fixos `mat-<SAP>`: não duplica). Sincronização testada com nuvem simulada (supervisor → técnico → supervisor).
