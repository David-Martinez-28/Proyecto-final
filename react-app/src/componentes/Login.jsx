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
        <Container fluid className="login-container">
            <Card className="card-login" style={{ width: '100%', maxWidth: '420px' }}>
                <Card.Body className="p-4">
                    <h2 className="text-center fw-bold mb-4">{isRegister ? 'Crear Cuenta' : 'Bienvenido'}</h2>
                    {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
                    {successMsg && <Alert variant="success">{successMsg}</Alert>}
                    
                    <Form onSubmit={handleFormSubmit}>
                        {isRegister && (
                            <>
                                <Form.Group className="mb-3"><Form.Label>Nombre</Form.Label><Form.Control value={name} onChange={e => setName(e.target.value)} required /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Especialidad</Form.Label><Form.Control value={especialidad} onChange={e => setEspecialidad(e.target.value)} required /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Nº Colegiado</Form.Label><Form.Control value={numColegiado} onChange={e => setNumColegiado(e.target.value)} required /></Form.Group>
                            </>
                        )}
                        <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required /></Form.Group>
                        <Form.Group className="mb-4"><Form.Label>Contraseña</Form.Label><Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required /></Form.Group>
                        <Button type="submit" className="w-100 py-2 botton-login">{isRegister ? 'Ir al Pago (50€)' : 'Iniciar Sesión'}</Button>
                    </Form>
                    <div className="text-center mt-3 botton-login"><Button variant="link" onClick={toggleMode}>{isRegister ? '¿Ya tienes cuenta?' : '¿Nuevo dietista?'}</Button></div>
                </Card.Body>
            </Card>

            <Modal show={showPayment} centered backdrop="static">
                <Modal.Header><Modal.Title>Confirmar Pago</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Button variant="success" className="w-100" onClick={handleRegister} disabled={isProcessing}>
                        {isProcessing ? <Spinner size="sm" animation="border" /> : 'Pagar 50,00 €'}
                    </Button>
                </Modal.Body>
            </Modal>
        </Container>
    );
};
export default Login;