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
    const [state, setState] = useState([]);
    const [history, setHistory] = useState([initialState]);

    /**
     * Commits the current state to the history.
     */
    const commit = () => {
        const newIndex = index + 1;
        // remove the history after current state
        const newHistory = history.slice(0, newIndex);
        // add new state to the history
        newHistory.push(state);

        // Enforce the maximum number of undo steps
        if (newHistory.length > maxSteps) {
            // Remove the oldest state
            newHistory.shift();
        } else {
            // increment the index
            setIndex(newIndex);
        }
        console.log("committed: ", newHistory, index);
        setHistory(newHistory);
    }

    /**
     * Undoes the last action in the history.
     */
    const undo = () => {
        console.log(index - 1)
        if (index > 0) {
            setIndex(prevState => prevState - 1)
            setState(history[index - 1])
        }
    }

    /**
     * Redoes the last action in the history.
     */
    const redo = () => {
        if (index < history.length - 1) {
            setIndex(prevState => prevState + 1);
            setState(history[index + 1])
        }
    }

    return [state, setState, undo, redo, commit];
}



export default useHistory;