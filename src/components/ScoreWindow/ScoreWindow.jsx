import React, {useContext, useEffect} from 'react';
import "./ScoreWindow.css"
import WindowModalOpenContext from "../../contexts/WindowModalOpenContext";
import ElementContext from "../../contexts/ElementContext";


/**
 * Creates a ScoreWindow element.
 * @returns {Element}
 * @constructor
 */
const ScoreWindow = () => {

    const {isScoreWindowOpen, setIsScoreWindowOpen} = useContext(WindowModalOpenContext);
    const {images} = useContext(ElementContext);

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
    }, []);


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
                Height: ${data.height}, Position: ${data.x.toFixed(0)} ${data.y.toFixed(0)}`).join('<br>');

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
        const resizable = document.getElementById('scoreWindow');
        let isResizing = false;
        let startX, startY, startWidth, startHeight, direction;
        let distance = 7;

        function initDrag(e) {
            // Determine if the mouse is near the edges
            const { left, right, bottom } = resizable.getBoundingClientRect();
            const nearLeftEdge = Math.abs(e.clientX - left) < distance;
            const nearRightEdge = Math.abs(e.clientX - right) < distance;
            const nearBottomEdge = Math.abs(e.clientY - bottom) < distance;

            if (nearRightEdge || nearBottomEdge || nearLeftEdge) {
                startX = e.clientX;
                startY = e.clientY;
                startWidth = parseInt(document.defaultView.getComputedStyle(resizable).width, 10);
                startHeight = parseInt(document.defaultView.getComputedStyle(resizable).height, 10);
                direction = {right: nearRightEdge, left: nearLeftEdge, bottom: nearBottomEdge};
                isResizing = true;

                document.documentElement.addEventListener('mousemove', doDrag, false);
                document.documentElement.addEventListener('mouseup', stopDrag, false);
            }
        }

        function doDrag(e) {
            if (!isResizing) return;

            let newWidth = startWidth + e.clientX - startX;
            let newHeight = startHeight + e.clientY - startY;

            if (direction.right) {
                resizable.style.width = Math.max(100, newWidth) + 'px';
            }
            if (direction.bottom) {
                resizable.style.height = Math.max(100, newHeight) + 'px';
            }
            if (direction.left) {
                const newWidth = Math.max(100, startWidth - (e.clientX - startX));
                if (newWidth > 400) {
                    resizable.style.width = newWidth + 'px';
                    resizable.style.left = e.clientX + 'px';
                }
            }
        }

        function stopDrag() {
            isResizing = false;
            document.documentElement.removeEventListener('mousemove', doDrag, false);
            document.documentElement.removeEventListener('mouseup', stopDrag, false);
        }

        resizable.addEventListener("mousemove", function(e) {
            const { left, right, bottom} = resizable.getBoundingClientRect();
            resizable.style.cursor = getCursor(e, left, right, bottom, distance);
        }, false)

        resizable.addEventListener('mousedown', initDrag, false);


    }, []);

    function getCursor(e, left, right, bottom, distance) {
        const nearLeftEdge = Math.abs(e.clientX - left) < distance;
        const nearRightEdge = Math.abs(e.clientX - right) < distance;
        const nearBottomEdge = Math.abs(e.clientY - bottom) < distance;

        if (nearBottomEdge && nearLeftEdge) return 'nesw-resize';
        if (nearBottomEdge && nearRightEdge) return 'nwse-resize';
        if (nearRightEdge || nearLeftEdge) return 'ew-resize';
        if (nearBottomEdge) return 'ns-resize';
        return 'default';
    }

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