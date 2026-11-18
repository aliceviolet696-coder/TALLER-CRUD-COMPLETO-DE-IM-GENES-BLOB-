package com.krakedev.taller_jwt.entidades;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Entidad del tema libre elegido: Mascotas.
 *
 * <p>La foto se guarda como binario directamente en PostgreSQL usando la
 * columna {@code bytea}. El formato MIME permite reconstruir la respuesta
 * HTTP con el Content-Type correcto.</p>
 */
@Entity
@Table(name = "mascotas")
public class Mascota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nombre", nullable = false, length = 80)
    private String nombre;

    @Column(name = "raza", nullable = false, length = 120)
    private String raza;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "foto", columnDefinition = "bytea", nullable = false)
    private byte[] foto;

    public Mascota() {
    }

    public Mascota(String nombre, String raza, String mimeType, byte[] foto) {
        this.nombre = nombre;
        this.raza = raza;
        this.mimeType = mimeType;
        this.foto = foto;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getRaza() {
        return raza;
    }

    public void setRaza(String raza) {
        this.raza = raza;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public byte[] getFoto() {
        return foto;
    }

    public void setFoto(byte[] foto) {
        this.foto = foto;
    }
}
