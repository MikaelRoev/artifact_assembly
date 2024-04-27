import React, {useCallback, useContext, useEffect, useState} from "react";
import {Stage} from "react-konva";
import {saveProjectDialog} from "../../util/FileHandling"
import {getHueData} from "../../util/ImageManupulation";
import ProjectContext from "../../contexts/ProjectContext";
import FilterInteractionContext from "../../contexts/FilterInteractionContext";
import StageContext from "../../contexts/StageContext";
import {emitter} from "../../util/EventEmitter";

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
        getSelectTransformer,
        getSelectedElements,
        getAllImages,
        getAllElements,
        addChanges,

        select,
        deselect,
        deselectAll,
        selectOnly,
        isSelected,
        deleteSelected,

        state,
        isLocked,
        undo,
        redo
    } = useContext(StageContext);
    const {project, setProject} = useContext(ProjectContext);
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
    }, [getStage, project.x, project.y, project.zoom]);

    /**
     * Changes the ability to rotate and drag the selected elements when isLocked changes.
     */
    useEffect(() => {
        const selectTransformer = getSelectTransformer();
        if (!selectTransformer) return;
        selectTransformer.rotateEnabled(!isLocked);
        selectTransformer.forEach(element => element.draggable(!isLocked));
    }, [getSelectTransformer, getSelectedElements, getStage, isLocked]);

    /**
     * Sets up and cleans up the delete event listener.
     */
    useEffect(() => {

        /**
         * Deletes the selected elements if the delete key is pressed.
         * @param e{KeyboardEvent} the event.
         */
        function handleDeletePressed(e) {
            if (["Delete", "Backspace"].includes(e.key) && getSelectedElements().length > 0
                && !isFilterInteracting) {
                deleteSelected();
            }
        }

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
        function handleSavePressed(e) {
            if (e.ctrlKey && (e.key.toUpperCase() === "S")) {
                e.preventDefault();
                saveProjectDialog(project, setProject, state).then(() => console.log("project saved"));
            }
        }
        document.addEventListener("keydown", handleSavePressed);
        return () => {
            document.removeEventListener("keydown", handleSavePressed);
        };
    }, [project, setProject, state]);

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
    const checkDeselect = useCallback((e) => {
        if (e.target === e.currentTarget && e.evt.button !== 2 && !ctrlPressed && !shiftPressed) {
            deselectAll();
        }
    }, [ctrlPressed, deselectAll, shiftPressed]);

    /**
     * Zooms the Konva stage when a mouse or touchpad scroll event is triggered.
     *
     * @param e{KonvaEventObject} - The event object containing information about the scroll event.
     */
    function zoomStage(e) {
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
    }

    /**
     * Clamps a numeric value between a minimum and maximum range.
     * @param {number} value - The numeric value to be clamped.
     * @param {number} min - The minimum value of the range.
     * @param {number} max - The maximum value of the range.
     * @returns {number} The clamped value.
     */
    function clamp(value, min, max){
        return Math.min(Math.max(value, min), max);
    }

    /**
     * useEffect for updating image dimensions
     */
    useEffect(() => {
        /**
         * Sets the width and height of images that does not have them yet.
         * @param konvaImages Image nodes on the canvas.
         * @returns {Promise<void>}
         */
        const setImageHueValues = async (konvaImages) => {
            console.log("Running setImageHueValues()")
            await new Promise(resolve => setTimeout(resolve, 1000));

            for (const image of konvaImages) {
                image.attrs.hueValues = await getHueData(image.toDataURL());
            }
        }

        /**
         * Checks if it is images on the canvas and only runs the function if there is
         * an image that needs its width and height updated.
         */
        if (getAllImages().length === 0) return;
        const konvaImages = getAllImages().filter((child) => !child.attrs.hueValues);
        if (konvaImages.length === 0) return;
        setImageHueValues(konvaImages).then(() => console.log("Information retrieved"));
    }, [getAllImages]);

    useEffect(() => {
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

        emitter.on('imageDrawn', (image) => {
            console.log("emitter on");
        })

        const elements = getAllElements();
        elements.forEach(element => {
            element.on("click", handleElementClick);
            element.on("tap", handleElementClick);
        });

        return () => {
            elements.forEach(element => {
                element.off("click");
                element.off("tap");
            })
        };
    }, [ctrlPressed, deselect, getAllElements, isSelected, select, selectOnly, shiftPressed]);

    useEffect(() => {
        const elements = getAllElements();
        elements.forEach(element => {
            /**
             * Saves the changes to history when move end.
             */
            element.on("dragend", (e) => {
                addChanges(e.target.id(), {x: e.target.x(), y: e.target.y()});
            });

            /**
             * Saves the changes to history when rotation end.
             */
            element.on("transformend", (e) => {
                addChanges(e.target.id(), {rotation: e.target.rotation()});
            });
        })

        return () => {
            elements.forEach(element => {
                element.off("dragend");
                element.off("transformend");
            })
        }
    }, [addChanges, getAllElements]);

    return (
        <Stage
            ref={stageRef}
            width={window.innerWidth}
            height={window.innerHeight}
            draggable={true}
            className="stage"
            onWheel={zoomStage}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}>
        </Stage>
    );
};

export default StageArea;