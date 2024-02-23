import {Group, Transformer} from "react-konva";
import React, {useContext, useEffect, useRef} from "react";
import ResizeContext from "../../pages/Canvas/Context/ResizeContext";
import LockContext from "../../pages/Canvas/Context/LockContext";

function SelectedGroup({children, selectedGroupRef}) {
    const trRef = useRef(null);
    const {resize} = useContext(ResizeContext);
    const {lock} = useContext(LockContext)

    useEffect(() => {
        if (selectedGroupRef.current && trRef.current) {
            trRef.current.nodes([selectedGroupRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    });

    return (
        <>
            <Group
                ref={selectedGroupRef}
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