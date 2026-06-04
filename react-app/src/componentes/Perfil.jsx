import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Modal } from 'react-bootstrap';
import { useAuth } from '../hooks/ApiLogin/useAuth';
import api from '../hooks/ApiLogin/axios'; // Usamos la instancia de axios directamente

const Perfil = () => {
    const { user } = useAuth();
    const [editando, setEditando] = useState(false);
    const [showBaja, setShowBaja] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(''); // Añade esta línea
    
    // Estados para edición
    const [formData, setFormData] = useState({
        name: user?.name || '',
        password: '',
        email: user?.email || '',
        password_confirmation: '',
        especialidad: user?.dietista?.especialidad || '',
        num_colegiado: user?.dietista?.num_colegiado || '',
        nick: user?.paciente?.nick || ''
    });

    // Estados para la imagen
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(user?.imagen || '/default-avatar.png');
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };
    console.log("Datos enviados al servidor:", JSON.stringify(formData));
    const handleGuardar = async () => {
    setLoading(true);
    setError('');
    
    const data = new FormData();
    // QUITAMOS data.append('_method', 'PUT');
    
    data.append('name', formData.name);
    data.append('email', formData.email); // Asegúrate de incluir el email
    if (formData.password) data.append('password', formData.password);
    if (formData.password_confirmation) data.append('password_confirmation', formData.password_confirmation);
    
    if (user.role === 'dietista') {
        data.append('especialidad', formData.especialidad);
        data.append('num_colegiado', formData.num_colegiado);
    } else {
        data.append('nick', formData.nick);
    }

    if (selectedFile) {
        data.append('imagen', selectedFile);
    }

    try {
    await api.post('/user/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    // En lugar de alert:
    setSuccess("Cambios guardados correctamente");
    setEditando(false);
    
    // Opcional: limpiar el mensaje después de 3 segundos
    setTimeout(() => setSuccess(''), 3000);
    
    } catch (err) {
        console.error(err.response?.data);
        setError("Error al actualizar. Revisa los campos.");
    }
};

    const handleBaja = async () => {
        try {
            await api.delete('/user/delete');
            localStorage.clear();
            window.location.href = '/login';
        } catch (err) { setError("No se pudo procesar la baja"); }
    };

    return (
        <Container className="mt-4" style={{ maxWidth: '600px' }}>
            <Card className="p-4 shadow-sm border-0">
                <h2 className="text-center mb-4">Perfil de {user.name.toUpperCase()}</h2>
                
                <div className="text-center mb-4">
                    <img src={preview} className="rounded-circle shadow" width="150" height="150" alt="avatar" style={{ objectFit: 'cover' }} />
                </div>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control name="name" value={formData.name} onChange={handleChange} disabled={!editando} />
                        <Form.Label>Correo Electrónico</Form.Label>
                        <Form.Control name="email" value={formData.email} onChange={handleChange} disabled={!editando} />   
                    </Form.Group>

                    {user.role === 'dietista' ? (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Especialidad</Form.Label>
                                <Form.Control name="especialidad" value={formData.especialidad} onChange={handleChange} disabled={!editando} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Nº Colegiado</Form.Label>
                                <Form.Control name="num_colegiado" value={formData.num_colegiado} onChange={handleChange} disabled={!editando} />
                            </Form.Group>
                        </>
                    ) : (
                        <Form.Group className="mb-3">
                            <Form.Label>Nick</Form.Label>
                            <Form.Control name="nick" value={formData.nick} onChange={handleChange} disabled={!editando} />
                            
                        </Form.Group>
                    )}

                    {editando && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Cambiar Foto</Form.Label>
                                <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                            </Form.Group>
                            <hr />
                            <Form.Control type="password" name="password" placeholder="Nueva Contraseña (opcional)" onChange={handleChange} className="mb-2" />
                            <Form.Control type="password" name="password_confirmation" placeholder="Confirmar Nueva Contraseña" onChange={handleChange} />
                            
                            <div className="mt-3">
                                <Button onClick={handleGuardar} disabled={loading}>
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                                <Button variant="secondary" className="ms-2" onClick={() => setEditando(false)}>Cancelar</Button>
                            </div>
                        </>
                    )}
                </Form>

                {!editando && (
                    <div className="mt-4 pt-3 border-top d-flex justify-content-between">
                        <Button variant="primary" onClick={() => setEditando(true)}>Modificar Datos</Button>
                        <Button variant="danger" onClick={() => setShowBaja(true)}>Darse de Baja</Button>
                    </div>
                )}
            </Card>

            <Modal show={showBaja} onHide={() => setShowBaja(false)}>
                <Modal.Body>¿Deseas eliminar tu cuenta permanentemente?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBaja(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={handleBaja}>Confirmar Eliminación</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Perfil;