import React, { ReactElement, useRef,
                useEffect, forwardRef, Ref,
                useImperativeHandle, CSSProperties } from 'react';

export interface DrawCanvasObject {
    clear: () => void
    getCanvas: () => HTMLCanvasElement
  }

interface CanvasProps {
    brushRadius: number
}

const CanvasDraw = forwardRef(({ brushRadius }: CanvasProps, ref: Ref<DrawCanvasObject>): ReactElement => {
   
    const posX = useRef<number>();
    const posY = useRef<number>();
    const canv = useRef<HTMLCanvasElement>();
    useImperativeHandle(ref, () => ({ clear, getCanvas }));

    useEffect(() => {

        canv.current.getContext('2d').fillStyle = 'black';
        canv.current.getContext('2d').fillRect(0,0,512,512);

    },[]);


    const clear = () => {
        const ctx = canv.current.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0,512,512);
    };

    const getCanvas = (): HTMLCanvasElement => canv.current;

    const draw = (e: React.MouseEvent) => {

        if(e.buttons !== 1) return;

        const ctx = canv.current.getContext('2d');
  
        ctx.beginPath();
        ctx.lineWidth = brushRadius;
        ctx.fillStyle = 'black';
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'white';
        ctx.moveTo(posX.current, posY.current);
        setPosition(e);
        ctx.lineTo(posX.current, posY.current);
        ctx.stroke();
    };

    const setPosition = (e :React.MouseEvent) => {
        posX.current = e.clientX-canv.current.getBoundingClientRect().left;
        posY.current = e.clientY-canv.current.getBoundingClientRect().top;
    };
    
    return (
        <canvas ref={ canv } width="512" height="512"
            style={ canvasStyle } onMouseMove={ draw }
            onMouseDown={ setPosition } onMouseEnter={ setPosition } />
    );
  });

CanvasDraw.displayName = 'CanvasDraw';
export default CanvasDraw;


const canvasStyle: CSSProperties = {
    borderStyle: 'solid',
    borderRadius: '12px'
};