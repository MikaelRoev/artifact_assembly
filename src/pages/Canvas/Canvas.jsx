import React from "react";
import {useRef} from "react";
import StageArea from "../../components/StageArea/StageArea";
import NavBar from "../../components/NavBar/NavBar";
import "./Canvas.css";
import ScoreWindow from "../../components/ScoreWindow/ScoreWindow";
import {LockedContextProvider} from "../../contexts/LockedContext";
import {FilterContextProvider} from "../../contexts/FilterContext";
import {SelectedElementsIndexContextProvider} from "../../contexts/SelectedElementsIndexContext";
import ExportImageModal from "../../components/ExportImageModal/ExportImageModal";
import {exportCanvasAsImageDialog} from "../../components/FileHandling";

/**
 * Creates a project page.
 * @returns {Element}
 * @constructor
 */
const Canvas = () => {
    const stageRef = useRef(null);
    const layerRef = useRef(null);
    const [isDialogOpen, setDialogOpen] = useState(false);

    /**
     * Function to get the canvas as DataURL and send it to
     * @param number
     */
    function handleSave(number) {
        let image = stageRef.current.toDataURL({pixelRatio: number});
        exportCanvasAsImageDialog(image).then(setDialogOpen(false))
    }

    return (
        <FilterContextProvider>
            <SelectedElementsIndexContextProvider>
                <LockedContextProvider>
                    <div className="stage-container">
                        <NavBar setDialogOpen={setDialogOpen} />
                        <StageArea stageRef={stageRef} layerRef={layerRef} />
                        <ScoreWindow layerRef={layerRef}/>
                        {isDialogOpen && <ExportImageModal onSave={handleSave} onClose={() => setDialogOpen(false)} />}
                    </div>
                </LockedContextProvider>
            </SelectedElementsIndexContextProvider>
        </FilterContextProvider>
    );
};

export default Canvas;
