package com.krakedev.taller_jwt.controllers;

import com.krakedev.taller_jwt.dto.AuthResponse;
import com.krakedev.taller_jwt.dto.LoginRequest;
import com.krakedev.taller_jwt.dto.MensajeResponse;
import com.krakedev.taller_jwt.dto.RegistroRequest;
import com.krakedev.taller_jwt.dto.RegistroResponse;
import com.krakedev.taller_jwt.entidades.Usuario;
import com.krakedev.taller_jwt.repositories.UsuarioRepository;
import com.krakedev.taller_jwt.seguridad.JwtServicio;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Registro e inicio de sesion. Estos endpoints son publicos. */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtServicio jwtServicio;

    public AuthController(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtServicio jwtServicio
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtServicio = jwtServicio;
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@Valid @RequestBody RegistroRequest datos) {
        String username = datos.username().trim();

        if (usuarioRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new MensajeResponse("Ese nombre de usuario ya esta registrado."));
        }

        String rol = (datos.rol() == null || datos.rol().isBlank())
                ? "USER"
                : datos.rol().trim().toUpperCase();

        if (!rol.equals("USER") && !rol.equals("ADMIN")) {
            return ResponseEntity.badRequest()
                    .body(new MensajeResponse("El rol debe ser USER o ADMIN."));
        }

        Usuario usuario = new Usuario(username, passwordEncoder.encode(datos.password()), rol);
        Usuario guardado = usuarioRepository.save(usuario);

        return ResponseEntity.status(HttpStatus.CREATED).body(new RegistroResponse(
                guardado.getId(),
                guardado.getUsername(),
                guardado.getRol(),
                "Usuario registrado correctamente."
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest datos) {
        String username = datos.username().trim();

        try {
            Authentication autenticacion = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, datos.password()));

            if (!autenticacion.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MensajeResponse("Usuario o contrasena incorrectos."));
            }

            Usuario usuario = usuarioRepository.findByUsername(username).orElseThrow();
            String token = jwtServicio.generarToken(usuario.getUsername(), usuario.getRol());

            return ResponseEntity.ok(new AuthResponse(
                    token,
                    "Bearer",
                    usuario.getUsername(),
                    usuario.getRol(),
                    jwtServicio.getExpiracionMs()
            ));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MensajeResponse("Usuario o contrasena incorrectos."));
        }
    }
}
