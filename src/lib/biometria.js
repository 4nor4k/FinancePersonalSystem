// "Cadeado" do app usando a biometria do próprio aparelho (Face ID, Touch ID,
// impressão digital), via WebAuthn. Isso NÃO substitui o login do Supabase --
// é uma camada local extra, verificada pelo sistema operacional do celular,
// que só libera a visualização do app depois de confirmada.

const FLAG_KEY = 'financeiro:biometria-ativa'
const CRED_KEY = 'financeiro:biometria-credencial'

export function biometriaAtiva() {
  return localStorage.getItem(FLAG_KEY) === '1'
}

export async function biometriaDisponivel() {
  if (!window.PublicKeyCredential) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

function bufferParaBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

function base64ParaBuffer(base64) {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
}

export async function registrarBiometria(nomeUsuario) {
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const userId = crypto.getRandomValues(new Uint8Array(16))

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'Financeiro' },
      user: { id: userId, name: nomeUsuario || 'usuario', displayName: nomeUsuario || 'Usuário' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
      timeout: 60000,
    },
  })

  if (!credential) throw new Error('Não foi possível registrar a biometria')

  localStorage.setItem(CRED_KEY, bufferParaBase64(credential.rawId))
  localStorage.setItem(FLAG_KEY, '1')
}

export async function verificarBiometria() {
  const credId = localStorage.getItem(CRED_KEY)
  if (!credId) return false

  const challenge = crypto.getRandomValues(new Uint8Array(32))

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ id: base64ParaBuffer(credId), type: 'public-key' }],
      userVerification: 'required',
      timeout: 60000,
    },
  })

  return !!assertion
}

export function desativarBiometria() {
  localStorage.removeItem(FLAG_KEY)
  localStorage.removeItem(CRED_KEY)
}
