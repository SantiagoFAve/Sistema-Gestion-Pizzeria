import { useEffect, useState } from 'react';
import { Card, Row, Col, Container } from 'react-bootstrap';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

function Dashboard() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8080/api/negocio/dashboard')
            .then(res => res.json())
            .then(datos => setData(datos))
            .catch(err => console.error("Error cargando dashboard", err));
    }, []);

    if (!data) return <div className="p-5 text-center"><h2>Cargando estadísticas... ⏳</h2></div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <Container fluid className="p-4">
            <h2 className="mb-4 fw-bold text-dark">Tablero de Control</h2>
            
            <Row className="g-4">
                <Col md={11}>
                    <Card className="shadow-sm h-100 border-0 center">
                        <Card.Header className="bg-white fw-bold">Productos Mas Vendidos</Card.Header>
                        <Card.Body style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.topProductos} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} style={{fontSize: '12px'}} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="cantidad" fill="#5b5b61ff" name="Unidades" radius={[0, 10, 10, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white fw-bold">Frecuencia de Pedidos por Hora</Card.Header>
                        <Card.Body style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.ventasPorHora}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hora" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="pedidos" stroke="#5b5b61ff" fill="#5b5b61ff" name="Cant. Pedidos" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Dashboard;