package com.negocio.gestion.repository;
import com.negocio.gestion.objetos.Jornada;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JornadaRepository extends JpaRepository<Jornada, Long> {
    Optional<Jornada> findByAbiertaTrue();
    List<Jornada> findAllByOrderByFechaInicioDesc();
}