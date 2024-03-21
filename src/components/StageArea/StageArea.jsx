import React, {useContext, useEffect, useRef, useState} from "react";
import {Layer, Stage, Transformer} from "react-konva";
import ImageNode from "../ImageNode/ImageNode";
import LockedContext from "../../contexts/LockedContext";
import {saveProjectDialog} from "../FileHandling"
import ProjectContext from "../../contexts/ProjectContext";
import SelectedElementsIndexContext from "../../contexts/SelectedElementsIndexContext";
import ImageFilterContext from "../../contexts/ImageFilterContext";

/**
 * Hook for handling the state history, undo, and redo.
 * @param initialState - the first state in the history.
 * @param maxSteps - of undo or redo actions or max length of the history.
 * @return {[any[],function(any, boolean): *,function(): *, function(): *]}
 * getter for the current state, setter for the current state, the undo function, and the redo function.
 */
const useHistory = (initialState, maxSteps) => {
	const [index, setIndex] = useState(0);
	const [history, setHistory] = useState([initialState]);

	/**
	 * Updates the state.
	 * @param action
	 * @param overwrite
	 */
	const setState = (action, overwrite = false) => {
		// get the new state ether from a function or a variable, implemented similar to useState
		const newState = typeof action === "function" ? action(history[index]) : action;

		if (overwrite) {
			// overwrite the current state
			const newHistory = [...history];
			newHistory[index] = newState;
			setHistory(newHistory);
		} else {
			const newIndex = index + 1;
			// remove the history after current state
			const newHistory = history.slice(0, newIndex);
			// add new state to the history
			newHistory.push(newState);

			// Enforce the maximum number of undo steps
			if (newHistory.length > maxSteps) {
				// Remove the oldest state
				newHistory.shift();
			} else {
				// increment the index
				setIndex(newIndex);
			}
			setHistory(newHistory);
		}
	}

	/**
	 * Undoes the last action in the history.
	 */
	const undo = () => index > 0 && setIndex(prevState => prevState - 1)

	/**
	 * Redoes the last action in the history.
	 */
	const redo = () => index < history.length - 1 && setIndex(prevState => prevState - 1);

	return [history[index], setState, undo, redo];
}

/**
 * Creates the canvas area in the project page.
 * @param stageRef is the reference for the stage used.
 * @param layerRef is the reference for the layer inside the stage.
 * @param setIsFilterWindowOpen is the boolean that is used in the canvas.jsx file to set the visibility of the window.
 * @returns {Element}
 * @constructor
 */
const StageArea = ({stageRef, layerRef, setIsFilterWindowOpen}) => {
	const [selectedElements, setSelectedElements] = useState([]);
	const [ctrlPressed, setCtrlPressed] = useState(false);
	const [shiftPressed, setShiftPressed] = useState(false);

	const trRef = useRef();

	const {selectedElementsIndex, setSelectedElementsIndex} = useContext(SelectedElementsIndexContext);
	const {isLocked} = useContext(LockedContext);
	const {project, setProject} = useContext(ProjectContext);
	const {setFilterImageIndex} = useContext(ImageFilterContext);

	const [images, setImages, undo, redo] = useHistory([], 20);

	const zoomScale = 1.17; //How much zoom each time
	const zoomMin = 0.001; //zoom out limit
	const zoomMax = 300; //zoom in limit

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
			if (e.key === "Delete" && selectedElementsIndex.length > 0) {
				const newImages = images.filter((image, index) => !selectedElementsIndex.includes(index));
				setImages(newImages);
				setSelectedElements([]);
				setSelectedElementsIndex([]);
			}
		};
		document.addEventListener("keydown", handleDeletePressed);
		return () => {
			document.removeEventListener("keydown", handleDeletePressed);
		};
	}, [images, selectedElements, setSelectedElements, selectedElementsIndex, setSelectedElementsIndex, setImages]);

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
	},[selectedElements, isLocked]);

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
				{images.length > 0 &&
					images.map((image, index) => {
						return (
							<ImageNode
								key={index}
								imageURL={image.imageUrl}
								imageProps={image}
								onSelect={(e) => handleElementClick(e, index)}
								onContextMenu={(e) => handleImageContextClick(e, index)}
								onChange={(newImage) => {
									const newImages = [...images];
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
					/>
				}
			</Layer>
		</Stage>
	);
};

export default StageArea;