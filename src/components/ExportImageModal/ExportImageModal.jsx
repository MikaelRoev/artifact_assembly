import {useState} from "react";
import "./ExportImageModal.css"

const ExportImageModal = ({onSave, onClose}) => {
    const [number, setNumber] = useState(1);

    const handleSave = () => {
        onSave(number);
        onClose();
    }

    return (
        <div className={"exportModal"} id={"exportImageDialog"}>
            <div className={"modalContent"}>
                <p>Enter a number between 1 - 10</p>
                <p>The number represents the resolution scale of the exported image</p>
                <p>1 equals a 1:1 ratio of pixels on canvas of your screen</p>
                <p>2 doubles the width and height. 3 triples the width and height. Etc...</p>
                <input
                    type={"number"}
                    value={number}
                    onChange={(e) => setNumber(parseInt(e.target.value, 10))}
                    min={"1"}
                    max={"10"}
                />
                <button onClick={onClose}>Cancel</button>
                <button onClick={handleSave}>Open save window</button>
            </div>
        </div>
    )

}

export default ExportImageModal;