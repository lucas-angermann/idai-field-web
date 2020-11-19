import React, { CSSProperties, ReactElement } from 'react';
import { Card } from 'react-bootstrap';
import DocumentTeaser from '../document/DocumentTeaser';
import { ResultDocument } from '../api/result';


export default function DocumentList({ documents, searchParams = '', scrollFunction }
        : { documents: ResultDocument[], searchParams: string,
            scrollFunction: (e: React.UIEvent<Element, UIEvent>) => void }): ReactElement {

    return documents.length > 0 ? (
        <Card className="documents-card">
            <Card.Body className="px-0 py-0">
                <div className="documents" onScroll={ scrollFunction }>
                    { documents.map((document: ResultDocument) =>
                        <div style={ documentContainerStyle } key={ document.resource.id }>
                            <DocumentTeaser document={ document } searchParams={ searchParams } />
                        </div>
                    )}
                </div>
            </Card.Body>
        </Card>
    ) : <></>;
}


const documentContainerStyle: CSSProperties = {
    borderBottom: '1px solid var(--main-bg-color)'
};
