import {createContext, useState} from "react";

const FilterEnabledContext = createContext(null);

/**
 * Provider for the filter context that allows for getting and setting the image filters.
 * @param children the tree that can use the context.
 * @return {JSX.Element} the provider with the tree under it.
 * @constructor
 */
export const FilterEnabledContextProvider = ({children}) => {
    const [filterEnabled, setFilterEnabled] = useState(true);

    return (
        <FilterEnabledContext.Provider value={{filterEnabled, setFilterEnabled}}>
            {children}
        </FilterEnabledContext.Provider>
    )
}

export default FilterEnabledContext;
