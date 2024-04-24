import React, {createContext, useContext, useState} from "react";
import {exportCanvasAsImageDialog} from "../../util/FileHandling";
import StageRefContext from "../../contexts/StageRefContext";
import "./ExportImageModal.css"

/**
 * The context for the export image modal.
 * @type {React.Context<null>}
 */
export const ExportImageModalContext = createContext(null);

/**
 * The context provider for the export image modal context.
 * @param children the children that can use the context.
 * @return {JSX.Element} the context provider.
 * @constructor
 */
export const ExportImageModalContextProvider = ({children}) => {
    const [isExportImageModalOpen, setIsExportImageModalOpen] = useState(false);

    return (
        <ExportImageModalContext.Provider value={{isExportImageModalOpen, setIsExportImageModalOpen}}>
            {children}
        </ExportImageModalContext.Provider>
    )
}

/**
 * Component that is a dialog modal that will show up when the export image button is pressed in the file dropdown menu.
 * @returns {JSX.Element} the dialog modal.
 * @constructor
 */
const ExportImageModal = () => {
    const [number, setNumber] = useState(1);
    const [isInfoVisible, setIsInfoVisible] = useState(false);
    const {isExportImageModalOpen, setIsExportImageModalOpen} = useContext(ExportImageModalContext);
    const {getStage} = useContext(StageRefContext);

    /**
     * Gets the canvas as DataURL and send it to the export canvas as image dialog.
     */
    function handleSave() {
        let image = getStage().toDataURL({pixelRatio: number});
        exportCanvasAsImageDialog(image)
            .then(() => setIsExportImageModalOpen(false))
            .catch(() => setIsExportImageModalOpen(false));
        setIsExportImageModalOpen(false);
    }

    /**
     * Function to toggle the information displayed in the modal.
     */
    function toggleInfo () {
        setIsInfoVisible(!isInfoVisible);
    }

    return (
        isExportImageModalOpen &&
        <div className={"exportModal"} id={"exportImageDialog"}>
            <div className={"modalContent"}>
                <div className={"modalMainInfo"}>
                    <p className={"modalPara"}>Enter a number between 1 - 10</p>
                    <button onClick={toggleInfo} className={"infoButton"}>?</button>
                </div>
                {isInfoVisible && (
                    <div className={"modalParaDiv"}>
                        <p className={"modalPara"}>The number represents the resolution scale of the exported image</p>
                        <p className={"modalPara"}>1 equals a 1:1 ratio of pixels on the canvas of your screen</p>
                        <p className={"modalPara"}>2 doubles the width and height. 3 triples the width and height.
                            Etc...</p>
                    </div>
                )}
            </div>
            <div className={"modalBottom"}>
                <input
                    className={"modalInput"}
                    type={"number"}
                    value={number}
                    onChange={(e) => setNumber(parseInt(e.target.value, 10))}
                    min={"1"}
                    max={"10"}
                />
                <div className={"modalButtonDiv"}>
                    <button className={"modalButton"} onClick={handleSave}>Save</button>
                    <button className={"modalButton"} onClick={() => setIsExportImageModalOpen(false)}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default ExportImageModal;