import {createContext, useState} from "react";

const ImageContext = createContext(null);

/**
 * Provider for the image context that allows for getting and setting images and image filters.
 * @param children the three that can use the context.
 * @return {JSX.Element} the provider with the three under it.
 * @constructor
 */
export const ImageContextProvider = ({children}) => {
    const [images, setImages] = useState([]);
    const [filter, setFilter] = useState(false);
    const [saturation, setSaturation] = useState(0);
    const [hue, setHue] = useState(0);
    const [contrast, setContrast] = useState(0);
    const [luminance, setLuminance] = useState(0);

    const providerValue = {
        images,
        filter,
        saturation,
        hue,
        contrast,
        luminance,
        setSaturation,
        setHue,
        setContrast,
        setLuminance,
        setFilter,
        setImages,
    };

    return (
        <ImageContext.Provider value={providerValue}>
            {children}
        </ImageContext.Provider>
    )
}

export default ImageContext;
