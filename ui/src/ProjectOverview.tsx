import React, { useEffect, useState } from 'react';
import Map from './Map';
import { search } from './documents';


export default () => {

    const [projectDocuments, setProjectDocuments] = useState([]);

    useEffect (() => {
        getProjectDocuments().then(setProjectDocuments);
    }, []);

    return (
        <div>
            <Map documents={ projectDocuments }></Map>
        </div>
    );
};


const getProjectDocuments = (): Promise<any[]> => search({ q: 'resource.type:Project' });
