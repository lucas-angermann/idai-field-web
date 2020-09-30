import React, { useState, FormEvent, ReactElement } from 'react';
import { Card, Form, Button, InputGroup } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';
import { useTranslation } from 'react-i18next';

export default function SearchBar({ projectId }: { projectId?: string }): ReactElement {

    const [queryString, setQueryString] = useState('');
    const history = useHistory();
    const { t } = useTranslation();

    
    const submitSearch = (e: FormEvent): void => {

        e.preventDefault();
        history.push(`?q=${queryString}`);
    };

    return (
        <Card>
            <Form onSubmit={ submitSearch }>
                <InputGroup>
                    <Form.Control
                        autoFocus={ true }
                        type="text"
                        placeholder={ t('searchBar.search') }
                        onChange={ e => setQueryString(e.target.value) } />
                    <InputGroup.Append>
                        <Button variant="primary" type="submit">
                            <Icon path={ mdiMagnify } size={ 0.8 } />
                        </Button>
                    </InputGroup.Append>
                </InputGroup>
            </Form>
        </Card>
    );
}
