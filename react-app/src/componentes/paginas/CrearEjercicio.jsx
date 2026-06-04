import React, { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import useApiPost from '../../hooks/ApiDietista/useApiPost';

const CrearEjercicio = () => {
    const [ejercicio, setEjercicio] = useState({ nombre: '', descripcion: '', grupo_muscular: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const exito = await useApiPost('/ejercicios', ejercicio);
        if (exito) {
            alert("Ejercicio registrado exitosamente");
            setEjercicio({ nombre: '', descripcion: '', grupo_muscular: '' });
        }
    };

    return (
        <Container className="py-5">
            <Card className="p-4 shadow-sm border-0 rounded-4">
                <h3 className="mb-4 text-danger fw-bold">Registrar Nuevo Ejercicio</h3>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre del Ejercicio</Form.Label>
                        <Form.Control value={ejercicio.nombre} onChange={e => setEjercicio({...ejercicio, nombre: e.target.value})} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Grupo Muscular</Form.Label>
                        <Form.Control value={ejercicio.grupo_muscular} onChange={e => setEjercicio({...ejercicio, grupo_muscular: e.target.value})} placeholder="Ej. Pecho, Espalda, Pierna" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Descripción técnica</Form.Label>
                        <Form.Control as="textarea" rows={3} value={ejercicio.descripcion} onChange={e => setEjercicio({...ejercicio, descripcion: e.target.value})} />
                    </Form.Group>
                    <Button type="submit" variant="danger" className="w-100">Guardar Ejercicio</Button>
                </Form>
            </Card>
        </Container>
    );
};

export default CrearEjercicio;