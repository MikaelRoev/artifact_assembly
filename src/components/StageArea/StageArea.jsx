import React, {useContext, useEffect, useRef, useState} from "react";
import {Layer, Stage, Transformer} from "react-konva";
import ImageNode from "../ImageNode/ImageNode";
import LockedContext from "../../contexts/LockedContext";
import {saveToFile, readFile} from "../FileHandling"
import {dialog} from "@tauri-apps/api";
import ProjectContext from "../../contexts/ProjectContext";
import ImageContext from "../../contexts/ImageContext";

/**
 * Creates the canvas area in the project page.
 * @param stageRef is the reference for the stage used.
 * @param layerRef is the reference for the layer inside the stage.
 * @returns {Element}
 * @constructor
 */
const StageArea = ({stageRef, layerRef}) => {
	//const [images, setImages] = useState([]);
	const [selectedElements, setSelectedElements] = useState([]);
	const [history, setHistory] = useState([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [ctrlPressed, setCtrlPressed] = useState(false);

	const trRef = useRef();

	const {isLocked} = useContext(LockedContext);
	const {project, setProject} = useContext(ProjectContext);
	const {images, setImages} = useContext(ImageContext);

	const maxUndoSteps = 20;

	const zoomScale = 1.17; //How much zoom each time
	const zoomMin = 0.001; //zoom out limit
	const zoomMax = 300; //zoom in limit

	console.log(project);

	/**
	 * Update the stage according to the project.
	 */
	useEffect(() => {
		const stage = stageRef.current;
		if (!stage) return;
		stage.position({ x: project.x, y: project.y });
		stage.scale({ x: project.zoom, y: project.zoom });
		stage.batchDraw();
	}, [project]);


	/**
	 * Sets up and cleans up the delete event listener.
	 */
	useEffect(() => {

		/**
	 	* Deletes the selected images if the delete key is pressed.
	 	* @param e the event.
		 */
		const handleDeletePressed = (e) => {
			if (e.key === "Delete" && selectedElements.length > 0) {
				const selectedIds = selectedElements.map((element) => element.getId())

				const newImages = images.filter((image) => !selectedIds.includes(image.id));

				setImages(newImages);
				setSelectedElements([]); // works
			}
		};
		document.addEventListener("keydown", handleDeletePressed);
		return () => {
			document.removeEventListener("keydown", handleDeletePressed);
		};
	}, [images, selectedElements]);

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
				saveProjectDialog().then(() => console.log("project saved"));
			}
		};
		document.addEventListener("keydown", handleSavePressed);
		return () => {
			document.removeEventListener("keydown", handleSavePressed);
		};
	}, [images]);

	/**
	 * Sets up and cleans up the undo event listener.
	 */
	useEffect(() => {
		/**
		 * Undo the last step in the history if ctrl + z is pressed.
		 * @param e the event.
		 */
		const handleUndoPressed = (e) => {
			if (e.ctrlKey && e.key === "z") {
				e.preventDefault();
				Undo();
			}
		};
		document.addEventListener("keydown", handleUndoPressed);
		return () => {
			document.removeEventListener("keydown", handleUndoPressed);
		};
	}, [history, historyIndex]);

	/**
	 * Set up and cleans up the deselect check.
	 */
	useEffect(() => {
		/**
		 * The ctrl key down event handler.
		 * @param e
		 */
		const handleCtrlDown = (e) => {
			if (e.key === 'Control') {
				setCtrlPressed(true);
			}
		};

		/**
		 * The ctrl key up event handler.
		 * @param e
		 */
		const handleCtrlUp = (e) => {
			if (e.key === 'Control') {
				setCtrlPressed(false);
			}
		};

		document.addEventListener('keydown', handleCtrlDown);
		document.addEventListener('keyup', handleCtrlUp);

		return () => {
			document.removeEventListener('keydown', handleCtrlDown);
			document.removeEventListener('keyup', handleCtrlUp);
		};
	}, []);


	/**
	 * Deselects when the mouse clicks on an empty area on the canvas
	 * and ctrl key is not pressed.
	 * @param e the event.
	 */
	const checkDeselect = (e) => {
		if (e.target === e.currentTarget && !ctrlPressed) {
			selectedElements.forEach((element) => element.draggable(false));
			setSelectedElements([]);
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
	 */
	const handleElementClick = (e) => {
		const element = e.target;
		element.moveToTop();
		const index = selectedElements.indexOf(element);

		if (ctrlPressed) {
			if (index !== -1) {
				// already selected
				const newSelected = [...selectedElements];
				newSelected.splice(index, 1);
				setSelectedElements(newSelected);
			} else {
				// not already selected
				setSelectedElements([...selectedElements, element]);
			}
		} else {
			selectedElements.forEach((element) => element.draggable(false));
			setSelectedElements([element]);
		}
	}

	/**
	 * Undoes the last action in the history.
	 */
	const Undo = () => {
		if (historyIndex > 0) {
			setHistoryIndex(historyIndex - 1);
			setImages(history[historyIndex - 1]);
		}
	};

	/**
	 * Updates the history of the canvas by adding changes.
	 * @param change the change to be added.
	 */
	const updateHistory = (change) => {
		// Update history
		const newHistory = history.slice(0, historyIndex + 1);
		newHistory.push(change);

		// Enforce the maximum number of undo steps
		if (newHistory.length > maxUndoSteps) {
			newHistory.shift(); // Remove the oldest state
		} else {
			setHistoryIndex(historyIndex + 1);
		}
		setHistory(newHistory);
	}

	/**
	 * Opens the "open project"-dialog window
	 * @return {Promise<void>} when the dialog window closes.
	 */
	const openProjectDialog = async () => {
		try {
			const filePath = await dialog.open({
				title: "Open Project",
				multiple: false,
				filters: [{name: 'JSON Files', extensions: ['json']}]
			});
			if (filePath) {
				jsonToProject(await readFile(filePath));
			} else {
				console.log('No file selected or operation cancelled.');
			}
		} catch (error) {
			console.error('Error during open project dialog: ', error);
		}
	}


	/**
	 * Opens the "save project as"-dialog window.
	 */
	const saveProjectDialog = async () => {
		try {
			const filePath = await dialog.save({
				title: 'Save Project As',
				filters: [{name: 'JSON Files', extensions: ['json']}]
			});
			if (filePath) {
				// get the project name from the file path.
				setProject({
					...project,
					name: filePath.replace(/^.*[\\/](.*?)\.[^.]+$/, '$1')
				});
				await saveToFile(projectToJSON(), filePath);
				await readFile(filePath);
			} else {
				console.log('No file selected or operation cancelled.');
			}
		} catch (error) {
			console.error('Error during file save dialog: ', error);
		}
	};


	/**
	 * Parses the project into a JSON representation.
	 * @returns {string} containing the resulting JSON.
	 */
	const projectToJSON = ()   => {
		return JSON.stringify(project);
	}

	/**
	 * Parses a JSON representation of a project into the project.
	 * @param {string} json representation of the project.
	 */
	const jsonToProject = (json) => {
		try {
			const project = JSON.parse(json);
			//setProjectName(project.name);
			//setProjectDescription(project.description);

			setImages(project.elements)
		} catch (error) {
			console.error('Error parsing JSON: ', error);
		}
	}

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
					images.map((image, i) => {
						return (
							<ImageNode
								key={image.id}
								id={image.id}
								imageURL={image.imageUrl}
								shapeProps={image}
								onSelect={(e) => handleElementClick(e)}
								onChange={(newAttrs) => {
									const rects = images.slice();
									rects[i] = newAttrs;
									setImages(rects);

									updateHistory(rects);
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