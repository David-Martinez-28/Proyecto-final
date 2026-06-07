import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Table, Badge, Spinner, Button, Modal } from 'react-bootstrap';
import useApiGet from '../../hooks/ApiDietista/useApiGet';
import axios from 'axios';

const ListarIngredientes = () => {
    // Estados para almacenar los ingredientes, el estado de carga, la búsqueda y el ingrediente activo para edición/eliminación
    const [ingredientes, setIngredientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    // Estados para modales
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [ingredienteActivo, setIngredienteActivo] = useState(null);
    // Función para cargar ingredientes desde el backend
    const cargarIngredientes = () => {
        useApiGet('/ingredientes')
            .then(data => setIngredientes(Array.isArray(data) ? data : (data?.data || [])))
            .finally(() => setCargando(false));
    };
    // Cargar ingredientes al montar el componente
    useEffect(() => { cargarIngredientes(); }, []);
    // Filtrar ingredientes según la búsqueda, comparando el nombre del ingrediente con el texto ingresado en el campo de búsqueda
    const filtrados = ingredientes.filter(ing =>
        ing.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (cargando) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container className="py-4 px-3 mx-auto" style={{ maxWidth: '900px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-light-subtle">
                <h4 className="fw-bold text-dark m-0">🥝 Catálogo de Ingredientes</h4>
                <Badge bg="success" pill className="px-3 py-2 font-monospace">Total: {ingredientes.length}</Badge>
            </div>

            <div className="mb-4">
                <Form.Control
                    type="text" placeholder="Filtrar por nombre..." value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="shadow-sm py-2 px-3 border-secondary-subtle rounded-3"
                />
            </div>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden border-top border-primary border-4">
                <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <Table hover className="align-middle mb-0 text-center">
                        <thead className="table-light">
                            <tr className="small text-uppercase text-muted">
                                <th className="text-start ps-4 py-3">Nombre</th>
                                <th>Kcal</th>
                                <th>Prot</th>
                                <th>Gras</th>
                                <th>Carb</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length > 0 ? (
                                filtrados.map(ing => (
                                    <tr key={ing.id}>
                                        <td className="text-start ps-4 fw-bold">{ing.nombre}</td>
                                        <td><Badge bg="dark" className="bg-opacity-50">{ing.calorias}</Badge></td>
                                        <td className="text-success">{ing.proteinas}g</td>
                                        <td className="text-danger">{ing.grasas}g</td>
                                        <td className="text-primary">{ing.carbohidratos}g</td>
                                        <td>
                                            <Button variant="link" className="p-0 text-primary me-2" onClick={() => { setIngredienteActivo(ing); setShowEdit(true); }}>✎</Button>
                                            <Button variant="link" className="p-0 text-danger" onClick={() => { setIngredienteActivo(ing); setShowDelete(true); }}>🗑</Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                // 🚨 Único añadido: Fila con el mensaje de aviso si no hay ingredientes
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        <div className="d-flex flex-column align-items-center">
                                            <span className="fs-2 mb-2">🔍</span>
                                            <p className="mb-0 fw-semibold">No se encontraron ingredientes en el catálogo.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            <ModalEditar show={showEdit} onHide={() => setShowEdit(false)} ingrediente={ingredienteActivo} onUpdate={cargarIngredientes} />
            <ModalEliminar show={showDelete} onHide={() => setShowDelete(false)} ingrediente={ingredienteActivo} onUpdate={cargarIngredientes} />
        </Container>
    );
};

// --- MODAL EDITAR ---
const ModalEditar = ({ show, onHide, ingrediente, onUpdate }) => {
    // Estado para manejar el formulario de edición, cargando los datos del ingrediente seleccionado
    const [form, setForm] = useState({ nombre: '', calorias: '', proteinas: '', grasas: '', carbohidratos: '' });
    // Cargar datos del ingrediente seleccionado en el formulario al abrir el modal
    useEffect(() => { if (ingrediente) setForm(ingrediente); }, [ingrediente]);
    // Función para manejar el guardado de los cambios en el ingrediente
    const handleSave = async () => {
        await axios.put(`http://212.227.178.175/api/ingredientes/${ingrediente.id}`, form, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        onUpdate(); onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Editar: {form.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Nombre del Alimento</Form.Label>
                    <Form.Control
                        value={form.nombre}
                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Calorías (kcal)</Form.Label>
                    <Form.Control
                        type="number"
                        value={form.calorias}
                        onChange={e => setForm({ ...form, calorias: e.target.value })}
                    />
                </Form.Group>

                <div className="d-flex gap-2">
                    <Form.Group className="mb-3 flex-fill">
                        <Form.Label className="small fw-bold text-muted">Proteínas (g)</Form.Label>
                        <Form.Control
                            type="number"
                            value={form.proteinas}
                            onChange={e => setForm({ ...form, proteinas: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 flex-fill">
                        <Form.Label className="small fw-bold text-muted">Grasas (g)</Form.Label>
                        <Form.Control
                            type="number"
                            value={form.grasas}
                            onChange={e => setForm({ ...form, grasas: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 flex-fill">
                        <Form.Label className="small fw-bold text-muted">Carbos (g)</Form.Label>
                        <Form.Control
                            type="number"
                            value={form.carbohidratos}
                            onChange={e => setForm({ ...form, carbohidratos: e.target.value })}
                        />
                    </Form.Group>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="primary" onClick={handleSave}>Guardar Cambios</Button>
            </Modal.Footer>
        </Modal>
    );
};

// --- MODAL ELIMINAR ---
const ModalEliminar = ({ show, onHide, ingrediente, onUpdate }) => {
    // Función para eliminar el ingrediente seleccionado, haciendo una petición DELETE al backend
    const eliminar = async () => {
        await axios.delete(`http://212.227.178.175/api/ingredientes/${ingrediente.id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        onUpdate(); onHide();
    };
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton><Modal.Title>¿Eliminar alimento?</Modal.Title></Modal.Header>
            <Modal.Body>Esta acción no se puede deshacer.</Modal.Body>
            <Modal.Footer><Button variant="danger" onClick={eliminar}>Confirmar</Button></Modal.Footer>
        </Modal>
    );
};

export default ListarIngredientes;