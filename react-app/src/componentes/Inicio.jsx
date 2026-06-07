import React from 'react';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Inicio = () => {
    // Inicializa el hook de navegación de React Router para redirigir a Login o Registro sin recargar la página.
    const navigate = useNavigate();

    return (
        // Contenedor principal que centra verticalmente la Landing Page ocupando el 100% del alto de la pantalla disponible.
        <div className="bg-light min-vh-100 d-flex align-items-center py-5">
            <Container style={{ maxWidth: '1200px' }}>

                {/* * SECCIÓN HERO: Bloque de presentación principal.
                  * Divide la pantalla en dos columnas en pantallas grandes (lg) y apila el contenido en móviles.
                  */}
                <Row className="align-items-center mb-5 g-5">

                    {/* Columna Izquierda: Mensaje de bienvenida, eslogan y botones de acción */}
                    <Col lg={6} className="text-center text-lg-start">
                        {/* Inserta una etiqueta píldora con una opacidad suave para destacar la categoría de la aplicación */}
                        <Badge bg="primary" className="px-3 py-2 mb-3 fs-6 fw-semibold rounded-pill bg-opacity-10 text-primary">
                            Gestión Digital para Dietistas
                        </Badge>
                        {/* Título de impacto principal con el nombre comercial de la marca */}
                        <h1 className="display-4 fw-bold text-dark mb-3">
                            Lleva tus asesorías al siguiente nivel con <span className="text-primary">Strong Hell</span>
                        </h1>
                        {/* Texto secundario que describe de manera global el propósito de la plataforma */}
                        <p className="lead text-secondary mb-4">
                            La plataforma integral diseñada para que profesionales de la salud organicen dietas, estructuren rutinas de entrenamiento y monitoricen el progreso de sus pacientes en tiempo real de forma ágil y centralizada.
                        </p>

                        {/* * BOTONES DE ACCIÓN PRINCIPALES:
                          * Redirigen al usuario hacia los formularios de acceso o alta mediante rutas relativas.
                          */}
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
                                onClick={() => navigate('/login', { state: { abrirEnRegistro: true } })} // 👈 Enviamos el estado oculto
                            >
                                Crear Cuenta
                            </Button>
                        </div>
                    </Col>

                    {/* Columna Derecha: Tarjeta de presentación con el logotipo corporativo importado */}
                    <Col lg={6} className="text-center">
                        <div className="bg-white p-5 rounded-4 shadow-sm border border-light-subtle d-inline-block">
                            {/* Renderiza la imagen del logo controlando sus dimensiones máximas de forma responsiva */}
                            <span style={{ fontSize: '6rem' }}>
                                <img className="img-fluid maxheight-40 maxwidth-40" src={logo} alt="Logo" />
                            </span>
                            {/* Nombre del proyecto principal */}
                            <h3 className="fw-bold text-dark mt-3 mb-0">Strong Hell</h3>
                            {/* Subtexto corporativo con espaciado de letras expandido */}
                            <small className="text-muted text-uppercase fw-semibold tracking-wider">Gestión Digital</small>
                        </div>
                    </Col>
                </Row>

                {/* * SECCIÓN DE CARACTERÍSTICAS: Tres tarjetas informativas ordenadas en rejilla (3 columnas en pantallas medianas o superiores).
                  * Explica brevemente los tres módulos de software implementados: Comidas, Rutinas y Agenda.
                  */}
                <Row className="g-4 mt-4">
                    {/* Tarjeta Informativa 1: Módulo de Alimentación */}
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

                    {/* Tarjeta Informativa 2: Módulo de Deporte */}
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

                    {/* Tarjeta Informativa 3: Módulo de Citas Médicas */}
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