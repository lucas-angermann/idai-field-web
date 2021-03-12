import React, { CSSProperties, ReactElement, ReactNode, useContext, useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Document, FieldValue, getDocumentDescription, getDocumentImages } from '../../api/document';
import { get } from '../../api/documents';
import { FilterBucketTreeNode, ResultDocument, ResultFilter } from '../../api/result';
import CONFIGURATION from '../../configuration.json';
import CategoryIcon from '../../shared/document/CategoryIcon';
import DocumentPermalinkButton from '../../shared/document/DocumentPermalinkButton';
import { ImageCarousel } from '../../shared/image/ImageCarousel';
import { getLabel } from '../../shared/languages';
import { useSearchParams } from '../../shared/location';
import { LoginContext } from '../../shared/login';
import SearchBar from '../../shared/search/SearchBar';
import { getProjectLabel } from '../projects';
import { initFilters } from './Project';
import ProjectHomeButton from './ProjectHomeButton';
import ProjectMap from './ProjectMap';

const MAP_FIT_OPTIONS = { padding : [ 100, 100, 100, 100 ], duration: 500 };

export default function ProjectEntry ():ReactElement {

    const { projectId } = useParams<{ projectId: string }>();
    const loginData = useContext(LoginContext);
    const searchParams = useSearchParams();
    const { t } = useTranslation();

    const [filters, setFilters] = useState<ResultFilter[]>([]);
    const [projectDoc, setProjectDoc] = useState<Document>();
    const [description, setDescription] = useState<FieldValue>('');
    const [title, setTitle] = useState<string>('');
    const [images, setImages] = useState<ResultDocument[]>();

    useEffect(() => {

        initFilters(projectId, searchParams, loginData.token)
            .then(result => setFilters(result.filters));

        get(projectId, loginData.token)
            .then(setProjectDoc);
    }, [projectId, loginData, searchParams]);

    useEffect(() => {

        if(projectDoc){
            const newDescription = getDocumentDescription(projectDoc);
            setDescription(newDescription || '');
            setImages(getDocumentImages(projectDoc));
            setTitle(getProjectLabel(projectDoc));
        }
       

    },[projectDoc, projectId]);
 
    if (!projectDoc || !filters) return null;
    return (
        <Card className="m-3">
            <Card.Header>
                <Row>
                    <Col>
                        <h2><img src="/marker-icon.svg" alt="Home" style={ homeIconStyle } /> { title }</h2>
                    </Col>
                    <Col className="text-right">
                        <DocumentPermalinkButton id={ projectId } baseUrl={ CONFIGURATION.fieldUrl } type="project" />
                    </Col>
                </Row>
            </Card.Header>
            <Card.Body>
                <Row className="p-2">
                    <Col className="col-4">
                        <Row>
                            <Col>
                                <SearchBar basepath={ `/project/${projectId}` } />
                            </Col>
                        </Row>
                        <Row className="mt-3 ml-1">
                            <Col>
                                <Card.Text>
                                    <strong>{ t('projectEntry.categories') }</strong>
                                </Card.Text>
                            </Col>
                        </Row>
                        <Row className="p-3">
                            <Col style={ filterColStyle }>
                                { renderFilters(filters, projectId) }
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <Row>
                            { images &&
                            <Col className="col-6">
                                <ImageCarousel document={ projectDoc } images={ images } style={ imageCarouselStyle } />
                            </Col>
                            }
                            { description &&
                            <Col>
                                <Card.Text>{ description }</Card.Text>
                            </Col>
                            }
                        </Row>
                        <Row className="mt-1">
                            <Col className="col-6" >
                            <ProjectMap
                                    selectedDocument={ projectDoc }
                                    predecessors={ [] }
                                    project={ projectId }
                                    onDeselectFeature={ undefined }
                                    fitOptions={ MAP_FIT_OPTIONS }
                                    spinnerContainerStyle={ MapSpinnerContainerStyle }
                                    isMiniMap={ true } />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col className="d-flex align-items-start flex-column">
                                { <ProjectHomeButton projectDocument={ projectDoc }
                                    label={ t('projectEntry.toHierarOverview') } /> }
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}


const renderFilters = (filters: ResultFilter[], projectId: string) =>
    filters.map((filter: ResultFilter) =>
        filter.name === 'resource.category.name' && renderFilter(filter, projectId));


const renderFilter = (filter: ResultFilter, projectId: string) =>
    filter.values.map((bucket: FilterBucketTreeNode) =>
        renderFilterValue(bucket, projectId));


const renderFilterValue = (bucket: FilterBucketTreeNode, projectId: string, level: number = 1): ReactNode => (
        <div style={ filterValueStyle(level) } key={ bucket.item.value.name }>
            { renderFilterItem(bucket, projectId) }
            { bucket.trees && bucket.trees.map((b: FilterBucketTreeNode) =>
                renderFilterValue(b, projectId, level + 1))
            }
        </div>
    );


const filterValueStyle = (level: number): CSSProperties => ({
    paddingLeft: `${level * 1.0}em`
});


const renderFilterItem = (bucket: FilterBucketTreeNode, projectId: string) => (
    <Link to={ `/project/${projectId}?q=*&resource.category.name=${bucket.item.value.name}` }>
        <Row>
            <Col>
                <CategoryIcon category={ bucket.item.value } size="20" />
            </Col>
            <Col>
                { getLabel(bucket.item.value) }
            </Col>
            <Col className="text-right">
                { bucket.item.count }
            </Col>
        </Row>
    </Link>
);


const filterColStyle: CSSProperties = {
    overflowY: 'scroll',
    maxHeight: '55vh'
};


const imageCarouselStyle: CSSProperties = {
    background: '#d3d3cf'
};


const MapSpinnerContainerStyle: CSSProperties = {
    position: 'absolute',
    top: '45%',
    left: '45%',
    zIndex: 1
};


const homeIconStyle: CSSProperties = {
    height: '1.5rem',
    width: '1.5rem',
    marginTop: '-0.3rem'
};
