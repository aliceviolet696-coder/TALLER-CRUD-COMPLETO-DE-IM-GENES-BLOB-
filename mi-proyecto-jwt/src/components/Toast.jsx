import { AlertIcon, CheckIcon, CloseIcon } from './Iconos.jsx'

/** Notificación flotante para confirmar o informar errores. */
export default function Toast({ toast, onCerrar }) {
  if (!toast) return null

  const esExito = toast.tipo === 'exito'

  return (
    <div
      className={`toast ${esExito ? 'toast-exito' : 'toast-error'}`}
      role="status"
      aria-live="polite"
    >
      <span className="toast-icon">
        {esExito ? <CheckIcon /> : <AlertIcon />}
      </span>
      <p>{toast.texto}</p>
      <button type="button" onClick={onCerrar} aria-label="Cerrar notificación">
        <CloseIcon />
      </button>
    </div>
  )
}
