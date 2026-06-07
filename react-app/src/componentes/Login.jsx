import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Modal, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../hooks/ApiLogin/useAuth';
import api from '../hooks/ApiLogin/axios';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [especialidad, setEspecialidad] = useState('');
    const [numColegiado, setNumColegiado] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const toggleMode = () => {
        setIsRegister(!isRegister);
        setErrorMsg('');
        setSuccessMsg('');
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        if (isRegister) {
            setShowPayment(true);
        } else {
            executeLogin();
        }
    };

    const executeLogin = async () => {
        try {
            const userData = await login({ email, password });
            navigate(userData.role === 'dietista' ? '/admin/dashboard' : '/mi-plan');
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Credenciales incorrectas.");
        }
    };

    const handleRegister = async () => {
        setIsProcessing(true);
        try {
            await api.post('/register', { 
                name, email, password, especialidad, num_colegiado: numColegiado, role: 'dietista'
            });
            setSuccessMsg("¡Registro exitoso! Ya puedes iniciar sesión.");
            setIsRegister(false);
            setPassword('');
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Error en el registro.");
        } finally {
            setIsProcessing(false);
            setShowPayment(false);
        }
    };

    return (
        /* 🔥 CORREGIDO: Clases añadidas para centrar perfectamente la tarjeta en el medio de la pantalla */
        <Container fluid className="d-flex align-items-center justify-content-center min-vh-100 bg-light login-container">
            <Card className="card-login border-0 shadow-sm rounded-4 border-top border-4 overflow-hidden" 
                  style={{ width: '100%', maxWidth: '420px', borderTopColor: isRegister ? 'var(--bs-success)' : 'var(--bs-primary)' }}>
                <Card.Body className="p-4 bg-white">
                    <h2 className="text-center fw-bold mb-4 text-dark">{isRegister ? 'Crear Cuenta' : 'Bienvenido'}</h2>
                    
                    {errorMsg && <Alert variant="danger" className="rounded-3 small fw-medium">{errorMsg}</Alert>}
                    {successMsg && <Alert variant="success" className="rounded-3 small fw-medium">{successMsg}</Alert>}
                    
                    <Form onSubmit={handleFormSubmit}>
                        {isRegister && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold small text-secondary">Nombre</Form.Label>
                                    <Form.Control value={name} onChange={e => setName(e.target.value)} required className="border-secondary-subtle" />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold small text-secondary">Especialidad</Form.Label>
                                    <Form.Control value={especialidad} onChange={e => setEspecialidad(e.target.value)} required className="border-secondary-subtle" />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold small text-secondary">Nº Colegiado</Form.Label>
                                    <Form.Control value={numColegiado} onChange={e => setNumColegiado(e.target.value)} required className="border-secondary-subtle" />
                                </Form.Group>
                            </>
                        )}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">Email</Form.Label>
                            <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required className="border-secondary-subtle" />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold small text-secondary">Contraseña</Form.Label>
                            <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required className="border-secondary-subtle" />
                        </Form.Group>
                        
                        <Button type="submit" variant={"primary"} className="w-100 py-2 fw-bold shadow-sm botton-login">
                            {isRegister ? 'Ir al Pago (50€)' : 'Iniciar Sesión'}
                        </Button>
                    </Form>
                    
                    <div className="text-center mt-3">
                        <Button variant="link" onClick={toggleMode} className={`fw-semibold small text-decoration-none ${isRegister ? 'text-primary' : 'text-primary'}`}>
                            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo dietista? Regístrate'}
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* MODAL DE PAGO */}
            <Modal show={showPayment} onHide={() => !isProcessing && setShowPayment(false)} centered backdrop="static" className="rounded-4">
                <Modal.Header closeButton={!isProcessing} className="border-0 pb-0">
                    <Modal.Title className="fw-bold text-primary fs-5">Confirmar Pago</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2 pb-4">
                    <p className="text-muted small mb-4">Para activar tu cuenta profesional en NutriPanel, por favor confirma el pago de la tasa única de alta.</p>
                    <Button variant="primary" className="w-100 py-2 fw-bold shadow-sm" onClick={handleRegister} disabled={isProcessing}>
                        {isProcessing ? <Spinner size="sm" animation="border" className="me-2" /> : 'Pagar 50,00 €'}
                    </Button>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Login;