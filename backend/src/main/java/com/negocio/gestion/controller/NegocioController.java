package com.negocio.gestion.controller;
import com.negocio.gestion.objetos.Gasto;
import com.negocio.gestion.objetos.Jornada;
import com.negocio.gestion.objetos.Pedido;
import com.negocio.gestion.service.NegocioService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/negocio")
@CrossOrigin(origins = "*")
public class NegocioController {
    @Autowired
    private NegocioService servicio;
    @Autowired
    private com.negocio.gestion.service.ReporteService reporteService;

    @PostMapping("/abrir-dia")
    public ResponseEntity<?> abrirDia() {
        try {
            Jornada jornada = servicio.abrirDia();
            return ResponseEntity.ok(jornada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/cerrar-dia")
    public ResponseEntity<?> cerrarDia() {
        try {
            Jornada jornada = servicio.cerrarDia();
            return ResponseEntity.ok(jornada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/jornada-actual")
    public ResponseEntity<Jornada> obtenerJornada() {
        Jornada actual = servicio.obtenerJornadaActual();
        if (actual != null) {
            return ResponseEntity.ok(actual);
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/pedido")
    public ResponseEntity<?> guardarPedido(@RequestBody Pedido pedido) {
        try {
            Pedido nuevo = servicio.guardarPedido(pedido);
            return ResponseEntity.ok(nuevo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/pedidos-actuales")
    public ResponseEntity<List<Pedido>> listarPedidosDelDia() {
        return ResponseEntity.ok(servicio.obtenerPedidosActuales());
    }

    @PutMapping("/pedido/{id}")
    public ResponseEntity<?> editarPedido(@PathVariable Long id, @RequestBody Pedido pedido) {
        try {
            Pedido editado = servicio.editarPedido(id, pedido);
            return ResponseEntity.ok(editado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/gasto")
    public ResponseEntity<?> registrarGasto(@RequestBody Gasto gasto) {
        try {
            return ResponseEntity.ok(servicio.registrarGasto(gasto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/gastos-actuales")
    public ResponseEntity<List<Gasto>> listarGastos() {
        return ResponseEntity.ok(servicio.obtenerGastosActuales());
    }

    @GetMapping("/exportar-cierre")
    public void exportarCierre(HttpServletResponse response) throws IOException {
        Jornada jornada = servicio.obtenerJornadaActual();

        if (jornada == null) {
            response.sendError(400, "No hay caja abierta.");
            return;
        }
        try {
            servicio.validarSiPuedeCerrar(jornada);
        } catch (RuntimeException e) {
            response.sendError(400, e.getMessage());
            return;
        }

        List<Pedido> pedidos = servicio.obtenerPedidosActuales();
        List<Gasto> gastos = servicio.obtenerGastosActuales();

        response.setContentType("application/pdf");
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=Cierre_Caja_" + jornada.getId() + ".pdf";
        response.setHeader(headerKey, headerValue);

        reporteService.generarReporteCierre(response, jornada, pedidos, gastos);
    }

    @DeleteMapping("/pedido/{id}")
    public ResponseEntity<?> borrarPedido(@PathVariable Long id) {
        try {
            servicio.borrarPedido(id);
            return ResponseEntity.ok("Pedido eliminado");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/pedido/{id}/entregar")
    public ResponseEntity<?> marcarEntregado(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(servicio.marcarEntregado(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<java.util.Map<String, Object>> obtenerDashboard() {
        return ResponseEntity.ok(servicio.obtenerDatosDashboard());
    }

    @GetMapping("/jornadas")
    public ResponseEntity<java.util.List<Jornada>> verHistorial() {
        return ResponseEntity.ok(servicio.obtenerHistorial());
    }

    @GetMapping("/jornada/{id}/reporte")
    public void descargarReporteHistorico(@PathVariable Long id, HttpServletResponse response) throws java.io.IOException {
        Jornada jornada = servicio.obtenerJornadaPorId(id);
        java.util.List<Pedido> pedidos = servicio.obtenerPedidosDeJornada(id);
        java.util.List<com.negocio.gestion.objetos.Gasto> gastos = servicio.obtenerGastosDeJornada(id);
        response.setContentType("application/pdf");
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=Reporte_Caja_" + id + ".pdf";
        response.setHeader(headerKey, headerValue);

        reporteService.generarReporteCierre(response, jornada, pedidos, gastos);
    }

}