import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { LoginData } from './App';

export default function Login({ onLogin }: { onLogin: (_: LoginData) => void }) {

    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [persistLogin, setPersistLogin] = useState(false);
    const history = useHistory();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const loginData = await postLogin(user, password);
        if (persistLogin) doPersistLogin(loginData);
        onLogin(loginData);
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
                                <Form.Group controlId="formBasicCheckbox">
                                    <Form.Check
                                        type="checkbox"
                                        label="Eingeloggt bleiben"
                                        onChange={ e => setPersistLogin(e.target.value) }/>
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


const postLogin = async (user: string, password: string): Promise<LoginData> => {

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


const doPersistLogin = (loginData: LoginData) =>
    localStorage.setItem('loginData', JSON.stringify(loginData));
