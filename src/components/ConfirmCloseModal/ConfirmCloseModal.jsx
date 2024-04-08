import "./ExportImageModal.css"
import React, {createContext, useContext, useState} from "react";

/**
 * The context for the close confirmation modal.
 * @type {React.Context<null>}
 */
const ConfirmCloseModalContext = createContext(null);

/**
 * The context provider for the close confirmation modal context.
 * @param children the children that can use the context.
 * @return {JSX.Element} the context provider.
 * @constructor
 */
export const ConfirmCloseModalContextProvider = ({children}) => {
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [onSave, setOnSave] = useState(() => () => {
    });
    const [onDoNotSave, setOnDoNotSave] = useState(() => () => {
    });
    const [onCancel, setOnCancel] = useState(() => () => {
    });

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

/**
 * Component that represents the close confirmation modal.
 * @return {JSX.Element} the modal.
 * @constructor
 */
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