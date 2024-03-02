import React from "react";
import {useRef} from "react";
import StageArea from "../../components/StageArea/StageArea";
import NavBar from "../../components/NavBar/NavBar";
import "./Canvas.css";
import {ImageContextProvider} from "../../contexts/ImageContext";
import ScoreWindow from "../../components/ScoreWindow/ScoreWindow";
import {LockedContextProvider} from "../../contexts/LockedContext";

/**
 * Creates a project page.
 * @returns {Element}
 * @constructor
 */
const Canvas = () => {
    const stageRef = useRef(null);
    const layerRef = useRef(null);

    /**
     * Function to take the screenshot of the stage in StageArea.
     * @param number the scaling number of the screenshot. 2 for 2x height and width.
     */
    const takeScreenshot = (number) => {
        let dataURL = stageRef.current.toDataURL({pixelRatio: number/100});
        downloadURI(dataURL, "canvas.png");
    };

    /**
     * Function to download the screenshot taken.
     * @param uri URI of the image.
     * @param name Desired filename.
     */
    function downloadURI(uri, name) {
        let link = document.createElement('a');
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click()
        document.body.removeChild(link);
    }

    return (
        <ImageContextProvider>
            <LockedContextProvider>
                <div className="stage-container">
                    <NavBar takeScreenshot={takeScreenshot} layerRef={layerRef} />
                    <StageArea stageRef={stageRef} layerRef={layerRef} />
                    <ScoreWindow layerRef={layerRef}/>
                </div>
            </LockedContextProvider>
        </ImageContextProvider>
    );
};

export default Canvas;
