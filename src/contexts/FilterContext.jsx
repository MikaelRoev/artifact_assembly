import {createContext, useState} from "react";

const FilterContext = createContext(null);

/**
 * Provider for the filter context that allows for getting and setting the image filters.
 * @param children the three that can use the context.
 * @return {JSX.Element} the provider with the three under it.
 * @constructor
 */
export const FilterContextProvider = ({children}) => {
    const [filter, setFilter] = useState(false);
    const [saturation, setSaturation] = useState(0);
    const [hue, setHue] = useState(0);
    const [contrast, setContrast] = useState(0);
    const [luminance, setLuminance] = useState(0);

    const providerValue = {
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
    };

    return (
        <FilterContext.Provider value={providerValue}>
            {children}
        </FilterContext.Provider>
    )
}

export default FilterContext;
