import { act, renderHook } from '@testing-library/react-native';

import { useLoad } from './useLoad';

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

it('carregando -> ok', async () => {
  const d = deferred<string>();
  const load = () => d.promise;
  const { result } = await renderHook(() => useLoad(load));
  expect(result.current.status).toBe('loading');
  await act(async () => d.resolve('previsão'));
  expect(result.current).toMatchObject({ status: 'ok', data: 'previsão' });
});

it('descarta a resposta antiga quando a consulta muda (troca de local)', async () => {
  const sp = deferred<string>();
  const rj = deferred<string>();
  const loads = { sp: () => sp.promise, rj: () => rj.promise };
  const { result, rerender } = await renderHook(({ which }: { which: 'sp' | 'rj' }) => useLoad(loads[which]), {
    initialProps: { which: 'sp' as const },
  });
  await rerender({ which: 'rj' });
  await act(async () => rj.resolve('RJ'));
  await act(async () => sp.resolve('SP')); // chega atrasada
  expect(result.current).toMatchObject({ status: 'ok', data: 'RJ' });
});

it('erro -> tentar de novo -> ok', async () => {
  let fail = true;
  const load = () => (fail ? Promise.reject(new Error('fora do ar')) : Promise.resolve('ok'));
  const { result } = await renderHook(() => useLoad(load));
  await act(async () => {});
  expect(result.current.status).toBe('error');
  fail = false;
  await act(async () => result.current.retry());
  expect(result.current).toMatchObject({ status: 'ok', data: 'ok' });
});
