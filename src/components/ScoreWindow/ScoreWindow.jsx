import React, {useContext, useEffect, useRef, useState} from 'react';
import "./ScoreWindow.css"
import WindowModalOpenContext from "../../contexts/WindowModalOpenContext";
import ImageContext from "../../contexts/ImageContext";
import {makeDraggable, makeResizable} from "../WindowFunctionality";
import Histogram from "../Histogram/Histogram";
import selectedElementsIndexContext from "../../contexts/SelectedElementsIndexContext";
import {convertFileSrc} from "@tauri-apps/api/tauri";
import {getHueData} from "../ImageManupulation";


/**
 *
 * @returns {Element}
 * @constructor
 */
const ScoreWindow = ({stageRef}) => {

    const {setIsScoreWindowOpen} = useContext(WindowModalOpenContext);
    const {images} = useContext(ImageContext);
    const {selectedElementsIndex} = useContext(selectedElementsIndexContext)
    const contentRef = useRef(null);
    const [update, setUpdate] = useState(true);

    /**
     * UseEffect to make the scorewindow draggable on creation.
     * And handle hiding the window when the exit button is pressed.
     */
    useEffect(() => {
        const element = document.getElementById("scoreWindow");
        const dragFrom = element.querySelector('.window-top');
        const stage = stageRef.current;
        makeDraggable(element, dragFrom, stage);
    }, [stageRef]);

    /**
     * UseEffect for resizing the window
     */
    useEffect(() => {
        makeResizable(document.getElementById('scoreWindow'), 10, stageRef.current);
    }, [stageRef]);


    /**
     * useEffect to prevent right-click on the similarity metrics window
     */
    useEffect(() => {
        let window = document.querySelector('#scoreWindow');
        if (window) {
            window.addEventListener('contextmenu', (event) => {
                event.preventDefault();
            })
        }
    }, []);

    async function updateHistograms() {
        const imageNodes = stageRef.current.getChildren()[0].getChildren().filter((child) => child.getClassName() === 'Image')
        for (const index of selectedElementsIndex) {
            for (const imageNode of imageNodes) {
                if (images[index].id === imageNode.attrs.id) {
                    const newHues = await getHueData(imageNode.toDataURL())
                    images[index] = {
                        ...images[index],
                        hueValues: newHues,
                    }
                }
            }

        }
        setUpdate(false)
        await new Promise(resolve => setTimeout(resolve, 1));
        setUpdate(true)
    }

    return (
        <div id="scoreWindow" className="window">
            <div className="window-top">
                <div className="window-top-left">Similarity Metrics Window</div>
                <button className="square exit" onClick={() => setIsScoreWindowOpen(false)}></button>
            </div>
            <div className={"options-container"}>
                <button className={"updateButton"} onClick={updateHistograms}>⟳</button>
            </div>
            <div ref={contentRef} className="window-content">
            {images.length > 0 && update &&
                    selectedElementsIndex.map((index) => {
                        const image = images[index];
                        if (image.hueValues) {
                            const path = convertFileSrc(image.filePath)
                            return (
                                <div className={"histogram-container"} key={index}>
                                    <img src={path} alt={"For histogram"} width={100} height={"auto"} />
                                    <Histogram
                                        key={index}
                                        array={image.hueValues}
                                        widthProp={400}
                                        heightProp={300}
                                        binsProp={360}
                                        maxValue={359}
                                    />
                                </div>
                                )
                        }
                        return null;
                    })}
                {selectedElementsIndex.length === 0 &&
                    <p style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)"
                    }}>Info.<br/>Select one or more images to display their histogram</p>}
            </div>
        </div>)
}

export default ScoreWindow