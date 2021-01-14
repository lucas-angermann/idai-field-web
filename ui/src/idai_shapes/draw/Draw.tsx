import React, { ReactElement } from 'react';
import Canvas from '../canvas/Canvas';

export default function Draw(): ReactElement {
    return (
        <div className="ml-3">
            <h1>Draw a profile</h1>
            <Canvas />
        </div>
    );
}
