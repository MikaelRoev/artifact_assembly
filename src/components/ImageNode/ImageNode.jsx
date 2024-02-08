import React from "react";
import Konva from "konva";
import { useContext, useRef, useEffect } from "react";
import { Transformer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import GridContext from "../../pages/Canvas/Context/GridContext";
import ResizeContext from "../../pages/Canvas/Context/ResizeContext";
import LockContext from "../../pages/Canvas/Context/LockContext";
import ImageContext from "../../pages/Canvas/Context/ImageContext";

/**
 * Represents an canvas object on the canvas.
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
	const trRef = useRef();

	const [imageSrc] = useImage(imageURL);

	const gridContext = useContext(GridContext);
	const resizeContext = useContext(ResizeContext);
	const lockContext = useContext(LockContext);
	const imageContext = useContext(ImageContext);

	const { grid } = gridContext;
	const { resize } = resizeContext;
	const { lock } = lockContext;
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

	useEffect(() => {
		if (isSelected) {
			// we need to attach transformer manually
			trRef.current.nodes([imageRef.current]);
			trRef.current.getLayer().batchDraw();
		}
	}, [isSelected]);

	useEffect(() => {
		if (imageSrc) {
			imageRef.current.cache();
		}
	}, [imageSrc]);

	return (
		<>
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
				onClick={onSelect}
				onTap={onSelect}
				{...shapeProps}
				draggable={!lock}
				onChange={onChange}
				onDragMove={(e) => {
					//Moves selected image on a grid
					e.target.x(Math.round(e.target.x() / grid) * grid);
					e.target.y(Math.round(e.target.y() / grid) * grid);
				}}
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
					if (!lock) container.style.cursor = "default";

					container.style.cursor = "pointer";
				}}
				onMouseLeave={(e) => {
					const container = e.target.getStage().container();
					container.style.cursor = "default";
				}}
				perfectDrawEnabled={false}
			/>
			{isSelected && (
				//Adds the konva transformer to the image item
				<Transformer
					ref={trRef}
					boundBoxFunc={(oldBox, newBox) => {
						// limit resize
						if (newBox.width < 5 || newBox.height < 5) {
							return oldBox;
						}
						return newBox;
					}}
					onDragMove={(e) => {
						//Moves selected image on top (z-index)
						e.target.moveToTop();
					}}
					resizeEnabled={resize}
				/>
			)}
		</>
	);
};

export default ImageNode;
