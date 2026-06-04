import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-light text-center py-4 mt-auto border-top">
            <Container>
                <Row>
                    <Col>
                        <p className="mb-1 fw-bold">StrongHell © {new Date().getFullYear()}</p>
                        <p className="text-muted small">
                            Transformando tu salud con ciencia y disciplina.
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;