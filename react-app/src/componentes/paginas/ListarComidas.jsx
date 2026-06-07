import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Spinner, Button, Modal, Form } from 'react-bootstrap';
import useApiGet from '../../hooks/ApiDietista/useApiGet';
import axios from 'axios';


const ListarComidas = () => {
    // Estados para almacenar las comidas, el estado de carga, la búsqueda y el ID del dietista para permisos
    const [comidas, setComidas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [miDietistaId, setMiDietistaId] = useState(null);
    

    // Estados de control para modales de vista, edición y eliminación
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showView, setShowView] = useState(false);
    const [comidaActiva, setComidaActiva] = useState(null);
    
    const cargarComidas = () => {
        useApiGet('/comidas')
            .then(data => setComidas(Array.isArray(data) ? data : (data?.data || [])))
            .finally(() => setCargando(false));
    };
    // Cargar datos y perfil del usuario
    useEffect(() => {
        const iniciar = async () => {
            try {
                // 1. Obtener ID del perfil desde el backend
                const perfilRes = await axios.get('http://212.227.178.175/api/me', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                // Ajusta esta ruta según la estructura de tu respuesta (ej: res.data.id o res.data.dietista.id)
                setMiDietistaId(perfilRes.data.id);

                // 2. Cargar comidas
                cargarComidas();
            } catch (err) {
                console.error("Error al obtener perfil", err);
                setCargando(false);
            }
        };
        iniciar();
    }, []);
    // Filtrado de comidas según la búsqueda
    const filtrados = comidas.filter(com => 
        com.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    // Renderizado condicional para mostrar spinner mientras se cargan los datos
    if (cargando) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container className="py-4 px-3 mx-auto" style={{ maxWidth: '950px' }}>
            <h4 className="fw-bold mb-4">🍳 Listado de Comidas</h4>
            <Form.Control className="mb-4" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Table hover className="align-middle mb-0">
                    <thead className="table-light small">
                        <tr>
                            <th className="ps-4">Plato</th>
                            <th>Ingredientes</th>
                            <th className="text-end pe-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtrados.length > 0 ? (
                            filtrados.map(com => (
                                <tr key={com.id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <img src={com.imagen} style={{width: 60, height: 60, objectFit: 'cover', borderRadius: '8px'}} />
                                            <strong>{com.nombre}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <ul className="list-unstyled mb-0 small">
                                            {com.ingredientes?.map(ing => (
                                                <li key={ing.id} className="text-secondary">• {ing.nombre}</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button variant="link" className="p-0 text-secondary me-3" onClick={() => { setComidaActiva(com); setShowView(true); }}>👁</Button>
                                        
                                        {/* Comparación numérica segura */}
                                        {Number(com.dietista_id) === Number(miDietistaId) ? (
                                            <>
                                                <Button variant="link" className="p-0 text-primary me-2" onClick={() => { setComidaActiva(com); setShowEdit(true); }}>✎</Button>
                                                <Button variant="link" className="p-0 text-danger" onClick={() => { setComidaActiva(com); setShowDelete(true); }}>🗑</Button>
                                            </>
                                        ) : (
                                            <Badge bg="light" text="dark">Solo lectura</Badge>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            // 🚨 MODIFICADO: Fila con el mensaje de aviso si la lista o el filtro se quedan vacíos
                            <tr>
                                <td colSpan="3" className="text-center py-5 text-muted">
                                    <div className="d-flex flex-column align-items-center">
                                        <span className="fs-2 mb-2">🍳</span>
                                        <p className="mb-0 fw-semibold">No se encontraron comidas registradas.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>

            <ModalVer show={showView} onHide={() => setShowView(false)} comida={comidaActiva} />
            <ModalEditar show={showEdit} onHide={() => setShowEdit(false)} comida={comidaActiva} onUpdate={cargarComidas} />
            <ModalEliminar show={showDelete} onHide={() => setShowDelete(false)} comida={comidaActiva} onUpdate={cargarComidas} />
        </Container>
    );
};

const ModalVer = ({ show, onHide, comida }) => {
    // Calculamos los totales sumando lo que aporta cada ingrediente
    // Nota: dividimos por 100 porque los valores del ingrediente suelen ser por cada 100g
    const calcularTotal = (campo) => {
        if (!comida?.ingredientes) return 0;
        return comida.ingredientes.reduce((sum, ing) => {
            const valorPorGramo = parseFloat(ing[campo] || 0) / 100;
            const cantidad = parseFloat(ing.pivot?.cantidad || 0);
            return sum + (valorPorGramo * cantidad);
        }, 0).toFixed(1);
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{comida?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {comida && (
                    <>
                        <img 
                            src={comida.imagen} 
                            className="img-fluid rounded mb-3 w-100" 
                            style={{ maxHeight: '300px', objectFit: 'cover' }} 
                            alt={comida.nombre}
                        />

                        {/* Totales calculados */}
                        <div className="d-flex justify-content-between bg-light p-3 rounded mb-3 text-center">
                            <div>
                                <small className="d-block text-muted">Proteínas</small>
                                <strong className="text-primary">{calcularTotal('proteinas')}g</strong>
                            </div>
                            <div>
                                <small className="d-block text-muted">Grasas</small>
                                <strong className="text-warning">{calcularTotal('grasas')}g</strong>
                            </div>
                            <div>
                                <small className="d-block text-muted">Carbos</small>
                                <strong className="text-success">{calcularTotal('carbohidratos')}g</strong>
                            </div>
                            <div>
                                <small className="d-block text-muted">Kcal Totales</small>
                                <strong className="text-danger">{calcularTotal('calorias')}</strong>
                            </div>
                        </div>

                        <h5>Receta</h5>
                        <p>{comida.receta || 'Sin receta.'}</p>
                        
                        <h5>Ingredientes</h5>
                        <ul>
                            {comida.ingredientes?.map(ing => (
                                <li key={ing.id}>
                                    {ing.nombre}: {ing.pivot?.cantidad} {ing.pivot?.unidad} 
                                    <span className="text-muted small"> ({ing.proteinas}g Prot / 100g)</span>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

// --- MODAL EDITAR ---
const ModalEditar = ({ show, onHide, comida, onUpdate }) => {
    const [form, setForm] = useState({ nombre: '', receta: '', imagen: null, ingredientes: [] });

    useEffect(() => {
        if (comida) setForm({ 
            nombre: comida.nombre, receta: comida.receta || '', imagen: null,
            ingredientes: comida.ingredientes.map(ing => ({
                id: ing.id, nombre: ing.nombre, cantidad: ing.pivot?.cantidad || 0, unidad: ing.pivot?.unidad || 'g'
            }))
        });
    }, [comida]);

    const handleSave = async () => {
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('nombre', form.nombre);
        formData.append('receta', form.receta);
        formData.append('ingredientes', JSON.stringify(form.ingredientes));
        if (form.imagen) formData.append('imagen', form.imagen);

        await axios.post(`http://212.227.178.175/api/comidas/${comida.id}`, formData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        onUpdate(); onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton><Modal.Title>Editar {comida?.nombre}</Modal.Title></Modal.Header>
            <Modal.Body>
                <Form.Control className="mb-3" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                <Form.Control as="textarea" rows={3} className="mb-3" value={form.receta} onChange={e => setForm({...form, receta: e.target.value})} />
                <Form.Control type="file" onChange={e => setForm({...form, imagen: e.target.files[0]})} />
            </Modal.Body>
            <Modal.Footer><Button onClick={handleSave}>Guardar Cambios</Button></Modal.Footer>
        </Modal>
    );
};

// --- MODAL ELIMINAR ---
const ModalEliminar = ({ show, onHide, comida, onUpdate }) => {
    const eliminar = async () => {
        await axios.delete(`http://212.227.178.175/api/comidas/${comida.id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        onUpdate(); onHide();
    };
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton><Modal.Title>¿Eliminar?</Modal.Title></Modal.Header>
            <Modal.Body>Esta acción es irreversible.</Modal.Body>
            <Modal.Footer><Button variant="danger" onClick={eliminar}>Eliminar</Button></Modal.Footer>
        </Modal>
    );
};

export default ListarComidas;