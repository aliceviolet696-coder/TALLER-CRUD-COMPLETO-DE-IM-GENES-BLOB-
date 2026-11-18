import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import {
  UserIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertIcon,
  CheckIcon,
  ShieldIcon,
  ArrowRightIcon,
} from '../components/Iconos.jsx'
import {
  ENDPOINTS,
  obtenerMensajeError,
  leerRespuesta,
} from '../config/apiConfig.js'

const ROLES = [
  { valor: 'USER', etiqueta: 'USER · Usuario estándar' },
  { valor: 'ADMIN', etiqueta: 'ADMIN · Administrador' },
]

export default function Registrar() {
  const navigate = useNavigate()
  const timeoutRef = useRef(null)

  const [formulario, setFormulario] = useState({
    username: '',
    password: '',
    confirmar: '',
    rol: 'USER',
  })
  const [verPassword, setVerPassword] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    document.title = 'Crear cuenta | Mascotas JWT'
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormulario((anterior) => ({ ...anterior, [name]: value }))
  }

  const validar = () => {
    const username = formulario.username.trim()
    if (username.length < 3) {
      return 'El nombre de usuario debe tener al menos 3 caracteres.'
    }
    if (formulario.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.'
    }
    if (formulario.password !== formulario.confirmar) {
      return 'Las contraseñas no coinciden.'
    }
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setExito('')

    const mensajeValidacion = validar()
    if (mensajeValidacion) {
      setError(mensajeValidacion)
      return
    }

    setCargando(true)

    try {
      const respuesta = await fetch(ENDPOINTS.registrar, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formulario.username.trim(),
          password: formulario.password,
          rol: formulario.rol,
        }),
      })

      const data = await leerRespuesta(respuesta)

      if (respuesta.status !== 201 && !respuesta.ok) {
        setError(
          obtenerMensajeError(
            data,
            respuesta.status === 409
              ? 'Ese nombre de usuario ya está registrado.'
              : `No se pudo crear la cuenta (código ${respuesta.status}).`,
          ),
        )
        return
      }

      setFormulario({ username: '', password: '', confirmar: '', rol: 'USER' })
      setExito('¡Cuenta creada correctamente! Te redirigimos al inicio de sesión...')

      timeoutRef.current = setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { registrado: formulario.username.trim() },
        })
      }, 1800)
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
      heroTitle="Crea tu cuenta y empieza a guardar fotos."
      heroText="Registra un usuario en la base de datos. Después podrás iniciar sesión con JWT y administrar el CRUD de mascotas."
    >
      <header className="card-head">
        <span className="card-badge">Registro</span>
        <h2>Crear una cuenta</h2>
        <p>Completa tus datos para registrarte en el sistema.</p>
      </header>

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}

      {exito && (
        <div className="alert alert-success" role="status">
          <CheckIcon />
          <span>{exito}</span>
        </div>
      )}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="registro-username">Nombre de usuario</label>
          <div className="input-wrap">
            <UserIcon className="input-icon" />
            <input
              id="registro-username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="ej. mabel"
              value={formulario.username}
              onChange={handleChange}
              minLength={3}
              required
              autoFocus
              disabled={Boolean(exito)}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="registro-password">Contraseña</label>
            <div className="input-wrap">
              <LockIcon className="input-icon" />
              <input
                id="registro-password"
                name="password"
                type={verPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="6+ caracteres"
                value={formulario.password}
                onChange={handleChange}
                minLength={6}
                required
                disabled={Boolean(exito)}
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

          <div className="field">
            <label htmlFor="registro-confirmar">Confirmar</label>
            <div className="input-wrap">
              <LockIcon className="input-icon" />
              <input
                id="registro-confirmar"
                name="confirmar"
                type={verPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repite la clave"
                value={formulario.confirmar}
                onChange={handleChange}
                minLength={6}
                required
                disabled={Boolean(exito)}
              />
            </div>
          </div>
        </div>

        <div className="field">
          <label htmlFor="registro-rol">Rol en el sistema</label>
          <div className="input-wrap select-wrap">
            <ShieldIcon className="input-icon" />
            <select
              id="registro-rol"
              name="rol"
              value={formulario.rol}
              onChange={handleChange}
              disabled={Boolean(exito)}
            >
              {ROLES.map((rol) => (
                <option key={rol.valor} value={rol.valor}>
                  {rol.etiqueta}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="btn-primary"
          type="submit"
          disabled={cargando || Boolean(exito)}
        >
          {cargando ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Creando cuenta...
            </>
          ) : exito ? (
            <>
              <CheckIcon />
              Cuenta creada
            </>
          ) : (
            <>
              Registrarme
              <ArrowRightIcon />
            </>
          )}
        </button>
      </form>

      <p className="switch-text">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="switch-link">
          Iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
