import "./FilterWindow.css"
import React, {useContext, useEffect} from "react";
import FilterForm from "../FilterForm/FilterForm";
import ImageContext from "../../contexts/ImageContext";
import ImageFilterContext from "../../contexts/ImageFilterContext";
import WindowModalOpenContext from "../../contexts/WindowModalOpenContext";

/**
 * Component representing the window containing the filter for the images.
 * @returns {Element}
 * @constructor
 */
const FilterWindow = () => {
    const {images, setImages} = useContext(ImageContext);
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
    const thresholdMax = 300;
    const thresholdMin = 0;


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
        const newImage = images[filterImageIndex];
        if (!newImage) return;
        newImage.hue = 0;
        newImage.saturation = 0;
        newImage.value = 0;
        newImage.luminance = 0;
        newImage.contrast = 0;
        newImage.threshold = 0;
        images[filterImageIndex] = newImage;
        setImages(images);
    };

    function checkValidValue(parameter) {
        if (!images[filterImageIndex] || isNaN(images[filterImageIndex][parameter])) {
            return 0;
        } else {
            return images[filterImageIndex][parameter];
        }
    }

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
                    value={checkValidValue("hue")}
                    setValue={(hue, overwrite) => {
                        if (!images[filterImageIndex]) return;
                        images[filterImageIndex].hue = parseInt(hue);
                        setImages(images, overwrite);
                    }}
                />
                <FilterForm
                    label="Saturation"
                    min={saturationMin}
                    max={saturationMax}
                    step={0.5}
                    value={checkValidValue("saturation")}
                    setValue={(saturation, overwrite) => {
                        if (!images[filterImageIndex]) return;
                        images[filterImageIndex].saturation = parseFloat(saturation);
                        setImages(images, overwrite);
                    }}
                />
                <FilterForm
                    label="Value"
                    min={valueMin}
                    max={valueMax}
                    step={0.1}
                    value={checkValidValue("value")}
                    setValue={(value, overwrite) => {
                        if (!images[filterImageIndex]) return;
                        images[filterImageIndex].value = parseFloat(value);
                        setImages(images, overwrite);
                    }}
                />
                <FilterForm
                    label="Luminance"
                    min={luminanceMin}
                    max={luminanceMax}
                    step={0.1}
                    value={checkValidValue("luminance")}
                    setValue={(luminance, overwrite) => {
                        if (!images[filterImageIndex]) return;
                        images[filterImageIndex].luminance = parseFloat(luminance);
                        setImages(images, overwrite);
                    }}
                />
                <FilterForm
                    label="Contrast"
                    min={contrastMin}
                    max={contrastMax}
                    step={1}
                    value={checkValidValue("contrast")}
                    setValue={(contrast, overwrite) => {
                        if (!images[filterImageIndex]) return;
                        images[filterImageIndex].contrast = parseFloat(contrast);
                        setImages(images, overwrite);
                    }}
                />
                <FilterForm
                    label="Mask Threshold"
                    min={thresholdMin}
                    max={thresholdMax}
                    step={1}
                    value={checkValidValue("threshold")}
                    setValue={(threshold, overwrite) => {
                        if (!images[filterImageIndex]) return;
                        images[filterImageIndex].threshold = parseInt(threshold);
                        setImages(images, overwrite);
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