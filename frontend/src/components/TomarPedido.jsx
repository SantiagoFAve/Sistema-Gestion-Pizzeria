import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Badge} from 'react-bootstrap';

function TomarPedido() {
    const [productos, setProductos] = useState([]);
    const [pedido, setPedido] = useState([]);
    const [descripcion, setDescripcion] = useState("");
    const [total, setTotal] = useState(0);
    const [metodoPago, setMetodoPago] = useState("Efectivo");
    const [pedidosHoy, setPedidosHoy] = useState([]);
    const [idPedidoEditar, setIdPedidoEditar] = useState(null);
    const pedidosPendientes = pedidosHoy.filter(p => !p.entregado);
    const pedidosEntregados = pedidosHoy.filter(p => p.entregado).sort((a, b) => b.id - a.id);

    useEffect(() => {
        fetch('http://localhost:8080/api/productos')
            .then(res => res.json())
            .then(data => setProductos(data));
            
        cargarPedidosHoy();
    }, []);

    const cargarPedidosHoy = () => {
        fetch('http://localhost:8080/api/negocio/pedidos-actuales')
            .then(res => res.json())
            .then(data => setPedidosHoy(data))
            .catch(err => console.log("Caja cerrada o error de red"));
    };

    const entregarPedido = (id) => {
        fetch(`http://localhost:8080/api/negocio/pedido/${id}/entregar`, { method: 'POST' })
            .then(res => {
                if (res.ok) cargarPedidosHoy();
            });
    };

    const agregarAlPedido = (producto) => {
        const itemExistente = pedido.find(item => item.id === producto.id);
        if (itemExistente) {
            const pedidoActualizado = pedido.map(item => 
                item.id === producto.id 
                ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio }
                : item
            );
            setPedido(pedidoActualizado);
        } else {
            setPedido([...pedido, { ...producto, cantidad: 1, subtotal: producto.precio }]);
        }
    };

    useEffect(() => {
        const nuevoTotal = pedido.reduce((acum, item) => acum + item.subtotal, 0);
        setTotal(nuevoTotal);
    }, [pedido]);

    const confirmarPedido = () => {
        if (pedido.length === 0) { alert("Pedido Vacio"); return; }

        const detallesBackend = pedido.map(item => ({
            producto: { id: item.id },
            cantidad: item.cantidad
        }));

        const pedidoFinal = { metodoPago, descripcion, detalles: detallesBackend };
        const method = idPedidoEditar ? 'PUT' : 'POST';
        const url = idPedidoEditar 
            ? `http://localhost:8080/api/negocio/pedido/${idPedidoEditar}`
            : 'http://localhost:8080/api/negocio/pedido';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedidoFinal)
        })
        .then(async response => {
            if (response.ok) {
                alert(idPedidoEditar ? "Pedido actualizado" : "Pedido creado");
                setPedido([]);
                setDescripcion("");
                setMetodoPago("Efectivo");
                setIdPedidoEditar(null);
                cargarPedidosHoy();
            } else {
                const errorMsg = await response.text();
                alert("Error: " + errorMsg);
            }
        });
    };

    const cargarParaEditar = (pedidoDelHistorial) => {
        setIdPedidoEditar(pedidoDelHistorial.id);

        setMetodoPago(pedidoDelHistorial.metodoPago);
        setDescripcion(pedidoDelHistorial.descripcion || "");
        const itemsFormateados = pedidoDelHistorial.detalles.map(d => ({
            id: d.producto.id,
            nombre: d.producto.nombre,
            precio: d.producto.precio,
            cantidad: d.cantidad,
            subtotal: d.subtotal
        }));
        setPedido(itemsFormateados);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const restarDelPedido = (idProducto) => {
        const itemExistente = pedido.find(item => item.id === idProducto);
        if (itemExistente.cantidad > 1) {
            const pedidoActualizado = pedido.map(item => 
                item.id === idProducto
                ? { ...item, cantidad: item.cantidad - 1, subtotal: (item.cantidad - 1) * item.precio }
                : item
            );
            setPedido(pedidoActualizado);
        } else {
            const pedidoActualizado = pedido.filter(item => item.id !== idProducto);
            setPedido(pedidoActualizado);
        }
    };

    const anularPedido = (id) => {
        if (window.confirm(`¿Seguro que quieres cancelar el pedido #${id}? \nSe borrará del registro y de la caja.`)) {
            fetch(`http://localhost:8080/api/negocio/pedido/${id}`, {
                method: 'DELETE'
            })
            .then(async response => {
                if (response.ok) {
                    cargarPedidosHoy();
                } else {
                    const msg = await response.text();
                    alert("Error: " + msg);
                }
            })
            .catch(() => alert("Error de conexión"));
        }
    };

    return (
        <Container fluid className="p-3">
            <Row>
                <Col md={8}>
                    <Card className="h-100 shadow-sm">
                        <Card.Header className="bg-dark text-white">
                            <h4>Menu de Productos</h4>
                        </Card.Header>
                        <Card.Body style={{ overflowY: 'auto', maxHeight: '80vh'}}>
                            <Row>
                                {productos.map(prod => (
                                    <Col md={4} lg={3} className="mb-3 " key={prod.id}>
                                        <Card 
                                            className="text-center h-100 cursor-pointer border-0 shadow-sm producto-card bg-light" 
                                            onClick={() => agregarAlPedido(prod)}
                                            style={{ cursor: 'pointer', transition: '0.2s' }}
                                        >
                                            <Card.Body className="d-flex flex-column justify-content-center">
                                                <h5>{prod.nombre}</h5>
                                                <h6 className="text-muted">${prod.precio}</h6>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="h-100 shadow">
                        <Card.Header className="bg-secondary text-white d-flex justify-content-between">
                            <h4>Pedido Actual</h4>
                            <h4>${total}</h4>
                        </Card.Header>
                        <Card.Body className="d-flex flex-column">
                            <div className="flex-grow-1" style={{ overflowY: 'auto', maxHeight: '60vh' }}>
                                <Table striped size="sm">
                                    <thead>
                                        <tr>
                                            <th>Prod</th>
                                            <th>Cant</th>
                                            <th>Sub</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pedido.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.nombre}</td>
                                                <td>{item.cantidad}</td>
                                                <td>${item.subtotal}</td>
                                                <td><Button variant="danger" className='fw-bold' size="sm" onClick={() => restarDelPedido(item.id)}>X</Button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            <div className="mt-2">
                                <Form.Label className="fw-bold m-0">Notas / Dirección:</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={2} 
                                    placeholder="Ej: Dirrecion - Quitar verduras"
                                    value={descripcion}
                                    onChange={e => setDescripcion(e.target.value)}
                                />
                            </div>
                            <div className="mt-3 fw-bold">
                            <Form.Label>Método de Pago:</Form.Label>
                                <Form.Select 
                                    value={metodoPago} 
                                    onChange={(e) => setMetodoPago(e.target.value)}
                                    className="mb-3"
                                >
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Transferencia">Transferencia</option>
                                </Form.Select>
                            </div>
                            <div className="mt-3 border-top pt-3">
                                <div className="d-grid gap-2">
                                    <Button variant="outline-success" className='fw-bold' onClick={confirmarPedido}>CONFIRMAR</Button>
                                    <Button variant="outline-danger" className='fw-bold' onClick={() => {
                                            setPedido([]);
                                            setDescripcion("");
                                            setIdPedidoEditar(null);
                                        }}>
                                        {idPedidoEditar ? 'CANCELAR EDICIÓN' : 'CANCELAR'}
                                    </Button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <h3 className="mb-3 fw-bold">Pedidos de la Jornada Actual</h3>
            
             <div className="mt-4">
                <h3 className="mb-3 text-secondary fw-bold">Pedidos Pendientes</h3>
                <Row className="g-3">
                    {pedidosPendientes.length === 0 && <p className="text-muted ms-3">No hay pedidos pendientes</p>}
                    {pedidosPendientes.map(p => (
                        <Col md={3} key={p.id}>
                            <Card className="border-2 border-success shadow-sm">
                                <Card.Body>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="badge bg-dark">#{p.id}</span>
                                        <span className={`badge ${p.metodoPago === 'Efectivo' ? 'bg-success' : 'bg-secondary'}`}>
                                        {p.metodoPago}
                                        </span>
                                    </div>
                                    <ul className="list-unstyled mb-2 small ps-2 bg-light py-2 rounded">
                                        {p.detalles.map((d, index) => (
                                            <li key={index}><strong>{d.cantidad}x</strong> {d.producto.nombre}</li>
                                        ))}
                                    </ul>
                                    {p.descripcion && <div className="alert alert-success p-1 small mb-2">Notas: {p.descripcion}</div>}
                                    <small className="text-muted">{new Date(p.fecha).toLocaleTimeString()} hs</small>
                                    <h3 className="fw-bold text-end">${p.total}</h3>
                                    <div className="d-grid gap-2 mt-2">
                                        <Button variant="success" className="fw-bold" onClick={() => entregarPedido(p.id)}>
                                            ENTREGAR
                                        </Button>
                                        <div className="d-flex gap-2">
                                            <Button variant="outline-warning" size="sm" className="w-50 fw-bold" onClick={() => cargarParaEditar(p)}>EDITAR</Button>
                                            <Button variant="outline-danger" size="sm" className="w-50 fw-bold" onClick={() => anularPedido(p.id)}>CANCELAR</Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            <div className="mt-5 pt-4 border-top">
                <h4 className="mb-3 text-success">Pedidos Entregados</h4>
                <Row className="g-3">
                    {pedidosEntregados.map(p => (
                        <Col md={3} key={p.id}>
                            <Card className="border-0 bg-light opacity-75">
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <small>#{p.id}</small>
                                        <small className="text-success fw-bold">ENTREGADO</small>
                                    </div>
                                    <ul className="list-unstyled mb-1 small ps-1 text-muted">
                                        {p.detalles.map((d, index) => (
                                            <li key={index}>{d.cantidad}x {d.producto.nombre}</li>
                                        ))}
                                    </ul>
                                    {p.descripcion && <div className="alert alert-success p-1 small mb-2">Notas: {p.descripcion}</div>}
                                    <h5 className="fw-bold m-0">${p.total}</h5>
                                    <small className="text-muted">{new Date(p.fecha).toLocaleTimeString()} hs</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </Container>
    );
}

export default TomarPedido;