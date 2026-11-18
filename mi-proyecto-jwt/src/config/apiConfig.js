/**
 * Configuración central del API y utilidades de sesión JWT.
 * La URL se toma de VITE_API_BASE_URL o del backend local por defecto.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8080'

export const ENDPOINTS = {
  login: `${API_BASE_URL}/auth/login`,
  registrar: `${API_BASE_URL}/auth/registrar`,
  items: `${API_BASE_URL}/auth/items`,
  foto: (id) => `${API_BASE_URL}/auth/items/${id}/foto`,
}

/** Claves usadas en localStorage para persistir la sesión. */
export const STORAGE_KEYS = {
  token: 'jwt_token',
  usuario: 'jwt_usuario',
}

export function obtenerToken() {
  return localStorage.getItem(STORAGE_KEYS.token) || ''
}

export function guardarSesion(data, usernameIngresado) {
  localStorage.setItem(STORAGE_KEYS.token, data.token)
  const usuario = {
    username: data.username || usernameIngresado,
    rol: data.rol || data.role || 'USER',
  }
  localStorage.setItem(STORAGE_KEYS.usuario, JSON.stringify(usuario))
  return usuario
}

export function obtenerUsuario() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.usuario)) || {}
  } catch {
    return {}
  }
}

export function cerrarSesionLocal() {
  localStorage.removeItem(STORAGE_KEYS.token)
  localStorage.removeItem(STORAGE_KEYS.usuario)
}

/** Decodifica el payload del JWT solo para comprobar la expiración. */
function decodificarPayload(token) {
  try {
    const base64 = token
      .split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const conRelleno = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const bytes = Uint8Array.from(atob(conRelleno), (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

/** true si existe un token y no está vencido. */
export function tokenVigente() {
  const token = obtenerToken()
  if (!token) return false
  const payload = decodificarPayload(token)
  if (!payload?.exp) return true
  return payload.exp * 1000 > Date.now()
}

/** Extrae el mensaje de error de Spring Boot ({ mensaje } o texto plano). */
export function obtenerMensajeError(data, fallback) {
  if (!data) return fallback
  if (typeof data === 'string' && data.trim()) return data
  return data.mensaje || data.message || data.error || fallback
}

/** Lee el cuerpo como JSON o texto sin lanzar excepciones. */
export async function leerRespuesta(respuesta) {
  const texto = await respuesta.text()
  if (!texto) return null
  try {
    return JSON.parse(texto)
  } catch {
    return texto
  }
}

/**
 * fetch con el header Authorization. Si el backend responde 401 se limpia la
 * sesión y se emite "sesion-expirada" para que la interfaz vuelva al login.
 */
export async function fetchConAuth(url, opciones = {}) {
  const headers = new Headers(opciones.headers || {})
  const token = obtenerToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const respuesta = await fetch(url, { ...opciones, headers })

  if (respuesta.status === 401) {
    cerrarSesionLocal()
    window.dispatchEvent(new Event('sesion-expirada'))
  }

  return respuesta
}
