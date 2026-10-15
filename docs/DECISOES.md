# Decisões técnicas

Formato: decisão · alternativa descartada · motivo · limitações conhecidas.

## D1 — Mock a partir de respostas reais da API (2026-10-15)
- **Decisão:** a MockSource usa respostas reais salvas da API no ar.
- **Descartada:** gerar o mock a partir de predictions.csv do projeto Java.
- **Motivo:** o formato fica idêntico ao da API e não precisamos do zip.
- **Limitações:** o mock só cobre as consultas que salvarmos.

## D2 — Jitter só explicado (2026-10-15)
- **Decisão:** o glossário explica jitter e diz que a previsão não o inclui.
- **Descartada:** omitir o termo.
- **Motivo:** o RNF07 cita jitter, e a API não tem esse campo.
- **Limitações:** o usuário não vê nenhum valor de jitter.

## D3 — Só as 6 atividades da API (2026-10-15)
- **Decisão:** usar VIDEO_CALL, AUDIO_CALL, STREAMING, FILE_UPLOAD, WEB_BROWSING e MESSAGING.
- **Descartada:** mostrar "jogos online" com regra própria.
- **Motivo:** o enum ActivityType não tem jogos, e o app não reimplementa regra de adequação.
- **Limitações:** o RQ03 cita jogos online. Diferença levada à professora: aguardando resposta.

## D4 — Modelo padrão model-a, em variável de ambiente (2026-10-15)
- **Decisão:** `EXPO_PUBLIC_DEFAULT_MODEL_ID=model-a`.
- **Descartada:** escolha do modelo pelo usuário (fica como extra).
- **Motivo:** é o primeiro item de GET /models e o algoritmo mais simples de explicar (regressão
  linear).
- **Limitações:** os 4 modelos discordam entre si (ex.: 15:00Z → A e C dizem MODERATE, B e D
  dizem UNSTABLE). O usuário só vê o modelo A.

## D5 — Atividades: 6 chamadas em paralelo com cache (2026-10-15)
- **Decisão:** depois de escolher o horário, disparar as 6 chamadas a POST /activity/check em
  paralelo, com timeout curto, erro individual e cache por probe + horário + modelo.
- **Descartada:** uma chamada por toque; avaliar adequação no app.
- **Motivo:** mostra tudo de uma vez sem reimplementar regra.
- **Limitações:** 6 requisições por horário novo.

## D6 — Horário sempre ancorado na timeline (2026-10-15)
- **Decisão:** o app só consulta horários que existem na timeline. O horário do seletor é
  aproximado para o item mais próximo, e a tela mostra qual foi usado.
- **Descartada:** enviar o horário livre do seletor.
- **Motivo:** POST /activity/check arredonda sozinho e não devolve o horário usado (testado:
  15:30 → 15:00; 2026-10-15 → 23:00Z).
- **Limitações:** a granularidade é de 1 hora.

## D7 — Local por lista, com rótulo de região (2026-10-15)
- **Decisão:** o usuário escolhe uma das 10 probes de /locations. O rótulo ("Região de São Paulo
  (SP)") é nosso, derivado da coordenada. POST /activity/check recebe as coordenadas da probe,
  nunca as do aparelho.
- **Descartada:** GPS do aparelho; mostrar só o número da probe.
- **Motivo:** privacidade (sem dados pessoais) e linguagem simples.
- **Limitações:** a coordenada da probe é aproximada (aviso `locationPrivacy` da API). Não
  mostramos distância.

## D8 — expo-router com 3 abas (2026-10-15)
- **Decisão:** abas Início, Atividades e Detalhes; timeline no topo de Detalhes e prévia no Início.
- **Descartada:** react-navigation direto; aba própria para a timeline.
- **Motivo:** é o padrão atual do Expo, com rotas por arquivo e menos configuração.
- **Limitações:** nenhuma conhecida.

## D9 — Vocabulário do glossário (2026-10-15)
- **Decisão:** as categorias aparecem como Boa / Regular / Instável (GOOD / MODERATE / UNSTABLE),
  com equivalência a OK / Risco / Falha (Redes) registrada no glossário. O status por atividade
  usa outro vocabulário: "Deve funcionar" / "Pode ter problemas", a partir de `suitable`.
  Sempre texto + ícone + cor.
- **Descartada:** mostrar OK / Risco / Falha; reaproveitar as categorias de qualidade nas
  atividades.
- **Motivo:** termos mais claros para quem não é técnico. A pergunta "dá para fazer isto?" é
  diferente da pergunta "como está a conexão?".
- **Limitações:** a equivalência com Redes ainda vai ser confirmada pela equipe com a professora.

## D10 — Cabeçalho sem perfil e sem "?" (2026-10-15)
- **Decisão:** sem ícone de perfil e sem ícone de ajuda; as explicações ficam na aba Detalhes.
- **Descartada:** manter os dois ícones do protótipo.
- **Motivo:** não há conta nem dado pessoal; a ajuda repetiria a aba Detalhes.
- **Limitações:** nenhuma.

## Limitação de dados
Os dados cobrem só 2026-08-20 00:00–23:00 UTC (19/08 21:00 a 20/08 20:00 em Brasília). O app
nunca apresenta a previsão como sendo de "agora".
