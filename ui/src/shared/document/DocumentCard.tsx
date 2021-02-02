import React, { CSSProperties, ReactElement } from 'react';
import { Card } from 'react-bootstrap';
import DocumentDetails from './DocumentDetails';
import DocumentPermalinkButton from './DocumentPermalinkButton';
import DocumentTeaser from './DocumentTeaser';
import { Document } from '../../api/document';


interface DocumentCardProps {
    document: Document;
    baseUrl: string;
    cardStyle: CSSProperties;
    headerStyle: CSSProperties;
    bodyStyle: CSSProperties;
}


export default function DocumentCard({ document, baseUrl, cardStyle, headerStyle, bodyStyle }
        : DocumentCardProps): ReactElement {
    
    return (
        <Card style={ cardStyle }>
            <Card.Header className="p-2" style={ { ...headerStyle, ...{ display: 'flex' } } }>
                <div style={ teaserContainerStyle }>
                    <DocumentTeaser document={ document } />
                </div>
                <div style={ permalinkButtonContainerStyle }>
                    <DocumentPermalinkButton document={ document } baseUrl={ baseUrl } />
                </div>
            </Card.Header>
            <Card.Body style={ bodyStyle }>
                <DocumentDetails document={ document } />
            </Card.Body>
        </Card>
    );
}


const teaserContainerStyle: CSSProperties = {
    flex: '1 1'
};


const permalinkButtonContainerStyle: CSSProperties = {
    flex: '0 0 42px',
    alignSelf: 'center'
};
