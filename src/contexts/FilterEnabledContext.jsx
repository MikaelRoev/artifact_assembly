import {createContext, useState} from "react";

/**
 * The filter context that allows for enabling or disabling the image filters.
 * @type {React.Context<null>}
 */
const FilterEnabledContext = createContext(null);

/**
 * Provider for the filter context that allows for enabling or disabling the image filters.
 * @param children {JSX.Element} the components that can use the context.
 * @return {JSX.Element} the context provider.
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
