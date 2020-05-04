import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default () => {

    const { id } = useParams();
    const [document, setDocument] = useState(null);

    useEffect (() => {
        getDocument(id).then(setDocument);
    }, []);

    return (document && document.resource)
        ? <h1>{document.resource.identifier}</h1>
        : <div>Error: No matching document found.</div>;

};

const getDocument = async (id: string) => {
    const response = await fetch(`/documents/${id}`);
    return await response.json();
};
