import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import useApiPost from '../../hooks/ApiDietista/useApiPost';

const CrearIngrediente = () => {
    // Estado para almacenar los datos del nuevo ingrediente
    const [ingrediente, setIngrediente] = useState({ nombre: '', calorias: '', proteinas: '', grasas: '', carbohidratos: '' });
    const [enviando, setEnviando] = useState(false);
    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);

        try {
            const exito = await useApiPost('/ingredientes', ingrediente);
            if (exito) {
                alert("Ingrediente registrado correctamente");
                setIngrediente({ nombre: '', calorias: '', proteinas: '', grasas: '', carbohidratos: '' });
            }
        } catch (error) {
            console.error("Error al registrar ingrediente:", error);
            alert("Hubo un error al guardar el ingrediente. Revisa los campos.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        /* 🎨 GUÍA DE ESTILOS: Contenedor centrado, estrecho y estilizado a 850px de ancho máximo */
        <Container className="py-4 px-3 mx-auto" style={{ maxWidth: '850px' }}>
            <Card className="p-4 shadow-sm border-0 rounded-4 border-top border-primary border-4 bg-white">
                <h3 className="fw-bold text-dark mb-4">🥝 Registrar Nuevo Ingrediente</h3>
                
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        {/* El campo del nombre destaca ocupando todo el ancho de la primera fila */}
                        <Col xs={12}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold text-muted">Nombre del Ingrediente / Alimento</Form.Label>
                                <Form.Control 
                                    placeholder="Ej: Pechuga de Pavo"
                                    value={ingrediente.nombre} 
                                    onChange={e => setIngrediente({...ingrediente, nombre: e.target.value})} 
                                    required 
                                    className="border-secondary-subtle py-2"
                                />
                            </Form.Group>
                        </Col>
                        
                        <Col xs={12} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold text-muted">Calorías (kcal por 100g)</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    step="any"
                                    placeholder="Ej: 145"
                                    value={ingrediente.calorias} 
                                    onChange={e => setIngrediente({...ingrediente, calorias: e.target.value})} 
                                    required 
                                    className="border-secondary-subtle py-2"
                                />
                            </Form.Group>
                        </Col>
                        
                        <Col xs={12} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold text-muted">Proteínas (g por 100g)</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    step="any"
                                    placeholder="Ej: 24.1"
                                    value={ingrediente.proteinas} 
                                    onChange={e => setIngrediente({...ingrediente, proteinas: e.target.value})} 
                                    className="border-secondary-subtle py-2"
                                />
                            </Form.Group>
                        </Col>
                        
                        <Col xs={12} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold text-muted">Grasas Totales (g por 100g)</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    step="any"
                                    placeholder="Ej: 1.2"
                                    value={ingrediente.grasas} 
                                    onChange={e => setIngrediente({...ingrediente, grasas: e.target.value})} 
                                    className="border-secondary-subtle py-2"
                                />
                            </Form.Group>
                        </Col>
                        
                        <Col xs={12} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold text-muted">Carbohidratos (g por 100g)</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    step="any"
                                    placeholder="Ej: 0.5"
                                    value={ingrediente.carbohidratos} 
                                    onChange={e => setIngrediente({...ingrediente, carbohidratos: e.target.value})} 
                                    className="border-secondary-subtle py-2"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Botón en Verde Secundario para las acciones finales de confirmación con Spinner integrado */}
                    <Button 
                        type="submit" 
                        variant="success" 
                        className="w-100 mt-4 fw-bold py-2 shadow-sm" 
                        disabled={enviando || !ingrediente.nombre || !ingrediente.calorias}
                    >
                        {enviando ? (
                            <>
                                <Spinner size="sm" animation="border" className="me-2" />
                                Añadiendo a la base de datos nutricional...
                            </>
                        ) : 'Guardar e Indexar Ingrediente'}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default CrearIngrediente;