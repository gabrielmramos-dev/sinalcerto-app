import { useCallback, useEffect, useRef, useState } from 'react';

import { ACTIVITIES, type Activity, type ActivityCheck } from '@/api/types';
import { forecastSource } from '@/data';
import { useSourceStatus } from '@/data/sourceStatus';

// D19: 15 s por chamada. Vale porque as chamadas só saem depois que a timeline carregou,
// ou seja, com o servidor já acordado (no plano gratuito, a primeira chamada pode levar dezenas de segundos).
export const ACTIVITY_TIMEOUT_MS = 15_000;

export type CardState = { status: 'loading' } | { status: 'ok'; data: ActivityCheck } | { status: 'error' };

export interface CheckParams {
  probeId: number;
  latitude: number;
  longitude: number;
  modelId: string;
  /** D6: predictionFor exato de um item da timeline. */
  predictionFor: string;
}

// D5: cache em memória por probe + horário + modelo + atividade. Só guarda sucesso.
// ponytail: cresce sem limite; são no máximo 10 probes x 24 horas x 6 atividades = 1.440 respostas.
const cache = new Map<string, ActivityCheck>();
export const clearActivityCache = () => cache.clear();

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Tempo esgotado')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** D5: as 6 atividades em paralelo, cada uma com seu estado, erro e "Tentar de novo". */
export function useActivityChecks(params: CheckParams | null) {
  const { probeId, latitude, longitude, modelId, predictionFor } = params ?? {};
  // A versão muda com "Tentar de novo" (D27): a chave nova faz as 6 consultas saírem de novo.
  const { version } = useSourceStatus();
  const base = params ? `${probeId}|${predictionFor}|${modelId}|v${version}` : null;
  const [errors, setErrors] = useState<Record<string, true>>({});
  const [, setDone] = useState(0); // só para redesenhar quando uma resposta entra no cache
  // Horário que está na tela agora. Respostas de outro horário são descartadas (plano do M3).
  const currentBase = useRef(base);

  const run = useCallback(
    (activity: Activity) => {
      if (base === null) return;
      const key = `${base}|${activity}`;
      withTimeout(
        forecastSource.checkActivity({
          modelId: modelId!,
          latitude: latitude!,
          longitude: longitude!,
          dateTime: predictionFor!,
          activity,
        }),
        ACTIVITY_TIMEOUT_MS,
      ).then(
        (data) => {
          // O dado é correto para o horário dele, então vai para o cache mesmo atrasado; só não redesenha a tela.
          cache.set(key, data);
          if (currentBase.current === base) setDone((n) => n + 1);
        },
        () => {
          // Erro atrasado de outro horário é descartado: ao voltar para ele, o cartão consulta de novo.
          if (currentBase.current === base) setErrors((e) => ({ ...e, [key]: true }));
        },
      );
    },
    [base, modelId, latitude, longitude, predictionFor],
  );

  useEffect(() => {
    currentBase.current = base;
    if (base === null) return;
    for (const activity of ACTIVITIES) if (!cache.has(`${base}|${activity}`)) run(activity);
  }, [base, run]);

  const retry = (activity: Activity) => {
    setErrors(({ [`${base}|${activity}`]: _, ...rest }) => rest);
    run(activity);
  };

  // Estado derivado: cache -> ok; erro deste horário -> erro; senão, carregando.
  const cards = ACTIVITIES.map((activity) => {
    const key = `${base}|${activity}`;
    const data = cache.get(key);
    const state: CardState = data ? { status: 'ok', data } : errors[key] ? { status: 'error' } : { status: 'loading' };
    return { activity, state };
  });

  return { cards, retry };
}

export type PlannerState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ok'; suitable: ReadonlySet<string> };

const PLANNER_PARALLEL = 6;

/**
 * D31 (planejador, E3): `suitable` de UMA atividade nas horas da timeline. As chamadas só saem quando a
 * pessoa toca na atividade: 24 por atividade e região, no máximo 6 ao mesmo tempo, com o mesmo cache
 * da D5 (o que já foi consultado nos cartões não sai de novo). Trocar de atividade para a fila antiga.
 */
export function usePlanner(
  params: Omit<CheckParams, 'predictionFor'> | null,
  hours: readonly string[],
  activity: Activity | null,
): { state: PlannerState; retry: () => void } {
  const { version } = useSourceStatus();
  const { probeId, latitude, longitude, modelId } = params ?? {};
  const run = params && activity ? `${probeId}|${modelId}|v${version}|${activity}` : null;
  const keyOf = (p: string) => `${probeId}|${p}|${modelId}|v${version}|${activity}`; // mesmo formato da D5
  const [failed, setFailed] = useState<string | null>(null);
  const [, setDone] = useState(0);
  const current = useRef(run);

  const start = useCallback(() => {
    if (run === null) return;
    const key = (p: string) => `${probeId}|${p}|${modelId}|v${version}|${activity}`;
    const queue = hours.filter((p) => !cache.has(key(p)));
    if (queue.length === 0) return;
    let anyError = false;
    const worker = async () => {
      // Para de puxar horas novas se a pessoa trocou de atividade ou de região.
      for (let p = queue.shift(); p && current.current === run; p = queue.shift()) {
        try {
          const data = await withTimeout(
            forecastSource.checkActivity({ modelId: modelId!, latitude: latitude!, longitude: longitude!, dateTime: p, activity: activity! }),
            ACTIVITY_TIMEOUT_MS,
          );
          cache.set(key(p), data);
        } catch {
          anyError = true;
        }
      }
    };
    Promise.all(Array.from({ length: PLANNER_PARALLEL }, worker)).then(() => {
      if (current.current !== run) return; // resposta de outra atividade: descartada da tela
      if (anyError) setFailed(run);
      setDone((n) => n + 1);
    });
  }, [run, hours, probeId, modelId, version, activity, latitude, longitude]);

  useEffect(() => {
    current.current = run;
    start();
  }, [run, start]);

  const retry = () => {
    setFailed(null);
    start();
  };

  if (run === null) return { state: { status: 'idle' }, retry };
  const results = hours.map((p) => cache.get(keyOf(p)));
  if (results.every((r) => r !== undefined)) {
    return { state: { status: 'ok', suitable: new Set(hours.filter((_, i) => results[i]!.suitable)) }, retry };
  }
  return { state: { status: failed === run ? 'error' : 'loading' }, retry };
}
