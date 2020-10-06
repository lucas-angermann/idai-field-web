import React, { CSSProperties, ReactElement } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CategoryIcon from './CategoryIcon';
import { ResultDocument } from '../api/result';
import './document-teaser.css';
import { useTranslation } from 'react-i18next';

const IMAGE_CATEGORIES = ['Image', 'Photo', 'Drawing'];

export default React.memo(function DocumentTeaser(
    { document, searchParams = '', size = 'normal', project = 'undefined' }
        : { document: ResultDocument, project?: string
            /* on rendering relation targets, the project is not part of the document*/,
            searchParams?: string, size?: 'small' | 'normal' }): ReactElement {

    const height = (size === 'small') ? 26 : 40;
    const { t } = useTranslation();

    if (document['deleted'] === true && document['deleted'] === 'true') {
        return (<div>{ t('documentTeaser.noTargetResource') } [{ document.resource.id }]</div>);
    }

    const isImage = IMAGE_CATEGORIES.includes(document.resource.category.name);
    const linkUrl = isImage
        ? `/image/${document?.project ?? project}/${document.resource.id}`
        : `/project/${document?.project ?? project}/${document.resource.id}${searchParams}`;

    return (
        <Link to={ linkUrl }
            style={ linkStyle }
            className="document-teaser">
            <div className={ `py-2 px-4 teaser-container teaser-${size}` }>
                <Row>
                    <Col style={ { flex: `0 0 ${height}px`, height: `${height}px` } } className="pl-2">
                        <CategoryIcon size={ `${height}` }
                                      category={ document.resource.category }/>
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
