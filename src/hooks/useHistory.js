import {useState} from "react";

/**
 * Hook for handling the state history, undo, and redo.
 * @param initialState - the first state in the history.
 * @param maxSteps - of undo or redo actions or max length of the history.
 * @return {[any,function(any, boolean): *,function(): *, function(): *]}
 * getter for the current state, setter for the current state, the undo function, and the redo function.
 */
const useHistory = (initialState, maxSteps) => {
    const [index, setIndex] = useState(0);
    const [history, setHistory] = useState([initialState]);

    const deepCopy = (obj) => JSON.parse(JSON.stringify(obj))


    /**
     * Updates the state.
     * @param action
     * @param overwrite
     */
    const setState = (action, overwrite = false) => {
        // get the new state ether from a function or a variable, implemented similar to useState
        const newState = typeof action === "function" ? action(deepCopy(history[index])) : action;

        if (overwrite) {
            // overwrite the current state
            const newHistory = [...history];
            newHistory[index] = newState;
            setHistory(newHistory);
        } else {
            const newIndex = index + 1;
            // remove the history after current state
            const newHistory = history.slice(0, newIndex);
            // add new state to the history
            newHistory.push(newState);

            // Enforce the maximum number of undo steps
            if (newHistory.length > maxSteps) {
                // Remove the oldest state
                newHistory.shift();
            } else {
                // increment the index
                setIndex(newIndex);
            }
            setHistory(newHistory);
        }
    }

    /**
     * Undoes the last action in the history.
     */
    const undo = () => index > 0 && setIndex(prevState => prevState - 1)

    /**
     * Redoes the last action in the history.
     */
    const redo = () => index < history.length - 1 && setIndex(prevState => prevState + 1);

    return [deepCopy(history[index]), setState, undo, redo];
}



export default useHistory;