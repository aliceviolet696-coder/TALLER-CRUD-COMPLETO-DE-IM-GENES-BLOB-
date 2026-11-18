package com.krakedev.taller_jwt.excepciones;

/** Se lanza cuando el id solicitado no existe en la base de datos. */
public class RecursoNoEncontradoException extends RuntimeException {

    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
