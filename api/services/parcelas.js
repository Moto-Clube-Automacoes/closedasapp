// /api/services/parcelas.js
import fetch from 'node-fetch';
global.fetch = fetch;

const SHEET_ID = '1_ERXJ69NKfaqfQr5r1Lc_CN9rSpW5hlFs6QMEZ9RMoI';

// Utilitário: busca um range via GVIZ e retorna rows[]
async function fetchRange(range) {
  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
    `?tqx=out:json&range=${encodeURIComponent(range)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Erro ${resp.status} em ${range}`);
  const text = await resp.text();
  const json = JSON.parse(text.replace(/^[^(]*\(/, '').replace(/\);?$/, ''));
  return json.table.rows || [];
}

// Lista de produtos (apenas nome + Preço Tabela)
// Abas: "Tabela Moto" e "Tabela Moto MG"
// Range: G4:L1000  → G=produto (idx 0), L=Preço Tabela (idx 5)
export async function fetchProdutos(tipo = 'moto') {
  const aba  = tipo === 'mg' ? 'Tabela Moto MG' : 'Tabela Moto';
  const rows = await fetchRange(`${aba}!G4:L1000`);

  const out = [];
  for (const r of rows) {
    const cells = r.c || [];
    const produto = cells[0]?.v?.toString().trim();
    if (!produto) continue;

    const raw = cells[5]?.v; // L
    const precoTabela =
      typeof raw === 'string'
        ? Number(raw.replace(/\./g, '').replace(/,/g, '.'))
        : (raw ?? 0);

    out.push({ produto, precoTabela });
  }
  return out;
}

// Detalhes do produto (campos para o popup)
// Range: G4:AA1000 (G=0..AA=20)
// Mapeamento (0-based):
//  G: produto(0) | J: Preço à Vista - Verde(3) | L: Preço Tabela(5)
//  T: Emplacamento à vista (IPVA incluso)(13) | Y: Frete CNH(18) | Z: Emplacamento Tabela(19)
export async function fetchDetalhes(produtoNome, tipo = 'moto') {
  const aba  = tipo === 'mg' ? 'Tabela Moto MG' : 'Tabela Moto';
  const rows = await fetchRange(`${aba}!G4:AA1000`);

  const linha = rows.find(
    (r) => r.c?.[0]?.v?.toString().trim() === produtoNome.trim()
  );
  if (!linha) {
    throw new Error(`Produto "${produtoNome}" não encontrado`);
  }

  const vals = (linha.c || []).map((c) => c?.v);

  const toNum = (v) =>
    typeof v === 'string' ? Number(v.replace(/\./g, '').replace(/,/g, '.')) : (v ?? 0);

  return {
    produto:             produtoNome,
    precoAVistaVerde:    toNum(vals[3]),   // J
    precoTabela:         toNum(vals[5]),   // L
    emplacamentoVista:   toNum(vals[13]),  // T
    freteCNH:            toNum(vals[18]),  // Y
    emplacamentoTabela:  toNum(vals[19])   // Z
  };
}

// Parcelas (1..18) usando fatores da aba "Indices 2R"
// Range: C14:G31 (18 linhas, 5 colunas = R0..R4)
// R esperado: 0..4 (se te enviarem 4 ⇒ usa coluna 5 = 4R)
export async function calcularParcelas(valorFinanciar, R = 4) {
  const rawRows = await fetchRange('Indices 2R!C14:G31');
  const indices = rawRows.map((row) => {
    const cells = row.c || [];
    return [0, 1, 2, 3, 4].map((i) => {
      const v = cells[i]?.v;
      if (typeof v === 'number') return v;
      if (typeof v === 'string') return Number(v.replace(/\./g, '').replace(/,/g, '.'));
      return 0;
      });
  });

  if (indices.length !== 18) {
    throw new Error(`Esperava 18 linhas de índice, recebi ${indices.length}`);
  }

  return indices.map((fatores, idx) => {
    const fator = fatores[R] || 0; // usa a coluna R (0..4)
    return {
      parcela: idx + 1,
      valor: +(valorFinanciar * fator).toFixed(2)
    };
  });
}
