import React, {useContext, useRef, useEffect, useState} from "react";
import Konva from "konva";
import {convertFileSrc} from '@tauri-apps/api/tauri';
import {Image as KonvaImage} from "react-konva";
import useImage from "use-image";
import FilterEnabledContext from "../../contexts/FilterEnabledContext";

/**
 * Component that represents a konva image object on the canvas.
 * @param imageProps {image:{
 *  filePath:string,
 *  x:number,
 *  y:number,
 *  hue:number,
 *  saturation:number,
 *  value:number,
 *  contrast:number,
 *  threshold:number,
 *  grayscale: boolean,
 *  invert: boolean
 * }}
 * the image prop object of the image containing information about the image.
 * @param onClick {function(evt: KonvaEventObject<MouseEvent>)} the event handler for the konva image click.
 * @param onChange {image:{
 *  filePath:string,
 *  x:number,
 *  y:number,
 *  hue:number,
 *  saturation:number,
 *  value:number,
 *  contrast:number,
 *  threshold:number,
 *  grayscale: boolean,
 *  invert: boolean
 * }} the event handler for the change of the konva image.
 * @param onContextMenu {function(evt: Konva.KonvaEventObject<PointerEvent>)} the event handler for context menu.
 * @param id id of the image
 * @returns {JSX.Element} the konva image.
 * @constructor
 */
const ImageNode = ({imageProps, onClick, onChange, onContextMenu,	id}) => {
    const imageRef = useRef();

    const [url, setUrl] = useState("");

    const [image] = useImage(url, "anonymous");

    const {filterEnabled} = useContext(FilterEnabledContext);

    /**
     * Handles the filters on the image.
     * @returns {Array<Filter>} an array of the filters or null.
     */
    const handleFilters = () => {
        if (filterEnabled === true) {
            const filters = [];
            if (
                (imageProps.hue !== undefined && imageProps.hue !== 0)
                || (imageProps.saturation !== undefined && imageProps.saturation !== 0)
                || (imageProps.value !== undefined && imageProps.value !== 0)
            ) filters.push(Konva.Filters.HSV);
            if (imageProps.contrast !== undefined && imageProps.contrast !== 0) filters.push(Konva.Filters.Contrast);
            if (imageProps.threshold !== undefined && imageProps.threshold !== 0) {
                filters.push(Konva.Filters.Mask);
            }
            if (imageProps.grayscale) filters.push(Konva.Filters.Grayscale);
            if (imageProps.invert) filters.push(Konva.Filters.Invert);
            return filters;
        } else return null;
    };

    /**
     * Gets the image.
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

	return (
		<KonvaImage
			{...imageProps}
			ref={imageRef}
            id={id}
			filters={handleFilters()}
			image={image}
			onClick={onClick}
			onTap={onClick}
			onContextMenu={onContextMenu}
			draggable={false}
            perfectDrawEnabled={false}
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
        />
    );
};

export default ImageNode;
