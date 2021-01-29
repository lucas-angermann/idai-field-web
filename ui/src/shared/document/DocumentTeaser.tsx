import { mdiMenuRight } from '@mdi/js';
import Icon from '@mdi/react';
import React, { CSSProperties, ReactElement } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ResultDocument } from '../../api/result';
import LinkButton from '../linkbutton/LinkButton';
import CategoryIcon from './CategoryIcon';
import './document-teaser.css';
import { isType } from './document-utils';


interface DocumentTeaserProps {
    document: ResultDocument;
    searchParams?: string;
    size?: 'small' | 'normal';
    showHierarchyButton?: boolean;
    linkUrl?: string;
    hierarchyHeader?: boolean;
    imageHeader?: boolean;
}


export default React.memo(function DocumentTeaser(
    { document, searchParams = '', size = 'normal',
            showHierarchyButton = false,
            linkUrl, hierarchyHeader = false }
        : DocumentTeaserProps): ReactElement {

    const height = (size === 'small') ? 26 : 40;
    const { t } = useTranslation();

    if (!document) return <></>;

    if (document.deleted) {
        return (<div>{ t('documentTeaser.noTargetResource') } [{ document.resource.id }]</div>);
    }

    if (hierarchyHeader) searchParams += (searchParams.length > 0) ? '&r=children' : '?r=children';

    return (
        <Row className="no-gutters document-teaser">
            <Col>
                { linkUrl
                    ? <Link to={ linkUrl }
                            target={ isType(document) ? '_blank' : '' }
                            style={ linkStyle } >
                        { renderTeaser(document, size, height, linkUrl?.length > 0, hierarchyHeader) }
                    </Link>
                    : renderTeaser(document, size, height, linkUrl?.length > 0, hierarchyHeader)
                }
            </Col>
            { showHierarchyButton && document.resource.childrenCount > 0 &&
                <Col style={ { flex: '0 0 30px' } } className="teaser-button hierarchy-button">
                    <LinkButton to={ '?' + getHierarchyButtonSearchParams(searchParams, document.resource.id) }
                            style={ { height: '100%' } } variant={ 'link' }>
                        <Icon path={ mdiMenuRight } size={ 1 }></Icon>
                    </LinkButton>
                </Col>
            }
        </Row>
    );
});


const renderTeaser = (document: ResultDocument, size: string, height: number, asLink: boolean,
                      limitHeight: boolean) => (

    <div className={ `py-2 px-4 teaser-container teaser-${size} ${asLink ? 'link' : ''}` }>
        <Row>
            <Col style={ { flex: `0 0 ${height}px`, height: `${height}px` } } className="pl-2">
                <CategoryIcon size={ `${height}` }
                              category={ document.resource.category } />
            </Col>
            <Col>
                <Row>
                    <Col className={ 'p-0' + (limitHeight ? ' limit-height' : '') }>
                        { document.resource.shortDescription
                            ? <h4 className="m-0" style={ textStyle }>{ document.resource.identifier }</h4>
                            : <h3 className="my-2" style={ textStyle }>{ document.resource.identifier }</h3>
                        }
                    </Col>
                </Row>
                { document.resource.shortDescription &&
                <Row>
                    <Col className={ 'p-0 text-muted short-description' + (limitHeight ? ' limit-height' : '') }
                         style={ textStyle }>
                        { document.resource.shortDescription }
                    </Col>
                </Row>
                }
            </Col>
        </Row>
    </div>
);


const getHierarchyButtonSearchParams = (searchParams: string | undefined, documentId: string) => {

    const params = new URLSearchParams(searchParams);
    params.set('parent', documentId);

    return params.toString();
};


const linkStyle: CSSProperties = {
    textDecoration: 'none',
    color: 'black'
};


const textStyle: CSSProperties = {
    wordBreak: 'break-word'
};
