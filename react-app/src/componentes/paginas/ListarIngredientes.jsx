import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Table, Badge, Spinner } from 'react-bootstrap';
import useApiGet from '../../hooks/ApiDietista/useApiGet';

const ListarIngredientes = () => {
    const [ingredientes, setIngredientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        useApiGet('/ingredientes')
            .then(data => setIngredientes(Array.isArray(data) ? data : (data?.data || [])))
            .finally(() => setCargando(false));
    }, []);

    const filtrados = ingredientes.filter(ing => 
        ing.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    console.log("Ingredientes obtenidos de la API:", ingredientes);
    if (cargando) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container className="py-4 px-3 mx-auto" style={{ maxWidth: '850px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-light-subtle">
                <h4 className="fw-bold text-dark m-0">🥝 Tabla de Alimentos e Ingredientes</h4>
                <Badge bg="success" pill className="px-3 py-2 font-monospace">Valores por 100g</Badge>
            </div>

            <div className="mb-4">
                <Form.Control
                    type="text"
                    placeholder="Filtrar por nombre de alimento..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="shadow-sm py-2 px-3 border-secondary-subtle rounded-3 small"
                />
            </div>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden border-top border-primary border-4 bg-white">
                <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <Table hover className="align-middle mb-0 text-center text-nowrap table-sm">
                        <thead className="table-light sticky-top bg-white border-bottom" style={{ zIndex: 1 }}>
                            <tr className="small text-uppercase text-muted" style={{ letterSpacing: '0.5px', fontSize: '11px' }}>
                                <th className="text-start ps-4 py-3">Alimento</th>
                                <th>Calorías</th>
                                <th>Proteínas</th>
                                <th>Grasas</th>
                                <th className="pe-4">Carbos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length > 0 ? (
                                filtrados.map(ing => (
                                    <tr key={ing.id} style={{ height: '55px' }}>
                                        <td className="text-start ps-4 fw-bold text-dark">{ing.nombre}</td>
                                        <td><Badge bg="dark" className="bg-opacity-75 font-monospace">{ing.calorias} kcal</Badge></td>
                                        <td className="fw-semibold text-success">{ing.proteinas ? `${ing.proteinas}g` : '-'}</td>
                                        <td className="fw-semibold text-danger">{ing.grasas ? `${ing.grasas}g` : '-'}</td>
                                        <td className="fw-semibold text-primary pe-4">{ing.carbohidratos ? `${ing.carbohidratos}g` : '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted small">No hay alimentos registrados con ese nombre.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>
        </Container>
    );
};

export default ListarIngredientes;