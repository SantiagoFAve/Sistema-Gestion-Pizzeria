import { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, InputGroup } from 'react-bootstrap';

function Productos() {
    const [productos, setProductos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [idEditar, setIdEditar] = useState(null);
    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState("");
    const [categoria, setCategoria] = useState("Pizza");
    const cargarProductos = () => {
        fetch('http://localhost:8080/api/productos')
            .then(res => res.json())
            .then(data => setProductos(data));
    };
    useEffect(() => {
        cargarProductos();
    }, []);

    const guardarProducto = () => {
        const producto = { nombre, precio: parseFloat(precio), categoria };
        const method = idEditar ? 'PUT' : 'POST';
        const url = idEditar 
            ? `http://localhost:8080/api/productos/${idEditar}` 
            : 'http://localhost:8080/api/productos';
        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        }).then(() => {
            alert("Producto guardado correctamente");
            cerrarModal();
            cargarProductos();
        });
    };

    const eliminarProducto = (id) => {
        if (window.confirm("¿Seguro que quieres borrar este producto del menú?")) {
            fetch(`http://localhost:8080/api/productos/${id}`, { method: 'DELETE' })
                .then(() => cargarProductos());
        }
    };

    const abrirModal = (prod = null) => {
        if (prod) {
            setIdEditar(prod.id);
            setNombre(prod.nombre);
            setPrecio(prod.precio);
            setCategoria(prod.categoria);
        } else {
            setIdEditar(null);
            setNombre("");
            setPrecio("");
            setCategoria("Pizza");
        }
        setShowModal(true);
    };

    const cerrarModal = () => setShowModal(false);

    return (
        <Container fluid>
            <div className="d-flex justify-content-between align-items-center">
                <h2 className= "fw-bold">Gestión del Menú</h2>
                <Button variant="secondary" className= "fw-bold" onClick={() => abrirModal()}>+ Nuevo Producto</Button>
            </div>

            <Table striped bordered hover>
                <thead className="table-dark">
                    <tr>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map(p => (
                        <tr key={p.id}>
                            <td className= "fw-bold">{p.nombre}</td>
                            <td><span className="badge bg-secondary fw-bold">{p.categoria}</span></td>
                            <td className= "fw-bold">${p.precio}</td>
                            <td>
                                <Button variant="secondary" size="sm" className="me-2 fw-bold" onClick={() => abrirModal(p)}>Editar Producto</Button>
                                <Button variant="danger" className= "fw-bold" size="sm" onClick={() => eliminarProducto(p.id)}>Eliminar Producto</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={cerrarModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{idEditar ? "Editar Producto" : "Nuevo Producto"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" value={nombre} onChange={e => setNombre(e.target.value)} autoFocus />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Precio</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>$</InputGroup.Text>
                                <Form.Control type="number" value={precio} onChange={e => setPrecio(e.target.value)} />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Categoría</Form.Label>
                            <Form.Select value={categoria} onChange={e => setCategoria(e.target.value)}>
                                <option value="Pizza">Pizza</option>
                                <option value="Sandwich">Sandwich</option>
                                <option value="Napolitana">Napolitana</option>
                                <option value="Bebidas">Bebidas</option>
                                <option value="Otros">Otros</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={cerrarModal}>Cancelar</Button>
                    <Button variant="secondary" onClick={guardarProducto}>Guardar</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default Productos;