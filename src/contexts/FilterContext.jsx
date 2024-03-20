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

    return (
        <FilterContext.Provider value={{filter, setFilter}}>
            {children}
        </FilterContext.Provider>
    )
}

export default FilterContext;
