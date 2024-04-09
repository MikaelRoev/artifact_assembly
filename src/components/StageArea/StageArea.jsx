import React, {useContext, useEffect, useRef, useState} from "react";
import {Group, Layer, Stage, Transformer} from "react-konva";
import ImageNode from "../ImageNode/ImageNode";
import LockedContext from "../../contexts/LockedContext";
import {saveProjectDialog} from "../FileHandling"
import ProjectContext from "../../contexts/ProjectContext";
import ElementContext from "../../contexts/ElementContext";
import SelectedElementsIndexContext from "../../contexts/SelectedElementsIndexContext";
import ImageFilterContext from "../../contexts/ImageFilterContext";
import WindowModalOpenContext from "../../contexts/WindowModalOpenContext";

/**
 * Creates the canvas area in the project page.
 * @param stageRef is the reference for the stage used.
 * @param layerRef is the reference for the layer inside the stage.
 * @returns {Element}
 * @constructor
 */
const StageArea = ({stageRef, layerRef}) => {
    const [selectedElements, setSelectedElements] = useState([]);
    const [ctrlPressed, setCtrlPressed] = useState(false);
    const [shiftPressed, setShiftPressed] = useState(false);

    const trRef = useRef();

    const {selectedElementsIndex, setSelectedElementsIndex} = useContext(SelectedElementsIndexContext);
    const {isLocked} = useContext(LockedContext);
    const {project, setProject} = useContext(ProjectContext);
    const {elements, setElements, undo, redo} = useContext(ElementContext);
    const {setFilterImageIndex} = useContext(ImageFilterContext);
	const {isFilterInteracting, setIsFilterWindowOpen} = useContext(WindowModalOpenContext);

    const zoomScale = 1.17; //How much zoom each time
    const zoomMin = 0.001; //zoom out limit
    const zoomMax = 300; //zoom in limit

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
	let newImages = [...elements];

	/**
	 * Update the stage according to the project.
	 */
	useEffect(() => {
		const stage = stageRef.current;
		if (!stage) return;
		stage.position({ x: project.x, y: project.y });
		stage.scale({ x: project.zoom, y: project.zoom });
		stage.batchDraw();
	}, [project, stageRef]);


    /**
     * Sets up and cleans up the delete event listener.
     */
    useEffect(() => {

        /**
         * Deletes the selected images if the delete key is pressed.
         * @param e the event.
         */
        const handleDeletePressed = (e) => {
            if (e.key === "Delete" && selectedElementsIndex.length > 0 && !isFilterInteracting) {
                const newImages = elements.filter((image, index) => !selectedElementsIndex.includes(index));
                setElements(newImages);
                setSelectedElements([]);
                setSelectedElementsIndex([]);
            }
        };
        document.addEventListener("keydown", handleDeletePressed);
        return () => {
            document.removeEventListener("keydown", handleDeletePressed);
        };
    }, [elements, selectedElements, setSelectedElements, selectedElementsIndex,
        setSelectedElementsIndex, setElements, isFilterInteracting]);

    /**
     * Sets up and cleans up the save event listener.
     */
    useEffect(() => {
        /**
         * Saves the image positions if ctrl + S is pressed.
         * @param e the event.
         */
        const handleSavePressed = (e) => {
            if (e.ctrlKey && e.key === "s") {
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
         * @param e the event.
         */
        const handleUndoPressed = (e) => {
            if (e.ctrlKey && e.key === "y") {
                e.preventDefault();
                redo();
            } else if (e.ctrlKey && e.key === "z") {
                e.preventDefault();
                undo();
            }
        };
        document.addEventListener("keydown", handleUndoPressed);
        return () => {
            document.removeEventListener("keydown", handleUndoPressed);
        };
    }, [undo, redo]);
	/**
	 * Sets up and cleans up the undo event listener.
	 */
	useEffect(() => {
		/**
		 * Key event handler for undo and redo.
		 * @param e the event.
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
         * @param e
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
         * @param e
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
     * @param e the event.
     */
    const checkDeselect = (e) => {
        if (e.target === e.currentTarget && !ctrlPressed && !shiftPressed) {
            selectedElements.forEach((element) => element.draggable(false));
            setSelectedElements([]);
            setSelectedElementsIndex([]);
        }
    };

    /**
     * Zooms the Konva stage when a mouse or touchpad scroll event is triggered.
     *
     * @param {Object} event - The event object containing information about the scroll event.
     */
    const zoomStage = (event) => {
        event.evt.preventDefault();

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

        const zoomFactor = event.evt.deltaY < 0 ? zoomScale : 1 / zoomScale;
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
     * @param e click event.
     * @param index of the element clicked on
     */
    const handleElementClick = (e, index) => {
        const element = e.target;
        element.moveToTop();
        const elementIndex = selectedElements.indexOf(element);
        const indexIndex = selectedElementsIndex.indexOf(index);

        if (ctrlPressed || shiftPressed) {
            if (elementIndex !== -1) {
                // already selected
                selectedElements[elementIndex].draggable(false);
                const newSelected = [...selectedElements];
                newSelected.splice(elementIndex, 1);
                setSelectedElements(newSelected);

                const newSelectedIndex = [...selectedElementsIndex];
                newSelectedIndex.splice(indexIndex, 1);
                setSelectedElementsIndex(newSelectedIndex);
            } else {
                // not already selected
                setSelectedElements([...selectedElements, element]);
                setSelectedElementsIndex([...selectedElementsIndex, index]);
            }
        } else {
            selectedElements.forEach((element) => element.draggable(false));
            setSelectedElements([element]);
            setSelectedElementsIndex([index]);
        }
    }

    /**
     * Handles when an image is right-clicked and opens the filter window.
     * @param e right-click event
     * @param index {number} the index of the image to add filters to.
     */
    const handleImageContextClick = (e, index) => {
        e.evt.preventDefault();
        setIsFilterWindowOpen(true);
        setFilterImageIndex(index);
    }

    const renderElements = () => {
        return (
            elements.length > 0 &&
            elements.map((element, index) => {
                switch (element.type) {
                    case 'Image':
                        return (
                            renderImage(element, index)
                        );
                    case 'Group':
                        return (
                            renderGroup(element, index)

                        );
                }
            })
        );
    }

    const renderImage = (image, index) => {
        return (
            <ImageNode
                key={index}
                imageProps={image}
                onSelect={(e) => handleElementClick(e, index)}
                onContextMenu={(e) => handleImageContextClick(e, index)}
                onChange={(newImage, overwrite) => {
                    const newImages = [...elements];
                    newImages[index] = newImage;
                    setElements(newImages, overwrite);
                }}
            />
        );
    }


    const renderGroup = (group, index) => {
        return (
            <Group
                key={index}
                onClick={e => handleElementClick(e, index)}
                onTap={e => handleElementClick(e, index)}
                onContextMenu={e => handleImageContextClick(e, index)}

            >
                {group.groupElements.map((groupElement, i) => {
                    console.log("Rendering Image:", groupElement); // Add console.log here
                    return (
                        <ImageNode
                            key={i}
                            imageProps={groupElement}
                            onChange={(newImage, overwrite) => {
                                const newImages = [...elements];
                                newImages[index] = { ...newImages[index], ...newImage }; // Update the specific image in the group
                                setElements(newImages, overwrite);
                            }}
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
        const setImageDimensions = async (imageNodes) => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            imageNodes.forEach(imageNode => {
                if (!imageNode.attrs.width || !imageNode.attrs.height) {
                    elements.forEach((image, index) => {
                        if (imageNode.attrs.fileName === image.fileName) {
                            elements[index] = {
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
        if (layerRef.current && elements.length > 0) {
            const imageNodes = layerRef.current.getChildren().filter((child) => child.getClassName() === 'Image')
                .filter((child) => !child.attrs.width);
            if (imageNodes.length !== 0) {
                setImageDimensions(imageNodes).then(() => console.log('Dimensions retrieved'))
            }
        }
    }, [elements.length, layerRef, elements]);

    /**
     * Returns a stage with a layer within.
     * Returns an imageNode and a transformer within the layer.
     */
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
                    />
                }
            </Layer>
        </Stage>
    );
};

export default StageArea;