import React, { ReactElement } from 'react';
import RelationFilter from './RelationFilter';


const FILTER_RELATIONS = ['isInstanceOf'];


export default function RelationFilters({ searchParams }: { searchParams: string }): ReactElement {

    const params = new URLSearchParams(searchParams);

    return <>
        {
            FILTER_RELATIONS
                .filter(relationName => hasRelationFilter(params, relationName))
                .map(relationName => <RelationFilter key={ relationName }
                                                     relationName={ relationName }
                                                     resourceId={ getResourceId(params, relationName) } />)
        }
    </>
}


const hasRelationFilter = (params: URLSearchParams, relationName: string): boolean => {

    return params.has(`resource.relations.${relationName}.resource.id`);
};


const getResourceId = (params: URLSearchParams, relationName: string): string => {

    return params.get(`resource.relations.${relationName}.resource.id`);
};
