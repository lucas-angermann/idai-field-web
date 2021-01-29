import { ResultDocument } from '../../api/result';
import CONFIGURATION from '../../configuration.json';


const IMAGE_CATEGORIES = ['Image', 'Photo', 'Drawing'];

export const getDocumentLink = (doc: ResultDocument, project: string): string =>
    isImage(doc)
    ? `/image/${project}/${doc.resource.id}`
    : isType(doc)
        ? `${CONFIGURATION.shapesUrl}/document/${doc.resource.id}`
        : `/project/${project}/${doc.resource.id}`;


export const isImage = (document: ResultDocument): boolean =>
    IMAGE_CATEGORIES.includes(document.resource.category.name);


export const isType = (document: ResultDocument): boolean => document.resource.category.name === 'Type';
