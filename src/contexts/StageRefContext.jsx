import React, {createContext, useContext, useRef} from "react";
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
    const stageRef = useRef(null);

    const {isLocked} = useContext(LockedContext);

    const [state, setState, undo, redo] = useHistory([], 20);

    let newState = state;

    /**
     * Getter for the whole stage.
     * @return {Konva.Stage | null} the stage.
     */
    const getStage = () => stageRef.current;

    /**
     * Getter for the select layer.
     * @return {Konva.Layer | null} the select layer in the stage or null if it could not find it.
     */
    const getSelectLayer = () => {
        const stage = getStage();
        if (!stage) return null;
        let selectLayer = stage.findOne("#select-layer");
        if (!selectLayer) {
            initializeStage();
            selectLayer = stage.findOne("#select-layer");
        }
        return selectLayer;
    }

    /**
     * Getter for the static layer.
     * @return {Konva.Layer | null} the static layer in the stage or null if it could not find it.
     */
    const getStaticLayer = () => {
        const stage = getStage();
        if (!stage) return null;
        let staticLayer = stage.findOne("#static-layer");
        if (!staticLayer) {
            initializeStage();
            staticLayer = stage.findOne("#static-layer");
        }
        return staticLayer;
    }

    /**
     * Getter for the selected elements.
     * @return {Konva.Node[]} the elements in the selected layer excluding transformers.
     */
    const getSelectedElements = () => {
        const selectLayer = getSelectLayer();
        return selectLayer ? selectLayer.getChildren().filter(node => !(node instanceof Konva.Transformer)) : [];
    }


    const getAllSelectedImages = () => {
        const selectLayer = getSelectLayer();
        return selectLayer ? selectLayer.find(node => node instanceof (Konva.Image)) : [];
    }

    /**
     * Getter for the select transformer box.
     * @return {Konva.Transformer | null} the select transformer.
     */
    const getSelectTransformer = () => {
        const selectLayer = getSelectLayer();
        return selectLayer ? selectLayer.findOne("#select-transformer") : null;
    }

    /**
     * Getter for all the images in the stage.
     * @return {Konva.Node[]} all elements of type image under the stage in the hierarchy.
     */
    const getAllImages = () => {
        //TODO: check if it returns all images including the ones inside of a group
        const stage = getStage();
        return stage ? stage.find(node => node instanceof Konva.Image) : [];
    }

    /**
     * Getter for all the elements in the stage.
     * @return {Konva.Node[]} all elements of type image under the stage in the hierarchy.
     */
    const getAllElements = () => {
        const stage = getStage();
        return stage ? [...getSelectedElements(), getStaticLayer().getChildren()] : [];
    }

    /**
     * Finds the index of the element in the state by id.
     * @param id {string} unique identifier of the element.
     * @return {number} the index of the element in the state.
     */
    const findIndexInState = (id) => state.findIndex((element) => element.id === id);

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
        Konva.Image.fromURL(url, (image) => {
            const splitFilePath = filePath.split("\\");
            image.setAttrs({
                ...imageState,
                fileName: splitFilePath[splitFilePath.length - 1],
                draggable: false,
                perfectDrawEnabled: false,
            });

            /**
             * Saves the changes to history when move end.
             */
            image.on("dragend", (e) => {
                const index = findIndexInState(image.id());
                state[index] = {
                    //TODO test if it woks
                    ...state[index],
                    x: e.target.x(),
                    y: e.target.y(),
                };
                setState(newState);
            });

            /**
             * Saves the changes to history when rotation end.
             */
            image.on("transformend", (e) => {
                const index = findIndexInState(image.id());
                state[index] = {
                    ...state[index],
                    rotation: e.target.rotation(),
                };
                setState(state);
            });

            /**
             * Moves the image to the top (z-index)
             */
            image.on("mousedown", (e) => {
                e.target.moveToTop();
            });

            /**
             * Change to pinter cursor when hovering over the image.
             */
            image.on("mouseenter", (e) => {
                document.body.style.cursor = "pointer";
            });

            /**
             * Change to default cursor when exiting the image.
             */
            image.on("mouseleave", (e) => {
                document.body.style.cursor = "default";
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
        element.draggable(!isLocked);

        element.moveTo(getSelectLayer());

        const previousSelected = getSelectTransformer().nodes();
        getSelectTransformer().nodes([...previousSelected, element]);
    }

    /**
     * Deselects an element.
     * @param element {Shape | Stage} the element to be deselected.
     */
    const deselect = (element) => {
        element.draggable(false);

        element.moveTo(getStaticLayer());

        const updatedNodes = getSelectTransformer().nodes().filter(node => node.id() !== element.id());
        getSelectTransformer().nodes(updatedNodes);
    }

    /**
     * Deselects all selected elements.
     */
    const deselectAll = () => {
        getSelectedElements().forEach(function (element) {
            element.draggable(false);

            element.moveTo(getStaticLayer());
        });

        getSelectTransformer().nodes([]);
    }

    /**
     * Deselects all selected elements and selects an element.
     * @param element {Shape | Stage} the element to be selected.
     */
    const selectOnly = (element) => {
        deselectAll();
        select(element);
    }

    /**
     * Checks if an element is selected.
     * @param element {Shape | Stage} the element to be checked.
     * @return {boolean} true if element is selected, false if not.
     */
    const isSelected = (element) => getSelectedElements()
        .some(selectedElement => selectedElement.id() === element.id())


    /**
     * Delete all selected elements.
     */
    const deleteSelected = () => {
        getSelectedElements().forEach(function (element) {
            element.destroy();
        })

        const newState = state.filter((elementState) => !isSelected(elementState));
        setState(newState);

        getSelectTransformer().nodes([]);
    }

    const groupSelected = () => {
        console.log("group selected")

        // get selected konva images
        const selectedImages = getAllSelectedImages();
        console.log("the selected images: ", selectedImages);

        // use konva group
        const group = new Konva.Group();
        console.log("empty group? ", group);

        // move images from selected layer to group
        selectedImages.forEach(image => {
            image.moveTo(group);

            image.draggable(false);
        });
        console.log("after grouping them: ", group);
        console.log("this layer should be empty: ", getSelectLayer())

        // destroy all selected elements
        getSelectedElements().forEach( element => {
            element.destroy();
        })

        console.log("transform nodes before: ", getSelectTransformer().nodes())

        // remove all from transformer nodes
        getSelectTransformer().nodes([]);
        console.log("transform halfway: ", getSelectTransformer().nodes())

        // select group (add to the selected layer)
        select(group);
        console.log("this layer should have a group: ", getSelectLayer())
        console.log("transform nodes after: ", getSelectTransformer().nodes())
    }

    /**
     * Initializes the stage, by creating it, and creating the two layers
     */
    const initializeStage = () => {
        const staticLayer = new Konva.Layer({id: "static-layer"});
        const selectLayer = new Konva.Layer({id: "select-layer"});

        const selectTransformer = new Konva.Transformer({id: "select-transformer"});
        selectTransformer.resizeEnabled(false);
        selectTransformer.rotateEnabled(!isLocked);

        selectLayer.add(selectTransformer);
        getStage().add(staticLayer, selectLayer);
    }

    const providerValues = {
        stageRef,
        getStage,
        getStaticLayer,
        getSelectTransformer,
        getSelectedElements,
        getAllElements,
        addImage,
        getAllImages,

        select,
        deselect,
        deselectAll,
        selectOnly,
        isSelected,
        deleteSelected,
        groupSelected,

        state,
        setState,
        undo,
        redo,
    }

    return (
        <StageRefContext.Provider value={providerValues}>
            {children}
        </StageRefContext.Provider>
    );
}

export default StageRefContext;