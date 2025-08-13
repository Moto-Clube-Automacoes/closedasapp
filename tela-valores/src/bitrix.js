// src/bitrix.js
export async function getBitrixUser() {
  return new Promise((resolve) => {
    // Fora do Bitrix (dev local)? Devolve null.
    if (!window.BX24) return resolve(null);

    window.BX24.init(() => {
      window.BX24.callMethod('user.current', (res) => {
        if (res.error()) return resolve(null);
        resolve(res.data());
      });
    });
  });
}

// conveniência: pega também o token para o backend validar
export function getBitrixAuth() {
  try {
    return window.BX24?.getAuth() || null; // {access_token, domain, expires, member_id, refresh_token}
  } catch {
    return null;
  }
}

// src/permissions.js
export function computePermissions(user) {
  // Campo custom. Ajuste o código exato do seu campo (ex.: UF_CRM_12345).
  const loja = user?.UF_LOJA || user?.UF_CRM_12345 || null;

  // Se for por departamento, troque por:
  // const deptos = user?.UF_DEPARTMENT || [];
  // const canMoto = deptos.includes(123); // id do depto Loja X
  // const canMG   = deptos.includes(456); // id do depto Loja Y

  const canMoto = loja === 'X';
  const canMG   = loja === 'Y';

  return { canMoto, canMG };
}
