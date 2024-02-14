import React from "react";
import {useState} from "react";
import StageArea from "../../components/StageArea/StageArea";
import NavBar from "../../components/NavBar/NavBar";
import "./Canvas.css";
import GridContext from "./Context/GridContext";
import ResizeContext from "./Context/ResizeContext";
import LockContext from "./Context/LockContext";
import ImageContext from "./Context/ImageContext";

const Canvas = () => {
    const [grid, setGrid] = useState(1);
    const [resize, setResize] = useState(false);
    const [lock, setLock] = useState(false);
    const [images, setImages] = useState([]);
    const [filter, setFilter] = useState(false);
    const [saturation, setSaturation] = useState(0);
    const [hue, setHue] = useState(0);
    const [contrast, setContrast] = useState(0);
    const [luminance, setLuminance] = useState(0);
    const stageRef = useState(null)

    const providerValue = {
        grid,
        resize,
        lock,
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
        setResize,
        setGrid,
        setLock,
        setImages
    };

    /**
     * Function to take the screenshot of the stage in StageArea.
     * @param number the scaling number of the screenshot. 2 for 2x height and width.
     */
    const takeScreenshot = (number) => {
        let dataURL = stageRef.current.toDataURL({pixelRatio: number});
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
            <GridContext.Provider value={providerValue}>
                <ResizeContext.Provider value={providerValue}>
                    <LockContext.Provider value={providerValue}>
                        <div className="stage-container">
                            <NavBar takeScreenshot={takeScreenshot}/>
                            <StageArea uploadedImages={images} stageRef={stageRef}/>
                        </div>
                    </LockContext.Provider>
                </ResizeContext.Provider>
            </GridContext.Provider>
        </ImageContext.Provider>
    );
};

export default Canvas;
