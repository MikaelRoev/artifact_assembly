import {createContext, useState} from "react";

const LockedContext = createContext(null);

/**
 * Provider for the locked context that allows for getting and setting locking the stage.
 * @param children the three that can use the context.
 * @return {JSX.Element} the provider with the three under it.
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
