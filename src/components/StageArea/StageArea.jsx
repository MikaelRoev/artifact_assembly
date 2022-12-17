import React from "react";
import { Stage, Layer } from "react-konva";
import TransformableImage from "../TransformableImage/TransformableImage";
import { initialImages } from "../../assets/InitialImages";

const StageArea = () => {
	const [images, setImages] = React.useState(initialImages);
	const [selectedId, selectedImage] = React.useState(null);

	const checkDeselect = (e) => {
		// deselect when clicked on empty area
		const clickedOnEmpty = e.target === e.target.getStage();
		if (clickedOnEmpty) {
			selectedImage(null);
		}
	};

	return (
		<Stage
			width={window.innerWidth}
			height={window.innerHeight}
			className="stage"
			onMouseDown={checkDeselect}
			onTouchStart={checkDeselect}>
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
	);
};

export default StageArea;
