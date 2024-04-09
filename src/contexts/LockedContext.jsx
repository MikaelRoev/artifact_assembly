import React, {createContext, useState} from "react";

/**
 * The locked context that allows for getting and setting locking the stage.
 * @type {React.Context<null>}
 */
const LockedContext = createContext(null);

/**
 * Provider for the locked context that allows for getting and setting locking the stage.
 * @param children {JSX.Element} the components that can use the context.
 * @return {JSX.Element} the context provider.
 * @constructor
 */
export const LockedContextProvider = ({children}) => {
    const [isLocked, setIsLocked] = useState(false);

    return (
        <LockedContext.Provider value={{isLocked, setIsLocked}}>
            {children}
        </LockedContext.Provider>
    )
}

export default LockedContext;
