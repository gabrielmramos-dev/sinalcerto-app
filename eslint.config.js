// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
// Pega controles sem nome, papel ou estado acessível já no editor (RNF02).
// O plugin ainda não declara suporte ao ESLint 9, por isso é registrado à mão (ver "overrides" no package.json).
const a11y = require('eslint-plugin-react-native-a11y');

module.exports = defineConfig([
  expoConfig,
  {
    plugins: { 'react-native-a11y': a11y },
    rules: a11y.configs.all.rules,
  },
  {
    ignores: ['dist/*'],
  },
]);
