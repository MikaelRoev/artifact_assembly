import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from "react";
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
    const [ctrlPressed, setCtrlPressed] = useState(false);
    const [shiftPressed, setShiftPressed] = useState(false);

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
        getStage().on("mousedown", checkDeselect);
        getStage().on("touchstart", checkDeselect);
    }

    /**
     * Deselects when the mouse left-clicks on an empty area on the canvas
     * and ctrl key is not pressed.
     * @param e{KonvaEventObject<MouseEvent>} the event.
     */
    const checkDeselect = (e) => {
        if (e.target === e.currentTarget && e.evt.button !== 2 && !ctrlPressed && !shiftPressed) {
            deselectAll();
        }
    };

    /**
     * Getter for the whole stage
     * @return {funcition: Konva.Stage} the stage
     */
    const getStage = useCallback(() => stageRef.current, [stageRef]);

    /**
     * Getter for the layer.
     * @return {Konva.Layer} the first child of the stage AKA the layer.
     */
    const getStaticLayer = () => getStage().getChildren()[0];

    /**
     * Getter for the select layer.
     * @return the second child of the stage AKA the select layer.
     */
    const getSelectLayer = useCallback(() => getStage().getChildren()[1], [getStage]);

    /**
     * Getter for the selected elements.
     */
    const getSelectedElements = useCallback(() => getSelectLayer().getChildren()
        .filter(child => !(child instanceof Konva.Transformer)), [getSelectLayer]);

    /**
     * Getter for the select transformer box.
     */
    const getSelectTransformer = useCallback(() => getSelectLayer().getChildren()[0], [getSelectLayer]);

    /**
     * Changes the ability to rotate and drag the selected elements when isLocked changes.
     */
    useEffect(() => {
        getSelectTransformer().rotateEnabled(!isLocked);
        getSelectedElements().forEach(element => element.draggable(!isLocked));
    }, [getSelectLayer, getSelectTransformer, isLocked]);

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
            } else if (elementState.type === "Group") {

            }
        });
    }

    /**
     * Getter for the images in the layer, excluding other elements
     * @return {Konva.Image[]} the images in the layer.
     */
    const getImages = () => getElements().filter(child => child instanceof Konva.Image);

    /**
     * Getter for elements in the layer that are groups
     * @return the groups
     */
    const getGroups = () => getElements().filter(child => child instanceof Konva.Group);

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
    const getImagesInAllGroups = () => getElementsInAllGroups().filter((child) => child instanceof Konva.Image);

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
     * Event handler for element clicking. This will check the selection of the element.
     * @param e {KonvaEventObject<MouseEvent>} click event.
     */
    const handleElementClick = (e) => {
        if (e.evt.button === 2) return;
        const element = e.target;
        element.moveToTop();

        console.log("control: ", ctrlPressed, "shift: ",  shiftPressed)
        if (ctrlPressed || shiftPressed) {
            if (isSelected(element)) {
                // already selected
                deselect(element);
            } else {
                // not already selected
                select(element);
            }
        } else {
            selectOnly(element);
        }
    }

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
             * Selects the image when clicked on
             */
            image.on("click", handleElementClick);

            /**
             * Selects the image when tapped on
             */
            image.on("tap", handleElementClick);

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
            .some(selectedElement => selectedElement.id() === element.id());

    /**
     * Set up and cleans up the select key check.
     */
    useEffect(() => {
        //TODO: fix bug!!

        /**
         * The selection keys down event handler.
         * @param e{KeyboardEvent}
         */
        const handleSelectKeyDown = (e) => {
            setCtrlPressed(true);
            if (e.key === "Control") {
                console.log("control down");
                setCtrlPressed(true);
            }
            if (e.key === "Shift") {
                console.log("shift down");
                setShiftPressed(true);
            }
        };

        /**
         * The select key up event handler.
         * @param e{KeyboardEvent}
         */
        const handleSelectKeyUp = (e) => {
            if (e.key === "Control") {
                console.log("control up");
                setCtrlPressed(false);
            }
            if (e.key === "Shift") {
                console.log("shift up");
                setShiftPressed(false);
            }
        };

        document.addEventListener("keydown", handleSelectKeyDown);
        document.addEventListener("keyup", handleSelectKeyUp);

        return () => {
            document.removeEventListener("keydown", handleSelectKeyDown);
            document.removeEventListener("keyup", handleSelectKeyUp);
        };
    }, []);

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
        deselectAll,
    }

    return (
        <StageRefContext.Provider value={providerValues}>
            {children}
        </StageRefContext.Provider>
    )
}

export default StageRefContext;