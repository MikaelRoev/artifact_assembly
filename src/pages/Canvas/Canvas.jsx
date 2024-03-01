import React from "react";
import {useRef, useState} from "react";
import StageArea from "../../components/StageArea/StageArea";
import NavBar from "../../components/NavBar/NavBar";
import "./Canvas.css";
import ImageContext from "./Context/ImageContext";
import LockContext from "./Context/LockContext";
import ScoreWindow from "../../components/ScoreWindow/ScoreWindow";

/**
 * Creates a project page.
 * @returns {Element}
 * @constructor
 */
const Canvas = () => {
    const [lock, setLock] = useState(false);
    const [images, setImages] = useState([]);
    const [filter, setFilter] = useState(false);
    const [saturation, setSaturation] = useState(0);
    const [hue, setHue] = useState(0);
    const [contrast, setContrast] = useState(0);
    const [luminance, setLuminance] = useState(0);
    const stageRef = useRef(null)
    const layerRef = useRef(null)

	const providerValue = {
		images,
		filter,
		saturation,
		hue,
		contrast,
		luminance,
		setSaturation,
		setHue,
		setContrast,
		setLuminance,
		setFilter,
		setImages,
	};


    /**
     * Function to take the screenshot of the stage in StageArea.
     * @param number the scaling number of the screenshot. 2 for 2x height and width.
     */
    const takeScreenshot = (number) => {
        let dataURL = stageRef.current.toDataURL({pixelRatio: number/100});
        downloadURI(dataURL, "canvas.png");
    }

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
        <ImageContext.Provider value={providerValue}>
            <LockContext.Provider value={{lock, setLock}}>
                <div className="stage-container">
                    <NavBar takeScreenshot={takeScreenshot} layerRef={layerRef} />
                    <StageArea uploadedImages={images} stageRef={stageRef} layerRef={layerRef} />
                    <ScoreWindow layerRef={layerRef}/>
                </div>
            </LockContext.Provider>
        </ImageContext.Provider>
    );
};

export default Canvas;
