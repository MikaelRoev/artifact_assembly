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

    const stageRef = useRef(null);

    const {isLocked} = useContext(LockedContext);

    const [state, setState, undo, redo] = useHistory([], 20);

    let newState = state;

    let initializeStage: function;

    /**
     * Getter for the whole stage.
     * @return {Konva.Stage | null} the stage.
     */
    const getStage = useCallback(() => stageRef.current, [stageRef]);

    /**
     * Getter for the select layer.
     * @return {Konva.Layer | null} the select layer in the stage or null if it could not find it.
     */
    const getSelectLayer = useCallback(() => {
        const stage = getStage();
        if (!stage) return null;
        let selectLayer = stage.findOne("#select-layer");
        if (!selectLayer) {
            initializeStage();
            selectLayer = stage.findOne("#select-layer");
        }
        return selectLayer;
    }, [getStage, initializeStage]);

    /**
     * Getter for the static layer.
     * @return {Konva.Layer | null} the static layer in the stage or null if it could not find it.
     */
    const getStaticLayer = useCallback(() => {
        const stage = getStage();
        if (!stage) return null;
        let staticLayer = stage.findOne("#static-layer");
        if (!staticLayer) {
            initializeStage();
            staticLayer = stage.findOne("#static-layer");
        }
        return staticLayer;
    }, [getStage, initializeStage]);

    /**
     * Getter for the selected elements.
     * @return {Konva.Node[]} the elements in the selected layer excluding transformers.
     */
    const getSelectedElements = useCallback(() => {
        const selectLayer = getSelectLayer();
        return selectLayer ? selectLayer.find(node => !(node instanceof Konva.Transformer)) : [];
    }, [getSelectLayer]);

    /**
     * Getter for the select transformer box.
     * @return {Konva.Transformer | null} the select transformer.
     */
    const getSelectTransformer = useCallback(() => {
        const selectLayer = getSelectLayer();
        console.log(selectLayer);
        return selectLayer ? selectLayer.findOne("#select-transformer") : null;
    }, [getSelectLayer]);

    /**
     * Getter for all the images in the stage.
     * @return {Konva.Node[]} all elements of type image under the stage in the hierarchy.
     */
    const getAllImages = useCallback(() => {
        const stage = getStage();
        return stage ? getStage().find(node => node instanceof Konva.Image) : [];
    }, [getStage]);

    /**
     * Changes the ability to rotate and drag the selected elements when isLocked changes.
     */
    useEffect(() => {
        if (!getStage()) return;
        getSelectTransformer().rotateEnabled(!isLocked);
        getSelectedElements().forEach(element => element.draggable(!isLocked));
    }, [getStage, getSelectTransformer, isLocked, getSelectedElements]);

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
    const select = useCallback((element) => {
        element.draggable(!isLocked);

        element.moveTo(getSelectLayer());

        const previousSelected = getSelectTransformer().nodes();
        getSelectTransformer().nodes([...previousSelected, element]);
    }, [getSelectLayer, getSelectTransformer, isLocked]);

    /**
     * Deselects an element.
     * @param element {Shape | Stage} the element to be deselected.
     */
    const deselect = useCallback((element) => {
        element.draggable(false);

        element.moveTo(getStaticLayer());

        const updatedNodes = getSelectTransformer().nodes().filter(node => node.id() !== element.id());
        getSelectTransformer().nodes(updatedNodes);
    }, [getSelectTransformer, getStaticLayer]);

    /**
     * Deselects all selected elements.
     */
    const deselectAll = useCallback(() => {
        getSelectedElements().forEach(function (element) {
            element.draggable(false);

            element.moveTo(getStaticLayer());
        });

        getSelectTransformer().nodes([]);
    }, [getSelectTransformer, getSelectedElements, getStaticLayer]);

    /**
     * Deselects all selected elements and selects an element.
     * @param element {Shape | Stage} the element to be selected.
     */
    const selectOnly = useCallback((element) => {
        deselectAll();
        select(element);
    }, [deselectAll, select]);

    /**
     * Checks if an element is selected.
     * @param element {Shape | Stage} the element to be checked.
     * @return {boolean} true if element is selected, false if not.
     */
    const isSelected = useCallback((element) => getSelectedElements()
            .some(selectedElement => selectedElement.id() === element.id())
        , [getSelectedElements]);

    /**
     * Deselects when the mouse left-clicks on an empty area on the canvas
     * and ctrl key is not pressed.
     * @param e{KonvaEventObject<MouseEvent>} the event.
     */
    const checkDeselect = useCallback((e) => {
        if (e.target === e.currentTarget && e.evt.button !== 2 && !ctrlPressed && !shiftPressed) {
            deselectAll();
        }
    }, [ctrlPressed, deselectAll, shiftPressed]);


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
            console.log(e.key);
            if (e.key === "Control") {
                setCtrlPressed(true);
            }
            if (e.key === "Shift") {
                setShiftPressed(true);
            }
        };

        /**
         * The select key up event handler.
         * @param e{KeyboardEvent}
         */
        const handleSelectKeyUp = (e) => {
            if (e.key === "Control") {
                setCtrlPressed(false);
            }
            if (e.key === "Shift") {
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

    /**
     * Set up and cleans up the on click functions of the images.
     */
    useEffect(() => {

        /**
         * Event handler for element clicking. This will check the selection of the element.
         * @param e {KonvaEventObject<MouseEvent>} click event.
         */
        const handleElementClick = (e) => {
            if (e.evt.button === 2) return;
            const element = e.target;
            element.moveToTop();

            console.log("control: ", ctrlPressed, "shift: ", shiftPressed)
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

        for (const image of getAllImages()) {
            console.log("in images")
            /**
             * Selects the image when clicked on
             */
            image.on("click", handleElementClick);

            /**
             * Selects the image when tapped on
             */
            image.on("tap", handleElementClick);
        }

        return () => {
            for (const image of getAllImages()) {
                image.off("click", handleElementClick);
                image.off("tap", handleElementClick);
            }
        };
    }, [ctrlPressed, deselect, getAllImages, isSelected, select, selectOnly, shiftPressed]);

    /**
     * Initializes the stage, by creating it, and creating the two layers
     */
    initializeStage = useCallback(() => {
        const staticLayer = new Konva.Layer({id: "static-layer"});
        const selectLayer = new Konva.Layer({id: "select-layer"});

        const selectTransformer = new Konva.Transformer({id: "select-transformer"});
        selectTransformer.resizeEnabled(false);
        selectTransformer.rotateEnabled(!isLocked);

        selectLayer.add(selectTransformer);
        getStage().add(staticLayer, selectLayer);
        getStage().on("mousedown", checkDeselect);
        getStage().on("touchstart", checkDeselect);
    }, [checkDeselect, getStage, isLocked]);

    const providerValues = {
        stageRef,
        getStage,
        addImage,
        getAllImages,
        getStaticLayer,
        initializeStage,
        select,
        deselectAll
    }

    return (
        <StageRefContext.Provider value={providerValues}>
            {children}
        </StageRefContext.Provider>
    )
}

export default StageRefContext;