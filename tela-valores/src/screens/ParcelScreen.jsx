// src/screens/ParcelScreen.jsx
import React, { useState } from 'react'
import { calcularParcelas } from '../services/parcelas'

export default function ParcelScreen() {
  const [valor, setValor]         = useState('')
  const [resultados, setResultados] = useState([])

  const handleSimular = async () => {
    const v = parseFloat(valor.replace(/\./g,'').replace(/,/g,'.')) || 0
    if (v <= 0) return
    const sims = await calcularParcelas(v)
    setResultados(sims)
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Simulação de Parcelas</h2>
      <div className="flex mb-6">
        <input
          type="text"
          placeholder="Valor a financiar"
          value={valor}
          onChange={e => setValor(e.target.value)}
          className="flex-1 border rounded-l px-3 py-2"
        />
        <button
          onClick={handleSimular}
          className="bg-blue-600 text-white px-4 rounded-r"
        >
          Simular
        </button>
      </div>

      {resultados.length > 0 && (
        <table className="w-full border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">Valor Parcela</th>
            </tr>
          </thead>
          <tbody>
            {resultados.map(r => (
              <tr
                key={r.parcela}
                className={r.parcela % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
              >
                <td className="p-2">{r.parcela}</td>
                <td className="p-2">
                  R$ {r.valor.toLocaleString('pt-BR',{minimumFractionDigits:2})}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
