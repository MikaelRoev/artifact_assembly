import React, {useContext, useEffect, useRef} from "react";
import {Transformer} from "react-konva";
import LockContext from "../../pages/Canvas/Context/LockContext";

/**
 * Abstract functional component representing an object on the stage area.
 * @constructor
 */
const ElementNode = ({ children, shapeProps, isSelected = false, onSelect, onChange, resizable }) => {
    const childRef = useRef();
    const trRef = useRef();

    const { lock } = useContext(LockContext);

    useEffect(() => {
        const transformer = trRef.current;
        const child = childRef.current;
        if (isSelected && transformer && child) {
            trRef.current.nodes([child]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    return (
        <>
            <div ref={childRef}>
                {React.cloneElement(children, {
                    onClick: onSelect,
                    onTap: onSelect,
                    onDragStart: onSelect,
                    draggable: !lock,
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
                    onTransformEnd: () => {
                    // set width and height and reset scale to match the data better
                    const node = childRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        // set minimal value
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(node.height() * scaleY),
                    });
                } })}
            </div>
            {
                // if it is selected make a transformer
                isSelected && (
                    //Adds the konva transformer to the image item
                    <Transformer
                        ref={trRef}
                        flipEnabled={false}
                        boundBoxFunc={(oldBox, newBox) => {
                            // limit resize
                            if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                        onDragStart={(e) => {//Moves selected image on top (z-index)
                            e.target.moveToTop();
                        }}
                        resizeEnabled={resizable}
                    />
                )
            }
        </>
    );
}

export default ElementNode;