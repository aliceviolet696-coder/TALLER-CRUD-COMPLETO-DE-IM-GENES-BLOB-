package com.krakedev.taller_jwt.seguridad;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

/** Firma, genera y valida los tokens JWT (HS256). */
@Service
public class JwtServicio {

    private final SecretKey clave;
    private final long expiracionMs;

    public JwtServicio(
            @Value("${app.jwt.secret}") String secreto,
            @Value("${app.jwt.expiracion-ms}") long expiracionMs
    ) {
        this.clave = Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
        this.expiracionMs = expiracionMs;
    }

    public String generarToken(String username, String rol) {
        Date ahora = new Date();
        return Jwts.builder()
                .subject(username)
                .claim("rol", rol)
                .issuedAt(ahora)
                .expiration(new Date(ahora.getTime() + expiracionMs))
                .signWith(clave)
                .compact();
    }

    public Claims obtenerClaims(String token) {
        return Jwts.parser()
                .verifyWith(clave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extraerUsername(String token) {
        return obtenerClaims(token).getSubject();
    }

    public boolean esValido(String token, UserDetails usuario) {
        try {
            Claims claims = obtenerClaims(token);
            return claims.getSubject().equals(usuario.getUsername())
                    && claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public long getExpiracionMs() {
        return expiracionMs;
    }
}
