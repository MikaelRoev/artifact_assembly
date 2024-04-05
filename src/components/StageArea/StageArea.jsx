import React, {useContext, useEffect, useRef, useState} from "react";
import {Layer, Stage, Transformer} from "react-konva";
import ImageNode from "../ImageNode/ImageNode";
import LockedContext from "../../contexts/LockedContext";
import {saveProjectDialog} from "../FileHandling"
import ProjectContext from "../../contexts/ProjectContext";
import ImageContext from "../../contexts/ImageContext";
import SelectContext from "../../contexts/SelectContext";
import ImageFilterContext from "../../contexts/ImageFilterContext";
import WindowModalOpenContext from "../../contexts/WindowModalOpenContext";

/**
 * Component that represents the konva stage area in the canvas page.
 * @param stageRef{MutableRefObject} the reference for the konva stage.
 * @param layerRef{MutableRefObject} the reference for the layer inside the konva stage.
 * @returns {JSX.Element} the konva stage.
 * @constructor
 */
const StageArea = ({stageRef, layerRef}) => {
    const [ctrlPressed, setCtrlPressed] = useState(false);
    const [shiftPressed, setShiftPressed] = useState(false);

    const trRef = useRef();

    const {
        selectedElements,
        selectedElementsIndex,
        select,
        deselect,
        deselectAll,
        selectOnly,
        isSelected
    } = useContext(SelectContext);
    const {isLocked} = useContext(LockedContext);
    const {project, setProject} = useContext(ProjectContext);
    const {images, setImages, undo, redo} = useContext(ImageContext);
    const {setFilterImageIndex} = useContext(ImageFilterContext);
    const {isFilterInteracting, setIsFilterWindowOpen} = useContext(WindowModalOpenContext);

    const zoomScale = 1.17; //How much zoom each time
    const zoomMin = 0.001; //zoom out limit
    const zoomMax = 300; //zoom in limit

    let newImages = [...images];

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
         * Deletes the selected images if the delete key is pressed.
         * @param e{KeyboardEvent} the event.
         */
        const handleDeletePressed = (e) => {
            if ((e.key === "Delete" || e.key === 'Backspace')
                && selectedElementsIndex.length > 0
                && !isFilterInteracting) {
                const newImages = images.filter((image, index) => !selectedElementsIndex.includes(index));
                setImages(newImages);
                deselectAll();
            }
        };
        document.addEventListener("keydown", handleDeletePressed);
        return () => {
            document.removeEventListener("keydown", handleDeletePressed);
        };
    }, [images, selectedElementsIndex, setImages, isFilterInteracting, deselectAll]);

    /**
     * Sets up and cleans up the save event listener.
     */
    useEffect(() => {
        /**
         * Saves the image positions if ctrl + S is pressed.
         * @param e{KeyboardEvent} the event.
         */
        const handleSavePressed = (e) => {
            if (e.ctrlKey && e.key === "s") {
                e.preventDefault();
                saveProjectDialog(project, setProject, images).then(() => console.log("project saved"));
            }
        };
        document.addEventListener("keydown", handleSavePressed);
        return () => {
            document.removeEventListener("keydown", handleSavePressed);
        };
    }, [images, project, setProject]);

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
                e.preventDefault();
                redo();
            } else if (e.ctrlKey && e.key === "z") {
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
            if (e.key === 'Control') {
                setCtrlPressed(true);
            }
            if (e.key === 'Shift') {
                setShiftPressed(true);
            }
        };

        /**
         * The select key up event handler.
         * @param e{KeyboardEvent}
         */
        const handleSelectKeyUp = (e) => {
            if (e.key === 'Control') {
                setCtrlPressed(false);
            }
            if (e.key === 'Shift') {
                setShiftPressed(false);
            }
        };

        document.addEventListener('keydown', handleSelectKeyDown);
        document.addEventListener('keyup', handleSelectKeyUp);

        return () => {
            document.removeEventListener('keydown', handleSelectKeyDown);
            document.removeEventListener('keyup', handleSelectKeyUp);
        };
    }, []);

    /**
     * Deselects when the mouse clicks on an empty area on the canvas
     * and ctrl key is not pressed.
     * @param e{MouseEvent} the event.
     */
    const checkDeselect = (e) => {
        if (e.target === e.currentTarget && !ctrlPressed && !shiftPressed) {
            deselectAll();
        }
    };

    /**
     * Zooms the Konva stage when a mouse or touchpad scroll event is triggered.
     *
     * @param e{KonvaEventObject} - The event object containing information about the scroll event.
     */
    const zoomStage = (e) => {
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
     * Updates the transformer to selected elements.
     */
    useEffect(() => {
        if (trRef.current && selectedElements.length > 0) {
            trRef.current.nodes(selectedElements);
            trRef.current.moveToTop();
            trRef.current.getLayer().batchDraw();
            selectedElements.forEach((element) => element.draggable(!isLocked));
        }
    }, [selectedElements, isLocked]);

    /**
     * Event handler for element clicking. This will check the selection of the element.
     * @param e {KonvaEventObject<MouseEvent>} click event.
     * @param index {number} of the element clicked on.
     */
    const handleElementClick = (e, index) => {
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
     * Handles when an image is right-clicked and opens the filter window.
     * @param e {KonvaEventObject<PointerEvent>} right-click event.
     * @param index {number} the index of the image to add filters to.
     */
    const handleImageContextClick = (e, index) => {
        e.evt.preventDefault();
        setIsFilterWindowOpen(true);
        setFilterImageIndex(index);
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
            imageNodes.forEach(imageNode => {
                if (!imageNode.attrs.width || !imageNode.attrs.height) {
                    images.forEach((image, index) => {
                        if (imageNode.attrs.fileName === image.fileName) {
                            images[index] = {
                                ...image,
                                width: imageNode.width(),
                                height: imageNode.height(),
                            }

                        }
                    })
                }
            })
        }

        /**
         * Checks if it is images on the canvas and only runs the function if there is
         * an image that needs its width and height updated.
         */
        if (layerRef.current && images.length > 0) {
            const imageNodes = layerRef.current.getChildren().filter((child) => child.getClassName() === 'Image')
                .filter((child) => !child.attrs.width);
            if (imageNodes.length !== 0) {
                setImageDimensions(imageNodes);
            }
        }
    }, [images.length, layerRef, images]);

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
                {images.length > 0 &&
                    images.map((image, index) => {
                        return (
                            <ImageNode
                                key={index}
                                imageURL={image.imageUrl}
                                imageProps={image}
                                onClick={(e) => handleElementClick(e, index)}
                                onContextMenu={(e) => handleImageContextClick(e, index)}
                                onChange={(newImage) => {
                                    newImages[index] = newImage;
                                    setImages(newImages);
                                }}
                            />
                        );
                    })
                }
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
            </Layer>
        </Stage>
    );
};

export default StageArea;