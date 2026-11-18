import { Link } from 'react-router-dom'
import { PawIcon, SparkIcon, CheckIcon } from './Iconos.jsx'

/** Estructura visual compartida por Login y Registro. */
export default function AuthLayout({ heroTitle, heroText, children }) {
  return (
    <div className="auth-page">
      <div className="auth-bg" aria-hidden="true">
        <span className="blob blob-1" />
        <span className="blob blob-2" />
        <span className="blob blob-3" />
        <span className="grid-overlay" />
      </div>

      <main className="auth-shell">
        <section className="auth-brand">
          <Link to="/login" className="brand" aria-label="Ir al inicio de sesión">
            <span className="brand-logo">
              <PawIcon />
            </span>
            <span className="brand-name">
              Mascotas<span>JWT</span>
            </span>
          </Link>

          <div className="brand-copy">
            <span className="brand-eyebrow">
              <SparkIcon />
              CRUD con imágenes BLOB
            </span>
            <h1>{heroTitle}</h1>
            <p>{heroText}</p>
          </div>

          <ul className="brand-features">
            <li>
              <span className="feature-check">
                <CheckIcon />
              </span>
              Fotos guardadas como <strong>bytea</strong> en PostgreSQL
            </li>
            <li>
              <span className="feature-check">
                <CheckIcon />
              </span>
              Crear, leer, editar y eliminar con JWT
            </li>
            <li>
              <span className="feature-check">
                <CheckIcon />
              </span>
              Object URLs para renderizar los Blobs en React
            </li>
          </ul>

          <div className="token-preview" aria-hidden="true">
            <div className="token-preview-head">
              <span className="token-dot" />
              <span className="token-dot" />
              <span className="token-dot" />
              <span className="token-label">access_token</span>
              <span className="token-status">válido</span>
            </div>
            <code>
              <span className="tk-head">eyJhbGciOiJIUzI1NiJ9</span>
              <span className="tk-dot">.</span>
              <span className="tk-body">eyJzdWIiOiJtYWJlbCIsInJvbCI6IlVTRVIifQ</span>
              <span className="tk-dot">.</span>
              <span className="tk-sign">9xQe...7fA</span>
            </code>
          </div>

          <p className="brand-foot">React · Spring Boot · PostgreSQL · JWT</p>
        </section>

        <section className="auth-panel">
          <div className="auth-card">{children}</div>
          <p className="auth-legal">
            <PawIcon />
            Tus fotos viajan y se almacenan de forma segura
          </p>
        </section>
      </main>
    </div>
  )
}
