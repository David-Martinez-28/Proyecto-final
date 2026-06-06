import React, { useState } from 'react';
import { Navbar, Container, Nav, Dropdown, Offcanvas, NavDropdown, Badge } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/ApiLogin/useAuth';
import { useClinica } from '../../contexto/contexto.jsx';
import miLogo from '../../assets/logo.png';

const Navegador = () => {
    const { user, logout } = useAuth();
    const { notificaciones, marcarNotificacionLeida } = useClinica();
    const navigate = useNavigate();

    const [showMenu, setShowMenu] = useState(false);
    const handleClose = () => setShowMenu(false);
    const handleShow = () => setShowMenu(true);

    const handleLogout = async () => {
        handleClose();
        await logout();
        navigate('/');
    };

    // Componente interno para Notificaciones y Perfil (Mantiene consistencia móvil/escritorio)
    const MenuUsuario = ({ esMovil }) => (
        <div className={`align-items-center gap-3 ${esMovil ? 'd-flex d-md-none ms-auto me-2' : 'd-none d-md-flex ms-md-auto'}`}>
            {/* --- MENÚ DESPLEGABLE DE NOTIFICACIONES --- */}
            <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="position-relative text-white border-0 p-2 shadow-none text-decoration-none fs-5">
                    🔔
                    {notificaciones && notificaciones.length > 0 && (
                        <Badge bg="danger" pill className="position-absolute top-0 start-50 translate-middle font-monospace" style={{ fontSize: '10px' }}>
                            {notificaciones.length}
                        </Badge>
                    )}
                </Dropdown.Toggle>

                <Dropdown.Menu style={{ width: '320px', maxHeight: '400px', overflowY: 'auto' }} className="shadow-lg border-0 mt-2 p-0 rounded-3">
                    <Dropdown.Header className="fw-bold border-bottom py-3 bg-light text-dark fs-6">Notificaciones Recientes</Dropdown.Header>
                    {!notificaciones || notificaciones.length === 0 ? (
                        <div className="text-muted text-center small py-4">No tienes mensajes nuevos</div>
                    ) : (
                        notificaciones.map(n => (
                            <Dropdown.Item
                                key={n.id}
                                className="bg-white border-bottom p-3 small text-wrap d-flex flex-column gap-1"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation(); 
                                    marcarNotificacionLeida(n.id);
                                }}
                                style={{ whiteSpace: 'normal' }}
                            >
                                <div className="fw-bold text-success">
                                    {n.tipo_accion === 'cita_rechazada' && '⚠️ Cita Cancelada'}
                                    {n.tipo_accion === 'nueva_cita' && '📅 Nueva Cita Recibida'}
                                    {n.tipo_accion === 'cita_aceptada' && '✅ Cita Aceptada'}
                                    {n.tipo_accion === 'cita_cancelada' && '❌ Cita Cancelada'}
                                    {!['cita_rechazada', 'nueva_cita', 'cita_aceptada', 'cita_cancelada'].includes(n.tipo_accion) && '📩 Aviso del Sistema'}
                                </div>
                                <div className="text-secondary small" style={{ fontSize: '12px', lineHeight: '1.4' }}>{n.mensaje}</div>
                                <span className="text-primary d-block text-end mt-1 fw-semibold" style={{ fontSize: '11px' }}>
                                    ✓ Marcar como leído
                                </span>
                            </Dropdown.Item>
                        ))
                    )}
                </Dropdown.Menu>
            </Dropdown>

            {/* --- COMPONENTE AVATAR Y PERFIL --- */}
            <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="d-flex align-items-center gap-2 text-decoration-none shadow-none border-0 p-0" id="dropdown-avatar">
                    <div className="text-end d-none d-sm-block lh-sm">
                        <p className="mb-0 fw-bold text-white small" style={{ fontSize: '14px' }}>{user?.name || 'Usuario'}</p>
                        <span className="text-warning small text-capitalize fw-semibold" style={{ fontSize: '11px' }}>{user?.role || 'Invitado'}</span>
                    </div>
                    <img 
                        src={user?.imagen || '/default-avatar.png'} 
                        alt="Avatar" 
                        className="rounded-circle shadow-sm border border-light-subtle" 
                        style={{ width: '38px', height: '38px', objectFit: 'cover' }} 
                    />
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-lg border-0 mt-2 rounded-3 overflow-hidden">
                    <Dropdown.Item as={Link} to="/perfil" onClick={handleClose} className="py-2 small fw-medium">
                        ⚙️ Editar Perfil
                    </Dropdown.Item>
                    <Dropdown.Divider className="my-1 border-light-subtle" />
                    <Dropdown.Item onClick={handleLogout} className="text-danger fw-bold py-2 small">
                        🚪 Cerrar Sesión
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );

    return (
        <Navbar expand="md" variant="dark" className="bg-primary shadow-sm mb-4 border-bottom border-primary-subtle sticky-top py-2 navegador">
            <Container fluid className="px-4 d-flex align-items-center justify-content-between">

                {/* Enrutamiento dinámico en el logo según el rol del usuario */}
                <Navbar.Brand as={Link} to={user?.role === 'dietista' ? '/admin/dashboard' : '/mi-plan'} onClick={handleClose} className="fw-bold fs-4 d-flex align-items-center text-white text-decoration-none">
                    <img src={miLogo} alt="Logo StrongHell" className="me-2" style={{ height: '50px', width: 'auto' }} />
                    <span className="text-white">StrongHell</span>
                </Navbar.Brand>

                {/* EN MÓVIL: Las notificaciones y el avatar al lado de la hamburguesa */}
                <MenuUsuario esMovil={true} />

                <Navbar.Toggle aria-controls="offcanvas-navbar" onClick={handleShow} className="border-0 shadow-none" />

                <Navbar.Offcanvas id="offcanvas-navbar" placement="start" show={showMenu} onHide={handleClose} className="bg-white">
                    <Offcanvas.Header closeButton closeVariant="white" className="bg-primary text-white border-bottom border-primary-subtle py-3">
                        <Offcanvas.Title className="fw-bold fs-4 d-flex align-items-center">
                            <img src={miLogo} alt="Logo StrongHell" className="me-2" style={{ height: '40px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
                            <span className="text-white">StrongHell</span>
                        </Offcanvas.Title>
                    </Offcanvas.Header>

                    <Offcanvas.Body className="pt-4 pt-md-0">
                        <Nav className="w-100 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 gap-md-0">
                            
                            <div className="d-flex flex-column flex-md-row gap-1 gap-md-2">
                                {/* Enlace de inicio inteligente */}
                                <Nav.Link as={Link} to={user?.role === 'dietista' ? '/admin/dashboard' : '/mi-plan'} onClick={handleClose} className="fw-semibold text-secondary text-md-white-50 px-2">
                                    {user?.role === 'dietista' ? 'Mis Pacientes' : 'Mi Plan'}
                                </Nav.Link>

                                {/* 👤 RUTAS EXCLUSIVAS PARA EL PACIENTE */}
                                {user?.role === 'paciente' && (
                                    <>
                                        <Nav.Link as={Link} to="/paciente/pedir-cita" onClick={handleClose} className="fw-semibold text-secondary text-md-white-50 px-2">
                                            Pedir Cita
                                        </Nav.Link>
                                        <Nav.Link as={Link} to="/paciente/estadisticas" onClick={handleClose} className="fw-semibold text-secondary text-md-white-50 px-2">
                                            Mis Mediciones
                                        </Nav.Link>
                                    </>
                                )}

                                {/* 👨‍⚕️ RUTAS EXCLUSIVAS PARA EL DIETISTA */}
                                {user?.role === 'dietista' && (
                                    <>
                                        <Nav.Link as={Link} to="/dietista/agenda" onClick={handleClose} className="fw-semibold text-secondary text-md-white-50 px-2">
                                            Agenda
                                        </Nav.Link>

                                        {/* DESPLEGABLE 1: ACCIONES DE ALTA / CREACIÓN */}
                                        <NavDropdown title="Añadir al Catálogo" id="nav-dropdown-crear" className="fw-semibold px-1">
                                            <NavDropdown.Item as={Link} to="/dietista/ejercicios" onClick={handleClose}>💪 Crear Ejercicio</NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/dietista/ingredientes" onClick={handleClose}>🥝 Crear Ingrediente</NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/dietista/rutinas" onClick={handleClose}>🏋️ Crear Rutina</NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/dietista/comidas" onClick={handleClose}>🍳 Crear Comida</NavDropdown.Item>
                                        </NavDropdown>

                                        {/* DESPLEGABLE 2: ACCIONES DE CONSULTA / LISTADO */}
                                        <NavDropdown title="Ver Catálogos" id="nav-dropdown-listar" className="fw-semibold px-1">
                                            <NavDropdown.Item as={Link} to="/dietista/listar-ejercicios" onClick={handleClose}>📋 Listar Ejercicios</NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/dietista/listar-ingredientes" onClick={handleClose}>📋 Listar Ingredientes</NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/dietista/listar-rutinas" onClick={handleClose}>📋 Listar Rutinas</NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/dietista/listar-comidas" onClick={handleClose}>📋 Listar Comidas</NavDropdown.Item>
                                        </NavDropdown>
                                    </>
                                )}
                            </div>

                            {/* EN ESCRITORIO: Se muestra el bloque del perfil alineado a la derecha */}
                            <MenuUsuario esMovil={false} />

                        </Nav>
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
    );
};

export default Navegador;