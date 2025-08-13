// api/services/parcelas.js
import fetch from 'node-fetch';
global.fetch = fetch;

const SHEET_ID = '1_ERXJ69NKfaqfQr5r1Lc_CN9rSpW5hlFs6QMEZ9RMoI';

async function fetchRange(range) {
  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
    `?tqx=out:json&range=${encodeURIComponent(range)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Erro ${resp.status}`);
  const text = await resp.text();
  const json = JSON.parse(text.replace(/^[^(]*\(/, '').replace(/\);?$/, ''));
  return json.table.rows;
}

// Lista para a tabela (Produto + Preço Tabela)
// Atenção: se sua planilha mudou, ajuste os índices de coluna aqui.
export async function fetchProdutos(tipo = 'moto') {
  const aba = tipo === 'mg' ? 'Tabela Moto MG' : 'Tabela Moto';
  // G..L (Produto está em G, Preço Tabela está em L)
  const rows = await fetchRange(`${aba}!G4:L1000`);
  return rows
    .map(r => {
      const produto = r.c[0]?.v?.toString().trim();
      const rawL    = r.c[5]?.v; // L relativo a G=0
      if (!produto) return null;
      const precoTabela =
        typeof rawL === 'string'
          ? Number(rawL.replace(/\./g, '').replace(/,/g, '.'))
          : rawL;
      return { produto, precoTabela };
    })
    .filter(Boolean);
}

// Detalhes para o modal (ajuste índices se necessário)
export async function fetchDetalhes(produtoNome, tipo = 'moto') {
  const aba  = tipo === 'mg' ? 'Tabela Moto MG' : 'Tabela Moto';
  const rows = await fetchRange(`${aba}!G4:AA1000`);
  const match = rows.find(r => r.c[0]?.v?.toString().trim() === produtoNome.trim());
  if (!match) throw new Error(`Produto "${produtoNome}" não encontrado`);

  const c = match.c || [];
  const toNum = v =>
    typeof v === 'string' ? Number(v.replace(/\./g, '').replace(/,/g, '.')) : (v ?? 0);

  // Mapeamento relativo a G=0 (confirme com sua planilha atual):
  // J = 3 → Preço à vista (Verde)
  // L = 5 → Preço Tabela
  // T = 13 → Emplacamento Tabela  (ajuste se sua planilha usar outra coluna)
  // U = 14 → Emplacamento à vista
  // Z = 19 → Frete CNH
  return {
    produto:             produtoNome,
    precoAVistaVerde:    toNum(c[3]?.v),
    precoTabela:         toNum(c[5]?.v),
    emplacamentoTabela:  toNum(c[13]?.v),
    emplacamentoVista:   toNum(c[14]?.v),
    freteCNH:            toNum(c[19]?.v),
  };
}

// Fatores de parcelas (Indices 2R)
export async function calcularParcelas(valorFinanciar, R = 4) {
  const rawRows = await fetchRange('Indices 2R!C14:G31');
  const indicesPorParcela = rawRows.map(row => {
    const cells = row.c || [];
    return [0,1,2,3,4].map(i => {
      const v = cells[i]?.v;
      if (typeof v === 'number') return v;
      if (typeof v === 'string') return Number(v.replace(/\./g, '').replace(/,/g, '.'));
      return 0;
    });
  });

  if (indicesPorParcela.length < 1) {
    throw new Error(`Nenhum índice encontrado em "Indices 2R"`);
  }

  // R é zero-based nos arrays: coluna R0..R4 -> índice = R
  return indicesPorParcela.map((fatores, idx) => {
    const fator = fatores[R] || 0;
    return {
      parcela: idx + 1,
      valor: +(valorFinanciar * fator).toFixed(2),
    };
  });
}
