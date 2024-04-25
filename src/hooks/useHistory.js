import {useMemo, useState} from "react";

/**
 * Hook for handling the state history, undo, and redo.
 * @param {Object} initialState - The first state in the history.
 * @param {number} maxSteps - Maximum number of undo or redo actions or max length of the history.
 * @returns {[Object,
 *            function((Function|Object), boolean): void,
 *            () => void,
 *            () => void]}
 * Returns an array containing:
 *  - The current state object.
 *  - A function to set the state, which takes a callback or a new state object
 *      and a boolean indicating if it should overwrite the previous commit to the history.
 *  - An undo function to revert to the previous state in history.
 *  - A redo function to move forward to the next state in history.
 */
function useHistory(initialState, maxSteps) {
    const [index, setIndex] = useState(0);
    const [history, setHistory] = useState([initialState]);

    //TODO: comment and put in util
    function deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    const currentState = useMemo(() => deepCopy(history[index]), [history, index]);

    /**
     * Updates the state.
     * @param action {Function|Object} a callback that returns a new state or a new state object
     * @param overwrite {evt: boolean}
     *  true - overwrites the previous history commit.
     *  false (default) - makes a new history commit.
     */
    function setState(action, overwrite = false) {
        // get the new state ether from a function or a variable, implemented similar to useState
        const newState = typeof action === "function" ? action(currentState) : action;

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
    function undo() {
        if (index > 0) {
            setIndex(prevState => prevState - 1)
        }
    }

    /**
     * Redoes the last action in the history.
     */
    function redo() {
        if (index < history.length - 1) {
            setIndex(prevState => prevState + 1);
        }
    }

    return [currentState, setState, undo, redo];
}

export default useHistory;