package com.negocio.gestion.objetos;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Gasto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String descripcion;
    private Double monto;
    private LocalDateTime fecha;
    @ManyToOne
    @JoinColumn(name = "jornada_id")
    private Jornada jornada;

    public Gasto() { this.fecha = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Double getMonto() { return monto; }
    public void setMonto(Double monto) { this.monto = monto; }
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    public Jornada getJornada() { return jornada; }
    public void setJornada(Jornada jornada) { this.jornada = jornada; }
}