import React, { ReactElement } from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiLinkVariant } from '@mdi/js';
import { Document } from '../../api/document';


export default function DocumentLinkButton({ document, baseUrl }
        : { document: Document, baseUrl: string }): ReactElement {

    return <OverlayTrigger trigger="click" placement="bottom" overlay={ getPopover(document, baseUrl) }>
        <Button variant="primary">
            <Icon path={ mdiLinkVariant } size={ 0.8 } />
        </Button>
    </OverlayTrigger>
}


const getPopover = (document: Document, baseUrl: string): ReactElement =>
    <Popover id="document-link-popover" style={ { width: '350px', maxWidth: '350px' } }>
      <Popover.Title as="h3">Permalink der Ressource</Popover.Title>
      <Popover.Content>
        <input disabled value={ `${baseUrl}/document/${document.resource.id}` } style={ { width: '100%' } }></input>
      </Popover.Content>
    </Popover>;
