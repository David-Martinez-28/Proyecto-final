import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Table, Badge, Spinner, Button } from 'react-bootstrap';
import useApiGet from '../../hooks/ApiDietista/useApiGet';

const ListarEjercicios = () => {
    const [ejercicios, setEjercicios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        useApiGet('/ejercicios')
            .then(data => setEjercicios(Array.isArray(data) ? data : (data?.data || [])))
            .finally(() => setCargando(false));
    }, []);

    const filtrados = ejercicios.filter(ej => 
        ej.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        ej.grupo_muscular.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (cargando) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container className="py-4 px-3 mx-auto" style={{ maxWidth: '850px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-light-subtle">
                <h4 className="fw-bold text-dark m-0">💪 Catálogo de Ejercicios</h4>
                <Badge bg="primary" pill className="px-3 py-2 font-monospace">Total: {ejercicios.length}</Badge>
            </div>

            <div className="mb-4">
                <Form.Control
                    type="text"
                    placeholder="Buscar por ejercicio o grupo muscular..."
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
                                <th className="text-start ps-4 py-3">Movimiento</th>
                                <th>Grupo Muscular</th>
                                <th className="text-start">Descripción Técnica</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length > 0 ? (
                                filtrados.map(ej => (
                                    <tr key={ej.id} style={{ minHeight: '60px' }}>
                                        <td className="text-start ps-4 fw-bold text-dark">{ej.nombre}</td>
                                        <td>
                                            <Badge bg="light" text="primary" className="px-2 py-1 border border-primary-subtle rounded-pill" style={{ fontSize: '11px' }}>
                                                {ej.grupo_muscular}
                                            </Badge>
                                        </td>
                                        <td className="text-start text-muted small text-wrap pe-4 py-2" style={{ maxWidth: '300px', fontSize: '12px', lineHeight: '1.4' }}>
                                            {ej.descripcion || <span className="text-black-50 style-italic">Sin descripción guardada.</span>}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-5 text-muted small">No se encontraron ejercicios en el catálogo.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>
        </Container>
    );
};

export default ListarEjercicios;