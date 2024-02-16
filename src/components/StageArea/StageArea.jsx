// import { initialImages } from "../../assets/InitialImages";
import React, {useEffect, useRef, useState} from "react";
import {Layer, Stage} from "react-konva";
import ImageNode from "../ImageNode/ImageNode";

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

	const maxUndoSteps = 20;

	const zoomScale = 1.17; //How much zoom each time
	const min = 0.001; //zoom out limit
	const max = 300; //zoom in limit

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
	 * If there are any saved images in the local storage, sets the images to the saved images.
	 * else sets them as the uploaded images,
	 */
	useEffect(() => {
		const savedImages = localStorage.getItem("savedImages");
		if (savedImages) {
			setImages(JSON.parse(savedImages));
		} else {
			setImages(uploadedImages);
		}
	}, [uploadedImages]);

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
				saveImagePositions();
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
	 * Saves the image positions.
	 */
	const saveImagePositions = () => {
		localStorage.setItem("savedImages", JSON.stringify(images));
	};

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
		const newScale = clamp(oldScale * zoomFactor, min, max);

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
		setSelectedImageId(Number(imageId));
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
			<Layer className="layer">
				{images.length > 0 &&
					images.map((image, i) => {
						return (
							<ImageNode
								key={image.id} // Updated key prop
								imageURL={image.imageUrl}
								shapeProps={image}
								isSelected={image.id === selectedImageId}
								onSelect={() => {
									selectImageId(image.id.toString());
								}}
								onChange={(newAttrs) => {
									const rects = images.slice();
									rects[i] = newAttrs;
									setImages(rects);

									// Update history
									const newHistory = history.slice(0, historyIndex + 1);
									newHistory.push(rects);

									// Enforce the maximum number of undo steps
									if (newHistory.length > maxUndoSteps) {
										newHistory.shift(); // Remove the oldest state
									} else {
										setHistoryIndex(historyIndex + 1);
									}

									setHistory(newHistory);
								}}
							/>
						);
					})}
			</Layer>
		</Stage>
	);
};

export default StageArea;