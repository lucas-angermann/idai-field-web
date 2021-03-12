import React, { CSSProperties, ReactElement, useContext, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Document, FieldValue, getDocumentDescription, getDocumentImages } from '../../api/document';
import { get } from '../../api/documents';
import { ResultDocument, ResultFilter } from '../../api/result';
import CONFIGURATION from '../../configuration.json';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../../constants';
import { renderGroup } from '../../shared/document/DocumentDetails';
import DocumentPermalinkButton from '../../shared/document/DocumentPermalinkButton';
import { ImageCarousel } from '../../shared/image/ImageCarousel';
import { useSearchParams } from '../../shared/location';
import { LoginContext } from '../../shared/login';
import SearchBar from '../../shared/search/SearchBar';
import CategoryFilter from '../filter/CategoryFilter';
import { getProjectLabel } from '../projects';
import { initFilters } from './Project';
import ProjectHierarchyButton from './ProjectHierarchyButton';
import ProjectMap from './ProjectMap';

const MAP_FIT_OPTIONS = { padding : [ 10, 10, 10, 10 ], duration: 500 };

export default function ProjectEntry ():ReactElement {

    const { projectId } = useParams<{ projectId: string }>();
    const loginData = useContext(LoginContext);
    const searchParams = useSearchParams();
    const { t } = useTranslation();

    const [categoryFilter, setCategoryFilter] = useState<ResultFilter>();
    const [projectDoc, setProjectDoc] = useState<Document>();
    const [description, setDescription] = useState<FieldValue>('');
    const [title, setTitle] = useState<string>('');
    const [images, setImages] = useState<ResultDocument[]>();

    useEffect(() => {

        initFilters(projectId, searchParams, loginData.token)
            .then(result => result.filters.find(filter => filter.name === 'resource.category.name'))
            .then(setCategoryFilter);

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
 
    if (!projectDoc || !categoryFilter) return null;
    
    return (
        <div className="d-flex flex-column p-2" style={ containerStyle }>
            <div className="d-flex p-2 m-2" style={ headerStyle }>
                <div className="flex-fill">
                    <h2><img src="/marker-icon.svg" alt="Home" style={ homeIconStyle } /> { title }</h2>
                </div>
                <div className="flex-fill text-right">
                    <DocumentPermalinkButton id={ projectId } baseUrl={ CONFIGURATION.fieldUrl } type="project" />
                </div>
            </div>
            <div className="d-flex flex-fill pt-2" style={ { height: 0 } }>
                <div className="mx-2 d-flex flex-column" style={ sidebarStyles }>
                    <Card className="mb-2 mt-0">
                        <SearchBar basepath={ `/project/${projectId}` } />
                    </Card>
                    <Card className="mb-2 mt-0 p-2">
                        <ProjectHierarchyButton projectDocument={ projectDoc }
                            label={ t('projectEntry.toHierarOverview') } />
                    </Card>
                    <Card className="my-0 flex-fill" style={ { height: 0 } }>
                        <div className="py-1 card-header">
                            <h5>{ t('projectEntry.categories') }</h5>
                        </div>
                        <div className="flex-fill py-2" style={ filterColStyle }>
                            <CategoryFilter filter={ categoryFilter } projectId={ projectId } />
                        </div>
                    </Card>
                </div>
                <div className="mx-2 d-flex flex-fill">
                    <div className="d-flex flex-column" style={ { flex: '1 1 50%' } }>
                        { images &&
                            <ImageCarousel document={ projectDoc } images={ images } style={ imageCarouselStyle } />
                        }
                        <div className="flex-fill mt-2" style={ { position: 'relative' } }>
                            <ProjectMap
                                    selectedDocument={ projectDoc }
                                    predecessors={ [] }
                                    project={ projectId }
                                    onDeselectFeature={ undefined }
                                    fitOptions={ MAP_FIT_OPTIONS }
                                    spinnerContainerStyle={ mapSpinnerContainerStyle }
                                    isMiniMap={ true } />
                        </div>
                    </div>
                    <div className="px-3 py-1" style={ contentStyle }>
                        { renderGroup(t, projectId, CONFIGURATION.fieldUrl)(projectDoc.resource.groups[1]) }
                    </div>
                </div>
            </div>
        </div>
    );
}


const containerStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
};

const headerStyle: CSSProperties = {
    color: 'var(--main-link-color)',
    borderBottom: '4px dotted var(--main-link-color)'
};

const sidebarStyles: CSSProperties = {
    width: `${SIDEBAR_WIDTH}px`
};

const filterColStyle: CSSProperties = {
    overflowY: 'auto'
};

const imageCarouselStyle: CSSProperties = {
    background: '#d3d3cf'
};

const contentStyle: CSSProperties = {
    flex: '1 1 50%',
    overflowY: 'auto'
};

const mapSpinnerContainerStyle: CSSProperties = {
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
