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
import {LockedContextProvider} from "../../contexts/LockedContext";
import {FilterEnabledContextProvider} from "../../contexts/FilterEnabledContext";
import {SelectContextProvider} from "../../contexts/SelectContext";
import {DeleteEnabledContextProvider} from "../../contexts/DeleteEnabledContext";
import {StageRefContextProvider} from "../../contexts/StageRefContext";
import "./Canvas.css";

/**
 * Component that represents the canvas page.
 * @returns {JSX.Element} the canvas page.
 * @constructor
 */
const Canvas = () => {
    return (
        <StageRefContextProvider>
            <SelectContextProvider>
                <LockedContextProvider>
                    <FilterEnabledContextProvider>
                        <DeleteEnabledContextProvider>
                            <FilterWindowContextProvider>
                                <SimilarityMetricsWindowContextProvider>
                                    <ExportImageModalContextProvider>
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
                                    </ExportImageModalContextProvider>
                                </SimilarityMetricsWindowContextProvider>
                            </FilterWindowContextProvider>
                        </DeleteEnabledContextProvider>
                    </FilterEnabledContextProvider>
                </LockedContextProvider>
            </SelectContextProvider>
        </StageRefContextProvider>
    );
};

export default Canvas;
