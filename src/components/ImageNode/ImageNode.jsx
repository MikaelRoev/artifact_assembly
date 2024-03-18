import React, {useState} from "react";
import Konva from "konva";
import { useContext, useRef, useEffect } from "react";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import FilterContext from "../../contexts/FilterContext";
import { convertFileSrc } from '@tauri-apps/api/tauri';

/**
 * Represents a canvas object on the canvas.
 * @param imageProps
 * @param isSelected
 * @param onSelect
 * @param onChange
 * @returns {Element}
 * @constructor
 */
const ImageNode = ({
	shapeProps: imageProps,
	onSelect,
	onChange
}) => {
	const imageRef = useRef();

	const [url, setUrl] = useState('');

	const [image] = useImage(url, 'Anonymous');

	const { filter, hue, saturation, luminance, contrast } = useContext(FilterContext);

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
		if (image) {
			imageRef.current.cache();
		}
	}, [image]);

	/**
	 * Makes an url from the file at file path.
	 */
	useEffect(() => {
		if (imageProps.filePath) {
			const newUrl = convertFileSrc(imageProps.filePath);
			setUrl(newUrl);
		}
	}, [imageProps.filePath]);

	/**
	 * Returns a Konva image
	 */
	return (
		<KonvaImage
			ref={imageRef}
			filters={handleFilter()}
			{...{
				hue: hue,
				saturation: saturation,
				luminance: luminance,
				contrast: contrast,
			}}
			image={image}
			onClick={onSelect}
			onTap={onSelect}
			x={imageProps.x}
			y={imageProps.y}
			{...imageProps}
			onChange={onChange}
			onDragEnd={(e) => {
				onChange({
					...imageProps,
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
					...imageProps,
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
	);
};

export default ImageNode;
