import {Group, Rect, Transformer} from "react-konva";
import React, {useContext, useEffect, useRef} from "react";


const SelectedGroup = ({children}) => {
    const groupRef = useRef();
    const trRef = useRef()

    useEffect(() => {
        if (groupRef.current && trRef.current) {
            trRef.current.nodes([groupRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    });

    return (
        <>
            <Group ref={groupRef}
                /*draggable={true}
                onTransform={()=> {
                    const node = groupRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    node.scaleX(1);
                    node.scaleY(1);

                }}*/
            >

                {children}
            </Group>

            // if it is selected add a transformer

            <Transformer
                ref={trRef}
                flipEnabled={false}

            />
        </>
    );

};

export default SelectedGroup;