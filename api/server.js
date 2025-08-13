// /api/server.js
import express from 'express';
import cors from 'cors';
import {
  fetchProdutos,
  fetchDetalhes,
  calcularParcelas
} from './services/parcelas.js';

const app = express();
app.use(cors());
app.use(express.json());

// GET /api/precos?tipo=moto|mg
app.get('/api/precos', async (req, res) => {
  try {
    const tipo = req.query.tipo === 'mg' ? 'mg' : 'moto';
    const lista = await fetchProdutos(tipo);
    res.json(lista);
  } catch (err) {
    console.error('[precos]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/detalhes?produto=...&tipo=moto|mg
app.get('/api/detalhes', async (req, res) => {
  try {
    const produto = req.query.produto;
    if (!produto) {
      return res.status(400).json({ error: 'Query param “produto” é obrigatório' });
    }
    const tipo = req.query.tipo === 'mg' ? 'mg' : 'moto';
    const det = await fetchDetalhes(produto, tipo);
    res.json(det);
  } catch (err) {
    // 404 se não achar; 500 para outros erros
    const status = /não encontrado/i.test(err.message) ? 404 : 500;
    console.error('[detalhes]', err);
    res.status(status).json({ error: err.message });
  }
});

// GET /api/parcelas?valor=...&R=...
app.get('/api/parcelas', async (req, res) => {
  try {
    const valor = parseFloat(req.query.valor);
    let R = parseInt(req.query.R, 10);
    if (Number.isNaN(valor)) {
      return res.status(400).json({ error: 'Parâmetro “valor” inválido ou ausente' });
    }
    if (Number.isNaN(R) || R < 0 || R > 4) R = 4;

    const sims = await calcularParcelas(valor, R);
    res.json(sims);
  } catch (err) {
    console.error('[parcelas]', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
