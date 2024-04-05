import {createContext, useState} from "react";

/**
 * The select elements index context that allows for getting and setting selected elements indices list.
 * @type {React.Context<null>}
 */
const SelectedElementsIndexContext = createContext(null);

/**
 * Provider for the select elements index context that allows for getting and setting selected elements indices list.
 * @param children {JSX.Element} the components that can use the context.
 * @return {JSX.Element} the context provider.
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