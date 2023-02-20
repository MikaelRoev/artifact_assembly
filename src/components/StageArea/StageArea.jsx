import React from "react";
import { Stage, Layer } from "react-konva";
import TransformableImage from "../TransformableImage/TransformableImage";
import { initialImages } from "../../assets/InitialImages";
import { useState, useRef } from "react";

const StageArea = () => {
	const [images, setImages] = useState(initialImages);
	const [selectedId, selectedImage] = useState(null);
	const stageRef = useRef(null);

	const zoomScale = 1.15;

	/**
	 * Calculates the distance between two points in a 2D coordinate system.
	 *
	 * @param {Object} p1 - An object representing the first point with x and y properties.
	 * @param {Object} p2 - An object representing the second point with x and y properties.
	 * @returns {number} The distance between the two points.
	 */

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
	function zoomStage(event) {
		event.evt.preventDefault();

		const stage = stageRef.current;
		if (!stage) return;

		const oldScale = stage.scaleX();
		const pointer = stage.getPointerPosition();
		const mousePointTo = {
			x: (pointer.x - stage.x()) / oldScale,
			y: (pointer.y - stage.y()) / oldScale,
		};

		// Add a max limit to how much you can zoom out
		const limit = 0.4;
		let newScale =
			event.evt.deltaY < 0 ? oldScale * zoomScale : oldScale / zoomScale;
		newScale = Math.max(limit, newScale);

		stage.scale({ x: newScale, y: newScale });

		const newPos = {
			x: pointer.x - mousePointTo.x * newScale,
			y: pointer.y - mousePointTo.y * newScale,
		};
		stage.position(newPos);
		stage.batchDraw();
	}

	return (
		<>
			<Stage
				width={window.innerWidth}
				height={window.innerHeight}
				className="stage"
				draggable
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
