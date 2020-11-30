import React, { ReactElement, Fragment } from 'react';
import { Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { mdiMenuRight } from '@mdi/js';
import Icon from '@mdi/react';
import './document-hierar-nav.css';

export interface HierarItem  {
    name: string;
    url: string;
    id?: string;
}

interface DocumentHierarNavProps {
    hierarchy: HierarItem[];
}

export default function DocumentHierarNav({ hierarchy}: DocumentHierarNavProps): ReactElement {
    return (
        <Row className="ml-3">
            { hierarchy.map((item, index) => (
                <Fragment key={ `hierar_${item.id}` }>
                    { index > 0 && item.name !== '' ?
                        <Icon path={ mdiMenuRight} size={ 1} className="navigation-arrow"></Icon> : null
                    }
                    <Link to={ item.url}>{ item.name}</Link>
                </Fragment> ))
            }
        </Row>
    );
}