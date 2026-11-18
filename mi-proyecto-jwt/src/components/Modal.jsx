import { useEffect } from 'react'
import { CloseIcon } from './Iconos.jsx'

/**
 * Modal accesible y reutilizable. Se cierra con Escape o clic en el fondo.
 */
export default function Modal({
  titulo,
  subtitulo,
  etiqueta = 'Formulario',
  tamanio = 'normal',
  onCerrar,
  children,
}) {
  useEffect(() => {
    const alPresionarTecla = (event) => {
      if (event.key === 'Escape') onCerrar()
    }
    const overflowPrevio = document.body.style.overflow

    document.addEventListener('keydown', alPresionarTecla)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', alPresionarTecla)
      document.body.style.overflow = overflowPrevio
    }
  }, [onCerrar])

  return (
    <div
      className={`modal-backdrop modal-${tamanio}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCerrar()
      }}
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
      >
        <header className="modal-head">
          <div>
            <span className="modal-kicker">{etiqueta}</span>
            <h2 id="modal-titulo">{titulo}</h2>
            {subtitulo && <p>{subtitulo}</p>}
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onCerrar}
            aria-label="Cerrar ventana"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
