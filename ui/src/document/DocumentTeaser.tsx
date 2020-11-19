import React, { CSSProperties, ReactElement } from 'react';
import { Row, Col, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiMenuLeft, mdiMenuRight, mdiMenuUp } from '@mdi/js';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import CategoryIcon from './CategoryIcon';
import { ResultDocument } from '../api/result';
import './document-teaser.css';
import LinkButton from '../LinkButton';

const IMAGE_CATEGORIES = ['Image', 'Photo', 'Drawing'];


export default React.memo(function DocumentTeaser(
    { document, searchParams = '', size = 'normal',
            project, showHierarchyButton = false,
            backButtonUrl, asLink = true, hierarchyHeader = false,
            imageHeader = false }
        : { document: ResultDocument, searchParams?: string, size?: 'small' | 'normal',
            /* on rendering relation targets, the project is not part of the document*/
            project?: string, showHierarchyButton?: boolean, backButtonUrl?: string,
            asLink?: boolean, hierarchyHeader?: boolean, imageHeader?: boolean }): ReactElement {

    const height = (size === 'small') ? 26 : 40;
    const { t } = useTranslation();

    if (document.deleted) {
        return (<div>{ t('documentTeaser.noTargetResource') } [{ document.resource.id }]</div>);
    }

    if (hierarchyHeader) searchParams += (searchParams.length > 0) ? '&r=children' : '?r=children';

    const isImage = IMAGE_CATEGORIES.includes(document.resource.category.name);
    const linkUrl = isImage
        ? `/image/${document?.project ?? project}/${document.resource.id}`
        : `/project/${document?.project ?? project}/${document.resource.id}${searchParams}`;

    return (
        <Row className="no-gutters document-teaser">
            { backButtonUrl && renderBackButton(height, searchParams, backButtonUrl, t, imageHeader, project) }
            <Col>
                { asLink
                    ? <Link to={ linkUrl } style={ linkStyle }>
                        { renderTeaser(document, size, height, asLink, hierarchyHeader) }
                    </Link>
                    : renderTeaser(document, size, height, asLink, hierarchyHeader)
                }
            </Col>
            { showHierarchyButton && document.resource.childrenCount > 0 &&
                <Col style={ { flex: `0 0 30px` } } className="teaser-button hierarchy-button">
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
                              category={ document.resource.category }/>
            </Col>
            <Col>
                <Row>
                    <Col className={ 'p-0' + (limitHeight ? ' limit-height' : '') }>
                        { document.resource.shortDescription
                            ? <h4 className="m-0">{ document.resource.identifier }</h4>
                            : <h3 className="my-2">{ document.resource.identifier }</h3>
                        }
                    </Col>
                </Row>
                { document.resource.shortDescription &&
                <Row>
                    <Col className={ 'p-0 text-muted short-description' + (limitHeight ? ' limit-height' : '') }>
                        { document.resource.shortDescription }
                    </Col>
                </Row>
                }
            </Col>
        </Row>
    </div>
);


const renderBackButton = (height: number, locationSearch: string, backButtonUrl: string, t: TFunction,
                          imageHeader: boolean, projectId?: string): ReactElement => {

    const searchParams = new URLSearchParams(locationSearch);
    const overviewSearch = searchParams.get('r') === 'overview';
    searchParams.delete('r');

    return searchParams.has('q')
        ? <Dropdown>
            <Dropdown.Toggle variant="link" id="back-button-toggle"
                             style={ { flex: `0 0 ${height}px` } }
                             className="teaser-button">
                <Icon path={ mdiMenuUp } size={ 1 }></Icon>
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item href={ (overviewSearch ? '/?' : `/project/${projectId}?`)
                        + searchParams.toString() }>
                    { t('project.backToSearchResults') }
                </Dropdown.Item>
                <Dropdown.Item href={ backButtonUrl }>
                    { t('project.viewInContext') }
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
        : <Col style={ { flex: `0 0 ${height}px` } } className="teaser-button">
            <LinkButton to={ backButtonUrl } style={ { height: '100%' } } variant={ 'link' }>
                <Icon path={ imageHeader ? mdiMenuLeft : mdiMenuUp } size={ 1 }></Icon>
            </LinkButton>
        </Col>;
};


const getHierarchyButtonSearchParams = (searchParams: string | undefined, documentId: string) => {

    const params = new URLSearchParams(searchParams);
    params.set('parent', documentId);

    return params.toString();
};


const linkStyle: CSSProperties = {
    textDecoration: 'none',
    color: 'black'
};
