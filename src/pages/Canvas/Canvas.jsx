import React, {useState, useRef} from "react";
import StageArea from "../../components/StageArea/StageArea";
import NavBar from "../../components/NavBar/NavBar";
import "./Canvas.css";
import ScoreWindow from "../../components/ScoreWindow/ScoreWindow";
import {LockedContextProvider} from "../../contexts/LockedContext";
import {FilterEnabledContextProvider} from "../../contexts/FilterEnabledContext";
import {SelectedElementsIndexContextProvider} from "../../contexts/SelectedElementsIndexContext";
import ExportImageModal from "../../components/ExportImageModal/ExportImageModal";
import {exportCanvasAsImageDialog} from "../../components/FileHandling";
import FilterWindow from "../../components/FilterWindow/FilterWindow";
import {ImageFilterContextProvider} from "../../contexts/ImageFilterContext";

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
    const [isFilterWindowOpen, setIsFilterWindowOpen] = useState(false);

    /**
     * Function to get the canvas as DataURL and send it to
     * @param number
     */
    function handleSave(number) {
        let image = stageRef.current.toDataURL({pixelRatio: number});
        exportCanvasAsImageDialog(image).then(() => setIsDialogOpen(false))
    }

    return (
        <FilterEnabledContextProvider>
            <SelectedElementsIndexContextProvider>
                <LockedContextProvider>
                    <ImageFilterContextProvider>
                        <div className="stage-container">
                            <NavBar setDialogOpen={setIsDialogOpen} setIsScoreWindowOpen={setIsScoreWindowOpen}/>
                            <StageArea stageRef={stageRef} layerRef={layerRef}
                                       setIsFilterWindowOpen={setIsFilterWindowOpen}/>
                            {isScoreWindowOpen &&
                                <ScoreWindow layerRef={layerRef} onClose={() => setIsScoreWindowOpen(false)}/>}
                            {isDialogOpen &&
                                <ExportImageModal onSave={handleSave} onClose={() => setIsDialogOpen(false)}/>}
                            {isFilterWindowOpen &&
                                <FilterWindow onClose={() => setIsFilterWindowOpen(false)}/>}
                        </div>
                    </ImageFilterContextProvider>
                </LockedContextProvider>
            </SelectedElementsIndexContextProvider>
        </FilterEnabledContextProvider>
    );
};

export default Canvas;
