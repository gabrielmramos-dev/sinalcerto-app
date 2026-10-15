// Salva respostas reais da API em src/data/mock/ (decisão D1).
// Uso: node scripts/save-mock.mjs [URL base]   (padrão: a instância da squad)
// Só o modelo padrão (model-a): trocar de modelo é extra.
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = (process.argv[2] ?? 'https://internet-quality-api.onrender.com') + '/api/v1';
const MODEL = 'model-a';
const OUT = new URL('../src/data/mock/', import.meta.url);

async function get(path, init) {
  const res = await fetch(BASE + path, { ...init, signal: AbortSignal.timeout(90_000) });
  if (!res.ok) throw new Error(`${res.status} em ${path}`);
  return res.json();
}

const models = await get('/models');
const locations = await get('/locations');
const forecasts = {};
const timelines = {};
for (const { probeId } of locations.items) {
  forecasts[probeId] = await get(`/forecasts/probes/${probeId}?model_id=${MODEL}`);
  timelines[probeId] = await get(`/forecasts/probes/${probeId}/timeline?model_id=${MODEL}&limit=100`);
}

const ACTIVITIES = ['VIDEO_CALL', 'AUDIO_CALL', 'STREAMING', 'FILE_UPLOAD', 'WEB_BROWSING', 'MESSAGING'];
// activities[probeId][predictionFor][activity] = [suitable, code, message]
// O resto da resposta (forecast) é igual ao item da timeline; isso é conferido abaixo.
const activities = {};
let shared;
const jobs = [];
for (const { probeId, location } of locations.items) {
  for (const item of timelines[probeId].items) {
    for (const activity of ACTIVITIES) jobs.push({ probeId, location, item, activity });
  }
}
for (let i = 0; i < jobs.length; i += 12) {
  await Promise.all(
    jobs.slice(i, i + 12).map(async ({ probeId, location, item, activity }) => {
      const r = await get('/activity/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: MODEL, ...location, dateTime: item.predictionFor, activity }),
      });
      const f = r.forecast;
      if (
        f.quality !== item.quality ||
        f.predictedAvgRttMs !== item.predictedAvgRttMs ||
        f.predictedPacketLossPct !== item.predictedPacketLossPct
      ) {
        throw new Error(`forecast diferente da timeline: probe ${probeId} ${item.predictionFor} ${activity}`);
      }
      shared ??= { model: r.model, metadata: r.metadata };
      ((activities[probeId] ??= {})[item.predictionFor] ??= {})[activity] = [
        r.suitable,
        r.recommendation.code,
        r.recommendation.message,
      ];
    }),
  );
  process.stdout.write(`\ratividades: ${Math.min(i + 12, jobs.length)}/${jobs.length}`);
}

mkdirSync(OUT, { recursive: true });
const save = (name, data) => writeFileSync(new URL(name, OUT), JSON.stringify(data) + '\n');
save('models.json', models);
save('locations.json', locations);
save('forecasts.json', forecasts);
save('timelines.json', timelines);
save('activities.json', { ...shared, savedAt: new Date().toISOString(), base: BASE, byProbe: activities });
console.log(`\nok: ${locations.items.length} probes, ${jobs.length} consultas de atividade`);
