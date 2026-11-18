package com.krakedev.taller_jwt.repositories;

import com.krakedev.taller_jwt.entidades.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MascotaRepository extends JpaRepository<Mascota, Integer> {
}
