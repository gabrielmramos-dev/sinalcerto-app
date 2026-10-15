# SinalCerto

App de previsão da qualidade da conexão com foco em acessibilidade (projeto integrador, Braz
Cubas). React Native + Expo SDK 57 + TypeScript.

## Rodar no celular

1. Instale o **Expo Go** (Play Store ou App Store). Ele precisa suportar o SDK 57.
2. No computador (Node 20 ou mais novo):
   ```bash
   npm install
   npx expo start
   ```
3. Celular e computador na **mesma rede Wi-Fi**. Leia o QR code com o Expo Go (Android) ou com a
   câmera (iPhone).
4. Se a rede bloquear (por exemplo, o Wi-Fi da faculdade): `npx expo start --tunnel`.

Se um dia a API rodar no seu computador: no celular físico, use o IP local da máquina (ex.:
`http://192.168.0.10:8000`); no emulador Android, `http://10.0.2.2:8000`. Ajuste
`EXPO_PUBLIC_API_BASE_URL` no `.env` (modelo em `.env.example`).

## Comandos

| Comando | O que faz |
|---|---|
| `npm run check` | typecheck + lint (com regras de acessibilidade) + testes. Rodar antes de cada entrega. |
| `npm test` | testes (Jest) |
| `node scripts/save-mock.mjs` | regrava o mock com respostas reais da API (≈1.500 chamadas) |

## Documentação

`PLAN.md` (marcos) · `STATUS.md` (o que está feito, de verdade) · `docs/DECISOES.md` ·
`docs/M0-design.md` (telas e glossário) · `docs/prompts-ia.md` (registro de uso de IA).
