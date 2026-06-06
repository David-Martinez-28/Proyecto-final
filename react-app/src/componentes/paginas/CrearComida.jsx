import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Form, Button, ListGroup, Row, Col, Table } from 'react-bootstrap';
import useApiGet from '../../hooks/ApiDietista/useApiGet';
// Importamos axios nativo para asegurar que el FormData con archivos binarios no se corrompa
import axios from 'axios';

const CrearComida = () => {
    const [comida, setComida] = useState({ nombre: '', receta: '', ingredientes: [] });
    const [imagen, setImagen] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [catalogo, setCatalogo] = useState([]);
    const [busquedaIngrediente, setBusquedaIngrediente] = useState('');
    const [enviando, setEnviando] = useState(false);
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        useApiGet('/ingredientes').then(data => setCatalogo(data || []));
    }, []);

    const handleImagenChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagen(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const añadirIngrediente = (ing) => {
        if (comida.ingredientes.find(i => i.id === ing.id)) return;
        setComida(prev => ({
            ...prev,
            ingredientes: [...prev.ingredientes, { ...ing, cantidad: '', unidad: 'g' }]
        }));
    };

    const eliminarIngrediente = (id) => {
        setComida(prev => ({
            ...prev,
            ingredientes: prev.ingredientes.filter(i => i.id !== id)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const ingredientesValidos = comida.ingredientes.filter(i => {
            const cant = parseFloat(i.cantidad);
            return !isNaN(cant) && cant > 0;
        });

        if (ingredientesValidos.length === 0) {
            alert("Por favor, introduce una cantidad válida (mayor que 0) para al menos un ingrediente.");
            return;
        }
        
        setEnviando(true);

        const formData = new FormData();
        formData.append('nombre', comida.nombre);
        formData.append('receta', comida.receta);
        
        // Adjuntamos el archivo físico si existe
        if (imagen && imagen instanceof File) {
            formData.append('imagen', imagen);
        }

        const ingredientesFormateados = ingredientesValidos.map(i => ({
            id: i.id,
            cantidad: parseFloat(i.cantidad),
            unidad: i.unidad || 'g'
        }));
        formData.append('ingredientes', JSON.stringify(ingredientesFormateados));

        try {
            const token = localStorage.getItem('token'); 

            // 🚀 PETICIÓN NATIVA: Evitamos intermediarios para que el binario de la imagen viaje real
            const response = await axios.post('http://212.227.178.175/api/comidas', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const res = response.data;

            if (res && res.status === 'error') {
                console.log("ERROR DETALLADO DEL BACKEND:", res);
                alert(`Error en el Servidor:\n\nMensaje: ${res.error_real}`);
                return;
            }

            alert("Comida creada con éxito");
            
            // Reset de estados
            setComida({ nombre: '', receta: '', ingredientes: [] });
            setImagen(null);
            setPreviewUrl('');
            setBusquedaIngrediente('');
            if (fileInputRef.current) fileInputRef.current.value = '';

        } catch (error) {
            console.error("Error completo atrapado en Axios:", error);
            if (error.response && error.response.data) {
                const serverData = error.response.data;
                if (serverData.errors) {
                    const mensajesDeError = Object.values(serverData.errors).flat().join('\n');
                    alert(`Error de validación:\n\n${mensajesDeError}`);
                } else {
                    alert(`Mensaje del servidor: ${serverData.message || "Petición rechazada"}`);
                }
            } else {
                alert("Hubo un error de red o el servidor no respondió.");
            }
        } finally {
            setEnviando(false);
        }
    };

    const catalogoFiltrado = catalogo.filter(ing => 
        ing.nombre.toLowerCase().includes(busquedaIngrediente.toLowerCase())
    );

    return (
        <Container className="py-4 px-3 mx-auto" style={{ maxWidth: '850px' }}>
            <Card className="p-4 shadow-sm border-0 rounded-4 border-top border-primary border-4 bg-white">
                <h3 className="fw-bold text-dark mb-4">🍳 Crear Nueva Comida</h3>
                
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={previewUrl ? 8 : 12}>
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
                        </Col>
                        
                        {previewUrl && (
                            <Col md={4} className="d-flex align-items-center justify-content-center mb-3">
                                <div className="position-relative border rounded-3 p-1 bg-light shadow-sm" style={{ width: '100px', height: '100px' }}>
                                    <img 
                                        src={previewUrl} 
                                        alt="Preview" 
                                        className="w-100 h-100 rounded-2" 
                                        style={{ objectFit: 'cover' }} 
                                    />
                                </div>
                            </Col>
                        )}
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold text-muted">Imagen de la Presentación</Form.Label>
                        <Form.Control 
                            type="file"
                            accept="image/*"
                            onChange={handleImagenChange}
                            ref={fileInputRef}
                            className="border-secondary-subtle file-input"
                        />
                        <Form.Text className="text-muted small">Formatos válidos: JPG, PNG o WebP. (Opcional)</Form.Text>
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
                        <Col md={5}>
                            <h6 className="fw-bold text-secondary mb-2">📋 Catálogo de Alimentos</h6>
                            
                            <Form.Control 
                                type="text"
                                size="sm"
                                placeholder="🔍 Buscar ingrediente..."
                                value={busquedaIngrediente}
                                onChange={e => setBusquedaIngrediente(e.target.value)}
                                className="mb-2 border-secondary-subtle shadow-none small"
                            />

                            <ListGroup className="rounded-3 shadow-sm border border-light-subtle" style={{ maxHeight: '210px', overflowY: 'auto' }}>
                                {catalogoFiltrado.length === 0 ? (
                                    <ListGroup.Item className="text-muted small text-center py-3">No se encontraron ingredientes</ListGroup.Item>
                                ) : (
                                    catalogoFiltrado.map(ing => (
                                        <ListGroup.Item 
                                            key={ing.id} 
                                            action 
                                            type="button"
                                            onClick={() => añadirIngrediente(ing)}
                                            className="small fw-medium py-2"
                                        >
                                            ➕ {ing.nombre}
                                        </ListGroup.Item>
                                    ))
                                )}
                            </ListGroup>
                            <Form.Text className="text-muted small d-block mt-1">Pulsa en un ingrediente para añadirlo.</Form.Text>
                        </Col>

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
                                                        <Form.Control 
                                                            type="number" 
                                                            size="sm" 
                                                            placeholder="0"
                                                            min="0.1"
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
                                                            type="button"
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
                    
                    <Button type="submit" variant="success" className="w-100 mt-2 fw-bold py-2 shadow-sm" disabled={enviando}>
                        {enviando ? 'Guardando composición...' : 'Guardar y Publicar Comida'}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default CrearComida;