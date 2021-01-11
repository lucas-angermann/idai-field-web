import React, { ReactElement, Fragment } from 'react';
import { Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { mdiMenuRight } from '@mdi/js';
import Icon from '@mdi/react';
import './document-hierar-nav.css';

export interface BreadcrumbItem {
    identifier: string;
    url: string;
    id?: string;
}

interface DocumentBreadcrumbProps {
    breadcrumbs: BreadcrumbItem[];
}

export default function DocumentBreadcrumb({ breadcrumbs }: DocumentBreadcrumbProps): ReactElement {
    return (
        <Row className="ml-3">
            { breadcrumbs.map((item, index) => (
                <Fragment key={ `hierar_${item.id}` }>
                    { index > 0 && item.identifier !== '' ?
                        <Icon path={ mdiMenuRight} size={ 1} className="navigation-arrow"></Icon> : null
                    }
                    <Link to={ item.url}>{ item.identifier}</Link>
                </Fragment> ))
            }
        </Row>
    );
}