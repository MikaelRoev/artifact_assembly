import React, {useContext, useEffect} from 'react';
import "./ScoreWindow.css"
import WindowModalOpenContext from "../../contexts/WindowModalOpenContext";
import ImageContext from "../../contexts/ImageContext";
import {makeDraggable, makeResizable} from "../WindowFunctionality";


/**
 * Creates a ScoreWindow element.
 * @returns {Element}
 * @constructor
 */
const ScoreWindow = ({stageRef}) => {

    const {isScoreWindowOpen, setIsScoreWindowOpen} = useContext(WindowModalOpenContext);
    const {images} = useContext(ImageContext);

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
     * UseEffect to get the data from the images on the canvas and put it inside the score window.
     */
    useEffect(() => {

        /**
         * Adds the image data to the score window.
         */
        const appendImageData = () => {
            const scoreWindowContent = document.querySelector('.window-content');
            if (images.length > 0) {
                scoreWindowContent.innerHTML = images.map(data => `ID: ${data.fileName}, Width: ${data.width}, 
                Height: ${data.height}, Position: ${data.x.toFixed(0)} ${data.y.toFixed(0)} Hue: ${data.hueValues.slice(0, 100).join('<br>')}`).join('<br>');

            } else if (images.length === 0) {
                scoreWindowContent.innerHTML = '';
            }
        }
        if (isScoreWindowOpen) {
            appendImageData();
        }
    }, [isScoreWindowOpen, images, images.length]);

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
            <div className="window-content"></div>
        </div>)
}

export default ScoreWindow