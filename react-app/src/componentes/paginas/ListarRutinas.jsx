import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Table, Badge, Spinner, ListGroup } from 'react-bootstrap';
import useApiGet from '../../hooks/ApiDietista/useApiGet';

const ListarRutinas = () => {
    const [rutinas, setRutinas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        useApiGet('/rutinas')
            .then(data => setRutinas(Array.isArray(data) ? data : (data?.data || [])))
            .finally(() => setCargando(false));
    }, []);

    const filtradas = rutinas.filter(rut => 
        rut.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (cargando) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container className="py-4 px-3 mx-auto" style={{ maxWidth: '850px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-light-subtle">
                <h4 className="fw-bold text-dark m-0">🏋️ Fichas de Rutinas y Entrenamientos</h4>
                <Badge bg="primary" pill className="px-3 py-2 font-monospace">Sistemas: {rutinas.length}</Badge>
            </div>

            <div className="mb-4">
                <Form.Control
                    type="text"
                    placeholder="Filtrar por nombre de la tabla de ejercicios..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="shadow-sm py-2 px-3 border-secondary-subtle rounded-3 small"
                />
            </div>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden border-top border-primary border-4 bg-white">
                <div className="table-responsive" style={{ maxHeight: '520px', overflowY: 'auto' }}>
                    <Table hover className="align-middle mb-0 text-center table-sm">
                        <thead className="table-light sticky-top bg-white border-bottom" style={{ zIndex: 1 }}>
                            <tr className="small text-uppercase text-muted" style={{ letterSpacing: '0.5px', fontSize: '11px' }}>
                                <th className="text-start ps-4 py-3" style={{ width: '250px' }}>Estructura / Bloque</th>
                                <th className="text-start pe-4">Ejercicios Indexados y Secuencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtradas.length > 0 ? (
                                filtradas.map(rut => (
                                    <tr key={rut.id} className="border-bottom" style={{ minHeight: '65px' }}>
                                        <td className="text-start ps-4 align-top pt-3">
                                            <strong className="text-dark fs-6">{rut.nombre}</strong>
                                            
                                        </td>
                                        <td className="pe-4 py-3">
                                            <div className="d-flex flex-wrap gap-2">
                                                {rut.ejercicios && rut.ejercicios.length === 0 ? (
                                                    <span className="text-black-50 small style-italic">Sin movimientos vinculados a este bloque.</span>
                                                ) : (
                                                    rut.ejercicios?.map((ej, index) => (
                                                        <Badge 
                                                            key={ej.id} 
                                                            bg="light" 
                                                            text="dark" 
                                                            className="p-2 border border-light-subtle d-inline-flex align-items-center gap-1 text-start"
                                                            style={{ fontSize: '11px', fontWeight: '500' }}
                                                        >
                                                            <span className="text-primary fw-bold font-monospace me-1">{index + 1}.</span> 
                                                            {ej.nombre} 
                                                            <span className="text-muted ms-1" style={{ fontSize: '9px' }}>({ej.grupo_muscular})</span>
                                                        </Badge>
                                                    ))
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" className="text-center py-5 text-muted small">No se encontraron rutinas de gimnasio parametrizadas.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>
        </Container>
    );
};

export default ListarRutinas;