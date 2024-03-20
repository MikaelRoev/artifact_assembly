import {createContext, useState} from "react";

const ImageFilterContext = createContext(null);

/**
 * Provider for the image filter context that allows for getting and setting index of image to add filter to.
 * @param children the tree that can use the context.
 * @return {JSX.Element} the provider with the tree under it.
 * @constructor
 */
export const ImageFilterContextProvider = ({children}) => {
    const [filterImageIndex, setFilterImageIndex] = useState([]);

    return (
        <ImageFilterContext.Provider value={{ filterImageIndex, setFilterImageIndex }}>
            {children}
        </ImageFilterContext.Provider>
    )
}

export default ImageFilterContext;