import React, {createContext, useRef} from "react";
import {convertFileSrc} from "@tauri-apps/api/tauri";
import Konva from "konva";
import useHistory from "../hooks/useHistory";
import {Layer, Transformer} from "react-konva";
import Konva from "konva";

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
     * @return images
     */
    const getImages = () => {
        return getElements().filter((child)=> child.getClassName() === 'Image');
    }

    /**
     * Getter for elements in the layer that are groups
     * @return the groups
     */
    const getGroups = () => {
        return getElements().filter((child) => child.getClassName() === 'Group');
    }

    /**
     * Getter for all elements in all groups
     * @return the elements in all groups
     */
    const getElementsInAllGroups = () => {
        return getGroups().forEach().getChildren();
    }

    /**
     * Getter for all images in all groups
     * @return the images in all groups
     */
    const getImagesInAllGroups = () => {
        return getElementsInAllGroups().filter((child)=> child.getClassName() === 'Image');

    }

    /**
     * Initializes the stage, by creating it, and creating the two layers
     */
    const initializeStage = () => {
        const layer = new Konva.Layer();
        const selectLayer = new Konva.Layer();
        getStage().add(layer, selectLayer)
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
                draggable: false,
                perfectDrawEnabled: false,
            })

            getLayer().add(image);
        })

        newState = [...newState, imageState];
        setState(newState);
    }

    const providerValues = {
        stageRef,
        getStage,
        getLayer,
        getElements,
        getImages,
        getElementsInAllGroups,
        getImagesInAllGroups,
        addImage,
    }

    return (
        <StageRefContext.Provider value={providerValues}>
            {children}
        </StageRefContext.Provider>
    )
}

export default StageRefContext;