// /tela-valores/src/services/parcelas.js
const API_BASE = '/api';

// Se você for usar autenticação/headers do Bitrix, injete aqui
const baseFetchInit = {};

// GET /api/precos?tipo=moto|mg
export async function fetchProdutos(tipo = 'moto', signal) {
  const url = `${API_BASE}/precos?tipo=${encodeURIComponent(tipo)}`;
  const res = await fetch(url, { ...baseFetchInit, signal });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return res.json();
}

// GET /api/detalhes?produto=...&tipo=moto|mg
export async function fetchDetalhes(produto, tipo = 'moto', signal) {
  const url =
    `${API_BASE}/detalhes?produto=${encodeURIComponent(produto)}&tipo=${encodeURIComponent(tipo)}`;
  const res = await fetch(url, { ...baseFetchInit, signal });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return res.json();
}

// GET /api/parcelas?valor=...&R=...
export async function calcularParcelas(valor, R, signal) {
  const url =
    `${API_BASE}/parcelas?valor=${encodeURIComponent(valor)}&R=${encodeURIComponent(R)}`;
  const res = await fetch(url, { ...baseFetchInit, signal });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return res.json();
}
