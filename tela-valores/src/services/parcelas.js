// tela-valores/src/services/parcelas.js

// Se existir VITE_API_BASE, usa ela; senão cai para '/api' (proxy do Vite no dev)
const API_BASE = 'http://37.27.202.41:3001/api';

function handleHttp(res) {
  if (!res.ok) {
    return res.text().then(t => {
      console.error('[API ERROR]', res.status, t);
      throw new Error(`Status ${res.status}`);
    });
  }
  return res.json();
}

/** Lista de produtos */
export async function fetchProdutos(tipo = 'moto') {
  const res = await fetch(`${API_BASE}/precos?tipo=${tipo}`);
  return handleHttp(res);
}

/** Detalhes do produto */
export async function fetchDetalhes(produto, tipo = 'moto') {
  const url = `${API_BASE}/detalhes?produto=${encodeURIComponent(produto)}&tipo=${tipo}`;
  const res = await fetch(url);
  return handleHttp(res);
}

/** Simulação de parcelas */
export async function calcularParcelas(valor, R) {
  const res = await fetch(`${API_BASE}/parcelas?valor=${valor}&R=${R}`);
  return handleHttp(res);
}


