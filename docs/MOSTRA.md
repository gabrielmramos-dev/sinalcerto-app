# Roteiro da Mostra (rascunho — só o que já está implementado)

## Problema
Quem tem um compromisso on-line não sabe se a internet vai aguentar. O SinalCerto mostra a
qualidade **prevista** da conexão em linguagem simples, para quem não entende de redes.

## Decisões e motivos (até o M1)
- Fonte única de termos (glossário): GOOD/MODERATE/UNSTABLE → Boa/Regular/Instável, com a
  equivalência a OK/Risco/Falha de Redes.
- Status sempre em texto + forma + cor; cada forma é diferente (círculo, triângulo, octógono).
- Contraste verificado por teste automatizado, não no olho.
- Dados de teste são respostas reais da API, gravadas por script e conferidas.

## Dificuldades
- A API arredonda o horário pedido e não diz qual horário usou. Solução: o app só pede
  horários que existem na timeline (D6).
- Conflito de versões entre bibliotecas (react-dom) e lint de acessibilidade sem suporte oficial
  ao ESLint 9.

## Limitações
- Os dados cobrem um único dia (20/08/2026); o app nunca chama isso de "agora".
- A previsão é de um ponto de referência da rede, não do celular do usuário.
- A previsão não inclui jitter.

## ODS
- **ODS 9:** torna compreensível uma informação sobre a infraestrutura digital.
- **ODS 10:** interface para não especialistas, acessível, sem rastreamento e sem coleta de dados
  pessoais.

## Melhorias possíveis
Ficam para o fim do projeto.
