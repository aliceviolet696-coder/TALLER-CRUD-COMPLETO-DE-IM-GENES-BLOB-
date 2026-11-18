-- Consulta para la captura de la base de datos.
-- Muestra los datos de las mascotas y el campo bytea (vista previa en hex).
-- Conectarse a la base: psql -U postgres -d mascotas_db

-- 1) Estructura de la tabla (confirma que foto es bytea)
\d mascotas

-- 2) Datos + evidencia del binario
SELECT
    id,
    nombre,
    raza,
    mime_type,
    octet_length(foto)                         AS bytes,
    left(foto::text, 52)                       AS foto_bytea
FROM mascotas
ORDER BY id;
