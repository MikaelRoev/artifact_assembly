import {Group, Transformer} from "react-konva";
import React, {useContext, useEffect, useRef} from "react";
import ResizeContext from "../pages/Canvas/Context/ResizeContext";
import LockContext from "../pages/Canvas/Context/LockContext";

const SelectedGroup = ({children}) => {
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