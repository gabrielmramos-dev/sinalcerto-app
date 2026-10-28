import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import type { TimelineItem } from '@/api/types';
import { bestInPeriod, PERIODS, type PeriodId } from '@/data/periods';
import { brasiliaHour, formatBrasiliaLong, itemAtClock } from '@/data/time';
import { period as periodText, ui } from '@/i18n/glossary';
import { colors, font, spacing } from '@/theme';
import { AppButton } from './AppButton';

const t = ui.timeChooser;

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
      <Text style={[font.body, styles.text]}>{selected ? t.used(formatBrasiliaLong(selected)) : t.none}</Text>
      {rounded && rounded.predictionFor === selected && (
        <Text style={[font.small, styles.muted]}>{t.rounded(rounded.picked)}</Text>
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
            accessibilityLabel={t.pickerLabel}
            accessibilityHint={t.pickerHint}
          />
          <AppButton
            label={t.usePicked}
            variant="primary"
            onPress={() => {
              pick(iosDraft);
              setIosDraft(null);
            }}
          />
          <AppButton label={t.cancel} hint={t.cancelHint} onPress={() => setIosDraft(null)} />
        </View>
      ) : (
        <AppButton label={t.change} hint={t.changeHint} onPress={openPicker} />
      )}

      <Text style={[font.label, styles.text]}>{t.periodsTitle}</Text>
      <View style={styles.periods}>
        {PERIODS.map(({ id }) => {
          const best = bestInPeriod(items, id);
          if (!best) return null;
          return (
            <AppButton
              key={id}
              label={`${periodText[id]}: ${formatBrasiliaLong(best.predictionFor, false)}`}
              hint={t.periodHint}
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
