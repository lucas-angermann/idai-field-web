import React, { CSSProperties, MutableRefObject, ReactElement, useRef } from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import Icon from '@mdi/react';
import { mdiLinkVariant } from '@mdi/js';


export default function DocumentPermalinkButton({ id, baseUrl }: { id: string, baseUrl: string }): ReactElement {

    const inputElementRef: MutableRefObject<HTMLInputElement> = useRef();
    const { t } = useTranslation();

    return <OverlayTrigger trigger="click" placement="right"
                           overlay={ getPopover(id, baseUrl, inputElementRef, t) }>
        <Button variant="link" style={ buttonStyle }
                onClick={ () => selectPermalink(inputElementRef) }>
            <div style={ iconStyle }>
              <Icon path={ mdiLinkVariant } size={ 0.7 } />
            </div>
        </Button>
    </OverlayTrigger>;
}


const getPopover = (id: string, baseUrl: string, inputElementRef: MutableRefObject<HTMLInputElement>,
                    t: TFunction): ReactElement =>
    <Popover id="document-link-popover" style={ popoverStyle }>
      <Popover.Title as="h3">{ t('permalinkButton.title') }</Popover.Title>
      <Popover.Content>
        <input ref={ inputElementRef } readOnly
          value={ `${baseUrl}/document/${id}` }
          style={ inputStyle } />
      </Popover.Content>
    </Popover>;


const selectPermalink = (inputElementRef: MutableRefObject<HTMLInputElement>) => {

  if (inputElementRef?.current) return;
  
  const observer = new MutationObserver(() => {
    if (inputElementRef?.current) {
      inputElementRef.current.select();
      observer.disconnect();
    }
  });

  observer.observe(document, { childList: true, subtree: true });
};


const buttonStyle: CSSProperties = {
  width: '45px',
  marginTop: '3px',
  color: 'black',
  boxShadow: 'none'
};


const iconStyle: CSSProperties = {
  position: 'relative',
  bottom: '1px'
};


const popoverStyle: CSSProperties = {
  width: '550px',
  maxWidth: '550px'
};


const inputStyle: CSSProperties = {
  width: '100%'
};
