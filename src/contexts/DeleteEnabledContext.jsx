import React, {createContext, useState} from "react";

/**
 * The context that allows for setting and getting if the delete elements is enabled.
 * @type {React.Context<null>}
 */
const DeleteEnabledContext = createContext(null);

/**
 * Provider for the context that allows for setting and getting if the delete elements is enabled.
 * @param children {JSX.Element} the components that can use the context.
 * @return {JSX.Element} the context provider.
 */
export const DeleteEnabledContextProvider = ({children}) => {
    const [deleteEnabled, setDeleteEnabled] = useState(true);

    return (
        <DeleteEnabledContext.Provider value={{deleteEnabled, setDeleteEnabled}}>
            {children}
        </DeleteEnabledContext.Provider>
    );
};

export default DeleteEnabledContext;