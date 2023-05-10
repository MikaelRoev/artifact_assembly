import React, { useEffect } from "react";
import { Stage, Layer } from "react-konva";
import ImageNode from "../ImageNode/ImageNode";
// import { initialImages } from "../../assets/InitialImages";

import { useState, useRef } from "react";

const StageArea = ({ uploadedImages }) => {
	const [images, setImages] = useState([]);
	const [selectedImageId, setSelectedImageId] = useState(null);
	const [history, setHistory] = useState([]);
	const [historyIndex, setHistoryIndex] = useState(-1);

	const stageRef = useRef(null);
	const maxUndoSteps = 20;

	const zoomScale = 1.17; //How much zoom each time
	const min = 0.001; //zoom out limit
	const max = 300; //zoom in limit

	useEffect(() => {
		setImages(uploadedImages);
	}, [uploadedImages]);

	useEffect(() => {
		const handleDelete = (e) => {
			if (e.key === "Delete" && selectedImageId !== null) {
				const updatedImages = images.filter(
					(image) => image.id !== selectedImageId
				);
				console.log(`image ${selectedImageId} deleted`);
				setImages(updatedImages);
				setSelectedImageId(null);
			}
		};
		document.addEventListener("keydown", handleDelete);
		return () => {
			document.removeEventListener("keydown", handleDelete);
		};
	}, [selectedImageId, images]);

	useEffect(() => {
		// Update the uploadedImages prop when the images state changes
		uploadedImages.forEach((uploadedImage) => {
			const index = images.findIndex((image) => image.id === uploadedImage.id);
			if (index >= 0) {
				uploadedImages[index] = images[index];
			}
		});
	}, [images, uploadedImages]);

	useEffect(() => {
		const savedImages = localStorage.getItem("savedImages");
		if (savedImages) {
			setImages(JSON.parse(savedImages));
		} else {
			setImages(uploadedImages);
		}
	}, [uploadedImages]);

	useEffect(() => {
		const handleSave = (e) => {
			if (e.ctrlKey && e.key === "s") {
				e.preventDefault();
				saveImagePositions();
			}
		};
		document.addEventListener("keydown", handleSave);
		return () => {
			document.removeEventListener("keydown", handleSave);
		};
	}, [images]);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.ctrlKey && e.key === "z") {
				e.preventDefault();
				handleUndo();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [history, historyIndex]);

	const saveImagePositions = () => {
		localStorage.setItem("savedImages", JSON.stringify(images));
	};

	const checkDeselect = (e) => {
		// deselect when clicked on empty area
		const clickedOnEmpty = e.target === e.currentTarget;
		if (clickedOnEmpty) {
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

	const selectImageId = (imageId) => {
		setSelectedImageId(Number(imageId));
		console.log(selectedImageId);
	};

	const handleUndo = () => {
		if (historyIndex > 0) {
			setHistoryIndex(historyIndex - 1);
			setImages(history[historyIndex - 1]);
		}
	};

	return (
		<>
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
		</>
	);
};

export default StageArea;
