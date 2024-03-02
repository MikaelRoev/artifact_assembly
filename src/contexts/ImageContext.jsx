import {createContext, useState} from "react";

const ImageContext = createContext(null);

/**
 * Provider for the image context that allows for getting and setting images.
 * @param children the three that can use the context.
 * @return {JSX.Element} the provider with the three under it.
 * @constructor
 */
export const ImageContextProvider = ({children}) => {
    const [images, setImages] = useState([]);

    return (
        <ImageContext.Provider value={{ images, setImages }}>
            {children}
        </ImageContext.Provider>
    )
}

export default ImageContext;
