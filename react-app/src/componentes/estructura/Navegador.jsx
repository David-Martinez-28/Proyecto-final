import React, { useState } from 'react';
import { Navbar, Container, Nav, Dropdown, Offcanvas, NavDropdown } from 'react-bootstrap';
// ¡IMPORTANTE! Añadimos 'Link' a la importación
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/ApiLogin/useAuth';
import miLogo from '../../assets/logo.png'; // Asegúrate de que esta ruta sea correcta

const Navegador = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [showMenu, setShowMenu] = useState(false);
    const handleClose = () => setShowMenu(false);
    const handleShow = () => setShowMenu(true);

    const handleLogout = async () => {
        handleClose();
        await logout();
        navigate('/');
    };

    return (
        <Navbar  expand="md" className="navbar shadow-sm mb-4 border-bottom sticky-top">
            <Container fluid className="px-4">

                {/* Corregido: Usamos 'as={Link}' en el Brand */}
                <Navbar.Brand as={Link} to={user?.role === 'dietista' ? '/admin/dashboard' : '/mi-plan'} onClick={handleClose} style={{ cursor: 'pointer' }} className="fw-bold  fs-4 d-flex align-items-center">
                    <img src={miLogo} alt="Logo StrongHell" className="me-2" style={{ height: '100px', width: 'auto' }} />
                    StrongHell
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="offcanvas-navbar" onClick={handleShow} className="border-0 shadow-none" />

                <Navbar.Offcanvas id="offcanvas-navbar" placement="start" show={showMenu} onHide={handleClose}>
                    <Offcanvas.Header closeButton className="border-bottom">
                        <Offcanvas.Title className="fw-bold  fs-4 d-flex align-items-center">
                            <img src={miLogo} alt="Logo StrongHell" className="me-2" style={{ height: '40px', width: 'auto' }} />
                            StrongHell
                        </Offcanvas.Title>
                    </Offcanvas.Header>

                    <Offcanvas.Body className="d-flex align-items-center">
                        <Nav className="me-auto gap-2">
                            {/* Corregido: Enlace de Inicio */}
                            <Nav.Link as={Link} to={user?.role === 'dietista' ? '/admin/dashboard' : '/mi-plan'} onClick={handleClose} className="fw-semibold ">Inicio</Nav.Link>

                            {/* --- OPCIONES EXCLUSIVAS PARA EL PACIENTE --- */}
                            {user?.role === 'paciente' && (
                                <>
                                <Nav.Link as={Link} to="/paciente/pedir-cita" onClick={handleClose} className="fw-semibold ">
                                    Pedir Cita
                                </Nav.Link>
                                
                                <Nav.Link 
                                    as={Link} 
                                    to="/paciente/estadisticas" // 👈 Simplificado, sin el ID en la URL de React
                                    onClick={handleClose} 
                                    className="fw-semibold"
                                >
                                    Mis Mediciones
                                </Nav.Link>
                                </>
                                
                            )}

                            {/* --- OPCIONES EXCLUSIVAS PARA EL DIETISTA --- */}
                            {user?.role === 'dietista' && (
                                <>
                                    {/* Nuevo enlace a la Agenda */}
                                    <Nav.Link as={Link} to="/dietista/agenda" onClick={handleClose} className="fw-semibold ">
                                        Agenda
                                    </Nav.Link>

                                    {/* Dropdown de Gestión con as={Link} para evitar recargas */}
                                    <NavDropdown title="Gestión" id="nav-dropdown-dietista" className="fw-semibold">
                                        <NavDropdown.Item as={Link} to="/dietista/ejercicios" onClick={handleClose}>Crear Ejercicios</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/dietista/ingredientes" onClick={handleClose}>Crear Ingredientes</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/dietista/rutinas" onClick={handleClose}>Crear Rutinas</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/dietista/comidas" onClick={handleClose}>Crear Comidas</NavDropdown.Item>
                                    </NavDropdown>
                                </>
                            )}
                        </Nav>

                        <Nav className="ms-auto align-items-center mt-3 mt-md-0">
                            <Dropdown align="end">
                                <Dropdown.Toggle variant="link" className="d-flex align-items-center gap-3 text-decoration-none shadow-none border-0 p-0" id="dropdown-avatar">
                                    <div className="text-end d-none d-sm-block text-dark">
                                        <p className="mb-0 fw-bold lh-1">{user?.name || 'Usuario'}</p>
                                        <span className="text-muted small text-capitalize fw-medium">{user?.role || 'Invitado'}</span>
                                    </div>
                                    <img src={user?.imagen || '/default-avatar.png'} alt="Avatar" className="rounded-circle foto-perfil" />
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="shadow border-0 mt-2">
                                    <Dropdown.Item as={Link} to="/perfil" onClick={handleClose}>
                                        Editar Perfil
                                    </Dropdown.Item>

                                    <Dropdown.Divider /> {/* Una línea separadora visual */}
                                    <Dropdown.Item onClick={handleLogout} className="text-danger fw-bold">Cerrar Sesión</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav>
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
    );
};

export default Navegador;