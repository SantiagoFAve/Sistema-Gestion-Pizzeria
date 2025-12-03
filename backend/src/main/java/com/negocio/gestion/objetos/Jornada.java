package com.negocio.gestion.objetos;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
public class Jornada {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private Boolean abierta = true;
    private Double totalDelDia = 0.0;

    public Jornada() {
        this.fechaInicio = LocalDateTime.now();
        this.abierta = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDateTime fechaInicio) { this.fechaInicio = fechaInicio; }
    public LocalDateTime getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDateTime fechaFin) { this.fechaFin = fechaFin; }
    public Boolean getAbierta() { return abierta; }
    public void setAbierta(Boolean abierta) { this.abierta = abierta; }
    public Double getTotalDelDia() { return totalDelDia; }
    public void setTotalDelDia(Double totalDelDia) { this.totalDelDia = totalDelDia; }
}