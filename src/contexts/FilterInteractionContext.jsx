import React, {createContext, useState} from "react";

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
export const FilterInteractionContextProvider = ({children}) => {
    const [isFilterInteracting, setIsFilterInteracting] = useState(false);

    return (
        <FilterInteractionContext.Provider value={{isFilterInteracting, setIsFilterInteracting}}>
            {children}
        </FilterInteractionContext.Provider>
    );
};

export default FilterInteractionContext;