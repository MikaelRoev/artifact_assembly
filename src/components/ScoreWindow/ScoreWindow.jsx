import React, {useEffect} from 'react';
import "./ScoreWindow.css"


/**
 * Creates a ScoreWindow element.
 * @param layerRef reference to the layer in the stagearea.
 * @returns {Element}
 * @constructor
 */
const ScoreWindow = ({layerRef}) => {

    /**
     * UseEffect to make the scorewindow draggable on creation.
     * And handle hiding the window when the exit button is pressed.
     */
    useEffect(() => {
        /**
         * Function to make the score window draggable across the window.
         * @param element the score window.
         */
        function makeDraggable(element) {
            // Initiating position variables.
            let currentPosX = 0, currentPosY = 0, previousPosX = 0, previousPosY = 0;
            // Sets onmousedown attribute to use the dragMouseDown function
            element.querySelector('.window-top').onmousedown = dragMouseDown;

            /**
             * Function to handle pressing the top element and moving it.
             * @param e
             */
            function dragMouseDown(e) {
                e.preventDefault();
                // Setting the previous position to the current mouse position
                previousPosX = e.clientX;
                previousPosY = e.clientY;
                // Call the close drag element function the mouse is let go.
                document.onmouseup = closeDragElement;
                // When the mouse is moved, call the element drag function.
                document.onmousemove = elementDrag;
            }

            /**
             * Function to handle dragging the element.
             * @param e
             */
            function elementDrag(e) {
                e.preventDefault();
                // Calculate the new position of the mouse using the previous position data
                currentPosX = previousPosX - e.clientX;
                currentPosY = previousPosY - e.clientY;
                // Replace the old values with the new values
                previousPosX = e.clientX;
                previousPosY = e.clientY;
                // Set the element's new position
                element.style.top = (element.offsetTop - currentPosY) + 'px';
                element.style.left = (element.offsetLeft - currentPosX) + 'px';
            }

            function closeDragElement() {
                // Stop moving when mouse button is released and release events
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }

        makeDraggable(document.querySelector('#scoreWindow'));

        document.addEventListener('click', e => {
            if (e.target.closest('.square.red')) {
                e.target.closest('.window').style.visibility = 'hidden';
            }
        });
    }, []);


    /**
     * UseEffect to get the data from the images on the canvas and put it inside the score window.
     */
    useEffect(() => {

        /**
         * Adds the image data to the score window.
         */
        const appendImageData = () => {
            const layer = layerRef.current;

            if (layer) {
                const imageNodes = layer.getChildren().filter((child) => child.getClassName() === 'Image');
                const imageData = imageNodes.map((image) => {
                    return {
                        id: image.name(), width: image.width().toFixed(0), height: image.height().toFixed(0),
                    }
                });
                const message = imageData.map(data => `ID: ${data.id}, Width: ${data.width}, Height: ${data.height}`).join('<br>');
                const scoreWindowContent = document.querySelector('.window-content');
                scoreWindowContent.innerHTML = message;
            }
        }

        /**
         * An observer that will observe when the score window is set to visible and then add the image data to the
         * score window.
         * @type {MutationObserver}
         */
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.style.visibility === 'visible') {
                        appendImageData()
                    }
                }
            })
        })
        // Setting the observer to observe the score window.
        const scoreWindow = document.querySelector('#scoreWindow');
        observer.observe(scoreWindow, {attributes: true})

    }, [layerRef]);

    return (<div id="scoreWindow" className="window">
            <div className="window-top">
                <div className="window-top-left">Similarity Metrics Window</div>
                <button className="square red"></button>
            </div>
            <div className="window-content"></div>
        </div>)
}

export default ScoreWindow