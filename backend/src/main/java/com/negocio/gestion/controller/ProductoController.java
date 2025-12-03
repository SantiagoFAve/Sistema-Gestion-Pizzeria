package com.negocio.gestion.controller;

import com.negocio.gestion.objetos.Producto;
import com.negocio.gestion.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {
    @Autowired
    private ProductoRepository repositorio;

    @GetMapping
    public List<Producto> listarProductos() {
        return repositorio.findByActivoTrue();
    }

    @PostMapping
    public Producto crearProducto(@RequestBody Producto producto) {
        return repositorio.save(producto);
    }

    @PutMapping("/{id}")
    public Producto actualizarProducto(@PathVariable Long id, @RequestBody Producto nuevosDatos) {
        Producto producto = repositorio.findById(id).orElseThrow();
        producto.setNombre(nuevosDatos.getNombre());
        producto.setPrecio(nuevosDatos.getPrecio());
        producto.setCategoria(nuevosDatos.getCategoria());
        return repositorio.save(producto);
    }

    @DeleteMapping("/{id}")
    public void eliminarProducto(@PathVariable Long id) {
        Producto producto = repositorio.findById(id).orElseThrow();
        producto.setActivo(false);
        repositorio.save(producto);
    }
}