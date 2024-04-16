import React, {createContext, useRef} from "react";
import Konva from "konva";
import {convertFileSrc} from "@tauri-apps/api/tauri";
import useHistory from "../hooks/useHistory";

/**
 * The stage reference context that allows for using the reference to konva stage in the stage area.
 * @type {React.Context<null>}
 */
const StageRefContext = createContext(null);

/**
 * Provider for the stage reference context that allows for using the reference to konva stage in the stage area.
 * @param children {JSX.Element} the components that can use the context.
 * @return {JSX.Element} the context provider.
 * @constructor
 */
export const StageRefContextProvider = ({children}) => {
    const stageRef = useRef();

    const [state, setState, undo, redo] = useHistory([], 20);

    let newState = state;

    /**
     * Initializes the stage, by creating it, and creating the two layers
     */
    const initializeStage = () => {
        const layer = new Konva.Layer();
        const selectLayer = new Konva.Layer();
        const transformer = new Konva.Transformer();
        selectLayer.add(transformer);
        getStage().add(layer, selectLayer);

        console.log(getStage().getChildren());
    }



    /**
     * Getter for the whole stage
     * @return the stage
     */
    const getStage = () => {
        return stageRef.current;
    }

    /**
     * Getter for the layer
     * @return the first child of the stage AKA the layer
     */
    const getLayer = () => {
        return getStage().getChildren()[0];
    }

    /**
     * Getter for the elements in the layer
     * @return the children AKA all the elements
     */
    const getElements = () => {
        return getLayer().getChildren();
    }

    /**
     * Getter for the images in the layer, excluding other elements
     * @return {Konva.Image[]} the images in the layer.
     */
    const getImages = () => {
        return getElements().filter((child)=> child instanceof Konva.Image);
    }

    /**
     * Getter for elements in the layer that are groups
     * @return the groups
     */
    const getGroups = () => {
        return getElements().filter((child) => child instanceof Konva.Group);
    }

    /**
     * Getter for all elements in all groups
     * @return the elements in all groups
     */
    const getElementsInAllGroups = () => {
        const elements = [];
        getGroups().forEach((group) => {
            elements.push(group.getChildren());
        });
        return elements;
    }

    /**
     * Getter for all images in all groups
     * @return the images in all groups
     */
    const getImagesInAllGroups = () => {
        return getElementsInAllGroups().filter((child)=> child instanceof Konva.Image);

    }

    const getAllImages = () => {
        const allImages = getImages();
        allImages.concat(getImagesInAllGroups());
        return allImages;
    }

    /**
     * Makes and adds an image.
     * @param id {string} the unique identification of the image.
     * @param position {{x: number, y: number}} on the stage of the image.
     * @param filePath {string} the path to the image file.
     * @param filterValues {{}} Object that contains all the values used by filters.
     */
    const addImage = (id, position, filePath, filterValues) => {
        const imageState = {
            type: "Image",
            id: id,
            x: position.x,
            y: position.y,
            filePath: filePath,
            ...filterValues,
        };
        const url = convertFileSrc(filePath);
        Konva.Image.fromURL(url,(image) => {
            const splitFilePath = filePath.split("\\");
            image.setAttrs({
                ...imageState,
                fileName: splitFilePath[splitFilePath.length - 1],
                draggable: true,
                perfectDrawEnabled: false,
            })

            image.on('dragend', function() {
                console.log('Image dragged ended at position:', this.position());
                // You can perform actions here based on the drag end event
            });

            getLayer().add(image);
        })

        newState = [...newState, imageState];
        setState(newState);
    }



    /*
    <Transformer
        ref={trRef}
        boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
            }
            return newBox;
        }}
        resizeEnabled={false}
        rotateEnabled={!isLocked}
    />
     */

    const providerValues = {
        stageRef,
        getStage,
        getLayer,
        getElements,
        getImages,
        getElementsInAllGroups,
        getImagesInAllGroups,
        addImage,
        initializeStage,
    }

    return (
        <StageRefContext.Provider value={providerValues}>
            {children}
        </StageRefContext.Provider>
    )
}

export default StageRefContext;