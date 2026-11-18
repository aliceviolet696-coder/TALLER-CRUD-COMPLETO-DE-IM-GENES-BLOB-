import {
  ImageIcon,
  PawIcon,
  PencilIcon,
  SearchIcon,
  TrashIcon,
} from './Iconos.jsx'

/** Etiqueta corta a partir del MIME, por ejemplo image/png -> PNG. */
function etiquetaMime(mimeType) {
  if (!mimeType) return 'IMG'
  const subtipo = mimeType.split('/')[1] || 'img'
  return subtipo.replace('+xml', '').toUpperCase()
}

function TarjetaEsqueleto() {
  return (
    <article className="mascota-card skeleton-card" aria-hidden="true">
      <div className="skeleton-bloque skeleton-foto" />
      <div className="skeleton-info">
        <span className="skeleton-bloque skeleton-linea" />
        <span className="skeleton-bloque skeleton-linea skeleton-corta" />
        <span className="skeleton-bloque skeleton-boton" />
      </div>
    </article>
  )
}

/**
 * Grid responsivo de Cards. Cada foto ya llega como Object URL creada en
 * GestionMascotas a partir del Blob descargado del backend.
 */
export default function ListaItems({
  items,
  total = 0,
  cargando = false,
  onEditar,
  onEliminar,
}) {
  if (cargando && items.length === 0) {
    return (
      <div className="mascotas-grid" aria-busy="true" aria-label="Cargando mascotas">
        {Array.from({ length: 6 }, (_, indice) => (
          <TarjetaEsqueleto key={indice} />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="listado-vacio">
        <span className="listado-vacio-icono">
          {total === 0 ? <PawIcon /> : <SearchIcon />}
        </span>
        <h3>
          {total === 0
            ? 'Todavía no hay mascotas'
            : 'No encontramos coincidencias'}
        </h3>
        <p>
          {total === 0
            ? 'Usa el formulario de la izquierda para crear tu primer registro con foto.'
            : 'Prueba con otro nombre o raza en el buscador.'}
        </p>
      </div>
    )
  }

  return (
    <div className="mascotas-grid">
      {items.map((item, indice) => (
        <article
          className="mascota-card"
          key={item.id}
          style={{ animationDelay: `${Math.min(indice, 8) * 40}ms` }}
        >
          <div className="mascota-foto">
            {item.fotoUrl ? (
              <img
                src={item.fotoUrl}
                alt={`Foto de ${item.nombre}`}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="mascota-sin-foto">
                <ImageIcon />
              </span>
            )}

            <span className="mascota-chip">{etiquetaMime(item.mimeType)}</span>
            <span className="mascota-num">#{String(item.id).padStart(2, '0')}</span>
          </div>

          <div className="mascota-info">
            <h3>{item.nombre}</h3>
            <p className="mascota-raza">
              <PawIcon />
              {item.raza}
            </p>

            <div className="mascota-acciones">
              <button
                type="button"
                className="btn-card btn-card-edit"
                onClick={() => onEditar(item)}
              >
                <PencilIcon />
                Editar
              </button>
              <button
                type="button"
                className="btn-card btn-card-delete"
                onClick={() => onEliminar(item)}
              >
                <TrashIcon />
                Eliminar
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
