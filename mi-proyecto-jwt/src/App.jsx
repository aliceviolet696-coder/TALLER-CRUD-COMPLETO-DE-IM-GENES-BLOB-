import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Registrar from './pages/Registrar.jsx'
import GestionMascotas from './pages/GestionMascotas.jsx'
import { cerrarSesionLocal, tokenVigente } from './config/apiConfig.js'

/** Bloquea /gestion si no hay un JWT vigente. */
function RutaProtegida({ children }) {
  if (!tokenVigente()) {
    cerrarSesionLocal()
    return <Navigate to="/login" replace />
  }
  return children
}

/** Evita volver a login/registro cuando ya hay sesión. */
function RutaPublica({ children }) {
  return tokenVigente() ? <Navigate to="/gestion" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RutaPublica>
            <Login />
          </RutaPublica>
        }
      />
      <Route
        path="/registrar"
        element={
          <RutaPublica>
            <Registrar />
          </RutaPublica>
        }
      />

      {/* Ruta privada del CRUD */}
      <Route
        path="/gestion"
        element={
          <RutaProtegida>
            <GestionMascotas />
          </RutaProtegida>
        }
      />

      <Route
        path="/"
        element={<Navigate to={tokenVigente() ? '/gestion' : '/login'} replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
