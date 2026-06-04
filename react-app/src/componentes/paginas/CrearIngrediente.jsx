import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import useApiPost from '../../hooks/ApiDietista/useApiPost';

const CrearIngrediente = () => {
    const [ingrediente, setIngrediente] = useState({ nombre: '', calorias: '', proteinas: '', grasas: '', carbohidratos: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const exito = await useApiPost('/ingredientes', ingrediente);
        if (exito) {
            alert("Ingrediente registrado correctamente");
            setIngrediente({ nombre: '', calorias: '', proteinas: '', grasas: '', carbohidratos: '' });
        }
    };

    return (
        <Container className="py-5">
            <Card className="p-4 shadow-sm border-0 rounded-4">
                <h3 className="mb-4 text-success fw-bold">Registrar Nuevo Ingrediente</h3>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre del Ingrediente</Form.Label>
                                <Form.Control value={ingrediente.nombre} onChange={e => setIngrediente({...ingrediente, nombre: e.target.value})} required />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Calorías (por 100g)</Form.Label>
                                <Form.Control type="number" value={ingrediente.calorias} onChange={e => setIngrediente({...ingrediente, calorias: e.target.value})} required />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Proteínas (por 100g)</Form.Label>
                                <Form.Control type="number" value={ingrediente.proteinas} onChange={e => setIngrediente({...ingrediente, proteinas: e.target.value})} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Grasas (por 100g)</Form.Label>
                                <Form.Control type="number" value={ingrediente.grasas} onChange={e => setIngrediente({...ingrediente, grasas: e.target.value})} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Carbohidratos (por 100g)</Form.Label>
                                <Form.Control type="number" value={ingrediente.carbohidratos} onChange={e => setIngrediente({...ingrediente, carbohidratos: e.target.value})} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button type="submit" variant="success" className="w-100 mt-3">Guardar Ingrediente</Button>
                </Form>
            </Card>
        </Container>
    );
};

export default CrearIngrediente;