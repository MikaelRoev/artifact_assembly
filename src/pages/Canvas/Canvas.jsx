import React, {useState, useRef} from "react";
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
    const [isScoreWindowOpen, setIsScoreWindowOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    /**
     * Function to get the canvas as DataURL and send it to
     * @param number
     */
    function handleSave(number) {
        let image = stageRef.current.toDataURL({pixelRatio: number});
        exportCanvasAsImageDialog(image).then(setIsDialogOpen(false))
    }

    return (
        <FilterContextProvider>
            <SelectedElementsIndexContextProvider>
                <LockedContextProvider>
                    <div className="stage-container">
                        <NavBar setDialogOpen={setIsDialogOpen} setIsScoreWindowOpen={setIsScoreWindowOpen} />
                        <StageArea stageRef={stageRef} layerRef={layerRef} />
                        {isScoreWindowOpen && <ScoreWindow layerRef={layerRef} onClose={() => setIsScoreWindowOpen(false)}/>}
                        {isDialogOpen && <ExportImageModal onSave={handleSave} onClose={() => setIsDialogOpen(false)} />}
                    </div>
                </LockedContextProvider>
            </SelectedElementsIndexContextProvider>
        </FilterContextProvider>
    );
};

export default Canvas;
