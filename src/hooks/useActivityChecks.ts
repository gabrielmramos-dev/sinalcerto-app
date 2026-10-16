import { useCallback, useEffect, useRef, useState } from 'react';

import { ACTIVITIES, type Activity, type ActivityCheck } from '@/api/types';
import { forecastSource } from '@/data';

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
  const base = params ? `${probeId}|${predictionFor}|${modelId}` : null;
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
