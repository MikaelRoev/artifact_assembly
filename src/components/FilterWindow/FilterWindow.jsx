import React, {createContext, useCallback, useContext, useEffect, useState} from "react";
import {makeDraggable} from "../../util/WindowFunctionality";
import FilterForm from "../FilterForm/FilterForm";
import FilterToggle from "../FilterToggle/FilterToggle";
import ElementContext from "../../contexts/ElementContext";
import SelectContext from "../../contexts/SelectContext";
import FilterEnabledContext from "../../contexts/FilterEnabledContext";
import StageRefContext from "../../contexts/StageRefContext";
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
    const {isAnyImages} = useContext(ElementContext);

    const [isFilterWindowOpen, setIsFilterWindowOpen] = useState(false);

    useEffect(() => {
        if (!isAnyImages) setIsFilterWindowOpen(false);
    }, [isAnyImages]);

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
    const {selectedImagesIndex, selectedImages, isAnySelectedImages} = useContext(SelectContext);
    const {isFilterWindowOpen, setIsFilterWindowOpen} = useContext(FilterWindowContext);
    const {filterEnabled, setFilterEnabled} = useContext(FilterEnabledContext);
    const {stageRef} = useContext(StageRefContext);

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
    const root = document.querySelector(":root");

    /**
     * Calculates the percentage representation of a value within a specified range.
     * @param value {number} The value to be normalized.
     * @param min {number} The value to be normalized.
     * @param max {number} The maximum value of the range.
     * @return {number} A percentage value representing where value falls within the range defined by min and max.
     */
    function mapToPercentage(value, min, max) {
        return ((value - min) * 100) / (max - min);
    }

    /**
     * Calculates and applies the style of the brightness slider based on invert.
     * @param brightness {number} the brightness value of the selected images.
     * @param invert {boolean} whether the selected images is inverted or not.
     */
    const updateBrightnessStyle = useCallback((brightness, invert) => {
        let valuePercent = mapToPercentage(brightness, brightnessMin, brightnessMax);
        if (invert) {
            valuePercent = 100 - valuePercent;
        }
        //Value is Brightness
        root.style.setProperty("--brightness", valuePercent);
    }, [brightnessMin, root.style]);

    /**
     * Makes the filter window draggable on creation
     * and handle hiding the window when the exit button is pressed.
     */
    useEffect(() => {
        if (!isFilterWindowOpen) return;
        const element = document.querySelector(".filterWindow");
        const dragFrom = element.querySelector(".filterWindowHeader");
        const stage = stageRef.current;
        makeDraggable(element, dragFrom, stage);
    }, [stageRef, isFilterWindowOpen]);

    /**
     * On creation, adds prevent right-click on the filter window.
     */
    useEffect(() => {
        let window = document.querySelector("#filter-window");
        if (window) {
            window.addEventListener("contextmenu", (event) => {
                event.preventDefault();
            })
        }
    }, []);

    /**
     * Gets the value of the parameter if the value is the same for all the selected images or 0 if not.
     * @param parameter {string} the name of the parameter to get the value of.
     * @return {number} the value if the value is the same for all the selected images or 0 if not.
     */
    const getValue = useCallback((parameter) => {
        if (!isAnySelectedImages) return 0;
        const firstValue = selectedImages[0][parameter];
        if (!isNaN(firstValue) && selectedImages.every(image => image[parameter] === firstValue)) return firstValue;
        return 0;
    }, [isAnySelectedImages, selectedImages]);

    /**
     * Gets true if all the selected are true else returns false.
     * @param parameter {string} the name of the parameter to get the boolean value of.
     * @return {boolean} true if all the selected are true else returns false.
     */
    const getBool = useCallback((parameter) => {
        if (!isAnySelectedImages) return false;
        return selectedImages.every(image => image[parameter]);
    }, [isAnySelectedImages, selectedImages]);

    /**
     * Sets the sliders and toggles on the filter window when changing which fragment to filter.
     */
    useEffect(() => {
        root.style.setProperty("--hue", -getValue("hue"));
        root.style.setProperty("--saturation",
            mapToPercentage(getValue("saturation"), saturationMin, saturationMax));
        updateBrightnessStyle(getValue("value"), getBool("invert"));
        if (!isAnySelectedImages || !isFilterWindowOpen) return;
        document.getElementById("grayscaleToggle")
            .querySelector('input[name="toggleCheckbox"]').checked = !!getBool("grayscale");
        if (getBool("invert")) {
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
    }, [getBool, getValue, isFilterWindowOpen, root.style, saturationMin, saturationMax, updateBrightnessStyle, isAnySelectedImages]);

    /**
     * Resets the filters on the filter image.
     */
    function resetFilter() {
        setValue("hue", 0);
        setValue("saturation", 0);
        setValue("value", 0); //Value is Brightness
        setValue("contrast", 0);
        setValue("threshold", 0);
        setBool("grayscale", false);
        setBool("invert", false);
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
    }

    /**
     * Sets the value of the parameter on all the selected images.
     * @param parameter {string} the name of the parameter to set the value of.
     * @param value {number} the new value of the parameter.
     * @param overwrite {boolean | undefined} whether it should overwrite the last state in the history
     * or as default commit a new state.
     */
    function setValue(parameter, value, overwrite = false) {
        selectedImagesIndex.forEach((index) => {
            elements[index][parameter] = value;
        });
        setElements(elements, overwrite);
    }

    /**
     * Sets the value of the parameter on all the selected images.
     * @param parameter {string} the name of the parameter to set the value of.
     * @param bool {boolean} the new value of the parameter.
     */
    function setBool(parameter, bool) {
        selectedImagesIndex.forEach((index) => {
            elements[index][parameter] = bool;
        });
        setElements(elements);
    }

    return (
        isFilterWindowOpen &&
        <div id="filter-window" className={"filterWindow"}>
            <div className={"filterWindowHeader"}>
                <div className={"filterWindowTitle"}>Filter</div>
                <button className={"square exit"} onClick={() => setIsFilterWindowOpen(false)}></button>
            </div>
            {isAnySelectedImages ?
                (<div className={"filterWindowBody"}>
                    <FilterForm
                        id={"filter-hue"}
                        label="Hue"
                        min={hueMin}
                        max={hueMax}
                        step={1}
                        value={getValue("hue")}
                        setValue={(hu, overwrite) => {
                            if (!isAnySelectedImages) return;
                            const hue = parseInt(hu);
                            setValue("hue", hue, overwrite);
                            root.style.setProperty("--hue", -hue);
                        }}
                    />
                    <FilterForm
                        id={"filter-saturation"}
                        label="Saturation"
                        min={saturationMin}
                        max={saturationMax}
                        step={0.1}
                        value={getValue("saturation")}
                        setValue={(sat, overwrite) => {
                            if (!isAnySelectedImages) return;
                            const saturation = parseFloat(sat);
                            setValue("saturation", saturation, overwrite);
                            root.style.setProperty("--saturation",
                                mapToPercentage(saturation, saturationMin, saturationMax));
                        }}
                    />
                    <FilterForm
                        id={"filter-contrast"}
                        label="Contrast"
                        min={contrastMin}
                        max={contrastMax}
                        step={1}
                        value={getValue("contrast")}
                        setValue={(contrast, overwrite) => {
                            if (!isAnySelectedImages) return;
                            setValue("contrast", parseFloat(contrast), overwrite);
                            root.style.setProperty("--contrast",
                                mapToPercentage(contrast, contrastMin, contrastMax));
                        }}
                    />
                    <FilterForm
                        id={"filter-brightness"}
                        label="Brightness"
                        min={brightnessMin}
                        max={brightnessMax}
                        step={0.05}
                        value={getValue("value")}
                        setValue={(bri, overwrite) => {
                            if (!isAnySelectedImages) return;
                            const brightness = parseFloat(bri);
                            setValue("value", brightness, overwrite);
                            updateBrightnessStyle(brightness, getBool("invert"));
                        }}
                    />
                    <FilterForm
                        id={"filter-mask"}
                        label="Edge reduction"
                        min={thresholdMin}
                        max={thresholdMax}
                        step={1}
                        value={getValue("threshold")}
                        setValue={(threshold, overwrite) => {
                            if (!isAnySelectedImages) return;
                            setValue("threshold", parseInt(threshold), overwrite);
                        }}
                    />
                    <FilterToggle
                        label="Grayscale"
                        id={"grayscaleToggle"}
                        onToggle={() => {
                            if (!isAnySelectedImages) return;
                            setBool("grayscale", !getBool("grayscale"));
                        }}
                        isChecked={getBool("grayscale")}
                    />
                    <FilterToggle
                        label="Invert"
                        id={"invertToggle"}
                        onToggle={() => {
                            if (!isAnySelectedImages) return;
                            const invert = !getBool("invert");
                            setBool("invert", invert);
                            updateBrightnessStyle(getValue("value"), invert);
                            if (invert) {
                                root.style.setProperty("--invert-first", 100);
                                root.style.setProperty("--invert-last", 0);
                            } else {
                                root.style.setProperty("--invert-first", 0);
                                root.style.setProperty("--invert-last", 100);
                            }
                        }}
                        isChecked={getBool("invert")}
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
                </div>) :
                (<div className={"filterWindowBody"}>
                    <p className={"filterWindowEmpty"}>
                        Info.<br/>Select one or more images to add filters to.
                    </p>
                </div>)
            }
        </div>
    );
}

export default FilterWindow;