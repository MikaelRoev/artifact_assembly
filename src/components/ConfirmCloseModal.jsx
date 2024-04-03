import {createContext, useContext, useState} from "react";

const ConfirmCloseModalContext = createContext(null);

export const ConfirmCloseModalContextProvider = ({children}) => {
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [onSave, setOnSave] = useState(() => () => {});
    const [onDoNotSave, setOnDoNotSave] = useState(() => () => {});
    const [onCancel, setOnCancel] = useState(() => () => {});

    const valueProp = {
        isConfirmModalOpen, setIsConfirmModalOpen,
        onSave, setOnSave,
        onDoNotSave, setOnDoNotSave,
        onCancel, setOnCancel
    }

    return (
        <ConfirmCloseModalContext.Provider value={valueProp}>
            {children}
        </ConfirmCloseModalContext.Provider>
    );
}

export const ConfirmCloseModal = () => {
    const {
        isConfirmModalOpen, setIsConfirmModalOpen,
        onSave,
        onDoNotSave,
        onCancel
    } = useContext(ConfirmCloseModalContext);

    return (
        isConfirmModalOpen &&
        <div className="exportModal">
            <p>
                Do you want to save your changes?
            </p>
            <button
                className='modalButton'
                onClick={() => {
                    console.log("save button click")
                    setIsConfirmModalOpen(false);
                    onSave();
                }}>
                Save
            </button>
            <button
                className='modalButton'
                onClick={() => {
                    onDoNotSave();
                    setIsConfirmModalOpen(false);
                }}>
                Do Not Save
            </button>
            <button
                className='modalButton'
                onClick={() => {
                    onCancel();
                    setIsConfirmModalOpen(false);
                }}>
                Cancel
            </button>
        </div>
    );
}

export default ConfirmCloseModalContext;