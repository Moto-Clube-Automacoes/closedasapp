// api/server.js
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // usado para chamar o REST do Bitrix (user.current)

import {
  fetchProdutos,
  calcularParcelas,
  fetchDetalhes,
} from './services/parcelas.js';

const app = express();
app.use(cors());
app.use(express.json());

/* -------------------------------------------
   Helpers: Bitrix auth + checagem de permissão
-------------------------------------------- */

// Lê o header X-B24-Auth (enviado pelo front) e carrega o usuário pelo REST user.current
async function loadB24UserFromHeader(req) {
  const raw = req.headers['x-b24-auth'];
  if (!raw) return null;

  let auth;
  try { auth = JSON.parse(raw); } catch { return null; }
  if (!auth || !auth.access_token || !auth.domain) return null;

  const url = `https://${auth.domain}/rest/user.current?auth=${auth.access_token}`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = await r.json();
  return j?.result || null;
}

// Defina aqui onde está sua "loja" no Bitrix.
// Exemplo: campo custom do usuário UF_LOJA ('X' | 'Y')
function getLojaFromUser(user) {
  // ajuste o nome exato do campo, ex.: UF_CRM_123456
  return user?.UF_LOJA || user?.UF_CRM_123456 || null;
}

/*  Se preferir por departamento, use isso:
function userHasDept(user, deptId) {
  const depts = Array.isArray(user?.UF_DEPARTMENT) ? user.UF_DEPARTMENT : [];
  return depts.includes(Number(deptId));
}
*/

// Política: Loja X vê "moto"; Loja Y vê "mg"
function canSee(tipo, user) {
  // Em dev/local sem Bitrix, libere (a não ser que você force com REQUIRE_AUTH=1)
  if (!user && process.env.REQUIRE_AUTH !== '1') return true;

  if (!user) return false;
  const loja = getLojaFromUser(user);
  if (tipo === 'moto') return loja === 'X';
  if (tipo === 'mg')   return loja === 'Y';
  return false;
}

// Middleware: anexa req.b24user se houver header
app.use('/api', async (req, _res, next) => {
  try {
    req.b24user = await loadB24UserFromHeader(req);
  } catch {
    req.b24user = null;
  }
  next();
});

/* --------------- ROTAS ------------------- */

// /api/precos — protegido por loja
app.get('/api/precos', async (req, res) => {
  try {
    const tipo = req.query.tipo === 'mg' ? 'mg' : 'moto';

    if (!canSee(tipo, req.b24user)) {
      return res.status(403).json({ error: 'Sem permissão para esta tabela' });
    }

    const lista = await fetchProdutos(tipo);
    res.json(lista);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// /api/parcelas — não depende de loja, mas pode proteger se quiser
app.get('/api/parcelas', async (req, res) => {
  try {
    const valor = parseFloat(req.query.valor);
    if (isNaN(valor)) {
      return res.status(400).json({ error: 'Parâmetro “valor” inválido ou faltando' });
    }
    let R = parseInt(req.query.R, 10);
    if (isNaN(R) || R < 1 || R > 5) R = 4;

    const sims = await calcularParcelas(valor, R);
    res.json(sims);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// /api/detalhes — protegido por loja
app.get('/api/detalhes', async (req, res) => {
  try {
    const produto = req.query.produto;
    if (!produto) {
      return res.status(400).json({ error: 'Query param “produto” é obrigatório' });
    }
    const tipo = req.query.tipo === 'mg' ? 'mg' : 'moto';

    if (!canSee(tipo, req.b24user)) {
      return res.status(403).json({ error: 'Sem permissão para esta tabela' });
    }

    const detalhes = await fetchDetalhes(produto, tipo);
    res.json(detalhes);
  } catch (err) {
    console.error(err);
    const status = err.message?.includes('não encontrado') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));

