import React, { useState, FormEvent, ReactElement, useEffect, useRef } from 'react';
import { Card, Form, Button, InputGroup } from 'react-bootstrap';
import { useHistory, useLocation } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiCloseCircle, mdiMagnify } from '@mdi/js';
import { useTranslation } from 'react-i18next';
import { parseFrontendGetParams } from '../api/query';


export default function SearchBar({ projectId, onSubmit }
        : { projectId?: string, onSubmit?: () => void }): ReactElement {

    const [queryString, setQueryString] = useState(undefined);
    const history = useHistory();
    const { t } = useTranslation();
    const location = useLocation();
    const input = useRef<HTMLInputElement>();

    useEffect(() => {
        setQueryString(parseQueryString(location.search));
    }, [location.search]);

    
    const submitSearch = (e: FormEvent): void => {
        e.preventDefault();
        history.push((projectId ? `/project/${projectId}` : '/') + `?q=${queryString ?? '*'}`);
        if (onSubmit) onSubmit();
    };

    const resetQueryString = (): void => {
        const params = new URLSearchParams(location.search);
        if (params.has('q')) {
            params.delete('q');
            history.push(`?${params}`);
        } else {
            setQueryString(undefined);
            input.current.value = '';
        }
    };

    return (
        <Card>
            <Form onSubmit={ submitSearch }>
                <InputGroup>
                    <Form.Control
                        autoFocus={ true }
                        type="text"
                        placeholder={ t('searchBar.search') }
                        value={ queryString ?? '' }
                        onChange={ e => setQueryString(e.target.value) }
                        ref={ input } />
                    <InputGroup.Append>
                        { isResetQueryButtonVisible(location.search) &&
                            <Button variant="link" onClick={ resetQueryString } style={ { paddingTop: '4px' } }>
                                <Icon path={ mdiCloseCircle } size={ 0.8 } />
                            </Button>
                        }
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


const isResetQueryButtonVisible = (locationSearch: string): boolean => {

    return new URLSearchParams(locationSearch).has('q');
};
