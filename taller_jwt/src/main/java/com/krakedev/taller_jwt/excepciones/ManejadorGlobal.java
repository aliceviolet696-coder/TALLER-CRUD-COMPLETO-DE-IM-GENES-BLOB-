package com.krakedev.taller_jwt.excepciones;

import com.krakedev.taller_jwt.dto.MensajeResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/** Convierte las excepciones en respuestas JSON uniformes ({ mensaje }). */
@RestControllerAdvice
public class ManejadorGlobal {

    private static final Logger log = LoggerFactory.getLogger(ManejadorGlobal.class);

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<MensajeResponse> noEncontrado(RecursoNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MensajeResponse(ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<MensajeResponse> datosInvalidos(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(new MensajeResponse(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<MensajeResponse> validacion(MethodArgumentNotValidException ex) {
        String mensaje = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Los datos enviados no son validos.");
        return ResponseEntity.badRequest().body(new MensajeResponse(mensaje));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<MensajeResponse> archivoMuyGrande(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(new MensajeResponse("La imagen supera el limite permitido de 5 MB."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<MensajeResponse> errorGeneral(Exception ex) {
        log.error("Error no controlado en la API", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MensajeResponse("Ocurrio un error interno. Revisa los logs del servidor."));
    }
}
