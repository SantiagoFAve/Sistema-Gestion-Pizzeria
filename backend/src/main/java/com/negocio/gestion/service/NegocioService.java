package com.negocio.gestion.service;
import com.negocio.gestion.objetos.*;
import com.negocio.gestion.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NegocioService {
    @Autowired private JornadaRepository jornadaRepo;
    @Autowired private PedidoRepository pedidoRepo;
    @Autowired private ProductoRepository productoRepo;
    @Autowired private GastoRepository gastoRepo;

    public Jornada abrirDia() {
        if (jornadaRepo.findByAbiertaTrue().isPresent()) {
            throw new RuntimeException("¡Ya hay una caja abierta! Cierrala antes de abrir otra");
        }
        Jornada nueva = new Jornada();
        return jornadaRepo.save(nueva);
    }

    public void validarSiPuedeCerrar(Jornada jornada) {
        List<Pedido> pedidosHoy = pedidoRepo.findByJornadaId(jornada.getId());
        boolean hayPendientes = pedidosHoy.stream().anyMatch(p -> !p.isEntregado());
        if (hayPendientes) {
            throw new RuntimeException("Hay pedidos pendientes en cocina.\nEntrégalos o anúlalos antes de cerrar la caja");
        }
    }

    public Jornada cerrarDia() {
        Jornada actual = jornadaRepo.findByAbiertaTrue()
                .orElseThrow(() -> new RuntimeException("No hay caja abierta para cerrar"));
        validarSiPuedeCerrar(actual);
        actual.setAbierta(false);
        actual.setFechaFin(LocalDateTime.now());
        return jornadaRepo.save(actual);
    }

    public Jornada obtenerJornadaActual() {
        return jornadaRepo.findByAbiertaTrue().orElse(null);
    }

    public List<Pedido> obtenerPedidosActuales() {
        Jornada actual = jornadaRepo.findByAbiertaTrue().orElse(null);
        if (actual == null) {
            return List.of();
        }

        return pedidoRepo.findByJornadaId(actual.getId());
    }

    @Transactional
    public Pedido guardarPedido(Pedido pedido) {
        Jornada jornadaActual = jornadaRepo.findByAbiertaTrue().orElseThrow(() -> new RuntimeException("La caja esta cerrada. Abre el día primero"));
        pedido.setJornada(jornadaActual);
        pedido.setFecha(LocalDateTime.now());
        double totalCalculado = 0;
        for (DetallePedido detalle : pedido.getDetalles()) {
            Producto p = productoRepo.findById(detalle.getProducto().getId()).orElseThrow();
            detalle.setProducto(p);
            detalle.setSubtotal(p.getPrecio() * detalle.getCantidad());
            detalle.setPedido(pedido);
            totalCalculado += detalle.getSubtotal();
        }
        pedido.setTotal(totalCalculado);
        return pedidoRepo.save(pedido);
    }

    @Transactional
    public Pedido editarPedido(Long id, Pedido pedidoEditado) {
        Pedido pedidoExistente = pedidoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (!pedidoExistente.getJornada().getAbierta()) {
            throw new RuntimeException("No se puede editar un pedido de una caja cerrada");
        }

        pedidoExistente.setMetodoPago(pedidoEditado.getMetodoPago());
        pedidoExistente.setDescripcion(pedidoEditado.getDescripcion());
        pedidoExistente.setFecha(LocalDateTime.now());
        pedidoExistente.getDetalles().clear();

        double nuevoTotal = 0;
        for (DetallePedido detalle : pedidoEditado.getDetalles()) {
            Producto p = productoRepo.findById(detalle.getProducto().getId()).orElseThrow();
            detalle.setProducto(p);
            detalle.setSubtotal(p.getPrecio() * detalle.getCantidad());
            detalle.setPedido(pedidoExistente);
            pedidoExistente.getDetalles().add(detalle);
            nuevoTotal += detalle.getSubtotal();
        }
        pedidoExistente.setTotal(nuevoTotal);
        return pedidoRepo.save(pedidoExistente);
    }

    public Gasto registrarGasto(Gasto gasto) {
        Jornada actual = jornadaRepo.findByAbiertaTrue().orElseThrow(() -> new RuntimeException("No puedes registrar gastos con la caja cerrada"));
        gasto.setJornada(actual);
        gasto.setFecha(LocalDateTime.now());
        return gastoRepo.save(gasto);
    }

    public List<Gasto> obtenerGastosActuales() {
        Jornada actual = jornadaRepo.findByAbiertaTrue().orElse(null);
        if (actual == null) return List.of();
        return gastoRepo.findByJornadaId(actual.getId());
    }

    public void borrarPedido(Long id) {
        Pedido pedido = pedidoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        if (!pedido.getJornada().getAbierta()) {
            throw new RuntimeException("No puedes borrar pedidos de una caja cerrada.");
        }
        pedidoRepo.delete(pedido);
    }

    public Pedido marcarEntregado(Long id) {
        Pedido pedido = pedidoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        pedido.setEntregado(true); // Cambiamos el estado
        return pedidoRepo.save(pedido);
    }

    public Map<String, Object> obtenerDatosDashboard() {
        List<Pedido> pedidos = pedidoRepo.findAll(); // Traemos todo el historial
        Map<String, Integer> rankingMap = pedidos.stream()
                .flatMap(p -> p.getDetalles().stream())
                .collect(Collectors.groupingBy(
                        d -> d.getProducto().getNombre(),
                        Collectors.summingInt(DetallePedido::getCantidad)
                ));

        List<Map<String, Object>> topProductos = rankingMap.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", e.getKey());
                    item.put("cantidad", e.getValue());
                    return item;
                })
                .collect(Collectors.toList());

        Map<String, Double> pagosMap = pedidos.stream()
                .collect(Collectors.groupingBy(
                        Pedido::getMetodoPago,
                        Collectors.summingDouble(Pedido::getTotal)
                ));

        List<Map<String, Object>> ventasPorPago = new ArrayList<>();
        pagosMap.forEach((k, v) -> {
            Map<String, Object> item = new HashMap<>();
            item.put("name", k);
            item.put("value", v);
            ventasPorPago.add(item);
        });


        Map<Integer, Long> horasMap = pedidos.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getFecha().getHour(),
                        Collectors.counting()
                ));

        List<Map<String, Object>> ventasPorHora = horasMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("hora", e.getKey() + ":00");
                    item.put("pedidos", e.getValue());
                    return item;
                })
                .collect(Collectors.toList());

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("topProductos", topProductos);
        respuesta.put("ventasPorPago", ventasPorPago);
        respuesta.put("ventasPorHora", ventasPorHora);
        return respuesta;
    }

    public List<Jornada> obtenerHistorial() {
        return jornadaRepo.findAllByOrderByFechaInicioDesc();
    }

    public Jornada obtenerJornadaPorId(Long id) {
        return jornadaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Jornada no encontrada"));
    }

    public List<Pedido> obtenerPedidosDeJornada(Long jornadaId) {
        return pedidoRepo.findByJornadaId(jornadaId);
    }

    public List<Gasto> obtenerGastosDeJornada(Long jornadaId) {
        return gastoRepo.findByJornadaId(jornadaId);
    }

}