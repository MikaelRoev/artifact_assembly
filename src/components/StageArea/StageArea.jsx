import React, {useContext, useEffect, useRef, useState} from "react";
import {Group, Layer, Stage, Transformer} from "react-konva";
import {saveProjectDialog} from "../../util/TauriDialogWondows"
import {getHueData} from "../../util/ImageManupulation";
import ImageNode from "../ImageNode/ImageNode";
import LockedContext from "../../contexts/LockedContext";
import ProjectContext from "../../contexts/ProjectContext";
import ElementContext from "../../contexts/ElementContext";
import SelectContext from "../../contexts/SelectContext";
import DeleteEnabledContext from "../../contexts/DeleteEnabledContext";
import StageRefContext from "../../contexts/StageRefContext";
import {clamp} from "../../util/Operations";

/**
 * Component that represents the konva stage area in the canvas page.
 * @returns {JSX.Element} the konva stage.
 * @constructor
 */
const StageArea = () => {
    const [ctrlPressed, setCtrlPressed] = useState(false);
    const [shiftPressed, setShiftPressed] = useState(false);

    /**
     * Reference to the konva transformer box.
     * @type {React.MutableRefObject<Konva.Transformer>}
     */
    const trRef = useRef();

    /**
     * Reference to the konva layer on the stage.
     * @type {React.MutableRefObject<Konva.Layer>}
     */
    const layerRef = useRef();

    const {
        selectedKonvaElements,
        isAnySelected,
        select,
        deselect,
        deselectAll,
        selectOnly,
        isSelected
    } = useContext(SelectContext);
    const {isLocked} = useContext(LockedContext);
    const {project, setProject} = useContext(ProjectContext);
    const {elements, setElements, undo, redo} = useContext(ElementContext);
    const {stageRef} = useContext(StageRefContext);
    const {deleteEnabled} = useContext(DeleteEnabledContext);

    const zoomScale = 1.17; //How much zoom each time
    const zoomMin = 0.001; //zoom out limit
    const zoomMax = 300; //zoom in limit

    let newElements = [...elements];

    /**
     * Update the stage according to the project.
     */
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        stage.position({x: project.x, y: project.y});
        stage.scale({x: project.zoom, y: project.zoom});
        stage.batchDraw();
    }, [project, stageRef]);


    /**
     * Sets up and cleans up the delete event listener.
     */
    useEffect(() => {

        /**
         * Deletes the selected elements if the delete key is pressed.
         * @param e{KeyboardEvent} the event.
         */
        function handleDeletePressed(e) {
            if (["Delete", "Backspace"].includes(e.key)
                && isAnySelected
                && deleteEnabled) {
                const newElements = elements.filter((element, index) => !isSelected(index));
                setElements(newElements);
                deselectAll();
            }
        }

        document.addEventListener("keydown", handleDeletePressed);
        return () => {
            document.removeEventListener("keydown", handleDeletePressed);
        };
    }, [deselectAll, elements, deleteEnabled, isSelected, setElements, isAnySelected]);

    /**
     * Sets up and cleans up the save event listener.
     */
    useEffect(() => {
        /**
         * Saves the project if ctrl + S is pressed.
         * @param e{KeyboardEvent} the event.
         */
        function handleSavePressed(e) {
            if (e.ctrlKey && (e.key.toUpperCase() === "S")) {
                e.preventDefault();
                saveProjectDialog(project, setProject, elements).then(() => console.log("project saved"));
            }
        }
        document.addEventListener("keydown", handleSavePressed);
        return () => {
            document.removeEventListener("keydown", handleSavePressed);
        };
    }, [elements, project, setProject]);

    /**
     * Sets up and cleans up the undo event listener.
     */
    useEffect(() => {
        /**
         * Key event handler for undo and redo.
         * @param e {KeyboardEvent} the event.
         */
        function handleUndoRedoPressed(e) {
            if ((e.ctrlKey && e.key.toUpperCase() === "Y") || (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === "Z")) {
                e.preventDefault();
                redo();
            } else if (e.ctrlKey && e.key.toUpperCase() === "Z") {
                e.preventDefault();
                undo();
            }
        }
        document.addEventListener("keydown", handleUndoRedoPressed);
        return () => {
            document.removeEventListener("keydown", handleUndoRedoPressed);
        };
    }, [redo, undo]);

    /**
     * Set up and cleans up the select key check.
     */
    useEffect(() => {
        /**
         * The selection keys down event handler.
         * @param e{KeyboardEvent}
         */
        function handleSelectKeyDown(e) {
            if (e.key === "Control") {
                setCtrlPressed(true);
            }
            if (e.key === "Shift") {
                setShiftPressed(true);
            }
        }

        /**
         * The select key up event handler.
         * @param e{KeyboardEvent}
         */
        function handleSelectKeyUp(e) {
            if (e.key === "Control") {
                setCtrlPressed(false);
            }
            if (e.key === "Shift") {
                setShiftPressed(false);
            }
        }

        document.addEventListener("keydown", handleSelectKeyDown);
        document.addEventListener("keyup", handleSelectKeyUp);

        return () => {
            document.removeEventListener("keydown", handleSelectKeyDown);
            document.removeEventListener("keyup", handleSelectKeyUp);
        };
    }, []);

    /**
     * Deselects when the mouse left-clicks on an empty area on the canvas
     * and ctrl key is not pressed.
     * @param e{KonvaEventObject<MouseEvent>} the event.
     */
    const checkDeselect = (e) => {
        if (e.target === e.currentTarget && e.evt.button !== 2 && !ctrlPressed && !shiftPressed) {
            deselectAll();
        }
    };

    /**
     * Zooms the Konva stage when a mouse or touchpad scroll event is triggered.
     *
     * @param e{KonvaEventObject} - The event object containing information about the scroll event.
     */
    function zoomStage(e) {
        e.evt.preventDefault();

        const stage = stageRef.current;
        if (!stage) {
            return;
        }

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const zoomFactor = e.evt.deltaY < 0 ? zoomScale : 1 / zoomScale;
        const newScale = clamp(oldScale * zoomFactor, zoomMin, zoomMax);
        setProject({
            ...project,
            zoom: newScale,
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        });
    }

    /**
     * Updates the transformer to selected elements.
     */
    useEffect(() => {
        if (trRef.current && isAnySelected) {
            trRef.current.nodes(selectedKonvaElements);
            trRef.current.moveToTop();
            trRef.current.getLayer().batchDraw();
            selectedKonvaElements.forEach((element) => element.draggable(!isLocked));
        }
    }, [selectedKonvaElements, isLocked, isAnySelected]);

    /**
     * Event handler for element clicking. This will check the selection of the element.
     * @param e {KonvaEventObject<MouseEvent>} click event.
     * @param index {number} of the element clicked on.
     */
    function handleElementClick(e, index) {
        if (e.evt.button === 2) return;
        const element = e.target;
        element.moveToTop();

        if (ctrlPressed || shiftPressed) {
            if (isSelected(index)) {
                // already selected
                deselect(index);
            } else {
                // not already selected
                select(element, index);
            }
        } else {
            selectOnly(element, index);
        }
    }

    /**
     * Render elements ny running renderImage, or renderGroup that will do the rendering
     * @return {false|*}
     */
    function renderElements() {
        return (
            elements.length > 0 &&
            elements.map((element, index) => {
                switch (element.type) {
                    case "Image":
                        return renderImage(element, index);
                        /*
                    case "Group":
                        return renderGroup(element, index);
                         */
                    default:
                        // not a valid element type
                        return (<></>);
                }
            })
        );
    }

    /**
     * Renders an image
     * @param image
     * @param index
     * @return {Element}
     */
    function renderImage(image, index) {
        return (
            <ImageNode
                key={image.id}
                id={image.id}
                imageProps={image}
                onClick={(e) => handleElementClick(e, index)}
                onChange={(newImage) => {
                    newElements[index] = newImage;
                    setElements(newElements);
                }}
            />
        );
    }

    /**
     * Renders a group and renders images inside it
     * @param group
     * @param index
     * @return {Element}
     */
    function renderGroup(group, index) {
        return (
            <Group
                key={index}
                onClick={e => handleElementClick(e, index)}
                onTap={e => handleElementClick(e, index)}

            >
                {group.groupElements.map((groupElement, i) => {
                    console.log("Rendering Image:", groupElement); // Add console.log here
                    return (
                        <ImageNode
                            key={i}
                            imageProps={groupElement}
                        />
                    );
                })}
            </Group>
        );
    }

    /**
     * useEffect for updating image dimensions
     */
    useEffect(() => {
        /**
         * Sets the width and height of images that does not have them yet.
         * @param imageNodes Image nodes on the canvas.
         * @returns {Promise<void>}
         */
        async function setImageDimensions(imageNodes) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            for (const imageNode of imageNodes) {
                for (const image of elements) {
                    const index = elements.indexOf(image);
                    if (imageNode.attrs.id === image.id) {
                        const hueValues = await getHueData(imageNode.toDataURL());
                        elements[index] = {
                            ...image, hueValues: hueValues,
                            width: imageNode.width(),
                            height: imageNode.height(),
                        }
                    }
                }
            }
        }

        /**
         * Checks if it is images on the canvas and only runs the function if there is
         * an image that needs its width and height updated.
         */
        if (layerRef.current && elements.length > 0) {
            const imageNodes = layerRef.current.getChildren().filter((child) => child.getClassName() === "Image")
                .filter((child) => !child.attrs.width || !child.attrs.height || !child.attrs.hueValues);
            if (imageNodes.length > 0) {
                setImageDimensions(imageNodes).then(() => console.log("Information retrieved"))
                    .catch(console.error);
            }
        }
    }, [elements.length, layerRef, elements]);

    return (
        <Stage
            width={window.innerWidth}
            height={window.innerHeight}
            draggable
            className="stage"
            onWheel={zoomStage}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
            ref={stageRef}>
            <Layer
                className="layer"
                ref={layerRef}>
                {renderElements()}
                {
                    isAnySelected &&
                    <Transformer
                        ref={trRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            // limit resize
                            if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                        resizeEnabled={false}
                        rotateEnabled={!isLocked}
                    />
                }
            </Layer>
        </Stage>
    );
};

export default StageArea;