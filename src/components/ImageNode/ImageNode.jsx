import Konva from "konva";
import { useContext, useRef, useEffect, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import FilterEnabledContext from "../../contexts/FilterEnabledContext";
import { convertFileSrc } from '@tauri-apps/api/tauri';

/**
 * Represents a canvas object on the canvas.
 * @param imageProps
 * @param isSelected
 * @param onSelect
 * @param onChange
 * @returns {JSX.Element}
 * @constructor
 */
const ImageNode = ({
	imageProps,
	onSelect,
	onChange,
	onContextMenu
}) => {
	const imageRef = useRef();

	const [url, setUrl] = useState('');

	const [image] = useImage(url, 'anonymous');

	const { filterEnabled } = useContext(FilterEnabledContext);

	/**
	 * Handles the filter on the image.
	 * @returns {[(this:Node, imageData: ImageData) => void,(this:Node, imageData: ImageData) => void]|null}
	 */
	const handleFilter = () => {
		if (filterEnabled === true) {
			return [Konva.Filters.HSV, Konva.Filters.HSL, Konva.Filters.Contrast, Konva.Filters.Mask];
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
			{...imageProps}
			ref={imageRef}
			filters={handleFilter()}
			image={image}
			onClick={onSelect}
			onTap={onSelect}
			onContextMenu={onContextMenu}
			x={imageProps.x}
			y={imageProps.y}
			draggable={false}
			onDragEnd={(e) => {
				onChange({
					...imageProps,
					x: e.target.x(),
					y: e.target.y(),
				});
			}}
			onTransformEnd={(e) => {
				onChange({
					...imageProps,
					x: e.target.x(),
					y: e.target.y(),
					rotation: e.target.rotation(),
				});
			}}
			onMouseDown={(e) => {
				//Moves selected image on top (z-index)
				e.target.moveToTop();
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
