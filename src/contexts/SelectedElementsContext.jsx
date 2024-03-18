import {createContext, useState} from "react";

const SelectedElementsContext = createContext(null);

/**
 * Provider for the select elements context that allows for getting and setting selected elements list.
 * @param children the three that can use the context.
 * @return {JSX.Element} the provider with the three under it.
 * @constructor
 */
export const SelectedElementsContextProvider = ({children}) => {
    const [selectedElements, setSelectedElements] = useState([]);

    return (
        <SelectedElementsContext.Provider value={{ selectedElements, setSelectedElements }}>
            {children}
        </SelectedElementsContext.Provider>
    )
}

export default SelectedElementsContext;