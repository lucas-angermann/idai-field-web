import React, { CSSProperties, ReactElement, ReactNode, useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Row, Col, Card } from 'react-bootstrap';
import SearchBar from '../../shared/search/SearchBar';
import { Document, getDocumentImages, getDocumentDescription, FieldValue } from '../../api/document';
import { get } from '../../api/documents';
import { LoginContext } from '../../shared/login';
import { ImageCarousel } from '../../shared/image/ImageCarousel';
import { ResultDocument, ResultFilter, FilterBucketTreeNode } from '../../api/result';
import { useSearchParams } from '../../shared/location';
import ProjectHomeButton from './ProjectHomeButton';
import { deselectFeature, initFilters } from './Project';
import CategoryIcon from '../../shared/document/CategoryIcon';
import { getLabel } from '../../shared/languages';
import ProjectMap from './ProjectMap';

const MAP_FIT_OPTIONS = { padding : [ 100, 100, 100, 100 ], duration: 500 };

export default function ProjectEntry ():ReactElement {

    const { projectId } = useParams<{ projectId: string }>();
    const loginData = useContext(LoginContext);
    const history = useHistory();
    const searchParams = useSearchParams();

    const [filters, setFilters] = useState<ResultFilter[]>([]);
    const [projectDoc, setProjectDoc] = useState<Document>();
    const [description, setDescription] = useState<FieldValue>('');
    const [images, setImages] = useState<ResultDocument[]>();

    useEffect(() => {

        initFilters(projectId, searchParams, loginData.token)
            .then(result => setFilters(result.filters));

        get(projectId, loginData.token)
            .then(setProjectDoc);
    }, [projectId, loginData, searchParams]);

    useEffect(() => {

        if(projectDoc){
            const description = getDocumentDescription(projectDoc);
            setDescription(description? description : '');
            setImages(getDocumentImages(projectDoc));
        }

    },[projectDoc]);

 
    if (!projectDoc || !filters) return null;
    return (
        <Card className="m-3">
            <Row className="text-center p-2">
                <Col>
                    <Card.Title >
                        <strong>{ projectDoc.resource.shortDescription }</strong>
                    </Card.Title>
                </Col>
            </Row>
            <Row className="p-2">
                <Col className="col-4">
                    <Row>
                        <Col>
                            <SearchBar basepath={ `/project/${projectId}` } />
                        </Col>
                    </Row>
                    <Row className="text-center pt-2">
                        <Col>
                            <Card.Text>Kategorien</Card.Text>
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
                                onDeselectFeature={ () => deselectFeature(projectDoc, searchParams, history) }
                                fitOptions={ MAP_FIT_OPTIONS }
                                spinnerContainerStyle={ MapSpinnerContainerStyle }
                                mapHeightVh={ 40 } />
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row>
                <Col className="d-flex align-items-end flex-column">
                            { <ProjectHomeButton projectId={ projectId } /> }
                </Col>
            </Row>
        </Card>
    );
}


const renderFilters = (filters: ResultFilter[], projectId: string) =>
    filters.map((filter: ResultFilter) =>
        filter.name === 'resource.category.name' && renderFilter(filter, projectId));


const renderFilter = (filter: ResultFilter, projectId?: string) =>
    filter.values.map((bucket: FilterBucketTreeNode) =>
        renderFilterValue(bucket, projectId));


const renderFilterValue = (bucket: FilterBucketTreeNode, projectId: string): ReactNode => (
        <React.Fragment key={ bucket.item.value.name }>
            { renderFilterItem(bucket) }
            { bucket.trees && bucket.trees.map((b: FilterBucketTreeNode) =>
                renderFilterValue(b, projectId))
            }
        </React.Fragment>
    );


const renderFilterItem = (bucket: FilterBucketTreeNode) => (
    <Row>
        <Col>
            <CategoryIcon category={ bucket.item.value } size="20" />
        </Col>
        <Col>
            { getLabel(bucket.item.value) }
        </Col>
        <Col>
            { bucket.item.count }
        </Col>
    </Row>
);


const filterColStyle: CSSProperties = {
    overflowY: 'scroll',
    maxHeight: '58vh'
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