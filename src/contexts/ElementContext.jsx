import React, {createContext} from "react";
import useHistory from "../hooks/useHistory";

/**
 * The element context that allows for getting and setting elements.
 * @type {React.Context<null>}
 */
const ElementContext = createContext(null);

/**
 * Provider for the image context that allows for getting and setting images.
 * @param children {JSX.Element} the components that can use the context.
 * @return {JSX.Element} the context provider.
 * @constructor
 */
export const ElementContextProvider = ({children}) => {
    const [elements, setElements, undo, redo] = useHistory([], 20);

    return (
        <ElementContext.Provider value={{elements, setElements, undo, redo }}>
            {children}
        </ElementContext.Provider>
    )
}

export default ElementContext;
