import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo } from 'react-native';

import { sourceStatus } from '@/data/sourceStatus';

// D27: o aviso da fonte nas telas. Nos testes a fonte é a reserva; aqui o estado é trocado à mão.
const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});

beforeEach(() => announce.mockClear());
afterEach(() => act(() => sourceStatus.reset('saved-only')));

it('primeira consulta ainda sem resposta: carregando avisa que pode levar até 1 minuto', async () => {
  await act(() => sourceStatus.reset('unknown'));
  await renderRouter('src/app', { initialUrl: '/' });
  expect(screen.getByText('Carregando a previsão. Na primeira vez, pode levar até 1 minuto.')).toBeOnTheScreen();
  // ainda sem resposta: nenhum aviso de fonte
  expect(screen.queryByText(/Previsão atualizada|Sem conexão/)).toBeNull();
});

it('sem conexão: aviso com "Tentar de novo"; ao voltar a conexão, muda para "Previsão atualizada" e anuncia', async () => {
  await act(() => sourceStatus.markOffline());
  await renderRouter('src/app', { initialUrl: '/' });
  expect(await screen.findByText('Sem conexão: mostrando a previsão guardada no app')).toBeOnTheScreen();

  await fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo: buscar a previsão atualizada' }));
  expect(sourceStatus.get()).toMatchObject({ retrying: true, version: 1 });

  await act(() => sourceStatus.markOnline()); // a API respondeu depois do "Tentar de novo"
  expect(screen.getByText('Previsão atualizada')).toBeOnTheScreen();
  expect(screen.queryByText(/Sem conexão/)).toBeNull();
  expect(announce).toHaveBeenCalledWith('Previsão atualizada');
});

it('"Tentar de novo" recarrega a tela (a versão da fonte muda)', async () => {
  await act(() => sourceStatus.markOffline());
  await renderRouter('src/app', { initialUrl: '/detalhes' });
  await screen.findByText(/^Mostrando 24 horas/, {}, { timeout: 5000 });
  await fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo: buscar a previsão atualizada' }));
  expect(screen.getByText('Carregando as horas…')).toBeOnTheScreen();
  expect(await screen.findByText(/^Mostrando 24 horas/)).toBeOnTheScreen();
});

it.each(['/', '/atividades', '/detalhes', '/local', '/sobre'])('o aviso aparece na tela %s', async (url) => {
  await act(() => sourceStatus.markOffline());
  await renderRouter('src/app', { initialUrl: url });
  expect(await screen.findByText('Sem conexão: mostrando a previsão guardada no app')).toBeOnTheScreen();
});
