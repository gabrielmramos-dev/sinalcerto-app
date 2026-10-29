import type { TimelineItem } from '@/api/types';
import { nearestItem } from '@/data/time';
import { useAppState } from '@/state/AppState';

/**
 * D34: UMA hora selecionada no app inteiro. É a escolhida pela pessoa (faixa, seletor, Detalhes) ou,
 * sem escolha, a mais próxima de agora (RQ01). Com os dados atuais (agosto), é a última: 20/08 20:00.
 * Derivada, não gravada: escolher continua sendo só `setSelectedTime`.
 */
export function useChosenHour(items: readonly TimelineItem[]) {
  const { selectedTime, setSelectedTime } = useAppState();
  const chosen = items.find((i) => i.predictionFor === selectedTime) ?? nearestItem(items, new Date());
  return { chosen, choose: setSelectedTime };
}
