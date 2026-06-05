import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, ListGroup, Row, Col, Table } from 'react-bootstrap';
import useApiGet from '../../hooks/ApiDietista/useApiGet';
import useApiPost from '../../hooks/ApiDietista/useApiPost';

const CrearComida = () => {
    // 1. Estado local: nada se guarda en BD hasta que pulsamos el botón
    const [comida, setComida] = useState({ nombre: '', receta: '', ingredientes: [] });
    const [catalogo, setCatalogo] = useState([]);
    const [enviando, setEnviando] = useState(false);

    // 2. Carga inicial del catálogo de ingredientes
    useEffect(() => {
        useApiGet('/ingredientes').then(data => setCatalogo(data || []));
    }, []);

    // 3. SOLO gestiona el estado (Sin llamadas a API)
    const añadirIngrediente = (ing) => {
        if (comida.ingredientes.find(i => i.id === ing.id)) return;
        setComida(prev => ({
            ...prev,
            ingredientes: [...prev.ingredientes, { ...ing, cantidad: '', unidad: 'g' }]
        }));
    };

    // Permite al dietista quitar un ingrediente de la tabla de preparación antes de enviar
    const eliminarIngrediente = (id) => {
        setComida(prev => ({
            ...prev,
            ingredientes: prev.ingredientes.filter(i => i.id !== id)
        }));
    };

    // 4. Acción exclusiva del botón (Aquí se envía todo de golpe)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (comida.ingredientes.length === 0) {
            alert("Por favor, añade al menos un ingrediente a la receta.");
            return;
        }
        
        setEnviando(true);

        // Limpieza de datos antes de enviar
        const payload = {
            nombre: comida.nombre,
            receta: comida.receta,
            ingredientes: comida.ingredientes.map(i => ({
                id: i.id,
                cantidad: parseFloat(i.cantidad) || 0,
                unidad: i.unidad
            }))
        };

        try {
            await useApiPost('/comidas', payload);
            alert("Comida creada con éxito");
            setComida({ nombre: '', receta: '', ingredientes: [] });
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Hubo un error al guardar la comida. Revisa la consola.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        /* 🔥 GUÍA DE ESTILOS: Contenedor estrecho, centrado y estilizado a 850px de ancho máximo */
        <Container className="py-4 px-3 mx-auto" style={{ maxWidth: '850px' }}>
            <Card className="p-4 shadow-sm border-0 rounded-4 border-top border-primary border-4 bg-white">
                <h3 className="fw-bold text-dark mb-4">🍳 Crear Nueva Comida</h3>
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold text-muted">Nombre del Plato</Form.Label>
                        <Form.Control 
                            placeholder="Ej: Ensalada de Pollo con Aguacate" 
                            value={comida.nombre} 
                            onChange={e => setComida({...comida, nombre: e.target.value})} 
                            required 
                            className="border-secondary-subtle py-2" 
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="small fw-semibold text-muted">Modo de Preparación / Receta</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={4}
                            placeholder="Describe paso a paso la elaboración del plato culinario..." 
                            value={comida.receta} 
                            onChange={e => setComida({...comida, receta: e.target.value})} 
                            className="border-secondary-subtle"
                        />
                    </Form.Group>

                    <Row className="g-4 mb-4">
                        {/* COLUMNA CATÁLOGO DE INGREDIENTES */}
                        <Col md={5}>
                            <h6 className="fw-bold text-secondary mb-2">📋 Catálogo de Alimentos</h6>
                            <ListGroup className="rounded-3 shadow-sm border border-light-subtle" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                {catalogo.length === 0 ? (
                                    <ListGroup.Item className="text-muted small text-center py-3">No hay ingredientes cargados</ListGroup.Item>
                                ) : (
                                    catalogo.map(ing => (
                                        <ListGroup.Item 
                                            key={ing.id} 
                                            action 
                                            onClick={() => añadirIngrediente(ing)}
                                            className="small fw-medium py-2"
                                        >
                                            ➕ {ing.nombre}
                                        </ListGroup.Item>
                                    ))
                                )}
                            </ListGroup>
                            <Form.Text className="text-muted small d-block mt-1">Pulsa en un ingrediente para añadirlo a la combinación.</Form.Text>
                        </Col>

                        {/* COLUMNA TABLA DE FORMULACIÓN */}
                        <Col md={7}>
                            <h6 className="fw-bold text-secondary mb-2">⚖️ Proporciones de la Receta</h6>
                            <div className="table-responsive rounded-3 border border-light-subtle" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                <Table hover className="mb-0 text-center align-middle table-sm small">
                                    <thead className="table-light border-bottom">
                                        <tr style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6c757d' }}>
                                            <th className="text-start ps-3 py-2">Ingrediente</th>
                                            <th style={{ width: '90px' }}>Cant.</th>
                                            <th style={{ width: '80px' }}>Unid.</th>
                                            <th style={{ width: '40px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comida.ingredientes.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-5 text-muted text-center bg-light bg-opacity-25 small">
                                                    No has añadido ingredientes a esta comida todavía.
                                                </td>
                                            </tr>
                                        ) : (
                                            comida.ingredientes.map((ing, idx) => (
                                                <tr key={ing.id} style={{ height: '50px' }}>
                                                    <td className="text-start ps-3 fw-bold text-dark text-truncate" style={{ maxWidth: '140px' }}>{ing.nombre}</td>
                                                    <td>
                                                        {/* 🔥 CORREGIDO: Se enlaza value={ing.cantidad} para evitar inputs huérfanos */}
                                                        <Form.Control 
                                                            type="number" 
                                                            size="sm" 
                                                            placeholder="0"
                                                            min="0"
                                                            step="any"
                                                            value={ing.cantidad}
                                                            onChange={e => {
                                                                const nuevos = [...comida.ingredientes];
                                                                nuevos[idx].cantidad = e.target.value;
                                                                setComida({...comida, ingredientes: nuevos});
                                                            }} 
                                                            required
                                                            className="border-secondary-subtle text-center shadow-none"
                                                        />
                                                    </td>
                                                    <td>
                                                        <Form.Control 
                                                            size="sm" 
                                                            value={ing.unidad} 
                                                            onChange={e => {
                                                                const nuevos = [...comida.ingredientes];
                                                                nuevos[idx].unidad = e.target.value;
                                                                setComida({...comida, ingredientes: nuevos});
                                                            }} 
                                                            required
                                                            className="border-secondary-subtle text-center shadow-none"
                                                        />
                                                    </td>
                                                    <td className="pe-2">
                                                        <Button 
                                                            variant="link" 
                                                            className="text-danger p-0 shadow-none text-decoration-none fw-bold small"
                                                            onClick={() => eliminarIngrediente(ing.id)}
                                                        >
                                                            ✖
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Col>
                    </Row>
                    
                    {/* Botón en Verde Secundario para acciones de envío exitosas */}
                    <Button type="submit" variant="success" className="w-100 mt-2 fw-bold py-2 shadow-sm" disabled={enviando}>
                        {enviando ? 'Guardando composición...' : 'Guardar y Publicar Comida'}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default CrearComida;