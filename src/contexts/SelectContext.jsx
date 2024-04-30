import React, {createContext, useContext, useMemo, useState} from "react";
import ElementContext from "./ElementContext";

/**
 * The select context that allows for getting selected elements and indices lists,
 * and the selection and deselection of elements.
 * @type {React.Context<null>}
 */
const SelectContext = createContext(null);

/**
 * Provider for the select context that allows for getting selected elements and indices lists,
 * and the selection and deselection of elements.
 * @param children {JSX.Element} the components that can use the context.
 * @return {JSX.Element} the context provider.
 * @constructor
 */
export const SelectContextProvider = ({children}) => {
    const [selectedElementsIndex, setSelectedElementsIndex] = useState([]);
    const [selectedKonvaElements, setSelectedKonvaElements] = useState([]);
    
    const {elements} = useContext(ElementContext);

    const selectedElements = useMemo(() => selectedElementsIndex.map(index => elements[index]),
        [elements, selectedElementsIndex]);
    const isAnySelected = useMemo(() => selectedElementsIndex.length > 0,
        [selectedElementsIndex.length]);
    const selectedImagesIndex = useMemo(() =>
        selectedElementsIndex.filter(index => elements[index].type === "Image"), [selectedElementsIndex, elements]);
    const selectedImages = useMemo(() =>
        selectedElements.filter(element => element.type === "Image"), [selectedElements]);
    const isAnySelectedImages = useMemo(() => selectedImagesIndex.length > 0,
        [selectedImagesIndex.length]);

    /**
     * Selects an element.
     * @param element {Shape | Stage} the element to be selected.
     * @param index {number} the index of the element to be selected.
     */
    function select (element, index) {
        setSelectedKonvaElements([...selectedKonvaElements, element]);
        setSelectedElementsIndex([...selectedElementsIndex, index]);
    }

    /**
     * Deselects an element.
     * @param index {number} the index of the element to be deselected.
     */
    function deselect(index) {
        const indexIndex = selectedElementsIndex.indexOf(index);
        if (indexIndex === -1) return;
        selectedKonvaElements[indexIndex].draggable(false);
        const newSelected = [...selectedKonvaElements];
        newSelected.splice(indexIndex, 1);
        setSelectedKonvaElements(newSelected);

        const newSelectedIndex = [...selectedElementsIndex];
        newSelectedIndex.splice(indexIndex, 1);
        setSelectedElementsIndex(newSelectedIndex);
    }

    /**
     * Deselects all selected elements.
     */
    function deselectAll() {
        selectedKonvaElements.forEach((element) => element.draggable(false));
        setSelectedKonvaElements([]);
        setSelectedElementsIndex([]);
    }

    /**
     * Deselects all selected elements and selects an element.
     * @param element {Shape | Stage} the element to be selected.
     * @param index {number} the index of the element to be selected.
     */
    function selectOnly(element, index) {
        selectedKonvaElements.forEach((element) => element.draggable(false));
        setSelectedKonvaElements([element]);
        setSelectedElementsIndex([index]);
    }

    /**
     * Checks if an element is selected.
     * @param index {number} the index of the element to be checked.
     * @return {boolean} true if element is selected, false if not.
     */
    const isSelected = (index) => selectedElementsIndex.includes(index);

    const providerValues = {
        selectedKonvaElements,
        selectedElementsIndex,
        selectedImagesIndex,
        selectedElements,
        selectedImages,
        isAnySelected,
        isAnySelectedImages,

        select,
        deselect,
        deselectAll,
        selectOnly,
        isSelected
    }

    return (
        <SelectContext.Provider value={providerValues}>
            {children}
        </SelectContext.Provider>
    )
}

export default SelectContext;