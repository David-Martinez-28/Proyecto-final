import React from 'react';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap'; // ✅ CORREGIDO: Añadido Badge aquí
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; 

const Inicio = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-light min-vh-100 d-flex align-items-center py-5">
            <Container style={{ maxWidth: '1200px' }}>
                
                {/* SECCIÓN HERO: Presentación Principal */}
                <Row className="align-items-center mb-5 g-5">
                    <Col lg={6} className="text-center text-lg-start">
                        <Badge bg="primary" className="px-3 py-2 mb-3 fs-6 fw-semibold rounded-pill bg-opacity-10 text-primary">
                             Gestión Digital para Dietistas
                        </Badge>
                        <h1 className="display-4 fw-bold text-dark mb-3">
                            Lleva tus asesorías al siguiente nivel con <span className="text-primary">Strong Hell</span>
                        </h1>
                        <p className="lead text-secondary mb-4">
                            La plataforma integral diseñada para que profesionales de la salud organicen dietas, estructuren rutinas de entrenamiento y monitoricen el progreso de sus pacientes en tiempo real de forma ágil y centralizada.
                        </p>
                        
                        {/* BOTONES DE ACCIÓN PRINCIPALES */}
                        <div className="d-flex gap-3 justify-content-center justify-content-lg-start">
                            <Button 
                                variant="primary" 
                                size="lg" 
                                className="fw-bold px-4 py-2 rounded-pill shadow-sm"
                                onClick={() => navigate('/login')}
                            >
                                Iniciar Sesión
                            </Button>
                            <Button 
                                variant="outline-dark" 
                                size="lg" 
                                className="fw-bold px-4 py-2 rounded-pill shadow-sm"
                                onClick={() => navigate('/registro')}
                            >
                                Crear Cuenta
                            </Button>
                        </div>
                    </Col>
                    
                    {/* ILUSTRACIÓN / LOGO DE PRESENTACIÓN */}
                    <Col lg={6} className="text-center">
                        <div className="bg-white p-5 rounded-4 shadow-sm border border-light-subtle d-inline-block">
                            <span style={{ fontSize: '6rem' }}><img className="img-fluid maxheight-40 maxwidth-40" src={logo} alt="Logo" /></span>
                            <h3 className="fw-bold text-dark mt-3 mb-0">Strong Hell</h3>
                            <small className="text-muted text-uppercase fw-semibold tracking-wider">Gestión Digital</small>
                        </div>
                    </Col>
                </Row>

                {/* SECCIÓN DE CARACTERÍSTICAS: ¿Cómo va la aplicación? */}
                <Row className="g-4 mt-4">
                    <Col md={4}>
                        <Card className="border-0 shadow-sm rounded-4 h-100 border-top border-success border-4">
                            <Card.Body className="p-4">
                                <div className="fs-3 mb-3">🍳</div>
                                <h5 className="fw-bold text-dark">Planes de Comidas</h5>
                                <p className="text-secondary small mb-0">
                                    Diseña menús personalizados arrastrando platos desde el catálogo maestro. Controla calorías y macronutrientes de forma automatizada por cada toma.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card className="border-0 shadow-sm rounded-4 h-100 border-top border-dark border-4">
                            <Card.Body className="p-4">
                                <div className="fs-3 mb-3">🏋️‍♂️</div>
                                <h5 className="fw-bold text-dark">Bloques de Entrenamiento</h5>
                                <p className="text-secondary small mb-0">
                                    Configura fichas de rutinas asignando series, repeticiones y tiempos de descanso. Vincula los bloques directamente al calendario de tus pacientes.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card className="border-0 shadow-sm rounded-4 h-100 border-top border-secondary border-4">
                            <Card.Body className="p-4">
                                <div className="fs-3 mb-3">📅</div>
                                <h5 className="fw-bold text-dark">Agenda Sincronizada</h5>
                                <p className="text-secondary small mb-0">
                                    Gestiona solicitudes de citas de tus pacientes. Acepta o cancela introduciendo motivos personalizados que se notificarán al instante.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

            </Container>
        </div>
    );
};

export default Inicio;