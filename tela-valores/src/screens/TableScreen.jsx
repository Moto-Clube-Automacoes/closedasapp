// src/screens/TableScreen.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { fetchProdutos, fetchDetalhes } from '../services/parcelas'
import Modal from '../components/Modal'

// Labels para o modal
const LABELS = {
  precoAVistaVerde:       'Preço à vista (Verde)',
  precoTabela:            'Preço Tabela',
  emplacamentoTabela:     'Emplacamento Tabela',
  emplacamentoVista:      'Emplacamento à vista',
  freteCNH:               'Frete CNH',
}

export default function TableScreen({ tipo, title }) {
  const [data, setData]         = useState([])
  const [detalhes, setDetalhes] = useState(null)
  const [sortBy, setSortBy]     = useState({ field: 'produto', asc: true })
  const reload = () => fetchProdutos(tipo).then(setData);

  // 1) buscar lista ao carregar / trocar aba
  useEffect(() => {
    fetchProdutos(tipo).then(setData)
    setDetalhes(null)
  }, [tipo])

  useEffect(() => { reload(); }, [tipo]);

  // 2) ordenar localmente
  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const v1 = a[sortBy.field]
      const v2 = b[sortBy.field]
      if (v1 < v2) return sortBy.asc ? -1 : 1
      if (v1 > v2) return sortBy.asc ? 1 : -1
      return 0
    })
  }, [data, sortBy])

  const onHeaderClick = field => {
    setSortBy(s =>
      s.field === field
        ? { ...s, asc: !s.asc }
        : { field, asc: true }
    )
  }

  // 3) ao clicar na linha, abrir o modal de detalhes
  const abrirDetalhes = async item => {
    try {
      const det = await fetchDetalhes(item.produto, tipo)
      setDetalhes(det)
    } catch (err) {
      console.error(err)
    }
  }

  return (
      <div className="table-screen">
    <div className="ts-header">
      <h2 className="screen-title">{title}</h2>
      <button className="btn-refresh" onClick={reload}>Atualizar</button>
    </div>

    <div className="relative">

      <table className="w-full table-fixed border-collapse">
        <thead className="sticky top-0 bg-blue-600 text-white">
          <tr>
            <th
              onClick={() => onHeaderClick('produto')}
              className="p-2 cursor-pointer select-none"
            >
              Produtos {sortBy.field === 'produto' && (sortBy.asc ? ' ↑' : ' ↓')}
            </th>
            <th
              onClick={() => onHeaderClick('precoTabela')}
              className="p-2 cursor-pointer select-none text-right"
            >
              Preço Tabela {sortBy.field === 'precoTabela' && (sortBy.asc ? ' ↑' : ' ↓')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, i) => (
            <tr
              key={i}
              className={`cursor-pointer ${i % 2 === 0 ? 'bg-white' : 'bg-gray-100'} hover:bg-gray-200`}
              onClick={() => abrirDetalhes(item)}
            >
              <td className="p-2 truncate">{item.produto}</td>
              <td className="p-2 text-right">
                R$ {item.precoTabela.toLocaleString('pt-BR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {detalhes && (
        <Modal title={detalhes.produto} onClose={() => setDetalhes(null)}>
          <div className="space-y-4">
            {Object.entries(detalhes).map(([key, val]) => {
              if (!LABELS[key] || typeof val !== 'number') return null
              const rounded = Math.round(val)  // <–– aqui arredonda para inteiro
              return (
                <div key={key}>
                  <div className="text-sm text-gray-500">{LABELS[key]}</div>
                  <div className="py-2 border-b border-gray-200">
                    R$ {rounded.toLocaleString('pt-BR')}
                  </div>
                </div>
              )
            })}
          </div>
        </Modal>
      )}
    </div>
</div>
  )
}
