import React, { CSSProperties, ReactElement } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CategoryIcon from './CategoryIcon';
import { ResultDocument } from '../api/result';

export default React.memo(function DocumentTeaser({ document, searchParams = '' }
        : { document: ResultDocument, searchParams?: string }): ReactElement {

    return (
        <Link to={ `/project/${document.project}/${document.resource.id}${searchParams}` } style={ linkStyle }>
            <Row className="m-0">
                <Col style={ { flex: '0 0 40px' } } className="pl-2">
                    <CategoryIcon size="40" category={ document.resource.category } />
                </Col>
                <Col>
                    <Row>
                        <Col className="p-0"><h4 className="m-0">{ document.resource.identifier }</h4></Col>
                    </Row>
                    <Row>
                        <Col className="p-0 text-muted" style={ { fontSize: '.9rem' } }>
                            { document.resource.shortDescription }
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Link>
    );

});


const linkStyle: CSSProperties = {
    textDecoration: 'none',
    color: 'black'
};
