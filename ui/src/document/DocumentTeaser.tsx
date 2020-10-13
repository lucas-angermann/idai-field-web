import React, { CSSProperties, ReactElement } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiMenuRight } from '@mdi/js';
import { useTranslation } from 'react-i18next';
import CategoryIcon from './CategoryIcon';
import { ResultDocument } from '../api/result';
import './document-teaser.css';
import LinkButton from '../LinkButton';

const IMAGE_CATEGORIES = ['Image', 'Photo', 'Drawing'];

export default React.memo(function DocumentTeaser(
    { document, searchParams = '', size = 'normal',
            project = 'undefined', showHierarchyButton = false }
        : { document: ResultDocument, searchParams?: string, size?: 'small' | 'normal',
            /* on rendering relation targets, the project is not part of the document*/
            project?: string, showHierarchyButton?: boolean}): ReactElement {

    const height = (size === 'small') ? 26 : 40;
    const { t } = useTranslation();

    if (document.deleted) {
        return (<div>{ t('documentTeaser.noTargetResource') } [{ document.resource.id }]</div>);
    }

    const isImage = IMAGE_CATEGORIES.includes(document.resource.category.name);
    const linkUrl = isImage
        ? `/image/${document?.project ?? project}/${document.resource.id}`
        : `/project/${document?.project ?? project}/${document.resource.id}${searchParams}`;

    return (
        <Row className="no-gutters document-teaser">
            <Col>
                <Link to={ linkUrl }
                      style={ linkStyle }>
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
            </Col>
            { showHierarchyButton && document.resource.childrenCount > 0 &&
                <Col style={ { flex: `0 0 ${height}px` } } className="hierarchy-button">
                    <LinkButton to={ '?' + getHierarchyButtonSearchParams(searchParams, document.resource.id) }
                            style={ { height: '100%' } } variant={ 'link' }>
                        <Icon path={ mdiMenuRight } size={ 1 }></Icon>
                    </LinkButton>
                </Col>
            }
        </Row>
    );
});


const getHierarchyButtonSearchParams = (searchParams: string | undefined, documentId: string) => {

    const params = new URLSearchParams(searchParams);
    params.set('parent', documentId);

    return params.toString();
};


const linkStyle: CSSProperties = {
    textDecoration: 'none',
    color: 'black'
};
