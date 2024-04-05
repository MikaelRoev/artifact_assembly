import React, {useRef, useContext} from "react";
import StageArea from "../../components/StageArea/StageArea";
import NavBar from "../../components/NavBar/NavBar";
import "./Canvas.css";
import SimilarityMetricsWindow from "../../components/SimilarityMetricsWindow/SimilarityMetricsWindow";
import {LockedContextProvider} from "../../contexts/LockedContext";
import {FilterEnabledContextProvider} from "../../contexts/FilterEnabledContext";
import {SelectedElementsIndexContextProvider} from "../../contexts/SelectedElementsIndexContext";
import ExportImageModal from "../../components/ExportImageModal/ExportImageModal";
import {exportCanvasAsImageDialog} from "../../components/FileHandling";
import FilterWindow from "../../components/FilterWindow/FilterWindow";
import {ImageFilterContextProvider} from "../../contexts/ImageFilterContext";
import WindowModalOpenContext from "../../contexts/WindowModalOpenContext";
import {
    ConfirmCloseModal,
    ConfirmCloseModalContextProvider,} from "../../components/ConfirmCloseModal";

/**
 * Creates a project page.
 * @returns {Element}
 * @constructor
 */
const Canvas = () => {
    const stageRef = useRef();
    const layerRef = useRef();
    const {isScoreWindowOpen, isDialogOpen, setIsDialogOpen, isFilterWindowOpen} = useContext(WindowModalOpenContext)

    /**
     * Function to get the canvas as DataURL and send it to
     * @param number
     */
    function handleSave(number) {
        let image = stageRef.current.toDataURL({pixelRatio: number});
        exportCanvasAsImageDialog(image)
            .then(() => setIsDialogOpen(false))
            .catch(() => setIsDialogOpen(false))
    }

    return (
        <FilterEnabledContextProvider>
            <SelectedElementsIndexContextProvider>
                <LockedContextProvider>
                    <ImageFilterContextProvider>
                        <ConfirmCloseModalContextProvider>
                            <div className="stage-container">
                                <NavBar stageRef={stageRef}/>
                                <StageArea stageRef={stageRef} layerRef={layerRef}/>
                                {isScoreWindowOpen && <SimilarityMetricsWindow/>}
                                {isDialogOpen && <ExportImageModal onSave={handleSave}/>}
                                {isFilterWindowOpen && <FilterWindow/>}
                                <ConfirmCloseModal/>
                            </div>
                        </ConfirmCloseModalContextProvider>
                    </ImageFilterContextProvider>
                </LockedContextProvider>
            </SelectedElementsIndexContextProvider>
        </FilterEnabledContextProvider>
    );
};

export default Canvas;
