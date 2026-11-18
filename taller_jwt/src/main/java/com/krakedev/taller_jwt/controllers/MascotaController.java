package com.krakedev.taller_jwt.controllers;

import com.krakedev.taller_jwt.dto.MascotaResumen;
import com.krakedev.taller_jwt.dto.MensajeResponse;
import com.krakedev.taller_jwt.entidades.Mascota;
import com.krakedev.taller_jwt.excepciones.RecursoNoEncontradoException;
import com.krakedev.taller_jwt.repositories.MascotaRepository;
import java.io.IOException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * CRUD completo de mascotas bajo /auth/items.
 *
 * <p>Las fotos viven en PostgreSQL como bytea. El listado devuelve solo
 * metadatos; la imagen se sirve en /auth/items/{id}/foto para que React cree
 * una Object URL a partir del Blob.</p>
 */
@RestController
@RequestMapping("/auth/items")
public class MascotaController {

    private static final long TAMANO_MAXIMO = 5L * 1024 * 1024;

    private final MascotaRepository mascotaRepository;

    public MascotaController(MascotaRepository mascotaRepository) {
        this.mascotaRepository = mascotaRepository;
    }

    /** READ: lista todas las mascotas, la mas reciente primero. */
    @GetMapping
    public List<MascotaResumen> listar() {
        return mascotaRepository.findAll(Sort.by(Sort.Direction.DESC, "id"))
                .stream()
                .map(MascotaResumen::desde)
                .toList();
    }

    /** READ: metadatos de una mascota. */
    @GetMapping("/{id}")
    public MascotaResumen obtener(@PathVariable Integer id) {
        return MascotaResumen.desde(buscar(id));
    }

    /** READ: devuelve la foto binaria con su Content-Type real. */
    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> obtenerFoto(@PathVariable Integer id) {
        Mascota mascota = buscar(id);

        if (mascota.getFoto() == null || mascota.getFoto().length == 0) {
            throw new RecursoNoEncontradoException("La mascota no tiene una foto guardada.");
        }

        MediaType tipo;
        try {
            tipo = MediaType.parseMediaType(mascota.getMimeType());
        } catch (Exception ex) {
            tipo = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(tipo)
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"mascota-" + id + "\"")
                .body(mascota.getFoto());
    }

    /** CREATE: recibe multipart/form-data con nombre, raza y foto. */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MascotaResumen> crear(
            @RequestParam("nombre") String nombre,
            @RequestParam("raza") String raza,
            @RequestPart("foto") MultipartFile foto
    ) {
        Mascota mascota = new Mascota();
        aplicarTextos(mascota, nombre, raza);
        validarImagen(foto, true);

        mascota.setMimeType(foto.getContentType());
        mascota.setFoto(leerBytes(foto));

        Mascota guardada = mascotaRepository.save(mascota);
        return ResponseEntity.status(HttpStatus.CREATED).body(MascotaResumen.desde(guardada));
    }

    /**
     * UPDATE: la foto es opcional. Si el cliente no envia una nueva, se
     * conservan los bytes y el MIME existentes.
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MascotaResumen actualizar(
            @PathVariable Integer id,
            @RequestParam("nombre") String nombre,
            @RequestParam("raza") String raza,
            @RequestPart(value = "foto", required = false) MultipartFile foto
    ) {
        Mascota mascota = buscar(id);
        aplicarTextos(mascota, nombre, raza);

        if (foto != null && !foto.isEmpty()) {
            validarImagen(foto, false);
            mascota.setMimeType(foto.getContentType());
            mascota.setFoto(leerBytes(foto));
        }

        return MascotaResumen.desde(mascotaRepository.save(mascota));
    }

    /** DELETE: elimina el registro si existe y responde 200 OK. */
    @DeleteMapping("/{id}")
    public ResponseEntity<MensajeResponse> eliminar(@PathVariable Integer id) {
        Mascota mascota = buscar(id);
        mascotaRepository.delete(mascota);

        return ResponseEntity.ok(new MensajeResponse(
                "Mascota \"" + mascota.getNombre() + "\" eliminada correctamente."));
    }

    private Mascota buscar(Integer id) {
        return mascotaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe una mascota con id " + id + "."));
    }

    private void aplicarTextos(Mascota mascota, String nombre, String raza) {
        String nombreLimpio = nombre == null ? "" : nombre.trim();
        String razaLimpia = raza == null ? "" : raza.trim();

        if (nombreLimpio.length() < 2 || nombreLimpio.length() > 80) {
            throw new IllegalArgumentException(
                    "El nombre debe tener entre 2 y 80 caracteres.");
        }
        if (razaLimpia.length() < 2 || razaLimpia.length() > 120) {
            throw new IllegalArgumentException(
                    "La raza debe tener entre 2 y 120 caracteres.");
        }

        mascota.setNombre(nombreLimpio);
        mascota.setRaza(razaLimpia);
    }

    private void validarImagen(MultipartFile foto, boolean obligatoria) {
        if (foto == null || foto.isEmpty()) {
            if (obligatoria) {
                throw new IllegalArgumentException("Debes seleccionar una foto.");
            }
            return;
        }

        String tipo = foto.getContentType();
        if (tipo == null || !tipo.toLowerCase().startsWith("image/")) {
            throw new IllegalArgumentException("El archivo debe ser una imagen (JPG, PNG, WEBP...).");
        }
        if (foto.getSize() > TAMANO_MAXIMO) {
            throw new IllegalArgumentException("La imagen no puede superar los 5 MB.");
        }
    }

    private byte[] leerBytes(MultipartFile foto) {
        try {
            return foto.getBytes();
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo leer el archivo de imagen.", ex);
        }
    }
}
