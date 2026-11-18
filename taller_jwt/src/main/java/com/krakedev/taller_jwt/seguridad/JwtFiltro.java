package com.krakedev.taller_jwt.seguridad;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Lee el header Authorization: Bearer y autentica la peticion. */
@Component
public class JwtFiltro extends OncePerRequestFilter {

    private final JwtServicio jwtServicio;
    private final UsuarioDetallesServicio detallesServicio;

    public JwtFiltro(JwtServicio jwtServicio, UsuarioDetallesServicio detallesServicio) {
        this.jwtServicio = jwtServicio;
        this.detallesServicio = detallesServicio;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7).trim();
            try {
                String username = jwtServicio.extraerUsername(token);
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails usuario = detallesServicio.loadUserByUsername(username);
                    if (jwtServicio.esValido(token, usuario)) {
                        var autenticacion = new UsernamePasswordAuthenticationToken(
                                usuario, null, usuario.getAuthorities());
                        autenticacion.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(autenticacion);
                    }
                }
            } catch (JwtException | IllegalArgumentException | UsernameNotFoundException ex) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
