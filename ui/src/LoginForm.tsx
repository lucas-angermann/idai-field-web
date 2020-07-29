import React, { useState, ReactElement } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { postLogin, persistLogin, LoginData } from './login';

export default function LoginForm({ onLogin }: { onLogin: (_: LoginData) => void }): ReactElement {

    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [shouldPersistLogin, setShouldPersistLogin] = useState(false);
    const [loginFailed, setLoginFailed] = useState(false);
    const history = useHistory();

    const handleSubmit = async (e: any) => {

        e.preventDefault();
        const loginData = await postLogin(user, password);
        if (loginData) {
            if (shouldPersistLogin) persistLogin(loginData);
            onLogin(loginData);
            history.push('/');
        } else {
            setLoginFailed(true);
        }
    };

    return (
        <Container>
            <Row>
                <Col>
                    { loginFailed && <Alert variant="danger">Nutzername oder Passwort falsch!</Alert> }
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
                                        onChange={ e => setShouldPersistLogin(e.target.value) }/>
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
