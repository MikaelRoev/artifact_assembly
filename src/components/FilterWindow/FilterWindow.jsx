import React, {createContext, useContext, useEffect, useState} from "react";
import FilterForm from "../FilterForm/FilterForm";
import FilterToggle from "../FilterToggle/FilterToggle";
import ElementContext from "../../contexts/ElementContext";
import ImageFilterContext from "../../contexts/ImageFilterContext";
import FilterEnabledContext from "../../contexts/FilterEnabledContext";
import "./FilterWindow.css"

/**
 * The context for the filter window.
 * @type {React.Context<null>}
 */
export const FilterWindowContext = createContext(null);

/**
 * The context provider for the filter window context.
 * @param children the children that can use the context.
 * @return {JSX.Element} the context provider.
 * @constructor
 */
export const FilterWindowContextProvider = ({children}) => {
    const [isFilterWindowOpen, setIsFilterWindowOpen] = useState(false);
    const {elements} = useContext(ElementContext);

    useEffect(() => {
        if (elements.length === 0) setIsFilterWindowOpen(false);
    }, [elements.length]);

    return (
        <FilterWindowContext.Provider value={{isFilterWindowOpen, setIsFilterWindowOpen}}>
            {children}
        </FilterWindowContext.Provider>
    )
}

/**
 * Component representing the window containing the filters for an image.
 * @returns {JSX.Element} the filter window.
 * @constructor
 */
