// D7: nomes definidos pela equipe a partir das coordenadas de GET /locations.
// A API não traz nome de cidade; cada probe fica na coordenada de uma capital.
const regions: Record<number, { name: string; label: string }> = {
  900001: { name: 'São Paulo (SP)', label: 'Região de São Paulo (SP)' },
  900002: { name: 'Rio de Janeiro (RJ)', label: 'Região do Rio de Janeiro (RJ)' },
  900003: { name: 'Belo Horizonte (MG)', label: 'Região de Belo Horizonte (MG)' },
  900004: { name: 'Brasília (DF)', label: 'Região de Brasília (DF)' },
  900005: { name: 'Salvador (BA)', label: 'Região de Salvador (BA)' },
  900006: { name: 'Recife (PE)', label: 'Região do Recife (PE)' },
  900007: { name: 'Fortaleza (CE)', label: 'Região de Fortaleza (CE)' },
  900008: { name: 'Curitiba (PR)', label: 'Região de Curitiba (PR)' },
  900009: { name: 'Porto Alegre (RS)', label: 'Região de Porto Alegre (RS)' },
  900010: { name: 'Manaus (AM)', label: 'Região de Manaus (AM)' },
};

const unknown = (id: number) => `Outra região (código ${id})`;

/** Rótulo da lista de escolha: "Região de São Paulo (SP)". */
export function regionLabel(probeId: number): string {
  return regions[probeId]?.label ?? unknown(probeId);
}

/** Fora da lista (D26): só o nome, "São Paulo (SP)", para usar em "Região escolhida: …". */
export function regionName(probeId: number): string {
  return regions[probeId]?.name ?? unknown(probeId);
}
