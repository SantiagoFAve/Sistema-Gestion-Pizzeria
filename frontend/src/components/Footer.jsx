import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
    return (
        <footer className="bg-dark text-white mt-auto py-3">
            <Container>
                <Row className="align-items-center justify-content-between">
                    <Col md={6} className="text-center text-md-start">
                        <p className="mb-0">
                            &copy; 2025 <strong>Negocio Gestión</strong>
                        </p>
                        <small className="text-muted">Sistema de Control de Ventas v1.0</small>
                    </Col>
                    <Col md={6} className="text-center text-md-end mt-2 mt-md-0">
                        <small className="text-muted d-block">
                            <span className="text-light fw-bold">Santiago Avellaneda</span>
                        </small>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}

export default Footer;