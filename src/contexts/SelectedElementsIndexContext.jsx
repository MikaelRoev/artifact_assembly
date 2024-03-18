import {createContext, useState} from "react";

const SelectedElementsIndexContext = createContext(null);

/**
 * Provider for the select elements index context that allows for getting and setting selected elements indices list.
 * @param children the three that can use the context.
 * @return {JSX.Element} the provider with the three under it.
 * @constructor
 */
export const SelectedElementsIndexContextProvider = ({children}) => {
    const [selectedElementsIndex, setSelectedElementsIndex] = useState([]);

    return (
        <SelectedElementsIndexContext.Provider value={{ selectedElementsIndex, setSelectedElementsIndex }}>
            {children}
        </SelectedElementsIndexContext.Provider>
    )
}

export default SelectedElementsIndexContext;