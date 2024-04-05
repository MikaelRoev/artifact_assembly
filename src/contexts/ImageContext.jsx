import {createContext} from "react";
import useHistory from "../hooks/useHistory";

/**
 * The image context that allows for getting and setting images.
 * @type {React.Context<null>}
 */
const ImageContext = createContext(null);

/**
 * Provider for the image context that allows for getting and setting images.
 * @param children {JSX.Element} the components that can use the context.
 * @return {JSX.Element} the context provider.
 * @constructor
 */
export const ImageContextProvider = ({children}) => {
    const [images, setImages, undo, redo] = useHistory([], 20);

    return (
        <ImageContext.Provider value={{ images, setImages, undo, redo }}>
            {children}
        </ImageContext.Provider>
    )
}

export default ImageContext;
