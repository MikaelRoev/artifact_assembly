import React, {useRef} from "react";
import StageArea from "../../components/StageArea/StageArea";
import NavBar from "../../components/NavBar/NavBar";
import SimilarityMetricsWindow, {
    SimilarityMetricsWindowContextProvider
} from "../../components/SimilarityMetricsWindow/SimilarityMetricsWindow";
import FilterWindow, {FilterWindowContextProvider} from "../../components/FilterWindow/FilterWindow";
import ExportImageModal, {ExportImageModalContextProvider} from "../../components/ExportImageModal/ExportImageModal";
import ConfirmCloseModal, {
    ConfirmCloseModalContextProvider
} from "../../components/ConfirmCloseModal/ConfirmCloseModal";
import {LockedContextProvider} from "../../contexts/LockedContext";
import {FilterEnabledContextProvider} from "../../contexts/FilterEnabledContext";
import {SelectContextProvider} from "../../contexts/SelectContext";
import {ImageFilterContextProvider} from "../../contexts/ImageFilterContext";
import "./Canvas.css";
import {FilterInteractionContextProvider} from "../../contexts/FilterInteractionContext";

/**
 * Component that represents the canvas page.
 * @returns {JSX.Element} the canvas page.
 * @constructor
 */
const Canvas = () => {
    const stageRef = useRef();
    const layerRef = useRef();

    return (
        <FilterEnabledContextProvider>
            <SelectContextProvider>
                <LockedContextProvider>
                    <ImageFilterContextProvider>
                        <ConfirmCloseModalContextProvider>
                            <ExportImageModalContextProvider>
                                <FilterWindowContextProvider>
                                    <SimilarityMetricsWindowContextProvider>
                                        <FilterInteractionContextProvider>
                                            <div className="stage-container">
                                                <NavBar stageRef={stageRef}/>
                                                <StageArea stageRef={stageRef} layerRef={layerRef}/>
                                                <SimilarityMetricsWindow/>
                                                <ExportImageModal stageRef={stageRef}/>
                                                <FilterWindow/>
                                                <ConfirmCloseModal/>
                                            </div>
                                        </FilterInteractionContextProvider>
                                    </SimilarityMetricsWindowContextProvider>
                                </FilterWindowContextProvider>
                            </ExportImageModalContextProvider>
                        </ConfirmCloseModalContextProvider>
                    </ImageFilterContextProvider>
                </LockedContextProvider>
            </SelectContextProvider>
        </FilterEnabledContextProvider>
    );
};

export default Canvas;
