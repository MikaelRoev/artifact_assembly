import {createContext, useContext, useState} from "react";

const ConfirmCloseWindowContext = createContext();

export const ConfirmCloseContextProvider = ({children}) => {
    const [isConfirmWindowOpen, setIsConfirmWindowOpen] = useState(false);

    return (
        <ConfirmCloseWindowContext.Provider value={{isConfirmWindowOpen, setIsConfirmWindowOpen}}>
            {children}
        </ConfirmCloseWindowContext.Provider>
    );
}

export const ConfirmCloseWindow = ({onSave, onDoNotSave, onCancel}) => {
    const {isConfirmWindowOpen, setIsConfirmWindowOpen} = useContext(ConfirmCloseWindowContext);

    return (
        isConfirmWindowOpen &&
        <div>
            <p>Do you want to save your changes?</p>
            <button
                onClick={() => {
                    onSave();
                    setIsConfirmWindowOpen(false);
                }}>
                Save
            </button>
            <button
                onClick={() => {
                    onDoNotSave();
                    setIsConfirmWindowOpen(false);
                }}>
                Do Not Save
            </button>
            <button
                onClick={() => {
                    onCancel();
                    setIsConfirmWindowOpen(false);
                }}>
                Cancel
            </button>
        </div>
    );
}

export default ConfirmCloseWindowContext;