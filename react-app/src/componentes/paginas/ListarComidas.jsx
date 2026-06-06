import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Table, Badge, Spinner, ListGroup } from 'react-bootstrap';
import useApiGet from '../../hooks/ApiDietista/useApiGet';

const ListarComidas = () => {
    const [comidas, setComidas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        useApiGet('/comidas')
            .then(data => setComidas(Array.isArray(data) ? data : (data?.data || [])))
            .finally(() => setCargando(false));
    }, []);

    const filtrados = comidas.filter(com => 
        com.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (cargando) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        /* 🎨 GUÍA DE ESTILOS: Contenedor centrado, estrecho y estilizado a 850px de ancho máximo */
        <Container className="py-4 px-3 mx-auto" style={{ maxWidth: '850px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-light-subtle">
                <h4 className="fw-bold text-dark m-0">🍳 Listado de Comidas y Recetas</h4>
                <Badge bg="primary" pill className="px-3 py-2 font-monospace">Platos: {comidas.length}</Badge>
            </div>

            {/* BARRA DE BÚSQUEDA */}
            <div className="mb-4">
                <Form.Control
                    type="text"
                    placeholder="Buscar platos elaborados por nombre..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="shadow-sm py-2 px-3 border-secondary-subtle rounded-3 small"
                />
            </div>

            {/* TABLA DE PLANIFICACIÓN DE COMIDAS */}
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden border-top border-primary border-4 bg-white">
                <div className="table-responsive" style={{ maxHeight: '520px', overflowY: 'auto' }}>
                    <Table hover className="align-middle mb-0 text-center table-sm">
                        <thead className="table-light sticky-top bg-white border-bottom" style={{ zIndex: 1 }}>
                            <tr className="small text-uppercase text-muted" style={{ letterSpacing: '0.5px', fontSize: '11px' }}>
                                {/* Modificamos el ancho a 280px para dar espacio cómodo a la miniatura de imagen */}
                                <th className="text-start ps-4 py-3" style={{ width: '280px' }}>Plato / Menú</th>
                                <th style={{ width: '220px' }}>Macroingredientes Asignados</th>
                                <th className="text-start pe-4">Preparación / Receta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length > 0 ? (
                                filtrados.map(com => (
                                    <tr key={com.id} className="border-bottom" style={{ minHeight: '75px' }}>
                                        
                                        {/* 🔥 MODIFICADO: Integración de la miniatura de la imagen alineada con Flexbox */}
                                        <td className="text-start ps-4 align-top pt-3">
                                            <div className="d-flex align-items-start gap-3">
                                                <img 
                                                    src={com.imagen || 'https://placehold.co/60x60/f8f9fa/6c757d?text=Plato'} 
                                                    alt={com.nombre}
                                                    className="rounded-3 shadow-sm border border-light-subtle object-cover"
                                                    style={{ width: '55px', height: '55px', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.src = 'https://placehold.co/60x60/f8f9fa/6c757d?text=Plato';
                                                    }}
                                                />
                                                <div className="text-truncate">
                                                    <strong className="text-dark d-block text-truncate" style={{ maxWidth: '180px' }}>
                                                        {com.nombre}
                                                    </strong>
                                                    {com.calorias ? (
                                                        <Badge bg="success" className="mt-1">{com.calorias} kcal</Badge>
                                                    ) : (
                                                        <Badge bg="secondary" className="mt-1">0 kcal</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="align-top pt-2">
                                            <ListGroup variant="flush" className="bg-transparent text-start small">
                                                {com.ingredientes && com.ingredientes.length > 0 ? (
                                                    com.ingredientes.map(ing => (
                                                        <ListGroup.Item key={ing.id} className="p-1 border-0 bg-transparent text-secondary" style={{ fontSize: '12px' }}>
                                                            • {ing.nombre} <span className="text-muted font-monospace">({ing.pivot?.cantidad || '0'}{ing.pivot?.unidad || 'g'})</span>
                                                        </ListGroup.Item>
                                                    ))
                                                ) : (
                                                    <span className="text-black-50 small style-italic ps-2 d-block pt-2">Sin ingredientes base.</span>
                                                )}
                                            </ListGroup>
                                        </td>

                                        <td className="text-start text-secondary small text-wrap align-top pt-3 pe-4 style-pre-line" style={{ fontSize: '12px', lineHeight: '1.4', whiteSpace: 'pre-line' }}>
                                            {com.receta || <span className="text-black-50 text-opacity-40 style-italic">Sin instrucciones pautadas de preparación.</span>}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-5 text-muted small">No se hallaron platos configurados en la base de datos.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>
        </Container>
    );
};

export default ListarComidas;