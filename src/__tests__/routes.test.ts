// Todo arquivo em src/app vira rota e entra no bundle do celular.
// Um teste ali quebrou o app (importava código que só existe no Node). Testes ficam em src/__tests__.
// fs via Jest, sem @types/node no projeto: no app, módulo do Node tem que dar erro de tipo.
const fs = jest.requireActual<{ readdirSync: (dir: string, opts: { recursive: true }) => string[] }>('fs');

it('src/app não tem arquivos de teste', () => {
  const files = fs.readdirSync('src/app', { recursive: true });
  expect(files.filter((f) => /\.test\.[jt]sx?$/.test(f))).toEqual([]);
});
