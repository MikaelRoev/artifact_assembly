import React from "react";
import Konva from "konva";
import { useContext, useRef, useEffect } from "react";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import ResizeContext from "../../pages/Canvas/Context/ResizeContext";
import ImageContext from "../../pages/Canvas/Context/ImageContext";
import ElementNode from "../StageNode/ElementNode";

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
	isSelected,
	onSelect,
	onChange,
	imageURL,
}) => {
	const imageRef = useRef();

	const [imageSrc] = useImage(imageURL);

	const { resizable } = useContext(ResizeContext);
	const { filter, hue, saturation, luminance, contrast } = useContext(ImageContext);

	/**
	 * Handles the filter on the image.
	 * @returns {[(this:Node, imageData: ImageData) => void,(this:Node, imageData: ImageData) => void]|null}
	 */
	const handleFilter = () => {
		if (filter !== true) return null;
		return [Konva.Filters.HSL, Konva.Filters.Contrast];
	};

	useEffect(() => {
		if (imageSrc) {
			imageRef.current.cache();
		}
	}, [imageSrc]);

	return (
		<ElementNode
			isSelected={isSelected}
			resizable={resizable}
			onSelect={onSelect}
			onChange={onChange}
		>
			<KonvaImage
				ref={imageRef}
				filters={handleFilter()}
				{...{
					hue: hue,
					saturation: Number(saturation),
					luminance: Number(luminance),
					contrast: Number(contrast),
				}}
				image={imageSrc}
				{...shapeProps}
				onMouseDown={(e) => {
					//Moves selected image on top (z-index)
					e.target.moveToTop();
				}}
				perfectDrawEnabled={false}
			/>
		</ElementNode>
	);
};

export default ImageNode;
