import React from "react";
import { Stage, Layer } from "react-konva";
import TransformableImage from "../TransformableImage/TransformableImage";
import { initialImages } from "../../assets/InitialImages";
import { useState, useRef, useEffect } from "react";

const StageArea = () => {
	const [images, setImages] = useState(initialImages);
	const [selectedId, selectedImage] = useState(null);

	const scaleBy = 1.05;
	const stageRef = useRef(null);
	let lastCenter = null;
	let lastDist = 0;

	function getDistance(p1, p2) {
		const dx = p2.x - p1.x;
		const dy = p2.y - p1.y;
		return Math.sqrt(dx ** 2 + dy ** 2);
	}

	function getCenter(p1, p2) {
		return {
			x: (p1.x + p2.x) / 2,
			y: (p1.y + p2.y) / 2,
		};
	}

	function resetStage() {
		const stage = stageRef.current;
		if (!stage) return;

		// Reset scale and position
		stage.scale({ x: 1, y: 1 });
		stage.position({ x: 0, y: 0 });
		stage.batchDraw();

		// Reset last center and distance values
		lastCenter = null;
		lastDist = 0;
	}

	const checkDeselect = (e) => {
		// deselect when clicked on empty area
		const clickedOnEmpty = e.target === e.currentTarget;
		if (clickedOnEmpty) {
			selectedImage(null);
		}
	};

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
		const minScale = 0.4;
		let newScale =
			event.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
		newScale = Math.max(minScale, newScale);

		stage.scale({ x: newScale, y: newScale });

		const newPos = {
			x: pointer.x - mousePointTo.x * newScale,
			y: pointer.y - mousePointTo.y * newScale,
		};
		stage.position(newPos);
		stage.batchDraw();
	}

	function handleTouch(e) {
		e.evt.preventDefault();
		const touches = e.evt.touches;
		const stage = stageRef.current;

		if (!stage || touches.length < 2) {
			return;
		}

		const touch1 = touches[0];
		const touch2 = touches[1];

		if (stage.isDragging()) {
			stage.stopDrag();
		}

		const p1 = { x: touch1.clientX, y: touch1.clientY };
		const p2 = { x: touch2.clientX, y: touch2.clientY };
		const newCenter = getCenter(p1, p2);
		const dist = getDistance(p1, p2);

		if (!lastCenter) {
			lastCenter = newCenter;
			return;
		}

		const scale = stage.scaleX() * (dist / lastDist);
		const pointTo = {
			x: (newCenter.x - stage.x()) / stage.scaleX(),
			y: (newCenter.y - stage.y()) / stage.scaleX(),
		};
		const dx = newCenter.x - lastCenter.x;
		const dy = newCenter.y - lastCenter.y;
		const newPos = {
			x: newCenter.x - pointTo.x * scale + dx,
			y: newCenter.y - pointTo.y * scale + dy,
		};

		stage.scale({ x: scale, y: scale });
		stage.position(newPos);
		stage.batchDraw();

		lastDist = dist;
		lastCenter = newCenter;
	}

	function handleTouchEnd() {
		lastCenter = null;
		lastDist = 0;
	}

	// useEffect(() => {
	// 	const handleKeyPress = (event) => {
	// 		if (event.key === "p") {
	// 			resetStage();
	// 		}
	// 	};
	// 	document.addEventListener("keydown", handleKeyPress);
	// 	return () => {
	// 		document.removeEventListener("keydown", handleKeyPress);
	// 	};
	// }, []);

	return (
		<>
			<Stage
				width={window.innerWidth}
				height={window.innerHeight}
				className="stage"
				draggable
				onWheel={zoomStage}
				onTouchMove={handleTouch}
				onTouchEnd={handleTouchEnd}
				onMouseDown={checkDeselect}
				onTouchStart={checkDeselect}
				ref={stageRef}
				onContextMenu={(e) => {
					e.evt.preventDefault();
					const contextMenu = document.getElementById("context-menu");
					contextMenu.style.top = `${e.evt.clientY}px`;
					contextMenu.style.left = `${e.evt.clientX}px`;
					contextMenu.classList.add("active");
				}}>
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
