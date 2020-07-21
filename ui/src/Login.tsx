import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

export default function Login({ onLogin }) {

    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const history = useHistory();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const jwtToken = await postLogin(user, password);
        onLogin(jwtToken);
        history.push('/');
    };

    return (
        <Container>
            <Row>
                <Col>
                    <Card>
                        <Card.Body>
                            <Form onSubmit={ handleSubmit }>
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label>Benutzername</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Benutzername"
                                        onChange={ e => setUser(e.target.value) } />
                                </Form.Group>
                                <Form.Group controlId="formBasicPassword">
                                    <Form.Label>Passwort</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Passwort"
                                        onChange={ e => setPassword(e.target.value) } />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    Einloggen
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );

}


const postLogin = async (user: string, password: string): Promise<any> => {

    const response = await fetch('/auth/sign_in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: user, pass: password })
    });
    return {
        user,
        token: (await response.json()).token
    };
};
