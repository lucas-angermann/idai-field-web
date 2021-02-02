import React, { CSSProperties, ReactElement } from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import Icon from '@mdi/react';
import { mdiLinkVariant } from '@mdi/js';
import { Document } from '../../api/document';


export default function DocumentLinkButton({ document, baseUrl }
        : { document: Document, baseUrl: string }): ReactElement {

    const { t } = useTranslation();

    return <OverlayTrigger trigger="click" placement="bottom" overlay={ getPopover(document, baseUrl, t) }>
        <Button variant="secondary" style={ buttonStyle }>
            <div style={ iconStyle }>
              <Icon path={ mdiLinkVariant } size={ 0.7 } />
            </div>
        </Button>
    </OverlayTrigger>;
}


const getPopover = (document: Document, baseUrl: string, t: TFunction): ReactElement =>
    <Popover id="document-link-popover" style={ popoverStyle }>
      <Popover.Title as="h3">{ t('permalinkButton.title') } </Popover.Title>
      <Popover.Content>
        <input disabled value={ `${baseUrl}/document/${document.resource.id}` } style={ inputStyle }></input>
      </Popover.Content>
    </Popover>;


const buttonStyle: CSSProperties = {
  width: '45px'
};


const iconStyle: CSSProperties = {
  position: 'relative',
  bottom: '1px'
};


const popoverStyle: CSSProperties = {
  width: '350px',
  maxWidth: '350px'
};


const inputStyle: CSSProperties = {
  width: '100%'
};
