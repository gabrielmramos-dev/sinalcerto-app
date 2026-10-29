// D7: nomes definidos pela equipe a partir das coordenadas de GET /locations.
// A API não traz nome de cidade; cada probe fica na coordenada de uma capital.
const regions: Record<number, { name: string }> = {
  900001: { name: 'São Paulo (SP)' },
  900002: { name: 'Rio de Janeiro (RJ)' },
  900003: { name: 'Belo Horizonte (MG)' },
  900004: { name: 'Brasília (DF)' },
  900005: { name: 'Salvador (BA)' },
  900006: { name: 'Recife (PE)' },
  900007: { name: 'Fortaleza (CE)' },
  900008: { name: 'Curitiba (PR)' },
  900009: { name: 'Porto Alegre (RS)' },
  900010: { name: 'Manaus (AM)' },
};

const unknown = (id: number) => `Outra região (código ${id})`;

/** Fora da lista (D26): só o nome, "São Paulo (SP)", para usar em "Região escolhida: …". */
export function regionName(probeId: number): string {
  return regions[probeId]?.name ?? unknown(probeId);
}
