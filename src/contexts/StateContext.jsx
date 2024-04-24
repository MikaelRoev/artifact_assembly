import React, {createContext} from "react";
import useHistory from "../hooks/useHistory";

/**
 * The state context that allows the getting and committing the state of the canvas to the history.
 * @type {React.Context<null>}
 */
const StateContext = createContext(null);

/**
 * Provider for the state context that allows the getting and committing the state of the canvas to the history.
 * @param children the tree that can use the state context.
 * @return {JSX.Element} the context provider.
 * @constructor
 */
export const StateContextProvider = ({children}) => {
    const [state, setState, undo, redo] = useHistory([], 20);

    return (
        <StateContext.Provider value={{
            state,
            setState,
            undo,
            redo
        }}>
            {children}
        </StateContext.Provider>
    )
}

export default StateContext;