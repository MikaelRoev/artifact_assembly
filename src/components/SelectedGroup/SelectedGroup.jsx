import {Group, Transformer} from "react-konva";
import React, {useContext, useEffect, useRef} from "react";
import ResizeContext from "../../pages/Canvas/Context/ResizeContext";
import LockContext from "../../pages/Canvas/Context/LockContext";

function SelectedGroup({children, groupRefCallback}) {
    const groupRef = useRef(null);
    const trRef = useRef(null);
    const {resize} = useContext(ResizeContext);
    const {lock} = useContext(LockContext)

    useEffect(() => {
        if (groupRef.current && trRef.current) {
            trRef.current.nodes([groupRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    });

    // Execute the ref callback to pass the groupRef to the parent
    useEffect(() => {
        if (typeof groupRefCallback === 'function') {
            groupRefCallback(groupRef);
        }
    }, [groupRefCallback, groupRef]);

    return (
        <>
            <Group
                ref={groupRef}
                draggable = {!lock}
            >
                {children}
            </Group>
            <Transformer
                ref={trRef}
                resizeEnabled={resize}
            />
        </>
    );
}

export default SelectedGroup;