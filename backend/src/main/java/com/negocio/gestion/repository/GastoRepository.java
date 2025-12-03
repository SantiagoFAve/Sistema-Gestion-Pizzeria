package com.negocio.gestion.repository;
import com.negocio.gestion.objetos.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GastoRepository extends JpaRepository<Gasto, Long> {
    List<Gasto> findByJornadaId(Long jornadaId);
}