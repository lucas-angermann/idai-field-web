import { ResultDocument } from '../api/result';


const MAX_LABEL_LENGTH = 25;


export const getProjectLabel = (projectDocument: ResultDocument): string => {

    return projectDocument.resource.shortDescription
        && projectDocument.resource.shortDescription.length <= MAX_LABEL_LENGTH
            ? projectDocument.resource.shortDescription
            : projectDocument.resource.identifier;
};
