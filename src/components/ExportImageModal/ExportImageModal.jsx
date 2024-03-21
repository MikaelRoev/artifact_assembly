import {useContext, useState} from "react";
import "./ExportImageModal.css"
import WindowModalOpenContext from "../../contexts/WindowModalOpenContext";

/**
 * Dialog modal that shows up when the export image of canvas button is pressed in the file dropdown menu
 * @param onSave Function to send number up to parent when pressing save.
 * @param onClose Function for closing dialog when pressing cancel.
 * @returns {JSX.Element}
 * @constructor
 */
const ExportImageModal = ({onSave}) => {
    const [number, setNumber] = useState(1);
    const [isInfoVisible, setIsInfoVisible] = useState(false);
    const {setIsDialogOpen} = useContext(WindowModalOpenContext);

    /**
     * Function to send number to parent and close the modal.
     */
    const handleSave = () => {
        onSave(number);
        setIsDialogOpen(false);
    }

    /**
     * Function to toggle the information displayed in the modal.
     */
    const toggleInfo = () => {
        setIsInfoVisible(!isInfoVisible);
    }

    return (
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
                    <button className={"modalButton"} onClick={handleSave}>Open save window</button>
                    <button className={"modalButton"} onClick={() => setIsDialogOpen(false)}>Cancel</button>
                </div>
            </div>
        </div>
    )

}

export default ExportImageModal;