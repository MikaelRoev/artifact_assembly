import {createContext} from "react";
import useHistory from "../hooks/useHistory";

const ElementContext = createContext(null);

/**
 * Provider for the image context that allows for getting and setting images.
 * @param children the tree that can use the context.
 * @return {JSX.Element} the provider with the tree under it.
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
