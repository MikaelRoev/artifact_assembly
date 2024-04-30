import React, {createContext, useCallback, useEffect, useMemo, useState} from "react";
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
    const selectLayer = stage && stage.findOne("#select-layer");
    const staticLayer = stage && stage.findOne("#static-layer");
    const selectedElements = useMemo(() => selectLayer ? selectLayer.getChildren()
        .filter(node => !(node instanceof Konva.Transformer)) : [], [selectLayer]);
    const selectTransformer = stage && stage.findOne("#select-transformer");
    const selectedImages = selectLayer ? selectLayer.find(node => node instanceof Konva.Image) : [];
    const allImages = stage ? stage.find(node => node instanceof Konva.Image) : [];
    const isAnyImages = allImages.length > 0;
    const isAnySelectedImages = selectedImages.length > 0;
    const staticElements = useMemo(() => staticLayer ? staticLayer.getChildren() : [], 
        [staticLayer]);
    const allElements = useMemo(() => stage ? [...selectedElements, ...staticElements] : [], 
        [selectedElements, stage, staticElements]);

    const [historyState, setHistoryState, undoState, redoState] = useHistory([], 20);

    const [isLocked, setIsLocked] = useState(false);

    const {state} = useLocation();
    const {projectElements} = state;
    
    /**
     * Makes and add a Konva group into a container.
     * @param groupProps {{groupElements: Object[]}} needed to make the konva group containing its children.
     * @param container {Konva.Container} to add the group into.
     */
    const addGroup = useCallback((groupProps, container) => {
        const group = new Konva.Group();
        groupProps.groupElements.forEach(groupElement => {
            addImage(groupElement, group);
        })
        container.add(group);
    }, []);

    /**
     * Adds the list of elements to be displayed on screen
     * @param elements {Object[]}
     */
    const addElement = useCallback( (elementProps, container) => {
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
    }, [addGroup]);

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
        imageProps.forEach(imageState => {
            addImage(imageState, staticLayer);
        })
        setHistoryState(historyState => [...historyState, ...imageProps]);
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

        element.moveTo(selectLayer);

        const previousSelected = selectTransformer.nodes();
        selectTransformer.nodes([...previousSelected, element]);
    }

    /**
     * Deselects an element.
     * @param element {Shape | Stage} the element to be deselected.
     */
    function deselect(element) {
        element.draggable(false);

        element.moveTo(staticLayer);

        const updatedNodes = selectTransformer.nodes().filter(node => node.id() !== element.id());
        selectTransformer.nodes(updatedNodes);
    }

    /**
     * Deselects all selected elements.
     */
    function deselectAll()  {
        selectedElements.forEach(function (element) {
            element.draggable(false);

            element.moveTo(staticLayer);
        });

        selectTransformer.nodes([]);
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
        return selectedElements.some(selectedElement => selectedElement.id() === element.id());
    }

    /**
     * Delete all selected elements.
     */
    function deleteSelected() {
        selectedElements.forEach(function (element) {
            element.destroy();
        })

        const newState = historyState.filter((elementState) => !isSelected(elementState));
        setHistoryState(newState);

        selectTransformer.nodes([]);
    }

    function groupSelected() {
        console.log("group selected")

        // get selected konva images
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
        console.log("this layer should be empty: ", selectLayer)

        // destroy all selected elements
        selectedElements.forEach( element => {
            element.destroy();
        })

        console.log("transform nodes before: ", selectTransformer.nodes())

        // remove all from transformer nodes
        selectTransformer.nodes([]);
        console.log("transform halfway: ", selectTransformer.nodes())

        // select group (add to the selected layer)
        select(group);
        console.log("this layer should have a group: ", selectLayer)
        console.log("transform nodes after: ", selectTransformer.nodes())
    }

    /**
     * Updates the stage based on the state.
     */
    useEffect(() => {
        const konvaIdSet = new Set(allElements.map(element => element.id()));

        allElements.forEach(element => {
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
            if (element.type === "Image") addImage(element, staticLayer);
            else if (element ==="Group") addGroup(element, staticLayer);
        })
    }, [addGroup, allElements, staticLayer, historyState]);

    function undo() {
        undoState();
    }

    function redo() {
        redoState();
    }

    const providerValues = {
        stage,
        staticLayer,
        allElements,
        allImages,
        isAnyImages,
        setElements,
        loadInImages,
        addChanges,

        selectTransformer,
        selectedElements,
        selectedImages,
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