const FilterWindow = () => {
    const {elements, setElements} = useContext(ElementContext);
    const {filterImageIndex} = useContext(ImageFilterContext);
    const {isFilterWindowOpen, setIsFilterWindowOpen} = useContext(FilterWindowContext);
    const {filterEnabled, setFilterEnabled} = useContext(FilterEnabledContext);

    const hueMax = 359;
    const hueMin = 0;
    const saturationMax = 10;
    const saturationMin = -2;
    const brightnessMax = 2;
    const brightnessMin = -2;
    const contrastMax = 100;
    const contrastMin = -100;
    const thresholdMax = 350;
    const thresholdMin = 0;
    const root = document.querySelector(':root');


    /**
     * Makes the filter window draggable on creation
     * and handle hiding the window when the exit button is pressed.
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
            if (isFilterWindowOpen) element.querySelector('.filterWindowHeader').onmousedown = dragMouseDown;

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
     * On creation, adds prevent right-click on the filter window.
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
     * Sets the sliders and toggles on the filter window when changing which fragment to filter.
     */
    useEffect(() => {
        if (elements[filterImageIndex]) {
            const image = elements[filterImageIndex];
            if (image.hue !== undefined) {
                root.style.setProperty("--hue", -image.hue);
            } else {
                root.style.setProperty("--hue", 0);
            }
            if (image.saturation !== undefined) {
                root.style.setProperty("--saturation",
                    ((image.saturation - saturationMin) / (saturationMax - saturationMin)) * (100));
            } else {
                root.style.setProperty("--saturation", 16.666);
            }
            if (image.value !== undefined) { //Value is Brightness
                if (image.invert) {
                    root.style.setProperty("--brightness",
                        100 - (((image.value - brightnessMin) * 100) / (brightnessMax - brightnessMin)));
                } else {
                    root.style.setProperty("--brightness",
                        ((image.value - brightnessMin) * 100) / (brightnessMax - brightnessMin));
                }
            } else {
                root.style.setProperty("--brightness", 50);
            }
            if (image.threshold !== undefined) {
                if (image.invert) {
                    root.style.setProperty("--mask",
                        100 - (((image.threshold - thresholdMin) * 100) / (thresholdMax - thresholdMin)));
                } else {
                    root.style.setProperty("--mask",
                        ((image.threshold - thresholdMin) * 100) / (thresholdMax - thresholdMin));
                }
            } else {
                root.style.setProperty("--mask", 0)
            }
            if (!isFilterWindowOpen) return;
            document.getElementById("grayscaleToggle")
                .querySelector('input[name="toggleCheckbox"]').checked = !!image.grayscale;
            if (image.invert) {
                root.style.setProperty("--invert-first", 100);
                root.style.setProperty("--invert-last", 0);
                document.getElementById("invertToggle")
                    .querySelector('input[name="toggleCheckbox"]').checked = true;
            } else {
                root.style.setProperty("--invert-first", 0);
                root.style.setProperty("--invert-last", 100);
                document.getElementById("invertToggle")
                    .querySelector('input[name="toggleCheckbox"]').checked = false;
            }
        }

    }, [filterImageIndex]);

    /**
     * Checks if the filter image has a parameter.
     * @param parameter the parameter to be checked.
     * @return {number} returns the value of the parameter or 0 if the image do not have the parameter.
     */
    function checkValidValue(parameter) {
        if (!elements[filterImageIndex] || isNaN(elements[filterImageIndex][parameter])) {
            return 0;
        } else {
            return elements[filterImageIndex][parameter];
        }
    }

    /**
     * Resets the filters on the filter image.
     */
    const resetFilter = () => {
        const newImage = elements[filterImageIndex];
        if (!newImage) return;
        newImage.hue = 0;
        newImage.saturation = 0;
        newImage.value = 0; //Value is Brightness
        newImage.contrast = 0;
        newImage.threshold = 0;
        newImage.grayscale = false;
        newImage.invert = false;
        const checkboxes = document.querySelectorAll('input[name="toggleCheckbox"]');
        checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
        })
        root.style.setProperty("--hue", 0);
        root.style.setProperty("--saturation", 16.666);
        root.style.setProperty("--brightness", 50);
        root.style.setProperty("--contrast", 0);
        root.style.setProperty("--mask", 0)
        root.style.setProperty("--invert-first", 0);
        root.style.setProperty("--invert-last", 100);
        elements[filterImageIndex] = newImage;
        setElements(elements);
    };

    return (
        isFilterWindowOpen &&
        <div id='filter-window' className={"filterWindow"}>
            <div className={"filterWindowHeader"}>
                <div className={"filterWindowTitle"}>Filter</div>
                <button className={"square exit"} onClick={() => setIsFilterWindowOpen(false)}></button>
            </div>
            <div className={"filterWindowBody"}>
                <FilterForm
                    id={"filter-hue"}
                    label="Hue"
                    min={hueMin}
                    max={hueMax}
                    step={1}
                    value={checkValidValue("hue")}
                    setValue={(hu, overwrite) => {
                        if (!elements[filterImageIndex]) return;
                        const hue = parseInt(hu);
                        elements[filterImageIndex].hue = hue;
                        root.style.setProperty("--hue", -hue);
                        setElements(elements, overwrite);
                    }}
                />
                <FilterForm
                    id={"filter-saturation"}
                    label="Saturation"
                    min={saturationMin}
                    max={saturationMax}
                    step={0.1}
                    value={checkValidValue("saturation")}
                    setValue={(sat, overwrite) => {
                        if (!elements[filterImageIndex]) return;
                        const saturation = parseFloat(sat);
                        elements[filterImageIndex].saturation = saturation;
                        root.style.setProperty("--saturation",
                            ((saturation - saturationMin) / (saturationMax - saturationMin)) * (100));
                        setElements(elements, overwrite);
                    }}
                />
                <FilterForm
                    id={"filter-contrast"}
                    label="Contrast"
                    min={contrastMin}
                    max={contrastMax}
                    step={1}
                    value={checkValidValue("contrast")}
                    setValue={(contrast, overwrite) => {
                        if (!elements[filterImageIndex]) return;
                        elements[filterImageIndex].contrast = parseFloat(contrast);
                        setElements(elements, overwrite);
                    }}
                />
                <FilterForm
                    id={"filter-brightness"}
                    label="Brightness"
                    min={brightnessMin}
                    max={brightnessMax}
                    step={0.05}
                    value={checkValidValue("value")}
                    setValue={(bri, overwrite) => {
                        if (!elements[filterImageIndex]) return;
                        const brightness = parseFloat(bri);
                        elements[filterImageIndex].value = brightness;
                        if (elements[filterImageIndex].invert) {
                            root.style.setProperty("--brightness",
                                100 - (((brightness - brightnessMin) * 100) / (brightnessMax - brightnessMin)));
                        } else {
                            root.style.setProperty("--brightness",
                                ((brightness - brightnessMin) * 100) / (brightnessMax - brightnessMin));
                        }
                        setElements(elements, overwrite);
                    }}
                />
                <FilterForm
                    id={"filter-mask"}
                    label="Edge reduction"
                    min={thresholdMin}
                    max={thresholdMax}
                    step={1}
                    value={checkValidValue("threshold")}
                    setValue={(threshold, overwrite) => {
                        if (!elements[filterImageIndex]) return;
                        elements[filterImageIndex].threshold = parseInt(threshold);
                        if (elements[filterImageIndex].invert) {
                            root.style.setProperty("--mask",
                                100 - (((threshold - thresholdMin) * 100) / (thresholdMax - thresholdMin)));
                        } else {
                            root.style.setProperty("--mask",
                                ((threshold - thresholdMin) * 100) / (thresholdMax - thresholdMin));
                        }
                        setElements(elements, overwrite);
                    }}
                />
                <FilterToggle
                    label="Grayscale"
                    id={"grayscaleToggle"}
                    setValue={() => {
                        if (!elements[filterImageIndex]) return;
                        elements[filterImageIndex].grayscale = !elements[filterImageIndex].grayscale;
                        setElements(elements);
                    }}
                />
                <FilterToggle
                    label="Invert"
                    id={"invertToggle"}
                    setValue={() => {
                        if (!elements[filterImageIndex]) return;
                        elements[filterImageIndex].invert = !elements[filterImageIndex].invert;
                        const brightness =
                            isNaN(elements[filterImageIndex].value) ? 0 : elements[filterImageIndex].value;
                        const threshold =
                            isNaN(elements[filterImageIndex].threshold) ? 0 : elements[filterImageIndex].threshold;
                        if (elements[filterImageIndex].invert) {
                            root.style.setProperty("--invert-first", 100);
                            root.style.setProperty("--invert-last", 0);
                            root.style.setProperty("--brightness",
                                100 - (((brightness - brightnessMin) * 100) / (brightnessMax - brightnessMin)));
                            root.style.setProperty("--mask",
                                100 - (((threshold - thresholdMin) * 100) / (thresholdMax - thresholdMin)));
                        } else {
                            root.style.setProperty("--invert-first", 0);
                            root.style.setProperty("--invert-last", 100);
                            root.style.setProperty("--brightness",
                                ((brightness - brightnessMin) * 100) / (brightnessMax - brightnessMin));
                            root.style.setProperty("--mask",
                                ((threshold - thresholdMin) * 100) / (thresholdMax - thresholdMin));
                        }
                        setElements(elements);
                    }}
                />
                <div className={"bottomButtons"}>
                    <button
                        onClick={resetFilter}>
                        Reset Filters
                    </button>
                    <button
                        onClick={() => {
                            setFilterEnabled((prevFilter) => !prevFilter);
                        }}>
                        {!filterEnabled ? "Enable Filters" : "Disable Filters"}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default FilterWindow;