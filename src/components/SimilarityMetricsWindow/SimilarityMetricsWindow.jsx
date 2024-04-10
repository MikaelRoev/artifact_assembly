import React, {createContext, useContext, useEffect, useState} from 'react';
import ElementContext from "../../contexts/ElementContext";
import "./SimilarityMetricsWindow.css"

/**
 * The context for the similarity metrics window.
 * @type {React.Context<null>}
 */
export const SimilarityMetricsWindowContext = createContext(null);

/**
 * The context provider for the similarity metrics window context.
 * @param children the children that can use the context.
 * @return {JSX.Element} the context provider.
 * @constructor
 */
export const SimilarityMetricsWindowContextProvider = ({children}) => {
    const [isSimilarityMetricsWindowOpen, setIsSimilarityMetricsWindowOpen] = useState(false);
    const {elements} = useContext(ElementContext);

    useEffect(() => {
        if (elements.length === 0) setIsSimilarityMetricsWindowOpen(false);
    }, [elements.length]);

    return (
        <SimilarityMetricsWindowContext.Provider value={{
            isSimilarityMetricsWindowOpen,
            setIsSimilarityMetricsWindowOpen
        }}>
            {children}
        </SimilarityMetricsWindowContext.Provider>
    )
}

/**
 * Component that represents a window that shows similarity metrics of the selected images.
 * @returns {JSX.Element} the similarity metrics window
 * @constructor
 */
const SimilarityMetricsWindow = () => {
    const {
        isSimilarityMetricsWindowOpen,
        setIsSimilarityMetricsWindowOpen
    } = useContext(SimilarityMetricsWindowContext);
    const {elements} = useContext(ElementContext);

    /**
     * UseEffect to make the score window draggable on creation.
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
            if (isSimilarityMetricsWindowOpen) element.querySelector('.window-top').onmousedown = dragMouseDown;

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
     * Gets the data from the images on the canvas and put it inside the score window.
     */
    useEffect(() => {

        /**
         * Adds the image data to the score window.
         */
        const appendImageData = () => {
            const scoreWindowContent = document.querySelector('.window-content');
            if (elements.length > 0) {
                scoreWindowContent.innerHTML = elements.map(data =>
                    `ID: ${data.fileName}, 
                    Width: ${data.width}, 
                    Height: ${data.height}, 
                    Position: ${data.x.toFixed(0)} 
                    ${data.y.toFixed(0)}`).join('<br>');

            } else if (elements.length === 0) {
                scoreWindowContent.innerHTML = '';
            }
        }
        if (isSimilarityMetricsWindowOpen) {
            appendImageData();
        }
    }, [isSimilarityMetricsWindowOpen, elements, elements.length]);

    /**
     * Resizes the window.
     */
    useEffect(() => {
        if (!isSimilarityMetricsWindowOpen) return;
        const resizable = document.getElementById('scoreWindow');
        let isResizing = false;
        let startX, startY, startWidth, startHeight, direction;
        let distance = 7;

        /**
         * Starts the drag event.
         * @param e {MouseEvent}
         */
        function initDrag(e) {
            // Determine if the mouse is near the edges
            const {left, right, bottom} = resizable.getBoundingClientRect();
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

        /**
         * Starts the drag event.
         * @param e {MouseEvent}
         */
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

        /**
         * When stopping the drag event.
         */
        function stopDrag() {
            isResizing = false;
            document.documentElement.removeEventListener('mousemove', doDrag, false);
            document.documentElement.removeEventListener('mouseup', stopDrag, false);
        }

        resizable.addEventListener("mousemove", function (e) {
            const boundingClientRect = resizable.getBoundingClientRect();
            resizable.style.cursor = getCursor(e, boundingClientRect, distance);
        }, false)

        resizable.addEventListener('mousedown', initDrag, false);
    }, []);

    /**
     * Get the cursor type.
     * @param e {MouseEvent} the mouse event.
     * @param boundingRect {DOMRect} the bounding rect of the window.
     * @param distance {number} the distance to the bounding rect of the activation of the drag.
     * @return {string} the cursor type.
     */
    function getCursor(e, boundingRect, distance) {
        const nearLeftEdge = Math.abs(e.clientX - boundingRect.left) < distance;
        const nearRightEdge = Math.abs(e.clientX - boundingRect.right) < distance;
        const nearBottomEdge = Math.abs(e.clientY - boundingRect.bottom) < distance;

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
        isSimilarityMetricsWindowOpen &&
        <div id="scoreWindow" className="window">
            <div className="window-top">
                <div className="window-top-left">Similarity Metrics Window</div>
                <button className="square exit" onClick={() => setIsSimilarityMetricsWindowOpen(false)}></button>
            </div>
            <div className="window-content"></div>
        </div>)
}

export default SimilarityMetricsWindow;