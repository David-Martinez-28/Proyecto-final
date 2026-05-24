import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Modal, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../hooks/ApiLogin/useAuth';
import api from '../hooks/ApiLogin/axios';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- NUEVOS ESTADOS PARA MENSAJES ---
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [especialidad, setEspecialidad] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    // Limpia los mensajes cuando el usuario cambia de modo (Login/Registro)
    const toggleMode = () => {
        setIsRegister(!isRegister);
        setErrorMsg('');
        setSuccessMsg('');
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setErrorMsg(''); // Limpiamos errores anteriores al enviar
        setSuccessMsg('');

        if (isRegister) {
            setShowPayment(true);
        } else {
            executeLogin();
        }
    };

    const PagoFalso = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            await api.post('/register', { 
                name, email, password, especialidad,
                role: 'dietista'
            });
            
            setIsProcessing(false);
            setShowPayment(false);
            
            // En lugar de alert, usamos nuestro estado de éxito
            setSuccessMsg("¡Pago verificado! Cuenta creada con éxito. Ya puedes iniciar sesión.");
            setIsRegister(false); 
            
            // Limpiamos la contraseña por seguridad
            setPassword('');
        } catch (err) {
            setIsProcessing(false);
            setShowPayment(false);
            // En lugar de alert, guardamos el error en el estado
            setErrorMsg(err.response?.data?.message || "Error al procesar el registro. Verifica los datos.");
        }
    };

    const executeLogin = async () => {
        try {
            const userData = await login({ email, password });
            
            if (userData && userData.role === 'dietista') {
                navigate('/admin/dashboard');
            } else {
                navigate('/mi-plan');
            }
        } catch (err) {
            // Guardamos el error de credenciales en el estado
            setErrorMsg(err.response?.data?.message || "Credenciales incorrectas. Inténtalo de nuevo.");
        }
    };

    return (
        <Container fluid className="vh-100 d-flex justify-content-center align-items-center bg-light">
            <Card className="p-4 shadow-sm border-0 rounded-4" style={{ width: '100%', maxWidth: '420px' }}>
                <Card.Body>
                    <h2 className="text-center fw-bold mb-2 text-dark">
                        {isRegister ? 'Registro de Dietista' : 'Bienvenido'}
                    </h2>
                    <p className="text-center text-muted mb-4">
                        {isRegister ? 'Completa tus datos profesionales' : 'Introduce tus credenciales'}
                    </p>

                    {/* --- ZONA DE ALERTAS INTEGRADAS --- */}
                    {errorMsg && (
                        <Alert variant="danger" className="text-center py-2">
                            {errorMsg}
                        </Alert>
                    )}
                    
                    {successMsg && (
                        <Alert variant="success" className="text-center py-2 fw-semibold">
                            {successMsg}
                        </Alert>
                    )}
                    {/* ---------------------------------- */}

                    <Form onSubmit={handleFormSubmit}>
                        {isRegister && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-muted small fw-bold">Nombre Completo</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={name} 
                                        onChange={e => { setName(e.target.value); setErrorMsg(''); }} 
                                        required 
                                        placeholder="Ej. Juan Pérez"
                                        className="py-2"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-muted small fw-bold">Especialidad</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Ej. Nutrición Deportiva"
                                        value={especialidad} 
                                        onChange={e => { setEspecialidad(e.target.value); setErrorMsg(''); }} 
                                        className="py-2"
                                    />
                                </Form.Group>
                            </>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label className="text-muted small fw-bold">Email</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="tu@email.com"
                                value={email} 
                                onChange={e => { setEmail(e.target.value); setErrorMsg(''); }} 
                                required 
                                className="py-2"
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="text-muted small fw-bold">Contraseña</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="********"
                                value={password} 
                                onChange={e => { setPassword(e.target.value); setErrorMsg(''); }} 
                                required 
                                className="py-2"
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100 fw-bold py-2 mb-3 fs-5 shadow-sm">
                            {isRegister ? 'Ir al Pago (50.00€)' : 'Iniciar Sesión'}
                        </Button>
                    </Form>

                    <div className="text-center mt-2">
                        <Button variant="link" className="text-decoration-none fw-semibold" onClick={toggleMode}>
                            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿Eres nuevo dietista? Regístrate'}
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* MODAL DE PAGO */}
            <Modal show={showPayment} onHide={() => !isProcessing && setShowPayment(false)} centered backdrop="static">
                <Modal.Header closeButton={!isProcessing} className="border-bottom-0 pb-0">
                    <Modal.Title className="fw-bold">Pasarela de Pago Segura</Modal.Title>
                </Modal.Header>
                
                <Modal.Body className="pt-2">
                    <div className="bg-light p-3 rounded mb-4 text-center border">
                        <span className="text-muted d-block mb-1">Total a pagar hoy:</span>
                        <span className="fs-2 fw-bold text-dark">50,00 €</span>
                    </div>

                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted mb-1">Número de Tarjeta</Form.Label>
                            <Form.Control type="text" placeholder="4242 4242 4242 4242" className="py-2" />
                        </Form.Group>
                        
                        <Row>
                            <Col xs={6}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-muted mb-1">Caducidad</Form.Label>
                                    <Form.Control type="text" placeholder="MM/YY" className="py-2" />
                                </Form.Group>
                            </Col>
                            <Col xs={6}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-muted mb-1">CVC</Form.Label>
                                    <Form.Control type="text" placeholder="123" className="py-2" />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Button 
                            variant="success" 
                            className="w-100 fw-bold py-3 d-flex justify-content-center align-items-center fs-5 shadow-sm"
                            onClick={PagoFalso} 
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Procesando pago...
                                </>
                            ) : (
                                'Confirmar Pago de 50€'
                            )}
                        </Button>
                    </Form>
                </Modal.Body>
                
                {!isProcessing && (
                    <Modal.Footer className="border-top-0 justify-content-center">
                        <Button variant="link" className="text-danger text-decoration-none fw-bold" onClick={() => setShowPayment(false)}>
                            Cancelar y volver
                        </Button>
                    </Modal.Footer>
                )}
            </Modal>
        </Container>
    );
};

export default Login;