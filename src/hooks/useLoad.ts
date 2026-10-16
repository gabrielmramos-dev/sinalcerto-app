import { useEffect, useState } from 'react';

export type LoadState<T> = { status: 'loading' } | { status: 'ok'; data: T } | { status: 'error'; error: unknown };

/**
 * Carrega dados para uma tela. `load` deve vir de useCallback: quando ele muda (ex.: outro local),
 * a tela volta a "carregando" e a resposta antiga, se chegar depois, é descartada.
 */
export function useLoad<T>(load: () => Promise<T>): LoadState<T> & { retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ load: () => Promise<T>; attempt: number; state: LoadState<T> }>();

  useEffect(() => {
    let current = true;
    load().then(
      (data) => current && setResult({ load, attempt, state: { status: 'ok', data } }),
      (error: unknown) => current && setResult({ load, attempt, state: { status: 'error', error } }),
    );
    return () => {
      current = false;
    };
  }, [load, attempt]);

  // "Carregando" é derivado: o resultado guardado é de outra consulta (ou de outra tentativa).
  const fresh = result && result.load === load && result.attempt === attempt;
  const state: LoadState<T> = fresh ? result.state : { status: 'loading' };
  return { ...state, retry: () => setAttempt((a) => a + 1) };
}
