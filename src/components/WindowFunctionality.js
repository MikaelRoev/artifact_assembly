/**
 * Function to make the score window draggable across the window.
 * @param element the score window.
 * @param dragFrom the element to click and drag from
 * @param stage the stage
 */
export function makeDraggable(element, dragFrom, stage) {
    // Initiating position variables.
    let currentPosX = 0, currentPosY = 0, previousPosX = 0, previousPosY = 0;
    // Sets onmousedown attribute to use the dragMouseDown function
    dragFrom.onmousedown = dragMouseDown;

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
        if (element.offsetTop - currentPosY < 0) {
            element.style.top = 0 + 'px';
        } else if (element.offsetTop + element.clientHeight > stage.height()) {
            element.style.top = (stage.height() - element.clientHeight) + 'px';
        } else {
            element.style.top = (element.offsetTop - currentPosY) + 'px';
        }
        if (element.offsetLeft - currentPosX < 0) {
            element.style.left = 0 + 'px';
        } else if (element.offsetLeft + element.clientWidth > stage.width()) {
            element.style.left = (stage.width() - element.clientWidth) + 'px';
        } else {
            element.style.left = (element.offsetLeft - currentPosX) + 'px';
        }
    }

    function closeDragElement() {
        // Stop moving when mouse button is released and release events
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

/**
 * Function to make an element resizable.
 * @param element element to make resizable
 * @param distance distance from the edge where the user can drag from
 * @param stage
 */
export function makeResizable(element, distance, stage) {
    const resizable = element
    let isResizing = false;
    let startX, startY, startWidth, startHeight, direction;

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

            document.documentElement.addEventListener('mousemove', function (e) {
                doDrag(e, stage)
            }, false);
            document.documentElement.addEventListener('mouseup', stopDrag, false);
        }
    }

    function doDrag(e, stage) {
        if (!isResizing) return;
        let posX, posY;
        const stageHeight = stage.height();
        const stageWidth = stage.width();

        if (e.clientX < 0) {
            posX = 0;
        } else if (e.clientX > stageWidth) {
            posX = stageWidth;
        } else {
            posX = e.clientX
        }

        if (e.clientY < 0) {
            posY = 0;
        } else if (e.clientY > stageHeight) {
            posY = stageHeight;
        } else {
            posY = e.clientY
        }

        let newWidth = startWidth + posX - startX;
        let newHeight = startHeight + posY - startY;

        if (direction.right) {
            if (newWidth > 400) {
                resizable.style.width = newWidth + 'px';
                resizable.style.left = (posX - resizable.clientWidth) + 'px'
            }
        }
        if (direction.bottom) {
            resizable.style.height = newHeight + 'px';
        }
        if (direction.left) {
            const newWidth = startWidth - (posX - startX);
            if (newWidth > 400) {
                resizable.style.width = newWidth + 'px';
                resizable.style.left = posX + 'px';
            }
        }

    }

    function getCursor(e, left, right, bottom, distance) {
        const nearLeftEdge = Math.abs(e.clientX - left) < distance;
        const nearRightEdge = Math.abs(e.clientX - right) < distance;
        const nearBottomEdge = Math.abs(e.clientY - bottom) < distance;

        if (nearBottomEdge && nearLeftEdge) return 'sw-resize';
        if (nearBottomEdge && nearRightEdge) return 'se-resize';
        if (nearRightEdge || nearLeftEdge) return 'ew-resize';
        if (nearBottomEdge) return 'ns-resize';
        return 'default';
    }

    function stopDrag() {
        isResizing = false;
        resizable.removeEventListener('mousemove', doDrag, false);
        resizable.removeEventListener('mouseup', stopDrag, false);
    }

    resizable.addEventListener("mousemove", function (e) {
        const {left, right, bottom} = resizable.getBoundingClientRect();
        resizable.style.cursor = getCursor(e, left, right, bottom, distance);
    }, false)

    resizable.addEventListener('mousedown', initDrag, false);
}
