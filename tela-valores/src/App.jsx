// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Routes, Route, Navigate } from 'react-router-dom';
import TableScreen from './screens/TableScreen';
import ParcelScreen from './screens/ParcelScreen';
import { getBitrixUser } from './bitrix';

function NoAccess({ title }) {
  return <div style={{ padding: 24 }}>Você não tem permissão para ver: <b>{title}</b></div>;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [perm, setPerm]   = useState({ canMoto: false, canMG: false });

  useEffect(() => {
    (async () => {
      const user = await getBitrixUser();
      // Dev local (fora do Bitrix): libera tudo para testar.
      if (!user) { setPerm({ canMoto: true, canMG: true }); setReady(true); return; }
      setPerm(computePermissions(user));
      setReady(true);
    })();
  }, []);

  if (!ready) return <div className="content" style={{ padding: 24 }}>Carregando…</div>;

  return (
    <BrowserRouter>
      <div className="app-container">
        <main className="main">
          <div className="header">
            <nav className="top-nav">
              <NavLink to="/moto"     className={({isActive}) => isActive ? 'active' : ''}>Tabela Moto</NavLink>
              <NavLink to="/mg"       className={({isActive}) => isActive ? 'active' : ''}>Tabela MG</NavLink>
              <NavLink to="/parcelas" className={({isActive}) => isActive ? 'active' : ''}>Parcelas</NavLink>
            </nav>
          </div>

          <div className="content">
            <Routes>
              <Route path="/" element={<Navigate to="/moto" replace />} />
              <Route
                path="/moto"
                element={perm.canMoto ? <TableScreen tipo="moto" title="Tabela MOTO" /> : <NoAccess title="Tabela Moto" />}
              />
              <Route
                path="/mg"
                element={perm.canMG ? <TableScreen tipo="mg" title="Tabela MG" /> : <NoAccess title="Tabela MG" />}
              />
              <Route path="/parcelas" element={<ParcelScreen />} />
              <Route path="*" element={<Navigate to="/moto" replace />} />
            </Routes>
          </div>

          <div className="bottom-nav">
            <NavLink to="/moto"     className={({isActive}) => isActive ? 'active' : ''}>Tabela</NavLink>
            <NavLink to="/mg"       className={({isActive}) => isActive ? 'active' : ''}>MG</NavLink>
            <NavLink to="/parcelas" className={({isActive}) => isActive ? 'active' : ''}>Cartão</NavLink>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
