# Roteiro da Mostra (3 minutos)

Só o que está implementado e testado. Os dados são de um único dia, 19 e 20 de agosto de 2026.

## Antes de começar
- **Aparelho:** iPhone com o app aberto no Início, em São Paulo (SP), com o brilho alto.
- **Sem internet garantida:** use a previsão guardada no app (`EXPO_PUBLIC_DATA_SOURCE=mock`, ver
  README). Com internet, abra o app 1 minuto antes, porque o servidor gratuito da API demora a acordar.
- **Reserva pronta:** a gravação de tela do roteiro abaixo, no próprio celular e no computador (plano B).
- **VoiceOver:** deixe o atalho configurado (três toques no botão lateral) para ligar e desligar rápido.

## Roteiro

| Tempo | O que falar | O que tocar |
|---|---|---|
| 0:00–0:20 | "Quem tem uma reunião ou uma aula on-line não sabe se a internet vai aguentar. O SinalCerto mostra a previsão em palavras simples: Boa, Regular ou Instável." | Mostrar o Início parado. |
| 0:20–0:50 | "O cartão mostra a hora escolhida. A faixa mostra as 24 horas: cor e padrão juntos, para não depender só da cor." | Tocar numa barra da madrugada: o cartão vira "Boa". Mostrar "Melhor: das 23h às 7h" e "Evite: das 15h às 18h". |
| 0:50–1:20 | "A pergunta desta tela é: quando posso fazer isto?" | Ir para Atividades e tocar em "Chamada de vídeo": "Melhor: das 23h às 7h". |
| 1:20–1:50 | "Quem quer os números encontra aqui, com explicação, e só quando pede." | Ir para Detalhes, abrir as 20:00 e tocar em "O que é isso?". |
| 1:50–2:30 | "O app foi feito para funcionar com leitor de tela." | Ligar o VoiceOver e deslizar na faixa para cima e para baixo: ele lê "19:00 · Regular". Desligar. |
| 2:30–3:00 | "Cada decisão de design tem base em pesquisa: a faixa substituiu um relógio porque gráficos lineares são lidos com mais precisão. E tudo tem teste automático, inclusive o contraste das cores." | Mostrar o README ou o `docs/fundamentacao-design.md`, se houver tela. |

## Plano B
- **Sem internet ou com a API fora do ar:** o app mostra "Sem conexão: mostrando a previsão guardada
  no app" e continua funcionando. Dá para seguir o roteiro igual.
- **Celular com problema:** passar a gravação de tela do roteiro e narrar por cima.
- **Android:** o APK está no link do README, mas o app ainda não foi testado em Android. Use o iPhone
  na apresentação.

## Perguntas prováveis

**O app mede a minha internet?** Não. Ele mostra uma previsão calculada a partir de medições antigas
da rede RIPE Atlas, feita pela API da turma. Ele não mede o celular.

**Por que só 19 e 20 de agosto?** A API só tem previsões desse dia. Por isso o app sempre mostra a
data real e nunca diz que a previsão é de "agora".

**De onde vem "Boa", "Regular" e "Instável"?** Das categorias da API. Na disciplina de Redes,
equivalem a OK, Risco e Falha. Essa equivalência aparece na tela Sobre.

**Por que não tem jogos online?** A API 0.2.0 não tem essa atividade. O app não inventa um status
sem dado.

**Por que uma faixa de barras, e não um relógio?** Estudos com pessoas leigas mostram que o gráfico
linear de 24 horas é lido com mais precisão e mais rápido que o circular (Waldner et al., 2019).

**Como vocês garantem a acessibilidade?** Testes automáticos de contraste, de área de toque e de
vocabulário, e teste manual com VoiceOver e texto no máximo a cada etapa. Falta o teste com TalkBack
no Android.

**A previsão vale para a minha casa?** Vale para a região escolhida, que é um ponto de medição numa
capital. Não é exatamente o seu endereço.

**Usaram IA?** Sim, como ferramenta de desenvolvimento, com cada pedido, resultado e erro registrado
em `docs/prompts-ia.md`. As decisões foram da equipe.

## ODS
- **ODS 9:** torna compreensível uma informação sobre a infraestrutura digital.
- **ODS 10:** interface para não especialistas, acessível, sem rastreamento e sem coleta de dados
  pessoais.
