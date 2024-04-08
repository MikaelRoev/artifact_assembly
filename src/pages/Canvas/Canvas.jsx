import React, {useRef, useContext} from "react";
import StageArea from "../../components/StageArea/StageArea";
import NavBar from "../../components/NavBar/NavBar";
import SimilarityMetricsWindow from "../../components/SimilarityMetricsWindow/SimilarityMetricsWindow";
import FilterWindow from "../../components/FilterWindow/FilterWindow";
import ExportImageModal, {ExportImageModalContextProvider} from "../../components/ExportImageModal/ExportImageModal";
import ConfirmCloseModal, {
    ConfirmCloseModalContextProvider
} from "../../components/ConfirmCloseModal/ConfirmCloseModal";
import {LockedContextProvider} from "../../contexts/LockedContext";
import {FilterEnabledContextProvider} from "../../contexts/FilterEnabledContext";
import {SelectContextProvider} from "../../contexts/SelectContext";
import {ImageFilterContextProvider} from "../../contexts/ImageFilterContext";
import WindowModalOpenContext from "../../contexts/WindowModalOpenContext";
import "./Canvas.css";

/**
 * Component that represents the canvas page.
 * @returns {JSX.Element} the canvas page.
 * @constructor
 */
const Canvas = () => {
    const stageRef = useRef();
    const layerRef = useRef();
    const {isScoreWindowOpen, isFilterWindowOpen} = useContext(WindowModalOpenContext)

    return (
        <FilterEnabledContextProvider>
            <SelectContextProvider>
                <LockedContextProvider>
                    <ImageFilterContextProvider>
                        <ConfirmCloseModalContextProvider>
                            <ExportImageModalContextProvider>
                                <div className="stage-container">
                                    <NavBar stageRef={stageRef}/>
                                    <StageArea stageRef={stageRef} layerRef={layerRef}/>
                                    {isScoreWindowOpen && <SimilarityMetricsWindow/>}
                                    <ExportImageModal stageRef={stageRef}/>
                                    {isFilterWindowOpen && <FilterWindow/>}
                                    <ConfirmCloseModal/>
                                </div>
                            </ExportImageModalContextProvider>
                        </ConfirmCloseModalContextProvider>
                    </ImageFilterContextProvider>
                </LockedContextProvider>
            </SelectContextProvider>
        </FilterEnabledContextProvider>
    );
};

export default Canvas;
