import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Container, Nav, Card, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Productos from './components/Productos';
import TomarPedido from './components/TomarPedido';
import Dashboard from './components/Dashboard';
import Historial from './components/Historial';
import Footer from './components/Footer';

function App() {
  const [showModalGasto, setShowModalGasto] = useState(false);
  const [montoGasto, setMontoGasto] = useState("");
  const [descGasto, setDescGasto] = useState("");

  const abrirCaja = () => {
    fetch('http://localhost:8080/api/negocio/abrir-dia', { method: 'POST' })
      .then(async response => {
        if (response.ok) {
          alert("Caja Abierta");
        } else {
          const msg = await response.text();
          alert("Advertencia: " + msg);
        }
      })
      .catch(() => alert("Error de conexión"));
  };

  const cerrarCaja = async () => {
    if (!window.confirm("¿Seguro que quieres cerrar la jornada? \nSe descargará el reporte y se cerrará el sistema")) {
      return;
    }

    try { 
      const respuestaPdf = await fetch('http://localhost:8080/api/negocio/exportar-cierre');
      if (respuestaPdf.ok) {
          const blob = await respuestaPdf.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = "Reporte_Diario.pdf";
          document.body.appendChild(a);
          a.click();
          a.remove();
      } else {
          alert("No se pudo generar el reporte, pero intentaremos cerrar la caja igual.");
      }

      const respuestaCierre = await fetch('http://localhost:8080/api/negocio/cerrar-dia', { method: 'POST' });
      
      if (respuestaCierre.ok) {
          alert("¡Caja cerrada correctamente!");
          window.location.reload();
      } else {
          const msg = await respuestaCierre.text();
          alert("Error al cerrar la caja: " + msg);
      }

    } catch (error) {
        console.error(error);
        alert("Error de conexión.");
    }
  };

  const registrarGasto = () => {
    if (!montoGasto || !descGasto) {
      alert("Por favor completa el monto y la descripción.");
      return;
    }

    const gasto = {
      monto: parseFloat(montoGasto),
      descripcion: descGasto
    };

    fetch('http://localhost:8080/api/negocio/gasto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gasto)
    })
    .then(async response => {
      if (response.ok) {
        alert("Gasto registrado. Se descontará del total de la caja.");
        setShowModalGasto(false);
        setMontoGasto("");
        setDescGasto("");
      } else {
        const msg = await response.text();
        alert("Error: " + msg);
      }
    })
    .catch(() => alert("Error de conexión con el servidor"));
  };

  const salirDelSistema = () => {
    if (window.confirm("¿Seguro que quieres cerrar el sistema? \nEsto apagará el servidor.")) {
      fetch('http://localhost:8080/actuator/shutdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(() => {
        document.body.innerHTML = `
          <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background-color:#212529; color:white; font-family:sans-serif;">
              <h1>Sistema Apagado</h1>
              <p>El servidor se ha detenido correctamente.</p>
              <p>Ya puedes cerrar esta ventana.</p>
          </div>
        `;
        window.close();
      })
      .catch(err => {
        alert("No se pudo apagar el servidor (¿Ya estaba apagado?)");
      });
    }
  };

  return (
    <BrowserRouter>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container fluid>
          <img
              src="/logo.png" alt="Logo" width="40" height="40" className="d-inline-block align-top me-2" // 'me-2' da el espacio a la derecha
            />
          <Navbar.Brand href="/" className='fw-bold'>Gestión de Negocio</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} className='fw-bold' to="/">Tomar Pedidos</Nav.Link>
              <Nav.Link as={Link} className='fw-bold' to="/productos">Modificar Productos</Nav.Link>
              <Nav.Link as={Link} className='fw-bold' to="/dashboard">Estadísticas</Nav.Link>
              <Nav.Link as={Link} className='fw-bold' to="/historial">Historial</Nav.Link>
              <div className="vr bg-white mx-2" style={{ height: '30px' }}></div>
              <Button variant="outline-success" className='fw-bold me-2' size="sm" onClick={abrirCaja}>Abrir Caja</Button>
              <Button variant="outline-warning" className='fw-bold me-2' size="sm" onClick={cerrarCaja}>Cerrar Caja</Button>
              <Button variant="outline-danger" size="sm" className="fw-bold" onClick={() => setShowModalGasto(true)}>
                Registrar Gasto
              </Button>
              <div className="vr bg-white mx-2" style={{ height: '30px' }}></div>
              <Nav.Link as={Link} className="text-danger fw-bold" onClick={salirDelSistema} style={{ cursor: 'pointer' }}>Salir</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="p-0">
        <Routes>
          <Route path="/" element={<TomarPedido />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/historial" element={<Historial />} />
        </Routes>

        <Modal show={showModalGasto} onHide={() => setShowModalGasto(false)} centered>
            <Modal.Header closeButton className="bg-danger text-white">
              <Modal.Title>Registrar Gastos</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Monto ($)</Form.Label>
                  <Form.Control 
                    type="number" 
                    placeholder="Ej: 2500" 
                    value={montoGasto} 
                    onChange={(e) => setMontoGasto(e.target.value)}
                    autoFocus
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Motivo / Descripción</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={2} 
                    placeholder="Ej: comprar tomate" 
                    value={descGasto} 
                    onChange={(e) => setDescGasto(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModalGasto(false)}>Cancelar</Button>
              <Button variant="danger" onClick={registrarGasto}>Registrar Gasto</Button>
            </Modal.Footer>
        </Modal>
      </Container>
      <Footer />
    </BrowserRouter>
  );
}

export default App;