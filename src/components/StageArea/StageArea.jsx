import React from "react";
import { Stage, Layer } from "react-konva";
import TransformableImage from "../TransformableImage/TransformableImage";
import { initialImages } from "../../assets/InitialImages";
import { useState, useRef } from "react";

const StageArea = () => {
	const [images, setImages] = useState(initialImages);
	const [selectedId, selectedImage] = useState(null);
	const stageRef = useRef(null);

	const zoomScale = 1.17; //How much zoom each time
	const min = 0.4; //zoom out limit
	const max = 300; //zoom in limit

	const checkDeselect = (e) => {
		// deselect when clicked on empty area
		const clickedOnEmpty = e.target === e.currentTarget;
		if (clickedOnEmpty) {
			selectedImage(null);
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
					{images.map((image, i) => {
						return (
							<TransformableImage
								key={i}
								imageURL={image.imageUrl}
								shapeProps={image}
								isSelected={image.id === selectedId}
								onSelect={() => {
									selectedImage(image.id);
								}}
								onChange={(newAttrs) => {
									const rects = images.slice();
									rects[i] = newAttrs;
									setImages(rects);
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
