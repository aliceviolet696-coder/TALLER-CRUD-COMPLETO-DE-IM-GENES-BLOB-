package com.krakedev.taller_jwt.dto;

import com.krakedev.taller_jwt.entidades.Mascota;

/**
 * Datos livianos para el listado: nunca se envia el byte[] completo al
 * navegador. La foto se descarga aparte como Blob para crear una Object URL.
 */
public record MascotaResumen(
        Integer id,
        String nombre,
        String raza,
        String mimeType,
        boolean tieneFoto
) {

    public static MascotaResumen desde(Mascota mascota) {
        return new MascotaResumen(
                mascota.getId(),
                mascota.getNombre(),
                mascota.getRaza(),
                mascota.getMimeType(),
                mascota.getFoto() != null && mascota.getFoto().length > 0
        );
    }
}
