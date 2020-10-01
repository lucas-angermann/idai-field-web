import React, { useState, FormEvent, ReactElement, useEffect } from 'react';
import { Card, Form, Button, InputGroup } from 'react-bootstrap';
import { useHistory, useLocation } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';
import { useTranslation } from 'react-i18next';
import { parseFrontendGetParams } from '../api/query';

export default function SearchBar({ projectId }: { projectId?: string }): ReactElement {

    const [queryString, setQueryString] = useState('');
    const history = useHistory();
    const { t } = useTranslation();
    const location = useLocation();

    useEffect(() => {
        setQueryString(parseQueryString(location.search));
    }, [location.search]);

    
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
                        value={ queryString }
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


const parseQueryString = (locationSearch: string): string => {

    const queryString = parseFrontendGetParams(locationSearch).q;
    return queryString === '*' ? '' : queryString;
};
