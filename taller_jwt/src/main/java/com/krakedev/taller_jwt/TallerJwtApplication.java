package com.krakedev.taller_jwt;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TallerJwtApplication {

    public static void main(String[] args) {
        crearBaseDeDatosSiNoExiste();
        SpringApplication.run(TallerJwtApplication.class, args);
    }

    /**
     * Crea la base mascotas_db antes de que arranque JPA, usando las mismas
     * credenciales del datasource. Asi el taller funciona con un solo comando.
     */
    private static void crearBaseDeDatosSiNoExiste() {
        String url = System.getenv().getOrDefault(
                "DB_URL", "jdbc:postgresql://localhost:5432/mascotas_db");
        String usuario = System.getenv().getOrDefault("DB_USERNAME", "postgres");
        String clave = System.getenv("DB_PASSWORD");

        if (clave == null) {
            clave = System.getenv("PGPASSWORD");
        }
        if (clave == null) {
            clave = "";
        }

        String sinParametros = url.split("\\?")[0];
        int ultimaBarra = sinParametros.lastIndexOf('/');
        if (ultimaBarra < 0) {
            return;
        }

        String base = sinParametros.substring(ultimaBarra + 1);
        if (base.isBlank() || base.equals("postgres")) {
            return;
        }

        String urlServidor = sinParametros.substring(0, ultimaBarra + 1) + "postgres";

        try {
            DriverManager.setLoginTimeout(5);
            Class.forName("org.postgresql.Driver");

            try (Connection conexion = DriverManager.getConnection(urlServidor, usuario, clave)) {
                boolean existe;
                try (PreparedStatement consulta = conexion.prepareStatement(
                        "SELECT 1 FROM pg_database WHERE datname = ?")) {
                    consulta.setString(1, base);
                    try (ResultSet resultado = consulta.executeQuery()) {
                        existe = resultado.next();
                    }
                }

                if (existe) {
                    System.out.println("[BD] Base de datos lista: " + base);
                    return;
                }

                try (Statement sentencia = conexion.createStatement()) {
                    sentencia.executeUpdate("CREATE DATABASE \"" + base.replace("\"", "\"\"")
                            + "\" WITH ENCODING 'UTF8' TEMPLATE template0");
                    System.out.println("[BD] Base de datos creada: " + base);
                }
            }
        } catch (ClassNotFoundException ex) {
            System.out.println("[BD] No se encontro el driver de PostgreSQL.");
        } catch (SQLException ex) {
            System.out.println("[BD] Aviso: no se pudo verificar/crear la base " + base
                    + " (" + ex.getMessage() + ").");
            System.out.println("[BD] Revisa que PostgreSQL este encendido y que la clave sea correcta.");
        }
    }
}
