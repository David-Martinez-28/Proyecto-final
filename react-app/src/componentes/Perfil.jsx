import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Modal } from 'react-bootstrap';
import { useAuth } from '../hooks/ApiLogin/useAuth';
import api from '../hooks/ApiLogin/axios'; // Usamos la instancia de axios directamente

const Perfil = () => {
    const { user } = useAuth();
    const [editando, setEditando] = useState(false);
    const [showBaja, setShowBaja] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(''); 
    
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

    const handleGuardar = async () => {
        setLoading(true);
        setError('');
        
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email); 
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
            
            setSuccess("Cambios guardados correctamente");
            setEditando(false);
            setLoading(false); // Liberamos el estado de carga
            
            setTimeout(() => setSuccess(''), 3000);
        
        } catch (err) {
            console.error(err.response?.data);
            setError("Error al actualizar. Revisa los campos.");
            setLoading(false);
        }
    };

    const handleBaja = async () => {
        try {
            await api.delete('/user/delete');
            localStorage.clear();
            window.location.href = '/login';
        } catch (err) { 
            setError("No se pudo procesar la baja"); 
        }
    };

    return (
        <Container className="py-5" style={{ maxWidth: '600px' }}>
            {/* ESTILO NUTRIPANEL: Tarjeta redondeada con borde superior corporativo */}
            <Card className="p-4 shadow-sm border-0 rounded-4 border-top border-primary border-4">
                <h2 className="text-center mb-4 fw-bold text-dark">Perfil de {user.name.toUpperCase()}</h2>
                
                {/* Avatar circular con sombra */}
                <div className="text-center mb-4">
                    <img 
                        src={preview} 
                        className="rounded-circle shadow-sm border border-secondary-subtle" 
                        width="150" 
                        height="150" 
                        alt="avatar" 
                        style={{ objectFit: 'cover' }} 
                    />
                </div>
                
                {error && <Alert variant="danger" className="rounded-3 small fw-medium">{error}</Alert>}
                {success && <Alert variant="success" className="rounded-3 small fw-medium">{success}</Alert>}
                
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">Nombre</Form.Label>
                        <Form.Control name="name" value={formData.name} onChange={handleChange} disabled={!editando} className="border-secondary-subtle" />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">Correo Electrónico</Form.Label>
                        <Form.Control name="email" value={formData.email} onChange={handleChange} disabled={!editando} className="border-secondary-subtle" />   
                    </Form.Group>

                    {user.role === 'dietista' ? (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold small text-secondary">Especialidad</Form.Label>
                                <Form.Control name="especialidad" value={formData.especialidad} onChange={handleChange} disabled={!editando} className="border-secondary-subtle" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold small text-secondary">Nº Colegiado</Form.Label>
                                <Form.Control name="num_colegiado" value={formData.num_colegiado} onChange={handleChange} disabled={!editando} className="border-secondary-subtle" />
                            </Form.Group>
                        </>
                    ) : (
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">Nick</Form.Label>
                            <Form.Control name="nick" value={formData.nick} onChange={handleChange} disabled={!editando} className="border-secondary-subtle" />
                        </Form.Group>
                    )}

                    {editando && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold small text-secondary">Cambiar Foto de Perfil</Form.Label>
                                <Form.Control type="file" accept="image/*" onChange={handleFileChange} className="border-secondary-subtle" />
                            </Form.Group>
                            <hr className="text-secondary-subtlemy-4" />
                            
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold small text-secondary">Seguridad de la Cuenta</Form.Label>
                                <Form.Control type="password" name="password" placeholder="Nueva Contraseña (opcional)" onChange={handleChange} className="mb-2 border-secondary-subtle" />
                                <Form.Control type="password" name="password_confirmation" placeholder="Confirmar Nueva Contraseña" onChange={handleChange} className="border-secondary-subtle" />
                            </Form.Group>
                            
                            <div className="mt-4 pt-2 d-flex gap-2">
                                <Button variant="success" className="fw-bold px-4 shadow-sm" onClick={handleGuardar} disabled={loading}>
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                                <Button variant="secondary" className="fw-medium px-4" onClick={() => setEditando(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                {!editando && (
                    <div className="mt-4 pt-3 border-top border-light-subtle d-flex justify-content-between">
                        <Button variant="primary" className="fw-bold px-4 shadow-sm" onClick={() => setEditando(true)}>
                            Modificar Datos
                        </Button>
                        <Button variant="outline-danger" className="fw-semibold px-3" onClick={() => setShowBaja(true)}>
                            Darse de Baja
                        </Button>
                    </div>
                )}
            </Card>

            {/* MODAL DE CONFIRMACIÓN DE BAJA */}
            <Modal show={showBaja} onHide={() => setShowBaja(false)} centered size="sm">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold text-danger fs-5">Eliminar Cuenta</Modal.Title>
                </Modal.Header>
                <Modal.Body className="small text-secondary py-3">
                    ¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Esta acción es irreversible.
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" onClick={() => setShowBaja(false)} className="fw-medium small">
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleBaja} className="fw-bold small shadow-sm">
                        Confirmar Eliminación
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Perfil;