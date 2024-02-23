import React, {useContext, useEffect, useRef} from "react";
import {Transformer} from "react-konva";
import LockContext from "../pages/Canvas/Context/LockContext";
import Konva from "konva";

/**
 * Abstract functional component representing an object on the stage area.
 * @constructor
 */
const ElementNode = ({
                         children,
                         isSelected = false,
                         onSelect,
                         onChange,
                         shapeProps,
                         resizable = false}) => {
    /**
     * Checks if the children is a Konva node.
     */
    const checkChildrenIsKonvaNode = () => {
        if (!(children && children.type && children.type.prototype instanceof Konva.Node)) {
            throw new Error('Invalid children: expected a Konva node.');
        }
    };

    const {lock} = useContext(LockContext);

    const nodeRef = useRef();
    const trRef = useRef();

    useEffect(() => {
        if (isSelected && nodeRef.current && trRef.current) {
            trRef.current.nodes([nodeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [children]);

    return (
        <>
            {React.cloneElement(children, {
                ref: nodeRef,
                draggable: !lock && isSelected,
                onClick: (event) => {
                    onSelect();
                    event.target.moveToTop();
                    //TODO: make group move on top
                },
                onTap: (event) => {
                    onSelect();
                    event.target.moveToTop();
                },
                onMouseEnter: (e) => {
                    // Adds a pointer cursor when hovering over the image
                    const container = e.target.getStage().container();
                    if (!lock) container.style.cursor = "default";

                    container.style.cursor = "pointer";
                },
                onMouseLeave: (e) => {
                    const container = e.target.getStage().container();
                    container.style.cursor = "default";
                },
                onDragEnd: (e) => {
                    onChange({
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                },
                /*
                onTransformEnd: (e) => {
                    const node = nodeRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        width: node.width() * scaleX,
                        height: node.height() * scaleY,
                    });
                },
                 */
                ...shapeProps
            })}
            {
                // if it is selected add a transformer
                isSelected && (
                <Transformer
                    ref={trRef}
                    resizeEnabled={!lock || resizable}
                    rotateEnabled={!lock}

                    onDragStart={(e) => {
                        //Moves selected image on top (z-index)
                        e.target.moveToTop();
                    }}
                    // flipEnabled={false}
                    // boundBoxFunc={(oldBox, newBox) => {
                    //     // limit resize
                    //     if (newBox.width < 5 || newBox.height < 5) {
                    //         return oldBox;
                    //     }
                    //     return newBox;
                    // }}
                />)
            }
        </>
    );
};

export default ElementNode;