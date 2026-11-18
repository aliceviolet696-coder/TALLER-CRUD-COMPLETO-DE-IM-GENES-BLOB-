-- Crea la base de datos del taller.
-- Ejecutar conectado a la base "postgres", por ejemplo:
--   psql -U postgres -d postgres -f 01_crear_base.sql
--
-- CREATE DATABASE no puede ejecutarse dentro de una transaccion.

CREATE DATABASE mascotas_db
    WITH ENCODING 'UTF8'
         TEMPLATE template0;
