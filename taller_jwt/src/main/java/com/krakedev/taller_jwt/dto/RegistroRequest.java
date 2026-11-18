package com.krakedev.taller_jwt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistroRequest(
        @NotBlank(message = "El nombre de usuario es obligatorio.")
        @Size(min = 3, max = 60, message = "El nombre de usuario debe tener entre 3 y 60 caracteres.")
        String username,

        @NotBlank(message = "La contrasena es obligatoria.")
        @Size(min = 6, max = 72, message = "La contrasena debe tener entre 6 y 72 caracteres.")
        String password,

        String rol
) {
}
