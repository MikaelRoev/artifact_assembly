import React, {useEffect} from 'react';
import "./ScoreWindow.css"


/**
 * Creates a ScoreWindow element.
 * @param layerRef reference to the layer in the stagearea.
 * @returns {Element}
 * @constructor
 */
const ScoreWindow = ({layerRef, onClose}) => {

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
            if (e.target.closest('.square.exit')) {
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

    useEffect(() => {
        const resizable = document.getElementById('scoreWindow');
        let isResizing = false;
        let startX, startY, startWidth, startHeight, direction;
        let distance = 5;

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

    return (
        <div id="scoreWindow" className="window">
            <div className="window-top">
                <div className="window-top-left">Similarity Metrics Window</div>
                <button className="square exit" onClick={onClose}></button>
            </div>
            <div className="window-content"></div>
        </div>)
}

export default ScoreWindow