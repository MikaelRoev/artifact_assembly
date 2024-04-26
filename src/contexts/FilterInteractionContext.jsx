import React, {createContext, useContext, useState} from "react";
import FilterEnabledContext from "./FilterEnabledContext";
import Konva from "konva";

/**
 * The filer interaction context that allows for setting and getting if the filers is interacting.
 * @type {React.Context<null>}
 */
const FilterInteractionContext = createContext(null);

/**
 * Provider for the filer interaction context that allows for  setting and getting if the filers is interacting.
 * @param children {JSX.Element} the components that can use the context.
 * @return {JSX.Element} the context provider.
 * @constructor
 */
export const FilterInteractionContextProvider = ({children, imageProps}) => {
    const [isFilterInteracting, setIsFilterInteracting] = useState(false);

    const {filterEnabled} = useContext(FilterEnabledContext);

    /**
     * Handles the filters on the image.
     * @returns {Array<Filter>} an array of the filters or null.
     */
    function handleFilters() {
        if (filterEnabled === true) {
            const filters = [];
            if (
                (imageProps.hue !== undefined && imageProps.hue !== 0)
                || (imageProps.saturation !== undefined && imageProps.saturation !== 0)
                || (imageProps.value !== undefined && imageProps.value !== 0)
            ) filters.push(Konva.Filters.HSV);
            if (imageProps.contrast !== undefined && imageProps.contrast !== 0) filters.push(Konva.Filters.Contrast);
            if (imageProps.threshold !== undefined && imageProps.threshold !== 0) {
                filters.push(Konva.Filters.Mask);
            }
            if (imageProps.grayscale) filters.push(Konva.Filters.Grayscale);
            if (imageProps.invert) filters.push(Konva.Filters.Invert);
            return filters;
        } else return null;
    }

    const providerValues = {
        handleFilters,
    }

    return (
        <FilterInteractionContext.Provider value={{isFilterInteracting, setIsFilterInteracting}}>
            {children}
        </FilterInteractionContext.Provider>
    );
};

export default FilterInteractionContext;