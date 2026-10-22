import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import type { TimelineItem } from '@/api/types';
import { bestInPeriod, PERIODS, type PeriodId } from '@/data/periods';
import { brasiliaHour, formatBrasiliaLong, itemAtClock } from '@/data/time';
import { period as periodText } from '@/i18n/glossary';
import { colors, font, spacing } from '@/theme';
import { AppButton } from './AppButton';

interface Props {
  items: TimelineItem[];
  /** predictionFor escolhido (D6) ou null. */
  selected: string | null;
  onSelect: (predictionFor: string) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** RQ04: seletor nativo de hora + botões de período. Só devolve horários que existem na timeline (D6). */
export function TimeChooser({ items, selected, onSelect }: Props) {
  const [chosenPeriod, setChosenPeriod] = useState<PeriodId | null>(null);
  // O aviso guarda o horário a que se refere: se o horário mudar em outra aba (Detalhes), ele some.
  const [rounded, setRounded] = useState<{ predictionFor: string; picked: string } | null>(null);
  const [iosDraft, setIosDraft] = useState<Date | null>(null);

  // O seletor mostra a hora do relógio; ela é lida como horário de Brasília, como todo o app (D18).
  const pickerValue = () => {
    const d = new Date();
    d.setHours(selected ? brasiliaHour(selected) : 12, 0, 0, 0);
    return d;
  };

  const pick = (date: Date) => {
    const item = itemAtClock(items, date.getHours(), date.getMinutes());
    if (!item) return;
    setChosenPeriod(null);
    setRounded(
      date.getMinutes() === 0
        ? null
        : { predictionFor: item.predictionFor, picked: `${pad(date.getHours())}:${pad(date.getMinutes())}` },
    );
    onSelect(item.predictionFor);
  };

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: pickerValue(),
        mode: 'time',
        is24Hour: true,
        onChange: (event, date) => event.type === 'set' && date && pick(date),
      });
    } else {
      setIosDraft(pickerValue());
    }
  };

  return (
    <View style={styles.box}>
      <Text style={[font.body, styles.text]}>
        {selected
          ? `Horário usado na previsão: ${formatBrasiliaLong(selected)} (horário de Brasília)`
          : 'Nenhum horário escolhido ainda.'}
      </Text>
      {rounded && rounded.predictionFor === selected && (
        <Text style={[font.small, styles.muted]}>Você escolheu {rounded.picked}; a previsão é por hora.</Text>
      )}

      {iosDraft ? (
        <View style={styles.box}>
          <DateTimePicker
            value={iosDraft}
            mode="time"
            display="spinner"
            is24Hour
            locale="pt-BR"
            onChange={(_, date) => date && setIosDraft(date)}
            accessibilityLabel="Hora da atividade"
            accessibilityHint="Escolha a hora e depois toque em Usar este horário"
          />
          <AppButton
            label="Usar este horário"
            variant="primary"
            onPress={() => {
              pick(iosDraft);
              setIosDraft(null);
            }}
          />
          <AppButton label="Cancelar" hint="Fecha o seletor sem mudar o horário" onPress={() => setIosDraft(null)} />
        </View>
      ) : (
        <AppButton label="Mudar horário" hint="Abre o seletor de hora" onPress={openPicker} />
      )}

      <Text style={[font.label, styles.text]}>Ou escolha a melhor hora de um período:</Text>
      <View style={styles.periods}>
        {PERIODS.map(({ id }) => {
          const best = bestInPeriod(items, id);
          if (!best) return null;
          return (
            <AppButton
              key={id}
              label={`${periodText[id]}: ${formatBrasiliaLong(best.predictionFor, false)}`}
              hint="Usa a hora com a melhor nota prevista neste período"
              selected={chosenPeriod === id && selected === best.predictionFor}
              onPress={() => {
                setChosenPeriod(id);
                setRounded(null);
                // Fecha o seletor do iPhone: senão ele continuaria mostrando outro horário que não é o usado.
                // Ao abrir de novo, ele começa no horário usado (pickerValue).
                setIosDraft(null);
                onSelect(best.predictionFor);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: spacing.sm },
  periods: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  text: { color: colors.text },
  muted: { color: colors.textMuted },
});
