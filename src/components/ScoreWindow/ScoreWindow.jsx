import React, {useContext, useEffect, useRef} from 'react';
import "./ScoreWindow.css"
import WindowModalOpenContext from "../../contexts/WindowModalOpenContext";
import ImageContext from "../../contexts/ImageContext";
import {makeDraggable, makeResizable} from "../WindowFunctionality";
import Histogram from "../Histogram/Histogram";


/**
 *
 * @returns {Element}
 * @constructor
 */
const ScoreWindow = ({stageRef}) => {

    const {setIsScoreWindowOpen} = useContext(WindowModalOpenContext);
    const {images} = useContext(ImageContext);
    const contentRef = useRef(null);

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

    return (
        <div id="scoreWindow" className="window">
            <div className="window-top">
                <div className="window-top-left">Similarity Metrics Window</div>
                <button className="square exit" onClick={() => setIsScoreWindowOpen(false)}></button>
            </div>
            <div ref={contentRef} className="window-content">
                { images.length > 0 &&
                    images.map((image, i) => {
                        const max = image.hueValues.reduce((acc, curr) => Math.max(acc, curr), -Infinity);
                        const min = image.hueValues.reduce((acc, curr) => Math.min(acc, curr), Infinity);
                        return <Histogram
                            key={i}
                            array={image.hueValues}
                            widthProp={400}
                            heightProp={300}
                            binsProp={100}
                            maxValue={max}
                            minValue={min}
                            maxTheoretical={359}
                        />
                })}
            </div>
        </div>)
}

export default ScoreWindow