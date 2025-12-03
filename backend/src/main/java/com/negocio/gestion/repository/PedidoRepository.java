package com.negocio.gestion.repository;
import com.negocio.gestion.objetos.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByJornadaId(Long jornadaId);
}