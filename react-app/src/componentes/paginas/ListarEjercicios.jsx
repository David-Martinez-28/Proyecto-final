import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Spinner, Button, Modal, Form } from 'react-bootstrap';
import useApiGet from '../../hooks/ApiDietista/useApiGet';
import axios from 'axios';

const ListarEjercicios = () => {
    // Estados para almacenar ejercicios, estado de carga, control de modales y ejercicio activo para edición/eliminación
    const [ejercicios, setEjercicios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [ejercicioActivo, setEjercicioActivo] = useState(null);
    // Función para cargar ejercicios desde el backend
    const cargarEjercicios = () => {
        useApiGet('/ejercicios').then(data => {
            setEjercicios(Array.isArray(data) ? data : (data?.data || []));
            setCargando(false);
        });
    };
    // Cargar ejercicios al montar el componente
    useEffect(() => { cargarEjercicios(); }, []);
    // Renderizado condicional para mostrar spinner mientras se cargan los datos
    if (cargando) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <Container className="py-4" style={{ maxWidth: '900px' }}>
            <h4 className="fw-bold mb-4">💪 Catálogo de Ejercicios</h4>
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Table hover className="align-middle mb-0">
                    <thead className="table-light small">
                        <tr>
                            <th className="ps-4">Imagen</th>
                            <th>Nombre</th>
                            <th>Grupo</th>
                            <th className="text-end pe-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ejercicios.length > 0 ? (
                            ejercicios.map(ej => (
                                <tr key={ej.id}>
                                    <td className="ps-4">
                                        {ej.imagen ? <img src={ej.imagen} alt="ej" style={{width: 50, height: 50, objectFit: 'cover', borderRadius: '8px'}}/> : '—'}
                                    </td>
                                    <td className="fw-bold">{ej.nombre}</td>
                                    <td><Badge bg="info">{ej.grupo_muscular}</Badge></td>
                                    <td className="text-end pe-4">
                                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => { setEjercicioActivo(ej); setShowEdit(true); }}>✎</Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => { setEjercicioActivo(ej); setShowDelete(true); }}>🗑</Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            // 🚨 Mensaje visible si no hay ejercicios cargados en la lista
                            <tr>
                                <td colSpan="4" className="text-center py-5 text-muted">
                                    <div className="d-flex flex-column align-items-center">
                                        <span className="fs-2 mb-2">🏋️‍♂️</span>
                                        <p className="mb-0 fw-semibold">No se encontraron ejercicios en el catálogo.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>

            <ModalEditar show={showEdit} onHide={() => setShowEdit(false)} ejercicio={ejercicioActivo} onUpdate={cargarEjercicios} />
            <ModalEliminar show={showDelete} onHide={() => setShowDelete(false)} ejercicio={ejercicioActivo} onUpdate={cargarEjercicios} />
        </Container>
    );
};

// --- COMPONENTES AUXILIARES ---
// Modal para editar ejercicio, con formulario que carga los datos del ejercicio seleccionado y permite guardar cambios
const ModalEditar = ({ show, onHide, ejercicio, onUpdate }) => {
    // Estado para manejar el formulario de edición, cargando los datos del ejercicio seleccionado
    const [form, setForm] = useState({ nombre: '', grupo_muscular: '', descripcion: '', imagen: null });
    // Cargar datos del ejercicio seleccionado en el formulario al abrir el modal
    useEffect(() => {
        if (ejercicio) setForm({ nombre: ejercicio.nombre, grupo_muscular: ejercicio.grupo_muscular, descripcion: ejercicio.descripcion, imagen: null });
    }, [ejercicio]);
    // Función para manejar el guardado de los cambios en el ejercicio
    const handleSave = async () => {
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('nombre', form.nombre);
        formData.append('grupo_muscular', form.grupo_muscular);
        formData.append('descripcion', form.descripcion);
        if (form.imagen) formData.append('imagen', form.imagen);

        await axios.post(`http://212.227.178.175/api/ejercicios/${ejercicio.id}`, formData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        onUpdate(); onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton><Modal.Title>Editar</Modal.Title></Modal.Header>
            <Modal.Body>
                <Form.Control className="mb-2" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                <Form.Control className="mb-2" value={form.grupo_muscular} onChange={e => setForm({...form, grupo_muscular: e.target.value})} />
                <Form.Control type="file" onChange={e => setForm({...form, imagen: e.target.files[0]})} />
            </Modal.Body>
            <Modal.Footer><Button onClick={handleSave}>Guardar</Button></Modal.Footer>
        </Modal>
    );
};
// Modal para confirmar eliminación de ejercicio, llamando a la API para eliminar el ejercicio seleccionado
const ModalEliminar = ({ show, onHide, ejercicio, onUpdate }) => {
    // Función para eliminar el ejercicio seleccionado, haciendo una petición DELETE al backend
    const eliminar = async () => {
        await axios.delete(`http://212.227.178.175/api/ejercicios/${ejercicio.id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        onUpdate(); onHide();
    };
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton><Modal.Title>Confirmar</Modal.Title></Modal.Header>
            <Modal.Body>¿Borrar {ejercicio?.nombre}?</Modal.Body>
            <Modal.Footer><Button variant="danger" onClick={eliminar}>Eliminar</Button></Modal.Footer>
        </Modal>
    );
};

export default ListarEjercicios;