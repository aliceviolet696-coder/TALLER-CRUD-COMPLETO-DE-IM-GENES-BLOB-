import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormularioMascota from '../components/FormularioMascota.jsx'
import ListaItems from '../components/ListaItems.jsx'
import Modal from '../components/Modal.jsx'
import Toast from '../components/Toast.jsx'
import {
  AlertIcon,
  LogoutIcon,
  PawIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  ShieldIcon,
  TrashIcon,
} from '../components/Iconos.jsx'
import {
  ENDPOINTS,
  cerrarSesionLocal,
  fetchConAuth,
  leerRespuesta,
  obtenerMensajeError,
  obtenerUsuario,
} from '../config/apiConfig.js'

export default function GestionMascotas() {
  const navigate = useNavigate()
  const usuario = useMemo(() => obtenerUsuario(), [])

  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [itemEditar, setItemEditar] = useState(null)
  const [itemEliminar, setItemEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [toast, setToast] = useState(null)

  const urlsRef = useRef([])
  const abortRef = useRef(null)

  const revocarUrls = useCallback(() => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    urlsRef.current = []
  }, [])

  /** Descarga metadatos y luego cada foto como Blob -> Object URL. */
  const cargarItems = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setCargando(true)
    setError('')

    let nuevasUrls = []

    try {
      const respuesta = await fetchConAuth(ENDPOINTS.items, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
      const datos = await leerRespuesta(respuesta)

      if (!respuesta.ok) {
        throw new Error(
          obtenerMensajeError(
            datos,
            `No se pudo cargar el listado (código ${respuesta.status}).`,
          ),
        )
      }

      const lista = Array.isArray(datos) ? datos : []

      const conFotos = await Promise.all(
        lista.map(async (item) => {
          if (!item.tieneFoto) return { ...item, fotoUrl: null }

          try {
            const respuestaFoto = await fetchConAuth(ENDPOINTS.foto(item.id), {
              signal: controller.signal,
            })
            if (!respuestaFoto.ok) return { ...item, fotoUrl: null }

            const blob = await respuestaFoto.blob()
            if (!blob.size) return { ...item, fotoUrl: null }

            const url = URL.createObjectURL(blob)
            nuevasUrls.push(url)
            return { ...item, fotoUrl: url }
          } catch (err) {
            if (err.name === 'AbortError') throw err
            return { ...item, fotoUrl: null }
          }
        }),
      )

      if (controller.signal.aborted) {
        nuevasUrls.forEach((url) => URL.revokeObjectURL(url))
        return
      }

      // Libera las Object URLs anteriores y adopta las nuevas.
      revocarUrls()
      urlsRef.current = nuevasUrls
      setItems(conFotos)
    } catch (err) {
      nuevasUrls.forEach((url) => URL.revokeObjectURL(url))
      if (err.name !== 'AbortError') {
        setError(err.message || 'No se pudo conectar con el servidor.')
      }
    } finally {
      if (abortRef.current === controller) setCargando(false)
    }
  }, [revocarUrls])

  useEffect(() => {
    document.title = 'Mis mascotas | CRUD con JWT'
    cargarItems()

    return () => {
      abortRef.current?.abort()
      revocarUrls()
    }
  }, [cargarItems, revocarUrls])

  // Si cualquier petición devuelve 401, se vuelve al login.
  useEffect(() => {
    const alExpirar = () =>
      navigate('/login', { replace: true, state: { expirado: true } })

    window.addEventListener('sesion-expirada', alExpirar)
    return () => window.removeEventListener('sesion-expirada', alExpirar)
  }, [navigate])

  // El toast desaparece solo después de 4 segundos.
  useEffect(() => {
    if (!toast) return undefined
    const temporizador = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(temporizador)
  }, [toast])

  const itemsFiltrados = useMemo(() => {
    const consulta = busqueda.trim().toLowerCase()
    if (!consulta) return items
    return items.filter((item) =>
      `${item.nombre} ${item.raza}`.toLowerCase().includes(consulta),
    )
  }, [items, busqueda])

  const conFoto = items.filter((item) => item.tieneFoto).length

  const alGuardar = (mensaje) => {
    setItemEditar(null)
    setToast({ tipo: 'exito', texto: mensaje })
    cargarItems()
  }

  const confirmarEliminar = async () => {
    if (!itemEliminar || eliminando) return

    setEliminando(true)
    try {
      const respuesta = await fetchConAuth(
        `${ENDPOINTS.items}/${itemEliminar.id}`,
        { method: 'DELETE' },
      )
      const datos = await leerRespuesta(respuesta)

      if (!respuesta.ok) {
        throw new Error(
          obtenerMensajeError(
            datos,
            `No se pudo eliminar (código ${respuesta.status}).`,
          ),
        )
      }

      const nombre = itemEliminar.nombre
      setItemEliminar(null)
      setToast({
        tipo: 'exito',
        texto: datos?.mensaje || `Mascota "${nombre}" eliminada correctamente.`,
      })
      await cargarItems()
    } catch (err) {
      setToast({
        tipo: 'error',
        texto: err.message || 'No se pudo eliminar la mascota.',
      })
    } finally {
      setEliminando(false)
    }
  }

  const cerrarSesion = () => {
    cerrarSesionLocal()
    navigate('/login', { replace: true })
  }

  return (
    <div className="gestion-page">
      <div className="auth-bg" aria-hidden="true">
        <span className="blob blob-1" />
        <span className="blob blob-2" />
        <span className="blob blob-3" />
        <span className="grid-overlay" />
      </div>

      <header className="gestion-topbar">
        <span className="brand brand-small">
          <span className="brand-logo">
            <PawIcon />
          </span>
          <span className="brand-name">
            Mascotas<span>JWT</span>
          </span>
        </span>

        <div className="gestion-topbar-derecha">
          <div className="usuario-chip">
            <span>Sesión</span>
            <strong>{usuario.username || 'usuario'}</strong>
          </div>
          <span className="sesion-chip">
            <ShieldIcon />
            {usuario.rol || 'USER'}
          </span>
          <button className="btn-ghost" type="button" onClick={cerrarSesion}>
            <LogoutIcon />
            Salir
          </button>
        </div>
      </header>

      <main className="gestion-main">
        <section className="gestion-hero">
          <div>
            <span className="gestion-eyebrow">
              <PawIcon />
              CRUD BLOB · PostgreSQL · JWT
            </span>
            <h1>
              Mis <span>mascotas</span>
            </h1>
            <p>
              Cada tarjeta muestra la foto almacenada como <code>bytea</code>,
              descargada como Blob y renderizada mediante una Object URL.
            </p>
          </div>

          <div className="gestion-stats" aria-label="Resumen de la colección">
            <div className="stat-pill">
              <strong>{items.length}</strong>
              <span>Registros</span>
            </div>
            <div className="stat-pill">
              <strong>{conFoto}</strong>
              <span>Con foto</span>
            </div>
            <div className="stat-pill">
              <strong>{itemsFiltrados.length}</strong>
              <span>Visibles</span>
            </div>
          </div>
        </section>

        <div className="gestion-layout">
          <aside className="panel-form">
            <div className="panel-form-head">
              <span className="panel-form-icon">
                <PlusIcon />
              </span>
              <div>
                <h2>Nueva mascota</h2>
                <p>Sube una foto y completa sus datos.</p>
              </div>
            </div>

            <FormularioMascota onGuardado={alGuardar} />
          </aside>

          <section className="gestion-listado" aria-label="Listado de mascotas">
            <div className="listado-head">
              <div className="listado-titulo">
                <h2>Colección</h2>
                <p>
                  {items.length === 0
                    ? 'Sin registros todavía'
                    : `${items.length} ${items.length === 1 ? 'mascota' : 'mascotas'} en la base de datos`}
                </p>
              </div>

              <div className="listado-controles">
                <div className="buscador">
                  <SearchIcon />
                  <input
                    type="search"
                    placeholder="Buscar por nombre o raza..."
                    value={busqueda}
                    onChange={(event) => setBusqueda(event.target.value)}
                    aria-label="Buscar mascota"
                  />
                </div>
                <button
                  type="button"
                  className="btn-icono"
                  onClick={cargarItems}
                  disabled={cargando}
                  title="Recargar listado"
                  aria-label="Recargar listado"
                >
                  <RefreshIcon />
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-error alert-listado" role="alert">
                <AlertIcon />
                <span>{error}</span>
                <button
                  type="button"
                  className="alerta-reintentar"
                  onClick={cargarItems}
                >
                  Reintentar
                </button>
              </div>
            )}

            <ListaItems
              items={itemsFiltrados}
              total={items.length}
              cargando={cargando}
              onEditar={setItemEditar}
              onEliminar={setItemEliminar}
            />
          </section>
        </div>
      </main>

      {itemEditar && (
        <Modal
          titulo={`Editar a ${itemEditar.nombre}`}
          subtitulo="Cambia los datos o reemplaza la foto. La imagen anterior se conserva si no eliges una nueva."
          etiqueta="PUT · /auth/items/{id}"
          onCerrar={() => setItemEditar(null)}
        >
          <FormularioMascota
            modo="editar"
            item={itemEditar}
            fotoActualUrl={itemEditar.fotoUrl}
            onGuardado={alGuardar}
            onCancelar={() => setItemEditar(null)}
          />
        </Modal>
      )}

      {itemEliminar && (
        <Modal
          titulo="Eliminar mascota"
          subtitulo="Esta acción borra el registro y su foto de PostgreSQL."
          etiqueta="DELETE · /auth/items/{id}"
          tamanio="pequenio"
          onCerrar={() => {
            if (!eliminando) setItemEliminar(null)
          }}
        >
          <div className="confirmar-eliminar">
            <span className="confirmar-icono">
              <TrashIcon />
            </span>
            <p>
              ¿Seguro que quieres eliminar a{' '}
              <strong>{itemEliminar.nombre}</strong>?
            </p>
            <p className="confirmar-nota">
              La foto guardada como <code>bytea</code> también se eliminará de
              forma permanente.
            </p>

            <div className="modal-acciones">
              <button
                type="button"
                className="btn-secundario"
                onClick={() => setItemEliminar(null)}
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-peligro"
                onClick={confirmarEliminar}
                disabled={eliminando}
              >
                {eliminando ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <TrashIcon />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Toast toast={toast} onCerrar={() => setToast(null)} />
    </div>
  )
}
