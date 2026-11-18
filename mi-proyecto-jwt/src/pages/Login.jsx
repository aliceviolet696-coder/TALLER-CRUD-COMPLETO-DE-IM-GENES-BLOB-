import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import {
  UserIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertIcon,
  CheckIcon,
  ArrowRightIcon,
} from '../components/Iconos.jsx'
import {
  ENDPOINTS,
  guardarSesion,
  obtenerMensajeError,
  leerRespuesta,
} from '../config/apiConfig.js'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState(location.state?.registrado || '')
  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    document.title = 'Iniciar sesión | Mascotas JWT'
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('Ingresa tu nombre de usuario y tu contraseña.')
      return
    }

    setCargando(true)

    try {
      const respuesta = await fetch(ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      const data = await leerRespuesta(respuesta)

      if (!respuesta.ok) {
        setError(
          obtenerMensajeError(
            data,
            `No se pudo iniciar sesión (código ${respuesta.status}).`,
          ),
        )
        return
      }

      if (!data?.token) {
        setError('El servidor respondió correctamente, pero no envió un token.')
        return
      }

      guardarSesion(data, username.trim())
      navigate('/gestion', { replace: true })
    } catch {
      setError(
        'No se pudo conectar con el servidor. Verifica que Spring Boot esté en ejecución.',
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <AuthLayout
      heroTitle="Tus mascotas, sus fotos y un CRUD completo."
      heroText="Inicia sesión para administrar la colección: crea registros con foto, edita sus datos o elimina los que ya no necesites."
    >
      <header className="card-head">
        <span className="card-badge">Acceso</span>
        <h2>Bienvenido de nuevo</h2>
        <p>Ingresa tus credenciales para administrar tus mascotas.</p>
      </header>

      {location.state?.expirado && !error && (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          <span>Tu sesión expiró. Inicia sesión nuevamente para continuar.</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}

      {location.state?.registrado && !error && (
        <div className="alert alert-success" role="status">
          <CheckIcon />
          <span>
            Cuenta creada correctamente. Ya puedes iniciar sesión como{' '}
            <strong>{location.state.registrado}</strong>.
          </span>
        </div>
      )}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="login-username">Nombre de usuario</label>
          <div className="input-wrap">
            <UserIcon className="input-icon" />
            <input
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="ej. mabel"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoFocus
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="login-password">Contraseña</label>
          <div className="input-wrap">
            <LockIcon className="input-icon" />
            <input
              id="login-password"
              name="password"
              type={verPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              className="input-action"
              onClick={() => setVerPassword((valor) => !valor)}
              aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={verPassword}
            >
              {verPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <button className="btn-primary" type="submit" disabled={cargando}>
          {cargando ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Verificando...
            </>
          ) : (
            <>
              Iniciar sesión
              <ArrowRightIcon />
            </>
          )}
        </button>
      </form>

      <p className="switch-text">
        ¿No tienes una cuenta?{' '}
        <Link to="/registrar" className="switch-link">
          Crear una cuenta
        </Link>
      </p>
    </AuthLayout>
  )
}
