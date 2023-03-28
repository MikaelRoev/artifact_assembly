import React from "react";
import { useContext, useRef, useEffect } from "react";
import { Transformer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import GridContext from "../../pages/Canvas/Context/GridContext";
import ResizeContext from "../../pages/Canvas/Context/ResizeContext";
import LockContext from "../../pages/Canvas/Context/LockContext";

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

	const { grid } = useContext(GridContext);
	const { resize } = useContext(ResizeContext);
	const { lock } = useContext(LockContext);

	const onMouseLeave = (e) => {
		const container = e.target.getStage().container();
		container.style.cursor = "default";
	};

	const onMouseDown = (e) => {
		e.target.moveToTop();
	};

	const onMouseEnter = (e, lock) => {
		const container = e.target.getStage().container();
		if (!lock) container.style.cursor = "default";

		container.style.cursor = "pointer";
	};

	const onTransformEnd = (imageRef, onChange, shapeProps) => {
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
	};

	const onDragEnd = (onChange, shapeProps, e) => {
		onChange({
			...shapeProps,
			x: e.target.x(),
			y: e.target.y(),
		});
	};

	const onDragMove = (e, grid) => {
		e.target.x(Math.round(e.target.x() / grid) * grid);
		e.target.y(Math.round(e.target.y() / grid) * grid);
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
			console.log("caching...");
			imageRef.current.cache();
		}
	}, [imageSrc]);

	return (
		<>
			<KonvaImage
				ref={imageRef}
				image={imageSrc}
				onClick={onSelect}
				onTap={onSelect}
				{...shapeProps}
				draggable={!lock}
				onDragMove={(e) => {
					onDragMove(e, grid);
				}}
				onDragEnd={(e) => {
					onDragEnd(onChange, shapeProps, e);
				}}
				onMouseDown={(e) => {
					onMouseDown(e);
				}}
				onTransformEnd={() => {
					onTransformEnd(imageRef, onChange, shapeProps);
				}}
				onMouseEnter={(e) => {
					onMouseEnter(e, lock);
				}}
				onMouseLeave={(e) => {
					onMouseLeave(e);
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
