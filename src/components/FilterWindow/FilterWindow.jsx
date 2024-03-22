import "./FilterWindow.css"
import React, {useContext, useEffect} from "react";
import FilterForm from "../FilterForm/FilterForm";
import ElementContext from "../../contexts/ElementContext";
import ImageFilterContext from "../../contexts/ImageFilterContext";
import WindowModalOpenContext from "../../contexts/WindowModalOpenContext";

/**
 * Component representing the window containing the filter for the images.
 * @returns {Element}
 * @constructor
 */
const FilterWindow = () => {
    const {elements, setElements} = useContext(ElementContext);
    const {filterImageIndex} = useContext(ImageFilterContext);
    const {setIsFilterWindowOpen} = useContext(WindowModalOpenContext);

    const hueMax = 180;
    const hueMin = 0;
    const saturationMax = 10;
    const saturationMin = -2;
    const valueMax = 2;
    const valueMin = -2;
    const luminanceMax = 2;
    const luminanceMin = -2;
    const contrastMax = 100;
    const contrastMin = -100;


    /**
     * UseEffect to make the filter window draggable on creation.
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
            element.querySelector('.filterWindowHeader').onmousedown = dragMouseDown;

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

        makeDraggable(document.querySelector('#filter-window'));
    }, []);


    /**
     * useEffect to prevent right-click on the filter window
     */
    useEffect(() => {
        let window = document.querySelector('#filter-window');
        if (window) {
            window.addEventListener('contextmenu', (event) => {
                event.preventDefault();
            })
        }
    }, []);

    /**
     * Function to reset the filters on an image.
     */
    const resetFilter = () => {
        const newImages = [...elements];
        newImages[filterImageIndex].hue = 0;
        newImages[filterImageIndex].saturation = 0;
        newImages[filterImageIndex].value = 0;
        newImages[filterImageIndex].luminance = 0;
        newImages[filterImageIndex].contrast = 0;
        setElements(newImages);
    };


    return (
        <div id='filter-window' className={"filterWindow"}>
            <div className={"filterWindowHeader"}>
                <div className={"filterWindowTitle"}>Filter</div>
                <button className={"square exit"} onClick={() => setIsFilterWindowOpen(false)}></button>
            </div>
            <div className={"filterWindowBody"}>
                <FilterForm
                    label="Hue"
                    min={hueMin}
                    max={hueMax}
                    step={1}
                    value={isNaN(elements[filterImageIndex].hue) ? 0 : elements[filterImageIndex].hue}
                    setValue={(hue) => {
                        const newImages = [...elements];
                        newImages[filterImageIndex].hue = hue;
                        setElements(newImages);
                    }}
                />
                <FilterForm
                    label="Saturation"
                    min={saturationMin}
                    max={saturationMax}
                    step={0.5}
                    value={isNaN(elements[filterImageIndex].saturation) ? 0 : elements[filterImageIndex].saturation}
                    setValue={(saturation) => {
                        const newImages = [...elements];
                        newImages[filterImageIndex].saturation = saturation;
                        setElements(newImages);
                    }}
                />
                <FilterForm
                    label="Value"
                    min={valueMin}
                    max={valueMax}
                    step={0.1}
                    value={isNaN(elements[filterImageIndex].value) ? 0 : elements[filterImageIndex].value}
                    setValue={(value) => {
                        const newImages = [...elements];
                        newImages[filterImageIndex].value = value;
                        setElements(newImages);
                    }}
                />
                <FilterForm
                    label="Luminance"
                    min={luminanceMin}
                    max={luminanceMax}
                    step={0.1}
                    value={isNaN(elements[filterImageIndex].luminance) ? 0 : elements[filterImageIndex].luminance}
                    setValue={(luminance) => {
                        const newImages = [...elements];
                        newImages[filterImageIndex].luminance = luminance;
                        setElements(newImages);
                    }}
                />
                <FilterForm
                    label="Contrast"
                    min={contrastMin}
                    max={contrastMax}
                    step={1}
                    value={isNaN(elements[filterImageIndex].contrast) ? 0 : elements[filterImageIndex].contrast}
                    setValue={(contrast) => {
                        const newImages = [...elements];
                        newImages[filterImageIndex].contrast = contrast;
                        setElements(newImages);
                    }}
                />
                <button
                    className={"resetAll"}
                    onClick={resetFilter}
                >Reset all</button>
            </div>
        </div>
    )
}

export default FilterWindow;