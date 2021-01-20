import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../../constants';


export default function ProjectSidebar({ children }: { children: ReactNode }): ReactElement {

    return <div style={ sidebarStyle } className="sidebar">{ children }</div>;
}


const sidebarStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    width: `${SIDEBAR_WIDTH}px`,
    position: 'absolute',
    top: NAVBAR_HEIGHT,
    left: '10px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column'
};
