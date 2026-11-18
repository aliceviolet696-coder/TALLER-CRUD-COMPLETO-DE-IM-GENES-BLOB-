package com.krakedev.taller_jwt.dto;

public record AuthResponse(
        String token,
        String tipo,
        String username,
        String rol,
        long expiracionMs
) {
}
