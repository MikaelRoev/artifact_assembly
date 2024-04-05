import {createContext, useState} from "react";

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
    const [selectedElements, setSelectedElements] = useState([]);

    /**
     * Selects an element.
     * @param element {Shape | Stage} the element to be selected.
     * @param index {number} the index of the element to be selected.
     */
    const select = (element, index) => {
        setSelectedElements([...selectedElements, element]);
        setSelectedElementsIndex([...selectedElementsIndex, index]);
    }

    /**
     * Deselects an element.
     * @param index {number} the index of the element to be deselected.
     */
    const deselect = (index) => {
        const indexIndex = selectedElementsIndex.indexOf(index);
        if (indexIndex === -1) return;
        selectedElements[indexIndex].draggable(false);
        const newSelected = [...selectedElements];
        newSelected.splice(indexIndex, 1);
        setSelectedElements(newSelected);

        const newSelectedIndex = [...selectedElementsIndex];
        newSelectedIndex.splice(indexIndex, 1);
        setSelectedElementsIndex(newSelectedIndex);
    }

    /**
     * Deselects all selected elements.
     */
    const deselectAll = () => {
        selectedElements.forEach((element) => element.draggable(false));
        setSelectedElements([]);
        setSelectedElementsIndex([]);
    }

    /**
     * Deselects all selected elements and selects an element.
     * @param element {Shape | Stage} the element to be selected.
     * @param index {number} the index of the element to be selected.
     */
    const selectOnly = (element, index) => {
        selectedElements.forEach((element) => element.draggable(false));
        setSelectedElements([element]);
        setSelectedElementsIndex([index]);
    }

    /**
     * Checks if an element is selected.
     * @param index {number} the index of the element to be checked.
     * @return {boolean} true if element is selected, false if not.
     */
    const isSelected = (index) => selectedElementsIndex.includes(index);

    const providerValues = {
        selectedElements,
        selectedElementsIndex,
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