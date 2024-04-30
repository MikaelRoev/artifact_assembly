import React, {createContext, useMemo} from "react";
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

    const isAnyElements = useMemo(() => (elements.length > 0), [elements.length]);
    const images = useMemo(() => elements.filter(element => element.type === "Image"),
        [elements]);
    const isAnyImages = useMemo(() => (images.length > 0),
        [images.length]);
    //TODO: bug with similarity tool

    return (
        <ElementContext.Provider value={{elements, setElements, images, isAnyElements, isAnyImages, undo, redo }}>
            {children}
        </ElementContext.Provider>
    )
}

export default ElementContext;
