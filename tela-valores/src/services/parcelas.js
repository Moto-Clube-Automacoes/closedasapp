// src/services/parcelas.js
const API_BASE = '/api';

// (opcional) se for usar autenticação do Bitrix no cabeçalho:
let withAuthHeaders = (init = {}) => init;

// descomente se você tiver essa função implementada
// import { getBitrixAuth } from '../bitrix';
// withAuthHeaders = (init = {}) => {
//   const auth = getBitrixAuth?.();
//   const headers = new Headers(init.headers || {});
//   if (auth) headers.set('X-B24-Auth', JSON.stringify(auth));
//   return { ...init, headers };
// };

const baseFetchInit = {
  cache: 'no-store',                          // evita cache
  headers: { 'Cache-Control': 'no-cache' },   // reforça no navegador
};

/** GET /api/precos?tipo=moto|mg */
export async function fetchProdutos(tipo = 'moto', signal) {
  const res = await fetch(
    `${API_BASE}/precos?tipo=${encodeURIComponent(tipo)}`,
    withAuthHeaders({ ...baseFetchInit, signal })
  );
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return res.json();
}

/** GET /api/detalhes?produto=...&tipo=moto|mg */
export async function fetchDetalhes(produto, tipo = 'moto', signal) {
  const url = `${API_BASE}/detalhes?produto=${encodeURIComponent(produto)}&tipo=${encodeURIComponent(tipo)}`;
  const res = await fetch(url, withAuthHeaders({ ...baseFetchInit, signal }));
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return res.json();
}

/** GET /api/parcelas?valor=...&R=... */
export async function calcularParcelas(valor, R, signal) {
  const url = `${API_BASE}/parcelas?valor=${encodeURIComponent(valor)}&R=${encodeURIComponent(R)}`;
  const res = await fetch(url, withAuthHeaders({ ...baseFetchInit, signal }));
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return res.json();
}
