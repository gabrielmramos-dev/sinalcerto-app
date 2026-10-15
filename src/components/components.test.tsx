import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { minTouch } from '@/theme';
import { AppButton } from './AppButton';
import { ScreenState } from './ScreenState';
import { QualityBadge, StatusBadge } from './StatusBadge';

describe('AppButton', () => {
  it('tem papel, nome, dica e área mínima de 48 (RNF02, RNF09)', async () => {
    await render(<AppButton label="Trocar local" hint="Abre a lista de regiões" onPress={() => {}} />);
    const button = screen.getByRole('button', { name: 'Trocar local' });
    expect(button).toHaveProp('accessibilityHint', 'Abre a lista de regiões');
    const style = StyleSheet.flatten(button.props.style);
    expect(style.minHeight).toBeGreaterThanOrEqual(minTouch);
    expect(style.minWidth).toBeGreaterThanOrEqual(minTouch);
  });

  it('expõe o estado selecionado também em texto (RNF03)', async () => {
    await render(<AppButton label="Tarde" selected onPress={() => {}} />);
    expect(screen.getByRole('button', { name: 'Tarde' })).toBeSelected();
    expect(screen.getByText('✓ Tarde')).toBeOnTheScreen();
  });

  it('desabilitado não dispara onPress', async () => {
    const onPress = jest.fn();
    await render(<AppButton label="Enviar" disabled onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Enviar' });
    expect(button).toBeDisabled();
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('StatusBadge', () => {
  it('QualityBadge mostra o texto do glossário e lê com contexto', async () => {
    await render(<QualityBadge value="MODERATE" />);
    expect(screen.getByText('Regular')).toBeOnTheScreen();
    expect(screen.getByLabelText('Qualidade prevista: Regular')).toBeOnTheScreen();
  });

  it('sem contexto, o nome é o próprio rótulo', async () => {
    await render(<StatusBadge tone="good" label="Deve funcionar" />);
    expect(screen.getByLabelText('Deve funcionar')).toBeOnTheScreen();
  });
});

describe('ScreenState', () => {
  it('erro é anunciado e tem "Tentar de novo"', async () => {
    const onRetry = jest.fn();
    await render(<ScreenState kind="error" message="Não deu para carregar." onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Não deu para carregar.');
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('carregando mostra texto, não só o indicador', async () => {
    await render(<ScreenState kind="loading" />);
    expect(screen.getByText('Carregando a previsão…')).toBeOnTheScreen();
  });

  it('vazio mostra a mensagem', async () => {
    await render(<ScreenState kind="empty" message="Nenhuma previsão para este local." />);
    expect(screen.getByText('Nenhuma previsão para este local.')).toBeOnTheScreen();
  });
});
