import { ResultDocument } from '../../api/result';
import CONFIGURATION from '../../configuration.json';


const IMAGE_CATEGORIES = ['Image', 'Photo', 'Drawing'];

export const getDocumentLink = (doc: ResultDocument, project: string, currentBaseUrl?: string): string => {

    const [baseUrl, path] = isImage(doc)
        ? ['', `/image/${project}/${doc.resource.id}`]
        : isCategory(doc, 'Type') || isCategory(doc, 'TypeCatalog')
            ? [CONFIGURATION.shapesUrl, `/document/${doc.resource.id}`]
            : [CONFIGURATION.fieldUrl,
                `/project/${project}/hierarchy/${ isCategory(doc, 'Project')
                    ? doc.resource.identifier
                    : doc.resource.id
                }`
            ];

    if (currentBaseUrl && baseUrl) {
        return (currentBaseUrl === baseUrl) ? path : baseUrl + path;
    } else {
        return path;
    }
};


export const getHierarchyLink = (doc: ResultDocument): string =>
    `/project/${doc.project}/hierarchy?parent=${doc.resource.id}`;


export const isImage = (document: ResultDocument): boolean =>
    IMAGE_CATEGORIES.includes(document.resource.category.name);


export const isCategory = (document: ResultDocument, category: string): boolean =>
    document.resource.category.name === category;
