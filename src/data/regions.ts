// D7: rótulos definidos pela equipe a partir das coordenadas de GET /locations.
// A API não traz nome de cidade; cada probe fica na coordenada de uma capital.
const regions: Record<number, string> = {
  900001: 'Região de São Paulo (SP)',
  900002: 'Região do Rio de Janeiro (RJ)',
  900003: 'Região de Belo Horizonte (MG)',
  900004: 'Região de Brasília (DF)',
  900005: 'Região de Salvador (BA)',
  900006: 'Região do Recife (PE)',
  900007: 'Região de Fortaleza (CE)',
  900008: 'Região de Curitiba (PR)',
  900009: 'Região de Porto Alegre (RS)',
  900010: 'Região de Manaus (AM)',
};

export function regionLabel(probeId: number): string {
  return regions[probeId] ?? `Ponto de referência ${probeId}`;
}
