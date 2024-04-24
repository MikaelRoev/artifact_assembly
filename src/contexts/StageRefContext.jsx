import React, {createContext, useRef, useState} from "react";
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
    const stageRef = useRef(null);

    const [state, setState, undo, redo] = useHistory([], 20);

    const [isLocked, setIsLocked] = useState(false);

    /**
     * Getter for the whole stage.
     * @return {Konva.Stage | null} the stage.
     */
    const getStage = () => stageRef.current;

    /**
     * Getter for the select layer.
     * @return {Konva.Layer | null} the select layer in the stage or null if it could not find it.
     */
    function getSelectLayer() {
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
    function getStaticLayer() {
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
    function getSelectedElements() {
        const selectLayer = getSelectLayer();
        return selectLayer ? selectLayer.getChildren().filter(node => !(node instanceof Konva.Transformer)) : [];
    }

    /**
     * Getter for the select transformer box.
     * @return {Konva.Transformer | null} the select transformer.
     */
    function getSelectTransformer() {
        const selectLayer = getSelectLayer();
        return selectLayer ? selectLayer.findOne("#select-transformer") : null;
    }

    /**
     * Getter for all the selected images in the select layer.
     * @return {Konva.Node[]} all elements of type image under the stage in the hierarchy.
     */
    function getSelectedImages() {
        const selectLayer = getSelectLayer();
        return selectLayer ? selectLayer.find(node => node instanceof Konva.Image) : [];
    }

    /**
     * Getter for all the images in the stage.
     * @return {Konva.Node[]} all elements of type image under the stage in the hierarchy.
     */
    function getAllImages() {
        const stage = getStage();
        return stage ? stage.find(node => node instanceof Konva.Image) : [];
    }

    /**
     * Checks if there are any images on the canvas.
     * @return {boolean} true if there are any images on the stage or false if there are none.
     */
    function isAnyImages() {
        return getAllImages().length > 0;
    }

    /**
     * Checks if there are any selected images on the canvas.
     * @return {boolean} true if there are any images in the selected layer or false if there are none.
     */
    function isAnySelectedImages() {
        return getSelectedImages().length > 0;
    }

    /**
     * Getter for all the elements in the stage.
     * @return {Konva.Node[]} all elements of type image under the stage in the hierarchy.
     */
    function getAllElements() {
        const stage = getStage();
        return stage ? [...getSelectedElements(), ...getStaticLayer().getChildren()] : [];
    }

    /**
     * Finds the index of the element in the state by id.
     * @param id {string} unique identifier of the element.
     * @return {number} the index of the element in the state.
     */
    function findIndexInState(id) {
        return state.findIndex((element) => element.id === id);
    }

    /**
     * Makes a konva image.
     * @param imageProps {{
     * id: {string}
     * x: {number}
     * y: {number}
     * filePath: {string}}}
     * @param callback {function(Konva.Image)} for when the image is done loading.
     */
    function makeImage(imageProps, callback) {
        const filePath = imageProps.filePath;
        const url = convertFileSrc(filePath);

        Konva.Image.fromURL(url, (image) => {
            const splitFilePath = filePath.split("\\");
            image.setAttrs({
                ...imageProps,
                fileName: splitFilePath[splitFilePath.length - 1],
                draggable: false,
                perfectDrawEnabled: false,
            });

            /**
             * Change to pinter cursor and moves the image to the top (z-index) when hovering over the image.
             */
            image.on("mouseenter", (e) => {
                document.body.style.cursor = "pointer";
                e.target.moveToTop();
            });

            /**
             * Change to default cursor when exiting the image.
             */
            image.on("mouseleave", () => {
                document.body.style.cursor = "default";
            });

            callback(image);
        })
    }

    /**
     * Makes and adds a konva image to the static layer.
     * @param imageProps {{
     * id: {string}
     * x: {number}
     * y: {number}
     * filePath: {string}
     * }} is the state values of the image that is needed to create a konva image.
     */
    function addImage(imageProps) {
        makeImage(imageProps, (image) => getStaticLayer().add(image));
    }

    /**
     * Makes and adds a Konva group and its children
     * @param groupProps {{groupElements: Object[]}}
     */
    function addGroup(groupProps) {
        const group = new Konva.Group();
        groupProps.groupElements.forEach(groupElement => {
            makeImage(groupElement, (image) => group.add(image));
        })
        getStaticLayer()?.add(group);
    }


    /**
     * Makes and adds konva images.
     * @param imageStates {{
     * id: {string}
     * x: {number}
     * y: {number}
     * filePath: {string}
     * }[]} is the list of state values of the images that is needed to create konva images.
     */
    function addMultipleImages(imageStates) {
        const newState = [...state];
        imageStates.forEach(imageState => {
            addImage(imageState);
            newState.push(imageState);
        })
        setState(newState);
    }

    /**
     * Sets the list of elements to be displayed on screen
     * @param elements {Object[]}
     */
    function setElements(elements) {
        setState(elements, false);
        elements.forEach(element => {
            if (element.type === "Image") addImage(element);
            else if (element ==="Group") addGroup(element);
        })
    }

    /**
     * Adds the changes to be saves to the state history.
     * @param id {string} unique identifier of the state element.
     * @param changes {Object} the changes with properties.
     * @param overwrite {boolean | undefined}
     * true - overwrites the previous history commit.
     * false (default)- makes a new history commit
     */
    function addChanges(id, changes, overwrite) {
        const index = findIndexInState(id);
        state[index] = {
            ...state[index],
            ...changes
        };
        setState(state, overwrite);
    }

    /**
     * Selects an element.
     * @param element {Shape | Stage} the element to be selected.
     */
    function select(element) {
        element.draggable(!isLocked);

        element.moveTo(getSelectLayer());

        const previousSelected = getSelectTransformer().nodes();
        getSelectTransformer().nodes([...previousSelected, element]);
    }

    /**
     * Deselects an element.
     * @param element {Shape | Stage} the element to be deselected.
     */
    function deselect(element) {
        element.draggable(false);

        element.moveTo(getStaticLayer());

        const updatedNodes = getSelectTransformer().nodes().filter(node => node.id() !== element.id());
        getSelectTransformer().nodes(updatedNodes);
    }

    /**
     * Deselects all selected elements.
     */
    function deselectAll()  {
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
    function selectOnly(element) {
        deselectAll();
        select(element);
    }

    /**
     * Checks if an element is selected.
     * @param element {Shape | Stage} the element to be checked.
     * @return {boolean} true if element is selected, false if not.
     */
    function isSelected(element) {
        return getSelectedElements().some(selectedElement => selectedElement.id() === element.id());
    }


    /**
     * Delete all selected elements.
     */
    function deleteSelected() {
        getSelectedElements().forEach(function (element) {
            element.destroy();
        })

        const newState = state.filter((elementState) => !isSelected(elementState));
        setState(newState);

        getSelectTransformer().nodes([]);
    }

    function groupSelected() {
        console.log("group selected")

        // get selected konva images
        const selectedImages = getSelectedImages();
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
    function initializeStage() {
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
        getSelectedImages,
        getAllElements,
        getAllImages,
        isAnyImages,
        isAnySelectedImages,
        setElements,
        addMultipleImages,
        addChanges,

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
        isLocked,
        setIsLocked,
    }

    return (
        <StageRefContext.Provider value={providerValues}>
            {children}
        </StageRefContext.Provider>
    );
}

export default StageRefContext;