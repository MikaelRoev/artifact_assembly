import React, {createContext, useEffect, useState} from "react";
import Konva from "konva";
import {convertFileSrc} from "@tauri-apps/api/tauri";
import useHistory from "../hooks/useHistory";
import {emitter} from "../util/EventEmitter";
import {useLocation} from "react-router-dom";

/**
 * The stage reference context that allows for using the reference to konva stage in the stage area.
 * @type {React.Context<null>}
 */
const StageContext = createContext(null);

/**
 * Provider for the stage reference context that allows for using the reference to konva stage in the stage area.
 * @param children {JSX.Element} the components that can use the context.
 * @return {JSX.Element} the context provider.
 * @constructor
 */
export const StageContextProvider = ({children}) => {
    const [stage, setStage] = useState(null);

    const [historyState, setHistoryState, undoState, redoState] = useHistory([], 20);

    const [isLocked, setIsLocked] = useState(false);

    const {state} = useLocation();
    const {projectElements} = state;

    /**
     * Initializes the stage, by creating it, and creating the two layers
     */
    useEffect(function initializeStage() {
        const newStage = new Konva.Stage({
            container: "stage-area",
            width: window.innerWidth,
            height: window.innerHeight,
            draggable: true,
        });

        const staticLayer = new Konva.Layer({id: "static-layer"});
        const selectLayer = new Konva.Layer({id: "select-layer"});

        const selectTransformer = new Konva.Transformer({id: "select-transformer"});
        selectTransformer.resizeEnabled(false);

        selectLayer.add(selectTransformer);
        projectElements.forEach(element => {
            addElement(element, staticLayer);
        });
        newStage.add(staticLayer, selectLayer);
        setStage(newStage);
        
        return () => {
            newStage.destroy();
        }
    }, [addElement, projectElements]);
    
    /**
     * Getter for the whole stage.
     * @return {Konva.Stage | null} the stage.
     */
    const getStage = () => stage;

    /**
     * Getter for the select layer.
     * @return {Konva.Layer | null} the select layer in the stage or null if it could not find it.
     */
    function getSelectLayer() {
        const stage = getStage();
        if (!stage) return null;
        return stage.findOne("#select-layer");
    }

    /**
     * Getter for the static layer.
     * @return {Konva.Layer | null} the static layer in the stage or null if it could not find it.
     */
    function getStaticLayer() {
        const stage = getStage();
        if (!stage) return null;
        return stage.findOne("#static-layer");
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
        const staticLayer = getStaticLayer();
        return staticLayer ? [...getSelectedElements(), ...staticLayer.getChildren()] : [];
    }

    /**
     * Finds the index of the element in the state by id.
     * @param id {string} unique identifier of the element.
     * @return {number} the index of the element in the state.
     */
    function findIndexInState(id) {
        return historyState.findIndex((element) => element.id === id);
    }

    /**
     * Makes and add a konva image into a container.
     * @param imageProps {{
     * id: {string}
     * x: {number}
     * y: {number}
     * filePath: {string}}} needed to make the konva image.
     * @param container {Konva.Container} to add the image into.
     */
    function addImage(imageProps, container) {
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

            container.add(image);

            emitter.emit('imageMade', image);
        })
    }

    /**
     * Makes and adds multiple konva images into a container and commits to the history.
     * @param imageProps {{
     * id: {string}
     * x: {number}
     * y: {number}
     * filePath: {string}
     * }[]} is the list of values of the images that is needed to make the konva images.
     */
    function loadInImages (imageProps) {
        const staticLayer = getStaticLayer();
        imageProps.forEach(imageState => {
            addImage(imageState, staticLayer);
        })
        setHistoryState(historyState => [...historyState, ...imageProps]);
    }

    /**
     * Makes and add a konva group into a container.
     * @param groupProps {{groupElements: Object[]}} needed to make the konva group containing its children.
     * @param container {Konva.Container} to add the group into.
     */
    function addGroup(groupProps, container) {
        const group = new Konva.Group();
        groupProps.groupElements.forEach(groupElement => {
            addImage(groupElement, group);
        })
        container.add(group);
    }
    
    function addElement(elementProps, container) {
        switch (elementProps.type) {
            case "Image":
                addImage(elementProps, container);
                break;
            case "Group":
                addGroup(elementProps, container);
                break;
            default:
                break;
        }
    }

    /**
     * Sets the list of elements to be displayed on screen
     * @param elements {Object[]}
     */
    function setElements(elements) {
        setHistoryState(elements, false);
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
        historyState[index] = {
            ...historyState[index],
            ...changes
        };
        setHistoryState(historyState, overwrite);
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

        const newState = historyState.filter((elementState) => !isSelected(elementState));
        setHistoryState(newState);

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
     * Updates the stage based on the state.
     */
    useEffect(() => {
        const konvaIdSet = new Set(getAllElements().map(element => element.id()));

        getAllElements().forEach(element => {
            const stateElement = historyState.find(e => e.id === element.id());
            if (stateElement) {
                element.attrs = {
                    ...element.attrs,
                    ...stateElement,
                }
            } else {
                element.destroy();
            }
        })

        historyState.filter(element => !konvaIdSet.has(element.id)).forEach(element => {
            if (element.type === "Image") addImage(element, getStaticLayer());
            else if (element ==="Group") addGroup(element, getStaticLayer());
        })
    }, [addGroup, addImage, getAllElements, historyState]);

    function undo() {
        undoState();
    }

    function redo() {
        redoState();
    }

    const providerValues = {
        getStage,
        getStaticLayer,
        getAllElements,
        getAllImages,
        isAnyImages,
        setElements,
        loadInImages,
        addChanges,

        getSelectTransformer,
        getSelectedElements,
        getSelectedImages,
        isAnySelectedImages,
        select,
        deselect,
        deselectAll,
        selectOnly,
        isSelected,
        deleteSelected,
        groupSelected,

        state: historyState,
        undo,
        redo,
        isLocked,
        setIsLocked,
    }

    return (
        <StageContext.Provider value={providerValues}>
            {children}
        </StageContext.Provider>
    );
}

export default StageContext;