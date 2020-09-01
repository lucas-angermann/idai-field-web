import React, { CSSProperties, ReactElement } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CategoryIcon from './CategoryIcon';
import { ResultDocument } from '../api/result';
import './document-teaser.css';


export default React.memo(function DocumentTeaser({ document, searchParams = '', size = 'normal' }
        : { document: ResultDocument, searchParams?: string, size?: 'small' | 'normal' }): ReactElement {

    const height = (size === 'small') ? 26 : 40;

    if (document['deleted'] === true && document['deleted'] === 'true') {
        return (<div>Zielressource nicht vorhanden [{ document.resource.id }]</div>);
    }

    return (
        <Link to={ `/project/${document.project}/${document.resource.id}${searchParams}` }
            style={ linkStyle }
            className="document-teaser">
            <div className={ `py-2 px-4 teaser-container teaser-${size}` }>
                <Row>
                    <Col style={ { flex: `0 0 ${height}px`, height: `${height}px` } } className="pl-2">
                        <CategoryIcon size={ `${height}` } category={ document.resource.category } />
                    </Col>
                    <Col>
                        <Row>
                            <Col className="p-0">
                                { document.resource.shortDescription
                                    ? <h4 className="m-0">{ document.resource.identifier }</h4>
                                    : <h3 className="my-2">{ document.resource.identifier }</h3>
                                }
                            </Col>
                        </Row>
                        { document.resource.shortDescription &&
                            <Row>
                                <Col className="p-0 text-muted short-description">
                                    { document.resource.shortDescription }
                                </Col>
                            </Row>
                        }
                    </Col>
                </Row>
            </div>
        </Link>
    );

});


const linkStyle: CSSProperties = {
    textDecoration: 'none',
    color: 'black'
};
