import { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Card } from 'react-bootstrap';

function Historial() {
    const [jornadas, setJornadas] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/negocio/jornadas')
            .then(res => res.json())
            .then(data => setJornadas(data))
            .catch(err => console.error(err));
    }, []);

    const descargarPDF = (id) => {
        fetch(`http://localhost:8080/api/negocio/jornada/${id}/reporte`)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Reporte_Caja_${id}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch(() => alert("Error al descargar"));
    };

    return (
        <Container className="mt-4">
            <h2 className="mb-4 fw-bold">Historial de Cierres de Caja</h2>
            
            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    <Table hover responsive className="m-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th>ID</th>
                                <th>Apertura</th>
                                <th>Cierre</th>
                                <th>Estado</th>
                                <th className="text-end">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jornadas.map(j => (
                                <tr key={j.id}>
                                    <td>#{j.id}</td>
                                    <td>{new Date(j.fechaInicio).toLocaleString()}</td>
                                    <td>
                                        {j.fechaFin 
                                            ? new Date(j.fechaFin).toLocaleString() 
                                            : '-'}
                                    </td>
                                    <td>
                                        {j.abierta 
                                            ? <Badge bg="success">ABIERTA AHORA</Badge> 
                                            : <Badge bg="secondary">CERRADA</Badge>
                                        }
                                    </td>
                                    <td className="text-end">
                                        <Button variant="outline-dark" size="sm" onClick={() => descargarPDF(j.id)}>
                                            Descargar PDF
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Historial;