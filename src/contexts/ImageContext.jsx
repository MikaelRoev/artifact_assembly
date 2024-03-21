import {createContext} from "react";
import useHistory from "../hooks/useHistory";

const ImageContext = createContext(null);

/**
 * Provider for the image context that allows for getting and setting images.
 * @param children the tree that can use the context.
 * @return {JSX.Element} the provider with the tree under it.
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
