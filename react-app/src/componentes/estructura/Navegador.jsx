import React, { useState } from 'react';
import { Navbar, Container, Nav, Dropdown, Offcanvas } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/ApiLogin/useAuth';
import AvatarUpload from '../AvatarUpload'; // Ajusta la ruta según dónde lo guardaste

// 👇 IMPORTA TU LOGO AQUÍ. Asegúrate de que exista en esa carpeta con ese nombre y extensión.
import miLogo from '../../assets/react.svg'; 

const Navegador = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Estado para controlar el menú lateral en dispositivos móviles
    const [showMenu, setShowMenu] = useState(false);
    const handleClose = () => setShowMenu(false);
    const handleShow = () => setShowMenu(true);

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/');
    };

    // Función para que el logo funcione como botón de inicio
    const irAlInicio = () => {
        handleClose();
        if (user?.role === 'dietista') {
            navigate('/admin/dashboard');
        } else {
            navigate('/mi-plan');
        }
    };

    return (
        <Navbar bg="white" expand="md" className="shadow-sm mb-4 border-bottom sticky-top">
            <Container fluid className="px-4">
                
                {/* LOGO O NOMBRE DE LA APP (Izquierda) */}
                <Navbar.Brand onClick={irAlInicio} style={{ cursor: 'pointer' }} className="fw-bold text-success fs-4 d-flex align-items-center">
                    <img 
                        src={miLogo} 
                        alt="Logo StrongHell" 
                        className="me-2" 
                        style={{ height: '40px', width: 'auto' }} 
                    />
                    StrongHell
                </Navbar.Brand>
                
                {/* BOTÓN HAMBURGUESA (Solo en móvil) */}
                <Navbar.Toggle aria-controls="offcanvas-navbar" onClick={handleShow} className="border-0 shadow-none" />
                
                <Navbar.Offcanvas
                    id="offcanvas-navbar"
                    aria-labelledby="offcanvas-label"
                    placement="start"
                    show={showMenu}
                    onHide={handleClose}
                >
                    <Offcanvas.Header closeButton className="border-bottom">
                        <Offcanvas.Title id="offcanvas-label" className="fw-bold text-success fs-4 d-flex align-items-center">
                            <img 
                                src={miLogo} 
                                alt="Logo StrongHell" 
                                className="me-2" 
                                style={{ height: '30px', width: 'auto' }} 
                            />
                            StrongHell
                        </Offcanvas.Title>
                    </Offcanvas.Header>
                    
                    <Offcanvas.Body className="d-flex align-items-center">
                        
                        {/* ENLACES (Se quedan pegados a la izquierda) */}
                        <Nav className="me-auto gap-2">
                            <Nav.Link onClick={irAlInicio} className="fw-semibold text-dark">
                                Inicio
                            </Nav.Link>
                        </Nav>

                        {/* ZONA DEL USUARIO (Empujada a la derecha gracias a ms-auto) */}
                        <Nav className="ms-auto align-items-center mt-3 mt-md-0">
                            
                            <Dropdown align="end">
                                {/* Toggle: Lo que el usuario ve y hace clic */}
                                <Dropdown.Toggle 
                                    variant="link" 
                                    className="d-flex align-items-center gap-3 text-decoration-none shadow-none border-0 p-0" 
                                    id="dropdown-avatar"
                                >
                                    <div className="text-end d-none d-sm-block text-dark">
                                        <p className="mb-0 fw-bold lh-1">{user?.name || 'Usuario'}</p>
                                        <span className="text-muted small text-capitalize fw-medium">
                                            {user?.role || 'Invitado'}
                                        </span>
                                    </div>
                                    
                                    {/* El componente de tu avatar */}
                                    <AvatarUpload />
                                </Dropdown.Toggle>

                                {/* Menú emergente que sale al hacer clic */}
                                <Dropdown.Menu className="shadow border-0 mt-2">
                                    <Dropdown.Item onClick={handleLogout} className="text-danger fw-bold">
                                         Cerrar Sesión
                                    </Dropdown.Item>
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