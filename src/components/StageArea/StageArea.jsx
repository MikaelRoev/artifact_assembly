import React, {useCallback, useContext, useEffect, useState} from "react";
import {Stage} from "react-konva";
import {saveProjectDialog} from "../../util/FileHandling"
import {getHueData} from "../../util/ImageManupulation";
import LockedContext from "../../contexts/LockedContext";
import ProjectContext from "../../contexts/ProjectContext";
import ElementContext from "../../contexts/ElementContext";
import FilterInteractionContext from "../../contexts/FilterInteractionContext";
import StageRefContext from "../../contexts/StageRefContext";

/**
 * Component that represents the konva stage area in the canvas page.
 * @returns {JSX.Element} the konva stage.
 * @constructor
 */
const StageArea = () => {
    const [ctrlPressed, setCtrlPressed] = useState(false);
    const [shiftPressed, setShiftPressed] = useState(false);

    const {
        stageRef,
        getStage,
        getStaticLayer,
        getSelectTransformer,
        getSelectedElements,
        getAllElements,
        getAllImages,

        select,
        deselect,
        deselectAll,
        selectOnly,
        isSelected,
        deleteSelected,

        undo,
        redo
    } = useContext(StageRefContext);
    const {isLocked} = useContext(LockedContext);
    const {project, setProject} = useContext(ProjectContext);
    const {elements} = useContext(ElementContext);
    const {isFilterInteracting} = useContext(FilterInteractionContext);

    const zoomScale = 1.17; //How much zoom each time
    const zoomMin = 0.001; //zoom out limit
    const zoomMax = 300; //zoom in limit

    /**
     * Update the stage according to the project.
     */
    useEffect(() => {
        const stage = getStage();
        if (!stage) return;
        stage.position({x: project.x, y: project.y});
        stage.scale({x: project.zoom, y: project.zoom});
        stage.batchDraw();
    }, [project, getStage]);

    /**
     * Changes the ability to rotate and drag the selected elements when isLocked changes.
     */
    useEffect(() => {
        if (!getStage()) return;
        getSelectTransformer().rotateEnabled(!isLocked);
        getSelectedElements().forEach(element => element.draggable(!isLocked));
    }, [getStage, getSelectTransformer, isLocked, getSelectedElements]);

    /**
     * Sets up and cleans up the delete event listener.
     */
    useEffect(() => {

        /**
         * Deletes the selected elements if the delete key is pressed.
         * @param e{KeyboardEvent} the event.
         */
        const handleDeletePressed = (e) => {
            if ((e.key === "Delete" || e.key === "Backspace") && getSelectedElements().length > 0
                && !isFilterInteracting) {
                console.log("delete ", e.key)
                deleteSelected();
            }
        };

        document.addEventListener("keydown", handleDeletePressed);
        return () => {
            document.removeEventListener("keydown", handleDeletePressed);
        };
    }, [deleteSelected, getSelectedElements, isFilterInteracting]);

    /**
     * Sets up and cleans up the save event listener.
     */
    useEffect(() => {
        /**
         * Saves the project if ctrl + S is pressed.
         * @param e{KeyboardEvent} the event.
         */
        const handleSavePressed = (e) => {
            if (e.ctrlKey && e.key === "s") {
                console.log("save ", e.key)
                e.preventDefault();
                saveProjectDialog(project, setProject, elements).then(() => console.log("project saved"));
            }
        };
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
        const handleUndoRedoPressed = (e) => {
            if ((e.ctrlKey && e.key === "y") || (e.ctrlKey && e.shiftKey && e.key === "Z")) {
                console.log("redo ", e.key)
                e.preventDefault();
                redo();
            } else if (e.ctrlKey && e.key === "z") {
                console.log("undo ", e.key)
                e.preventDefault();
                undo();
            }
        };
        document.addEventListener("keydown", handleUndoRedoPressed);
        return () => {
            document.removeEventListener("keydown", handleUndoRedoPressed);
        };
    }, [undo, redo]);

    /**
     * Set up and cleans up the select key check.
     */
    useEffect(() => {
        /**
         * The selection keys down event handler.
         * @param e{KeyboardEvent}
         */
        const handleSelectKeyDown = (e) => {
            if (e.key === "Control") {
                console.log("ctrl ", e.key)
                setCtrlPressed(true);
            }
            if (e.key === "Shift") {
                console.log("shift ", e.key)
                setShiftPressed(true);
            }
        };

        /**
         * The select key up event handler.
         * @param e{KeyboardEvent}
         */
        const handleSelectKeyUp = (e) => {
            if (e.key === "Control") {
                setCtrlPressed(false);
            }
            if (e.key === "Shift") {
                setShiftPressed(false);
            }
        };

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
    const checkDeselect = useCallback((e) => {
        console.log("deselect ", e.target)
        if (e.target === e.currentTarget && e.evt.button !== 2 && !ctrlPressed && !shiftPressed) {
            deselectAll();
        }
    }, [ctrlPressed, deselectAll, shiftPressed]);

    /**
     * Zooms the Konva stage when a mouse or touchpad scroll event is triggered.
     *
     * @param e{KonvaEventObject} - The event object containing information about the scroll event.
     */
    const zoomStage = (e) => {
        e.evt.preventDefault();

        const stage = getStage();
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
    };

    /**
     * Clamps a numeric value between a minimum and maximum range.
     * @param {number} value - The numeric value to be clamped.
     * @param {number} min - The minimum value of the range.
     * @param {number} max - The maximum value of the range.
     * @returns {number} The clamped value.
     */
    const clamp = (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    };

    /**
     * Event handler for element clicking. This will check the selection of the element.
     * @param e {KonvaEventObject<MouseEvent>} click event.
     */
    const handleElementClick = (e) => {
        if (e.evt.button === 2) return;
        const element = e.target;
        element.moveToTop();

        if (ctrlPressed || shiftPressed) {
            if (isSelected(element)) {
                // already selected
                deselect(element);
            } else {
                // not already selected
                select(element);
            }
        } else {
            selectOnly(element);
        }
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
        const setImageDimensions = async (imageNodes) => {
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
        if (getStaticLayer() && elements.length > 0) {
            const imageNodes = getAllImages().filter((child) => !child.width() || !child.height() || !child.attrs.hueValues);
            if (imageNodes.length > 0) {
                setImageDimensions(imageNodes).then(() => console.log("Information retrieved"));
            }
        }
    }, [elements.length, getStaticLayer, elements, getAllImages]);

    useEffect(() => {
        const images = getAllImages();
        images.forEach(image => {
            image.on("click", handleElementClick);
            image.on("tap", handleElementClick);
        })

        return () => {
            images.forEach(image => {
                image.off("click");
                image.off("tap");
            })
        }
    }, [ctrlPressed, getAllImages, handleElementClick, shiftPressed]);

    return (
        <Stage
            ref={stageRef}
            width={window.innerWidth}
            height={window.innerHeight}
            draggable={false} //TODO: make true
            className="stage"
            onWheel={zoomStage}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}>

            {/*<Layer
                className="layer">
                {renderElements()}
                {
                    selectedElements.length > 0 &&
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
            </Layer>*/}
        </Stage>
    );
};

export default StageArea;