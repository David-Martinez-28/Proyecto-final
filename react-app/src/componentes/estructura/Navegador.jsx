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

    // Componente interno reutilizable para no repetir el marcado de Notificaciones y Perfil
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

                <Dropdown.Menu style={{ width: '320px', maxHeight: '400px', overflowY: 'auto' }} className="shadow-lg border-0 mt-2 p-0 rounded-3 ">
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

                <Navbar.Brand as={Link} to={user?.role === 'dietista' ? '/admin/dashboard' : '/mi-plan'} onClick={handleClose} className="fw-bold fs-4 d-flex align-items-center text-white text-decoration-none">
                    <img src={miLogo} alt="Logo StrongHell" className="me-2" style={{ height: '50px', width: 'auto' }} />
                    <span className="text-white">StrongHell</span>
                </Navbar.Brand>

                {/* EN MÓVIL: Las notificaciones y el avatar se renderizan aquí, al lado de la hamburguesa */}
                <MenuUsuario esMovil={true} />

                <Navbar.Toggle aria-controls="offcanvas-navbar" onClick={handleShow} className="border-0 shadow-none" />

                <Navbar.Offcanvas id="offcanvas-navbar" placement="start" show={showMenu} onHide={handleClose} className="bg-white">
                    {/* 🔥 MODIFICADO: Añadido fondo bg-primary, texto blanco y botón de cierre claro */}
                    <Offcanvas.Header closeButton closeVariant="white" className="bg-primary text-white border-bottom border-primary-subtle py-3">
                        <Offcanvas.Title className="fw-bold fs-4 d-flex align-items-center">
                            <img src={miLogo} alt="Logo StrongHell" className="me-2" style={{ height: '40px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
                            <span className="text-white">StrongHell</span>
                        </Offcanvas.Title>
                    </Offcanvas.Header>

                    <Offcanvas.Body className="pt-4 pt-md-0">
                        <Nav className="w-100 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 gap-md-0">
                            
                            {/* --- BLOQUE DE ENLACES PRINCIPALES --- */}
                            <div className="d-flex flex-column flex-md-row gap-1 gap-md-2">
                                <Nav.Link as={Link} to={user?.role === 'dietista' ? '/admin/dashboard' : '/mi-plan'} onClick={handleClose} className="fw-semibold text-secondary text-md-white-50 px-2">
                                    Inicio
                                </Nav.Link>

                                {/* --- OPCIONES EXCLUSIVAS PARA EL PACIENTE --- */}
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

                                {/* --- OPCIONES EXCLUSIVAS PARA EL DIETISTA --- */}
                                {user?.role === 'dietista' && (
                                    <>
                                        <Nav.Link as={Link} to="/dietista/agenda" onClick={handleClose} className="fw-semibold text-secondary text-md-white-50 px-2">
                                            Agenda
                                        </Nav.Link>
                                        <NavDropdown title="Gestión" id="nav-dropdown-dietista" className="fw-semibold px-1">
                                            <NavDropdown.Item as={Link} to="/dietista/ejercicios" onClick={handleClose}>Crear Ejercicios</NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/dietista/ingredientes" onClick={handleClose}>Crear Ingredientes</NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/dietista/rutinas" onClick={handleClose}>Crear Rutinas</NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/dietista/comidas" onClick={handleClose}>Crear Comidas</NavDropdown.Item>
                                        </NavDropdown>
                                    </>
                                )}
                            </div>

                            {/* EN ESCRITORIO: Se muestra el bloque en su lugar original alineado a la derecha */}
                            <MenuUsuario esMovil={false} />

                        </Nav>
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
    );
};

export default Navegador;