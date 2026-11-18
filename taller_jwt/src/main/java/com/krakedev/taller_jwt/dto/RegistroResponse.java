package com.krakedev.taller_jwt.dto;

public record RegistroResponse(
        Integer id,
        String username,
        String rol,
        String mensaje
) {
}
