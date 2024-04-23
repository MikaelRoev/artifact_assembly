import React, {createContext, useContext, useEffect, useMemo, useState} from "react";
import {makeDraggable} from "../../util/WindowFunctionality";
import FilterForm from "../FilterForm/FilterForm";
import FilterToggle from "../FilterToggle/FilterToggle";
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
    const [isFilterWindowOpen, setIsFilterWindowOpen] = useState(false);
    const {isAnyImages} = useContext(StageRefContext);

    useEffect(() => {
        if (isAnyImages) setIsFilterWindowOpen(false);
    }, [isAnyImages]);

    const provideValues = useMemo(() =>
    {
        return {isFilterWindowOpen, setIsFilterWindowOpen}
    }, [isFilterWindowOpen, setIsFilterWindowOpen]);

    return (
        <FilterWindowContext.Provider value={provideValues}>
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
    const {isFilterWindowOpen, setIsFilterWindowOpen} = useContext(FilterWindowContext);
    const {filterEnabled, setFilterEnabled} = useContext(FilterEnabledContext);
    const {getStage, getSelectedImages, isAnySelectedImages, addChanges} = useContext(StageRefContext);

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
    const mapToPercentage = (value, min, max) => {
        return ((value - min) * 100) / (max - min);
    }

    /**
     * Calculates and applies the style of the brightness slider based on invert.
     * @param brightness {number} the brightness value of the selected images.
     * @param invert {boolean} whether the selected images is inverted or not.
     */
    const updateBrightnessStyle = (brightness, invert) => {
        let valuePercent = mapToPercentage(brightness, brightnessMin, brightnessMax);
        if (invert) {
            valuePercent = 100 - valuePercent;
        }
        //Value is Brightness
        root.style.setProperty("--brightness", valuePercent);
    }

    /**
     * Makes the filter window draggable on creation
     * and handle hiding the window when the exit button is pressed.
     */
    useEffect(() => {
        if (!isFilterWindowOpen) return;
        const element = document.querySelector(".filterWindow");
        const dragFrom = element.querySelector(".filterWindowHeader");
        makeDraggable(element, dragFrom, getStage());
    }, [getStage, isFilterWindowOpen]);

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
     * Sets the sliders and toggles on the filter window when changing which fragment to filter.
     */
    useEffect(() => {
        root.style.setProperty("--hue", -getValue("hue"));
        root.style.setProperty("--saturation",
            mapToPercentage(getValue("saturation"), saturationMin, saturationMax));
        updateBrightnessStyle(getValue("value"), getBool("invert"));
        if (isAnySelectedImages()) {
            if (!isFilterWindowOpen) return;
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
        }
    }, [getSelectedImages]);

    /**
     * Resets the filters on the filter image.
     */
    const resetFilter = () => {
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
    };

    /**
     * Gets the value of the parameter if the value is the same for all the selected images or 0 if not.
     * @param parameter {string} the name of the parameter to get the value of.
     * @return {number} the value if the value is the same for all the selected images or 0 if not.
     */
    const getValue = (parameter) => {
        const selectedImages = getSelectedImages();
        if (!isAnySelectedImages()) return 0;
        const firstValue = selectedImages[0].attrs[parameter];
        if (!isNaN(firstValue) && selectedImages.every(image => image.attrs[parameter] === firstValue)) return firstValue;
        return 0;
    }

    /**
     * Sets the value of the parameter on all the selected images.
     * @param parameter {string} the name of the parameter to set the value of.
     * @param value {number} the new value of the parameter.
     * @param overwriteFirst {boolean | undefined} whether it should overwrite the last state in the history
     * or as default commit a new state.
     */
    const setValue = (parameter, value, overwriteFirst = false) => {
        let isFirst = true;
        getSelectedImages().forEach(image => {
            image.attrs[parameter] = value;
            const change = {};
            change[parameter] = value;
            if (isFirst) {
                addChanges(image.id(), change, overwriteFirst);
                isFirst = false;
            } else {
                addChanges(image.id(), change, true);
            }
        });
    }

    /**
     * Gets true if all the selected are true else returns false.
     * @param parameter {string} the name of the parameter to get the boolean value of.
     * @return {boolean} true if all the selected are true else returns false.
     */
    const getBool = (parameter) => {
        const selectedImages = getSelectedImages();
        if (!isAnySelectedImages()) return false;
        return selectedImages.every(image => image.attrs[parameter]);
    }

    /**
     * Sets the value of the parameter on all the selected images.
     * @param parameter {string} the name of the parameter to set the value of.
     * @param bool {boolean} the new value of the parameter.
     */
    const setBool = (parameter, bool) => {
        let isFirst = true;
        getSelectedImages().forEach(image => {
            image.attrs[parameter] = bool;
            const change = {};
            change[parameter] = bool;
            if (isFirst) {
                addChanges(image.id(), change, false);
                isFirst = false;
            } else {
                addChanges(image.id(), change, true);
            }
        });
    }

    return (
        isFilterWindowOpen &&
        <div id="filter-window" className={"filterWindow"}>
            <div className={"filterWindowHeader"}>
                <div className={"filterWindowTitle"}>Filter</div>
                <button className={"square exit"} onClick={() => setIsFilterWindowOpen(false)}></button>
            </div>
            {isAnySelectedImages() ?
                (<div className={"filterWindowBody"}>
                    <FilterForm
                        id={"filter-hue"}
                        label="Hue"
                        min={hueMin}
                        max={hueMax}
                        step={1}
                        value={getValue("hue")}
                        setValue={(hu, overwrite) => {
                            if (!isAnySelectedImages()) return;
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
                            if (!isAnySelectedImages()) return;
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
                            if (!isAnySelectedImages()) return;
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
                            if (!isAnySelectedImages()) return;
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
                            if (!isAnySelectedImages()) return;
                            setValue("threshold", parseInt(threshold), overwrite);
                        }}
                    />
                    <FilterToggle
                        label="Grayscale"
                        id={"grayscaleToggle"}
                        setValue={() => {
                            if (!isAnySelectedImages()) return;
                            setBool("grayscale", !getBool("grayscale"));
                        }}
                    />
                    <FilterToggle
                        label="Invert"
                        id={"invertToggle"}
                        setValue={() => {
                            if (!isAnySelectedImages()) return;
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