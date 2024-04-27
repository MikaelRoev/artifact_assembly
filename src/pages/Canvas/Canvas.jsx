import React from "react";
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
import {FilterEnabledContextProvider} from "../../contexts/FilterEnabledContext";
import {FilterInteractionContextProvider} from "../../contexts/FilterInteractionContext";
import {StageContextProvider} from "../../contexts/StageContext";
import "./Canvas.css";

/**
 * Component that represents the canvas page.
 * @returns {JSX.Element} the canvas page.
 * @constructor
 */
const Canvas = () => {
    return (
        <StageContextProvider>
            <FilterEnabledContextProvider>
                <FilterInteractionContextProvider>
                    <ExportImageModalContextProvider>
                        <FilterWindowContextProvider>
                            <SimilarityMetricsWindowContextProvider>
                                <ConfirmCloseModalContextProvider>
                                    <div className="stage-container">
                                        <NavBar/>
                                        <StageArea/>
                                        <SimilarityMetricsWindow/>
                                        <ExportImageModal/>
                                        <FilterWindow/>
                                        <ConfirmCloseModal/>
                                    </div>
                                </ConfirmCloseModalContextProvider>
                            </SimilarityMetricsWindowContextProvider>
                        </FilterWindowContextProvider>
                    </ExportImageModalContextProvider>
                </FilterInteractionContextProvider>
            </FilterEnabledContextProvider>
        </StageContextProvider>
    );
};

export default Canvas;
