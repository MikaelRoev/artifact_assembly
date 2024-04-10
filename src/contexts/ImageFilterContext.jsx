import React, {createContext, useState} from "react";

/**
 * The image filter context that allows for getting and setting index of the image to add filter to.
 * @type {React.Context<null>}
 */
const ImageFilterContext = createContext(null);

/**
 * Provider for the image filter context that allows for getting and setting index of the image to add filter to.
 * @param children {JSX.Element} the components that can use the context.
 * @return {JSX.Element} the context provider.
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