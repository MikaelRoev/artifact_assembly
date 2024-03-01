import React from "react";
import Konva from "konva";
import { useContext, useRef, useEffect } from "react";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import ImageContext from "../../pages/Canvas/Context/ImageContext";

/**
 * Represents a canvas object on the canvas.
 * @param shapeProps
 * @param isSelected
 * @param onSelect
 * @param onChange
 * @param imageURL
 * @returns {Element}
 * @constructor
 */
const ImageNode = ({
	shapeProps,
	onSelect,
	onChange,
	imageURL,
	id
}) => {
	const imageRef = useRef();

	const [imageSrc] = useImage(imageURL);

	const imageContext = useContext(ImageContext);

	const { filter, hue, saturation, luminance, contrast } = imageContext;

	/**
	 * Handles the filter on the image.
	 * @returns {[(this:Node, imageData: ImageData) => void,(this:Node, imageData: ImageData) => void]|null}
	 */
	const handleFilter = () => {
		if (filter === true) {
			return [Konva.Filters.HSL, Konva.Filters.Contrast];
		} else return null;
	};

	/**
	 * Gets the image
	 */
	useEffect(() => {
		if (imageSrc) {
			imageRef.current.cache();
		}
	}, [imageSrc]);

	/**
	 * Returns a Konva image
	 */
	return (
		<>
			<KonvaImage
				id={id}
				ref={imageRef}
				filters={handleFilter()}
				{...{
					hue: hue,
					saturation: Number(saturation),
					luminance: Number(luminance),
					contrast: Number(contrast),
				}}
				image={imageSrc}
				onClick={onSelect}
				onTap={onSelect}
				{...shapeProps}
				onChange={onChange}
				onDragEnd={(e) => {
					onChange({
						...shapeProps,
						x: e.target.x(),
						y: e.target.y(),
					});
				}}
				onMouseDown={(e) => {
					//Moves selected image on top (z-index)
					e.target.moveToTop();
				}}
				onTransformEnd={() => {
					const node = imageRef.current;
					const scaleX = node.scaleX();
					const scaleY = node.scaleY();

					node.scaleX(1);
					node.scaleY(1);
					onChange({
						...shapeProps,
						x: node.x(),
						y: node.y(),
						// set minimal value
						width: Math.max(5, node.width() * scaleX),
						height: Math.max(node.height() * scaleY),
					});
				}}
				onMouseEnter={(e) => {
					// Adds a pointer cursor when hovering over the image
					const container = e.target.getStage().container();
					container.style.cursor = "default";

					container.style.cursor = "pointer";
				}}
				onMouseLeave={(e) => {
					const container = e.target.getStage().container();
					container.style.cursor = "default";
				}}
				perfectDrawEnabled={false}
			/>
		</>
	);
};

export default ImageNode;
