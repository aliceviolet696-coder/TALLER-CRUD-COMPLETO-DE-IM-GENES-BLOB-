import { useEffect, useId, useRef, useState } from 'react'
import {
  AlertIcon,
  CameraIcon,
  CheckIcon,
  PawIcon,
} from './Iconos.jsx'
import {
  ENDPOINTS,
  fetchConAuth,
  leerRespuesta,
  obtenerMensajeError,
} from '../config/apiConfig.js'

const TAMANO_MAXIMO = 5 * 1024 * 1024

/**
 * Formulario compartido por la creación (panel izquierdo) y la edición
 * (modal). Envía multipart/form-data y en edición la foto es opcional.
 */
export default function FormularioMascota({
  modo = 'crear',
  item = null,
  fotoActualUrl = null,
  onGuardado,
  onCancelar,
}) {
  const inputId = useId()
  const inputRef = useRef(null)
  const previewRef = useRef(null)

  const [nombre, setNombre] = useState(item?.nombre || '')
  const [raza, setRaza] = useState(item?.raza || '')
  const [archivo, setArchivo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const editando = modo === 'editar'

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    }
  }, [])

  const cambiarArchivo = (event) => {
    const siguiente = event.target.files?.[0] || null

    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = siguiente ? URL.createObjectURL(siguiente) : null
    setPreview(previewRef.current)
    setArchivo(siguiente)
    setError('')
  }

  const limpiar = () => {
    setNombre('')
    setRaza('')
    setArchivo(null)
    setError('')
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
      previewRef.current = null
    }
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (enviando) return

    const nombreLimpio = nombre.trim()
    const razaLimpia = raza.trim()

    if (nombreLimpio.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.')
      return
    }
    if (razaLimpia.length < 2) {
      setError('La raza debe tener al menos 2 caracteres.')
      return
    }
    if (!editando && !archivo) {
      setError('Selecciona una foto para la mascota.')
      return
    }
    if (archivo && !archivo.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen (JPG, PNG, WEBP...).')
      return
    }
    if (archivo && archivo.size > TAMANO_MAXIMO) {
      setError('La imagen no puede superar los 5 MB.')
      return
    }

    setEnviando(true)

    try {
      const datos = new FormData()
      datos.append('nombre', nombreLimpio)
      datos.append('raza', razaLimpia)
      if (archivo) datos.append('foto', archivo)

      const url = editando
        ? `${ENDPOINTS.items}/${item.id}`
        : ENDPOINTS.items

      const respuesta = await fetchConAuth(url, {
        method: editando ? 'PUT' : 'POST',
        body: datos,
      })

      const cuerpo = await leerRespuesta(respuesta)

      if (!respuesta.ok) {
        throw new Error(
          obtenerMensajeError(
            cuerpo,
            `No se pudo guardar (código ${respuesta.status}).`,
          ),
        )
      }

      limpiar()
      onGuardado?.(
        editando
          ? 'Mascota actualizada correctamente.'
          : 'Mascota creada correctamente.',
      )
    } catch (err) {
      setError(err.message || 'No se pudo conectar con el servidor.')
    } finally {
      setEnviando(false)
    }
  }

  const imagenVisible = preview || (editando ? fotoActualUrl : null)

  return (
    <form className="form formulario-mascota" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="alert alert-error form-alert" role="alert">
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}

      <div className="field">
        <label htmlFor={`${inputId}-nombre`}>Nombre</label>
        <div className="input-wrap">
          <PawIcon className="input-icon" />
          <input
            id={`${inputId}-nombre`}
            name="nombre"
            type="text"
            placeholder="Ej. Luna"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            maxLength={80}
            required
            autoFocus={editando}
            disabled={enviando}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor={`${inputId}-raza`}>Raza o descripción</label>
        <div className="input-wrap">
          <PawIcon className="input-icon" />
          <input
            id={`${inputId}-raza`}
            name="raza"
            type="text"
            placeholder="Ej. Golden Retriever"
            value={raza}
            onChange={(event) => setRaza(event.target.value)}
            maxLength={120}
            required
            disabled={enviando}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor={inputId}>
          {editando ? 'Nueva foto (opcional)' : 'Foto de la mascota'}
        </label>

        <label
          className={`file-drop ${imagenVisible ? 'file-drop-con-imagen' : ''}`}
          htmlFor={inputId}
        >
          {imagenVisible ? (
            <img src={imagenVisible} alt="Vista previa de la mascota" />
          ) : (
            <span className="file-placeholder">
              <CameraIcon />
              <strong>Selecciona una imagen</strong>
              <span>JPG, PNG o WEBP · máximo 5 MB</span>
            </span>
          )}

          <input
            id={inputId}
            ref={inputRef}
            className="file-input"
            type="file"
            accept="image/*"
            onChange={cambiarArchivo}
            disabled={enviando}
          />

          {imagenVisible && <span className="file-change">Cambiar foto</span>}
        </label>

        {editando && (
          <p className="form-hint">
            Si no eliges otra imagen, se conserva la foto actual de la base de
            datos.
          </p>
        )}
      </div>

      <div className="form-acciones">
        {editando && (
          <button
            type="button"
            className="btn-secundario"
            onClick={onCancelar}
            disabled={enviando}
          >
            Cancelar
          </button>
        )}

        <button className="btn-primary" type="submit" disabled={enviando}>
          {enviando ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Guardando...
            </>
          ) : (
            <>
              <CheckIcon />
              {editando ? 'Guardar cambios' : 'Guardar mascota'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
