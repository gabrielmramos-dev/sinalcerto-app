// Roda antes de cada arquivo de teste (ver "setupFiles" no package.json).

// O seletor nativo de data e hora trava no Jest (aqui não há módulo nativo). Trocamos por uma View com
// os mesmos props (onChange, rótulo). O seletor de verdade é verificado à mão no iPhone (D18, STATUS.md).
jest.mock('@react-native-community/datetimepicker', () => {
  // Dentro de jest.mock só dá para usar require (a fábrica roda antes dos imports).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createElement } = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: object) => createElement(View, props),
    DateTimePickerAndroid: { open: jest.fn() },
  };
});
