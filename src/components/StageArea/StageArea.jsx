import React, { useEffect } from "react";
import {Stage, Layer, Rect as KonvaRect, Group, Text} from "react-konva";
import { useState, useRef } from "react";
import ElementNode from "../ElementNode";
import FileHandling from "../FileHandling";

/**
 * Creates the canvas area in the project page.
 * @param uploadedImages is the initial images on the canvas.
 * @param stageRef is the reference for the stage used.
 * @returns {Element}
 * @constructor
 */
const StageArea = ({ uploadedImages, stageRef}) => {
	const [images, setImages] = useState([]);
	const [selectedImageId, setSelectedImageId] = useState(null);
	const [history, setHistory] = useState([]);
	const [historyIndex, setHistoryIndex] = useState(-1);

	const renderCount = useRef(0);
	const maxUndoSteps = 20;

	const zoomScale = 1.17; //How much zoom each time
	const zoomMin = 0.001; //zoom out limit
	const zoomMax = 300; //zoom in limit

	let projectName = "";
	let projectDescription = "";

	useEffect(() => {
		renderCount.current = renderCount.current + 1;
		console.log(renderCount.current);
	});

	/**
	 * Sets the images when the list of uploaded images changes.
	 */
	useEffect(() => {
		setImages(uploadedImages);
	}, [uploadedImages]);



	/**
	 * Sets up and cleans up the delete event listener.
	 */
	useEffect(() => {

		/**
	 	* Deletes the selected images if the delete key is pressed.
	 	* @param e the event.
		 */
		const handleDeletePressed = (e) => {
			if (e.key === "Delete" && selectedImageId !== null) {
				const updatedImages = images.filter(
					(image) => image.id !== selectedImageId
				);
				console.log(`image ${selectedImageId} deleted`);
				setImages(updatedImages);
				setSelectedImageId(null);
			}
		};
		document.addEventListener("keydown", handleDeletePressed);
		return () => {
			document.removeEventListener("keydown", handleDeletePressed);
		};
	}, [selectedImageId, images]);

	/**
	 * Updates the uploaded images when an image changes state.
	 */
	useEffect(() => {
		// Update the uploadedImages prop when the images state changes
		uploadedImages.forEach((uploadedImage) => {
			const index = images.findIndex((image) => image.id === uploadedImage.id);
			if (index >= 0) {
				uploadedImages[index] = images[index];
			}
		});
	}, [images, uploadedImages]);


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
				FileHandling.saveProjectDialog().then(() => {console.log('Project saved!');});
				FileHandling.openProjectDialog().then(() => {console.log('Project opened!');});
 			}
		};
		document.addEventListener("keydown", handleSavePressed);
		return () => {
			document.removeEventListener("keydown", handleSavePressed);
		};
	});

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
	 * Deselects when the mouse clicks on an empty area on the canvas.
	 * @param e the event.
	 */
	const checkDeselect = (e) => {
		if (e.target === e.currentTarget) {
			setSelectedImageId(null);
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

		stage.scale({ x: newScale, y: newScale });

		const newPos = {
			x: pointer.x - mousePointTo.x * newScale,
			y: pointer.y - mousePointTo.y * newScale,
		};
		stage.position(newPos);
		stage.batchDraw();
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
	 * Selects an image.
	 * @param imageId
	 */
	const selectImageId = (imageId) => {
		setSelectedImageId(imageId);
		console.log(selectedImageId);
	};

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

	const shapes = [
		<KonvaRect
			key="rect"
			x={20}
			y={20}
			width={100}
			height={50}
			fill="blue"
		/>,
		<Text
			key="text"
			x={150}
			y={20}
			text="Hello, Konva!"
			fontSize={20}
			fill="green"
		/>,
		<Group key="group" >
			<KonvaRect
				x={250}
				y={20}
				width={50}
				height={50}
				fill="red"
			/>
			<KonvaRect
				x={250}
				y={80}
				width={50}
				height={50}
				fill="yellow"
			/>
		</Group>
	]

	return (
		<>
			<Stage
				width={window.innerWidth}
				height={window.innerHeight}
				//draggable
				className="stage"
				onWheel={zoomStage}
				onMouseDown={checkDeselect}
				onTouchStart={checkDeselect}
				ref={stageRef}>
				<Layer className="layer">
					{
						shapes.length > 0 && shapes.map((shape, index) => (
							<ElementNode
								key={shape.key}
								isSelected={shape.key === selectedImageId}
								onSelect={() => {
									selectImageId(shape.key);
								}}
								onChange={(newAttrs) => {
									const changes = images.slice();
									changes[index] = newAttrs;
									setImages(changes);
									updateHistory(changes);
								}}
							>
								{shape}
							</ElementNode>
						))
					}
					{/*images.length > 0 &&
						images.map((image, i) => {
							return (
								<ImageNode
									key={image.id} // Updated key prop
									imageURL={image.imageUrl}
									shapeProps={image}
									isSelected={image.id === selectedImageId}
									onSelect={() => {
										selectImageId(image.id);
									}}
									onChange={(newAttrs) => {
										const changes = images.slice();
										changes[i] = newAttrs;
										setImages(changes);
										updateHistory(changes);
									}}
								/>
							);
						})*/}
				</Layer>
			</Stage>
		</>
	);
};

export default StageArea;
