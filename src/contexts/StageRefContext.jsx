import React, {createContext, useCallback, useContext, useEffect, useRef} from "react";
import Konva from "konva";
import {convertFileSrc} from "@tauri-apps/api/tauri";
import useHistory from "../hooks/useHistory";
import LockedContext from "./LockedContext";

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

    const {isLocked} = useContext(LockedContext);

    const [state, setState, undo, redo] = useHistory([], 20);

    let newState = state;

    /**
     * Initializes the stage, by creating it, and creating the two layers
     */
    const initializeStage = () => {
        const layer = new Konva.Layer();
        const selectLayer = new Konva.Layer();

        const transformer = new Konva.Transformer();
        transformer.resizeEnabled(false);
        transformer.rotateEnabled(!isLocked);

        selectLayer.add(transformer);
        getStage().add(layer, selectLayer);
    }

    /**
     * Getter for the whole stage
     * @return the stage
     */
    const getStage = useCallback(() => stageRef.current, [stageRef]);

    /**
     * Getter for the layer.
     * @return the first child of the stage AKA the layer.
     */
    const getStaticLayer = () => getStage().getChildren()[0];

    /**
     * Getter for the select layer.
     * @return the second child of the stage AKA the select layer.
     */
    const getSelectLayer = useCallback(() => getStage().getChildren()[1], [getStage]);

    const getSelectTransformer = useCallback(() => getSelectLayer().getChildren()[0], [getSelectLayer]);

    /**
     * Changes the ability to rotate the selected elements when isLocked changes.
     */
    useEffect(() => {
        getSelectTransformer().rotateEnabled(!isLocked);
    }, [getSelectTransformer, isLocked]);

    /**
     * Getter for the elements in the layer.
     * @return the children AKA all the elements.
     */
    const getElements = () => getStaticLayer().getChildren();

    const setElements = (elementStates) => {
        getStaticLayer().destroyChildren();
        getSelectLayer().destroyChildren();
        elementStates.forEach((elementState) => {
            if (elementState.type === "Image") {
                addImage(elementState);
            }
            else if (elementState.type === "Group") {

            }
        });
    }

    /**
     * Getter for the images in the layer, excluding other elements
     * @return {Konva.Image[]} the images in the layer.
     */
    const getImages = () => getElements().filter((child)=> child instanceof Konva.Image);

    /**
     * Getter for elements in the layer that are groups
     * @return the groups
     */
    const getGroups = () => getElements().filter((child) => child instanceof Konva.Group);

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
    const getImagesInAllGroups = () => getElementsInAllGroups().filter((child)=> child instanceof Konva.Image);

    const getAllImages = () => {
        const allImages = getImages();
        allImages.concat(getImagesInAllGroups());
        return allImages;
    }

    /**
     * Finds the index of the element in the state by id.
     * @param id {string} unique identifier of the element.
     * @return {number} the index of the element in the state.
     */
    const findIndexInState = (id) => state.findIndex((element) => element.id === id());

    /**
     * Makes and adds a konva image.
     * @param imageState {{
     * id: {string}
     * x: {number}
     * y: {number}
     * filePath: {string}
     * }} is the state values of the image that is needed to create a konva image.
     */
    const addImage = (imageState) => {
        const filePath = imageState.filePath;
        const url = convertFileSrc(filePath);
        Konva.Image.fromURL(url,(image) => {
            const splitFilePath = filePath.split("\\");
            image.setAttrs({
                ...imageState,
                fileName: splitFilePath[splitFilePath.length - 1],
                draggable: false,
                perfectDrawEnabled: false,
            });

            /**
             * Selects the image when clicked on
             */
            image.on("click", () => {
                select(image);
            });

            /**
             * Selects the image when tapped on
             */
            image.on("tap", () => {
                select(image);
            });

            image.on("click", () => {
                select(image);
            });

            image.on("tap", () => {
                select(image);
            });

            /**
             * Saves the changes to history when move end.
             */
            image.on('dragend', (e) => {
                const index = findIndexInState(image.id());
                state[index] = {
                    ...imageState,
                    x: e.target.x(),
                    y: e.target.y(),
                };
                setState(newState);
            });

            /**
             * Saves the changes to history when rotation end.
             */
            image.on('transformend', (e) => {
                const index = findIndexInState(image.id());
                state[index] = {
                    ...imageState,
                    rotation: e.target.rotation(),
                };
                console.log(state)
                setState(state);
            });

            /**
             * Moves the image to the top (z-index)
             */
            image.on('mousedown', (e) => {
                e.target.moveToTop();
            });

            /**
             * Change to pinter cursor when hovering over the image.
             */
            image.on('mouseenter', (e) => {
                document.body.style.cursor = 'pointer';
            });

            /**
             * Change to default cursor when exiting the image.
             */
            image.on('mouseleave', (e) => {
                document.body.style.cursor = 'default';
            });

            getStaticLayer().add(image);
        });

        newState = [...newState, imageState];
        setState(newState);
    }

    /**
     * Selects an element.
     * @param element {Shape | Stage} the element to be selected.
     */
    const select = (element) => {
        //setSelectedElements([...selectedElements, element]);
        //setSelectedElementsIndex([...selectedElementsIndex, index]);

        const previousSelected = getSelectTransformer().nodes();
        getSelectTransformer().nodes([...previousSelected, element]);

        console.log("static", getStaticLayer().getChildren());
        console.log("select", getSelectLayer().getChildren());
    }

    const providerValues = {
        stageRef,
        getStage,
        getStaticLayer,
        getElements,
        setElements,
        getImages,
        getElementsInAllGroups,
        getImagesInAllGroups,
        addImage,
        initializeStage,
        select,
    }

    return (
        <StageRefContext.Provider value={providerValues}>
            {children}
        </StageRefContext.Provider>
    )
}

export default StageRefContext;