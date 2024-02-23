import {useRef, useState} from "react";
import StageArea from "../../components/StageArea/StageArea";
import NavBar from "../../components/NavBar/NavBar";
import "./Canvas.css";
import GridContext from "./Context/GridContext";
import ResizeContext from "./Context/ResizeContext";
import LockContext from "./Context/LockContext";
import ImageContext from "./Context/ImageContext";
import {dialog} from "@tauri-apps/api";
import imageNode from "../../components/ImageNode/ImageNode";

/**
 * Creates a project page.
 * @returns {Element}
 * @constructor
 */
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
    const stageRef = useRef(null)
    const layerRef = useRef(null)

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

    /**
     * Function to open up the score window for all the images on the canvas.
     * @returns Void
     */
    const openScoreWindow = async () => {
        const layer = layerRef.current;

        if (layer) {
            const imageNodes = layer.getChildren().filter((child) => child.getClassName() === 'Image');
            const imageData = imageNodes.map((image) => {
                return {
                    id: image.name(),
                    width: image.width().toFixed(0),
                    height: image.height().toFixed(0),
                }
            });
            const message = imageData.map(data => `ID: ${data.id}, Width: ${data.width}, Height: ${data.height}`).join('\n')
            await dialog.message(message, {
                title: "Score Window",
                type: "info"
            });
        }
    };

    return (
        <ImageContext.Provider value={providerValue}>
            <GridContext.Provider value={providerValue}>
                <ResizeContext.Provider value={providerValue}>
                    <LockContext.Provider value={providerValue}>
                        <div className="stage-container">
                            <NavBar takeScreenshot={takeScreenshot} openScoreWindow={openScoreWindow} />
                            <StageArea uploadedImages={images} stageRef={stageRef} layerRef={layerRef} />
                        </div>
                    </LockContext.Provider>
                </ResizeContext.Provider>
            </GridContext.Provider>
        </ImageContext.Provider>
    );
};

export default Canvas;
