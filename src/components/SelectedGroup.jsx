import {Group, Rect, Transformer} from "react-konva";
import React, {useEffect, useRef} from "react";

const SelectedGroup = ({children}) => {
    const groupRef = useRef(null);
    const trRef = useRef(null);

    useEffect(() => {
        if (groupRef.current && trRef.current) {
            trRef.current.nodes([groupRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    });

    return (
        <>
            <Group ref={groupRef} draggable>
                {children}
            </Group>
            <Transformer
                ref={trRef}
                flipEnabled={false}
            />
        </>
    );
}

export default SelectedGroup;