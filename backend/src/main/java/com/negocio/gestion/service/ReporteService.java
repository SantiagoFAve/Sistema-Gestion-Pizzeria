package com.negocio.gestion.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.negocio.gestion.objetos.DetallePedido;
import com.negocio.gestion.objetos.Gasto;
import com.negocio.gestion.objetos.Jornada;
import com.negocio.gestion.objetos.Pedido;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReporteService {
    public void generarReporteCierre(HttpServletResponse response, Jornada jornada, List<Pedido> pedidos, List<Gasto> gastos) throws IOException {
        Document documento = new Document(PageSize.A4);
        PdfWriter.getInstance(documento, response.getOutputStream());
        documento.open();

        Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph titulo = new Paragraph("Cierre de Caja #" + jornada.getId(), fontTitulo);
        titulo.setAlignment(Paragraph.ALIGN_CENTER);
        documento.add(titulo);

        String fecha = jornada.getFechaInicio().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        Paragraph subtitulo = new Paragraph("Apertura: " + fecha);
        subtitulo.setAlignment(Paragraph.ALIGN_CENTER);
        documento.add(subtitulo);
        documento.add(new Paragraph(" "));

        double totalEfectivo = 0;
        double totalDigital = 0;
        for (Pedido p : pedidos) {
            if ("Efectivo".equalsIgnoreCase(p.getMetodoPago())) {
                totalEfectivo += p.getTotal();
            } else {
                totalDigital += p.getTotal();
            }
        }

        double totalGastos = 0;
        for (Gasto g : gastos) {
            totalGastos += g.getMonto();
        }

        double efectivoReal = totalEfectivo - totalGastos;
        double ventaBruta = totalEfectivo + totalDigital;

        PdfPTable tablaResumen = new PdfPTable(2);
        tablaResumen.setWidthPercentage(60);
        tablaResumen.setSpacingAfter(20f);

        tablaResumen.addCell(celda("Ingresos Efectivo", Color.LIGHT_GRAY));
        tablaResumen.addCell(celda("$ " + totalEfectivo, Color.WHITE));

        tablaResumen.addCell(celda("Gastos", new Color(255, 230, 230)));
        tablaResumen.addCell(celda("- $ " + totalGastos, Color.WHITE));

        tablaResumen.addCell(celda("EFECTIVO EN CAJA", new Color(220, 255, 220))); // Verde claro
        tablaResumen.addCell(celda("$ " + efectivoReal, Color.WHITE));

        tablaResumen.addCell(celda("Total Digital", Color.LIGHT_GRAY));
        tablaResumen.addCell(celda("$ " + totalDigital, Color.WHITE));
        documento.add(tablaResumen);


        Paragraph tituloVentas = new Paragraph("Detalle de Ventas", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12));
        tituloVentas.setSpacingAfter(5f);
        documento.add(tituloVentas);

        PdfPTable tablaDetalle = new PdfPTable(5);
        tablaDetalle.setWidths(new float[]{1, 2, 6, 2, 2});
        tablaDetalle.setWidthPercentage(100);

        tablaDetalle.addCell(celdaHeader("Ticket"));
        tablaDetalle.addCell(celdaHeader("Hora"));
        tablaDetalle.addCell(celdaHeader("Detalle"));
        tablaDetalle.addCell(celdaHeader("Pago"));
        tablaDetalle.addCell(celdaHeader("Total"));

        for (Pedido p : pedidos) {
            tablaDetalle.addCell(String.valueOf(p.getId()));
            tablaDetalle.addCell(p.getFecha().format(DateTimeFormatter.ofPattern("HH:mm")));

            StringBuilder detalleStr = new StringBuilder();
            for (DetallePedido dp : p.getDetalles()) {
                detalleStr.append("• ").append(dp.getCantidad()).append(" x ").append(dp.getProducto().getNombre()).append("\n");
            }
            if (p.getDescripcion() != null && !p.getDescripcion().isEmpty()) {
                detalleStr.append("[Nota: ").append(p.getDescripcion()).append("]");
            }

            PdfPCell celdaProd = new PdfPCell(new Phrase(detalleStr.toString(), FontFactory.getFont(FontFactory.HELVETICA, 9)));
            celdaProd.setPadding(5);
            tablaDetalle.addCell(celdaProd);

            tablaDetalle.addCell(p.getMetodoPago());
            tablaDetalle.addCell("$ " + p.getTotal());
        }
        documento.add(tablaDetalle);

        // --- 5. LISTA DE GASTOS (NUEVO) ---
        if (!gastos.isEmpty()) {
            documento.add(new Paragraph(" ")); // Espacio
            Paragraph tituloGastos = new Paragraph("Detalle de Gastos", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12));
            tituloGastos.setSpacingAfter(5f);
            documento.add(tituloGastos);

            PdfPTable tablaGastos = new PdfPTable(3); // Hora, Motivo, Monto
            tablaGastos.setWidths(new float[]{2, 6, 2});
            tablaGastos.setWidthPercentage(100);

            tablaGastos.addCell(celdaHeader("Hora"));
            tablaGastos.addCell(celdaHeader("Motivo / Descripción"));
            tablaGastos.addCell(celdaHeader("Monto"));

            for (Gasto g : gastos) {
                tablaGastos.addCell(g.getFecha().format(DateTimeFormatter.ofPattern("HH:mm")));
                tablaGastos.addCell(celda(g.getDescripcion(), Color.WHITE));
                tablaGastos.addCell("$ " + g.getMonto());
            }
            documento.add(tablaGastos);
        }

        documento.close();
    }

    private PdfPCell celda(String texto, Color fondo) {
        PdfPCell c = new PdfPCell(new Phrase(texto, FontFactory.getFont(FontFactory.HELVETICA, 10)));
        c.setBackgroundColor(fondo);
        c.setPadding(5);
        return c;
    }

    private PdfPCell celdaHeader(String texto) {
        PdfPCell c = new PdfPCell(new Phrase(texto, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE)));
        c.setBackgroundColor(Color.DARK_GRAY);
        c.setPadding(5);
        return c;
    }
}