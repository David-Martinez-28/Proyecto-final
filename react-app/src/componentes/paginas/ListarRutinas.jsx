import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Spinner, Button, Modal, Form } from 'react-bootstrap';
import useApiGet from '../../hooks/ApiDietista/useApiGet';
import axios from 'axios';

const ListarRutinas = () => {
    // Estados para almacenar las rutinas, ejercicios disponibles, estado de carga, búsqueda y el ID del dietista para permisos
    const [rutinas, setRutinas] = useState([]);
    const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [miDietistaId, setMiDietistaId] = useState(null);
    // Estados para controlar los modales y la rutina activa para edición/eliminación
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showView, setShowView] = useState(false);
    const [rutinaActiva, setRutinaActiva] = useState(null);
    // Función para cargar rutinas, ejercicios y perfil del dietista al montar el componente
    const cargarDatos = async () => {
        setCargando(true);
        try {
            // Obtener perfil para permisos
            const perfilRes = await axios.get('http://212.227.178.175/api/me', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setMiDietistaId(perfilRes.data.id);

            // Cargar datos
            const [rutinasData, ejerciciosData] = await Promise.all([
                useApiGet('/rutinas'),
                useApiGet('/ejercicios')
            ]);
            setRutinas(Array.isArray(rutinasData) ? rutinasData : (rutinasData?.data || []));
            setEjerciciosDisponibles(Array.isArray(ejerciciosData) ? ejerciciosData : (ejerciciosData?.data || []));
        } catch (error) {
            console.error("Error al cargar datos", error);
        } finally {
            setCargando(false);
        }
    };
    // Cargar datos al montar el componente
    useEffect(() => { cargarDatos(); }, []);
    // Filtrar rutinas según la búsqueda, comparando el nombre de la rutina con el texto ingresado en el campo de búsqueda
    const filtradas = rutinas.filter(rut => rut.nombre.toLowerCase().includes(busqueda.toLowerCase()));

    if (cargando) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container className="py-4 px-3 mx-auto" style={{ maxWidth: '950px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-light-subtle">
                <h4 className="fw-bold text-dark m-0">🏋️ Fichas de Rutinas</h4>
            </div>

            <Form.Control className="mb-4" placeholder="Filtrar rutinas..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Table hover className="align-middle mb-0">
                    <thead className="table-light small">
                        <tr>
                            <th className="ps-4">Nombre de Rutina</th>
                            <th>Ejercicios</th>
                            <th className="text-end pe-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtradas.length > 0 ? (
                            filtradas.map(rut => (
                                <tr key={rut.id}>
                                    <td className="ps-4 fw-bold">{rut.nombre}</td>
                                    <td>
                                        {rut.ejercicios?.map(ej => (
                                            <Badge bg="info" key={ej.id} className="me-1 mb-1">{ej.nombre}</Badge>
                                        ))}
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button variant="link" className="text-secondary p-0 me-3" onClick={() => { setRutinaActiva(rut); setShowView(true); }}>👁</Button>
                                        
                                        {Number(rut.dietista_id) === Number(miDietistaId) ? (
                                            <>
                                                <Button variant="link" className="text-primary p-0 me-2" onClick={() => { setRutinaActiva(rut); setShowEdit(true); }}>✎</Button>
                                                <Button variant="link" className="text-danger p-0" onClick={() => { setRutinaActiva(rut); setShowDelete(true); }}>🗑</Button>
                                            </>
                                        ) : (
                                            <Badge bg="light" text="dark">Solo lectura</Badge>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            // 🚨 Único añadido: Mensaje si no hay rutinas registradas o filtradas
                            <tr>
                                <td colSpan="3" className="text-center py-5 text-muted">
                                    <div className="d-flex flex-column align-items-center">
                                        <span className="fs-2 mb-2">🏋️‍♂️</span>
                                        <p className="mb-0 fw-semibold">No se encontraron rutinas registradas.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>

            <ModalVer show={showView} onHide={() => setShowView(false)} rutina={rutinaActiva} />
            <ModalEditar show={showEdit} onHide={() => setShowEdit(false)} rutina={rutinaActiva} ejerciciosCatalogo={ejerciciosDisponibles} onUpdate={cargarDatos} />
            <ModalEliminar show={showDelete} onHide={() => setShowDelete(false)} rutina={rutinaActiva} onUpdate={cargarDatos} />
        </Container>
    );
};
// Modal para ver detalles de la rutina, mostrando el nombre y los ejercicios incluidos
const ModalVer = ({ show, onHide, rutina }) => (
    <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton><Modal.Title>{rutina?.nombre}</Modal.Title></Modal.Header>
        <Modal.Body>
            <h5>Ejercicios incluidos:</h5>
            <ul className="list-group">
                {rutina?.ejercicios?.map(ej => (
                    <li key={ej.id} className="list-group-item">{ej.nombre}</li>
                ))}
            </ul>
        </Modal.Body>
    </Modal>
);
// Modal para editar rutina, con formulario que carga los datos de la rutina seleccionada y permite guardar cambios
const ModalEditar = ({ show, onHide, rutina, ejerciciosCatalogo, onUpdate }) => {
    // Estado para manejar el formulario de edición, cargando los datos de la rutina seleccionada
    const [form, setForm] = useState({ nombre: '', ejercicios: [] });
    // Cargar datos de la rutina seleccionada en el formulario al abrir el modal
    useEffect(() => {
        if (rutina) setForm({ nombre: rutina.nombre, ejercicios: rutina.ejercicios.map(e => e.id) });
    }, [rutina]);
    // Función para manejar el guardado de los cambios en la rutina
    const handleSave = async () => {
        await axios.put(`http://212.227.178.175/api/rutinas/${rutina.id}`, form, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        onUpdate(); onHide();
    };
    // Función para manejar la selección/deselección de ejercicios en el formulario de edición
    const toggleEjercicio = (id) => {
        setForm(prev => ({ ...prev, ejercicios: prev.ejercicios.includes(id) ? prev.ejercicios.filter(eId => eId !== id) : [...prev.ejercicios, id] }));
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton><Modal.Title>Editar Rutina</Modal.Title></Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3"><Form.Label>Nombre</Form.Label><Form.Control value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></Form.Group>
                <h6>Ejercicios:</h6>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="border p-2 rounded">
                    {ejerciciosCatalogo.map(ej => (
                        <Form.Check key={ej.id} type="checkbox" label={ej.nombre} checked={form.ejercicios.includes(ej.id)} onChange={() => toggleEjercicio(ej.id)} />
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer><Button onClick={handleSave}>Guardar Cambios</Button></Modal.Footer>
        </Modal>
    );
};

// Modal para confirmar eliminación de ejercicio, llamando a la API para eliminar el ejercicio seleccionado
const ModalEliminar = ({ show, onHide, rutina, onUpdate }) => {
    // Función para eliminar el ejercicio seleccionado, haciendo una petición DELETE al backend
    const eliminar = async () => {
        await axios.delete(`http://212.227.178.175/api/rutinas/${rutina.id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        onUpdate(); onHide();
    };
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton><Modal.Title>Confirmar</Modal.Title></Modal.Header>
            <Modal.Body>¿Borrar rutina?</Modal.Body>
            <Modal.Footer><Button variant="danger" onClick={eliminar}>Eliminar</Button></Modal.Footer>
        </Modal>
    );
};

export default ListarRutinas;