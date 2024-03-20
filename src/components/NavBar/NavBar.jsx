import React, {useContext, useEffect, useState} from "react";
import FilterForm from "../FilterForm/FilterForm";
import "./NavBar.css";
import LockedContext from "../../contexts/LockedContext";
import ImageContext from "../../contexts/ImageContext";
import FilterContext from "../../contexts/FilterContext";
import ProjectContext from "../../contexts/ProjectContext";
import {saveProjectDialog} from "../FileHandling";
import {open} from "@tauri-apps/api/dialog";
import selectedElementsIndexContext from "../../contexts/SelectedElementsIndexContext";

/**
 * Creates a navigation bar that is at the top of the project page.
 * @returns {Element}
 * @constructor
 */
const NavBar = ({setDialogOpen}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(0);
    const [value, setValue] = useState(0);
    const [luminance, setLuminance] = useState(0);
    const [contrast, setContrast] = useState(0);

    const {isLocked, setIsLocked} = useContext(LockedContext);
    const {images, setImages} = useContext(ImageContext);
    const {project, setProject} = useContext(ProjectContext);
    const {filter, setFilter} = useContext(FilterContext);
    const {selectedElementsIndex} = useContext(selectedElementsIndexContext);

    const offset = 20;
    const hueMax = 360;
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
     * Checks if there is an image at the position.
     * @param position {{x: number, y: number}} the position to check.
     * @return {boolean} true if there are at least one image at the position,
     * false if there are no images at the position.
     */
    const isAnyImageAtPosition = (position) => {
        return images.some((image) => {
            return image.x === position.x && image.y === position.y
        })
    }

    /**
     * Finds the first available position not taken by an image.
     * @param position {{x: number, y: number}} the starting position to search from.
     * @return {{x: number, y: number}} the first available position.
     */
    const findFirstFreePosition = (position) => {
        while (isAnyImageAtPosition(position)) {
            position.x += offset;
            position.y += offset;
        }
        return {x: position.x, y: position.y}
    }

	/**
	 * Handles uploading of an image.
	 * @returns {Promise<void>}
	 */
	const handleImageUpload = async () => {
        setIsLoading(true);
        // open file explorer dialog window
        const result = await open({
            title: "Load Image",
            filters: [{name: 'Images', extensions: ['jpg', 'png']}],
            multiple: true,
            //defaultPath: await appDataDir()
        });
        if (result?.length > 0) {
            let position = {x: 0, y: 0};
            const newImages = result.map((file) => {
                position = findFirstFreePosition(position);
                const newImage = {
                    className: 'Image',
                    filePath: file,
                    x: position.x,
                    y: position.y,
                    // rotation?
                    // Other properties for the `shapeProps` object
                };
                position.x += offset;
                position.y += offset;
                return newImage
            });
            setImages([...images, ...newImages]);
            setIsLoading(false);
        }
        handleFileButtonClick()
    };

    const toggleLock = () => {
        setIsLocked((prevLock) => !prevLock);
    };

    const toggleFilter = () => {
        setFilter((prevFilter) => !prevFilter);
    };

    const handleHueChange = (hueValue) => {
        const newImages = [...images];

        selectedElementsIndex.forEach((index) => {
            let imageValue = images[index].hue;
            if(isNaN(imageValue)) imageValue = 0;
            const groundValue = imageValue - hue;
            const newValue = groundValue + hueValue;
            newImages[index].hue = newValue % 360;
        });
        setImages(newImages);
        setHue(hueValue);
    };


    const handleSaturationChange = (saturationValue) => {
        const newImages = [...images];

        selectedElementsIndex.forEach((index) => {
            let imageValue = images[index].saturation;
            if(isNaN(imageValue)) imageValue = 0;
            const groundValue = imageValue - saturation;
            const newValue = groundValue + saturationValue;
            if (newValue > saturationMax) {
                newImages[index].saturation = saturationMax
            } else if (newValue < saturationMin){
                newImages[index].saturation = saturationMin
            } else {
                newImages[index].saturation = newValue
            }
        });
        setImages(newImages);
        setSaturation(saturationValue);
    };

    const handleValueChange = (valueValue) => {
        const newImages = [...images];

        selectedElementsIndex.forEach((index) => {
            let imageValue = images[index].value;
            if(isNaN(imageValue)) imageValue = 0;
            const groundValue = imageValue - value;
            const newValue = groundValue + valueValue;
            if (newValue > valueMax) {
                newImages[index].value = valueMax
            } else if (newValue < valueMin){
                newImages[index].value = valueMin
            } else {
                newImages[index].value = newValue
            }
        });
        setImages(newImages);
        setValue(valueValue);
    };

    const handleLuminanceChange = (luminanceValue) => {
        const newImages = [...images];

        selectedElementsIndex.forEach((index) => {
            let imageValue = images[index].luminance;
            if(isNaN(imageValue)) imageValue = 0;
            const groundValue = imageValue - luminance;
            const newValue = groundValue + luminanceValue;
            if (newValue > luminanceMax) {
                newImages[index].luminance = luminanceMax
            } else if (newValue < luminanceMin){
                newImages[index].luminance = luminanceMin
            } else {
                newImages[index].luminance = newValue
            }
        });
        setImages(newImages);
        setLuminance(luminanceValue);
    };

    const handleContrastChange = (contrastValue) => {
        const newImages = [...images];

        selectedElementsIndex.forEach((index) => {
            let imageValue = images[index].contrast;
            if(isNaN(imageValue)) imageValue = 0;
            const groundValue = imageValue - contrast;
            const newValue = groundValue + contrastValue;
            if (newValue > contrastMax) {
                newImages[index].contrast = contrastMax
            } else if (newValue < contrastMin){
                newImages[index].contrast = contrastMin
            } else {
                newImages[index].contrast = newValue
            }
        });
        setImages(newImages);
        setContrast(contrastValue);
    };

    const resetFilter = () => {
        setHue(0);
        setSaturation(0);
        setValue(0);
        setLuminance(0);
        setContrast(0);
    };

    /**
     * Constant function to set the visibility of the file dropdown menu.
     */
    const handleFileButtonClick = () => {
        setDropdownVisible(!dropdownVisible)
    }

    /**
     * Resets the filter when change in the selected.
     */
    useEffect(() => {
        setHue(0);
        setSaturation(0);
        setValue(0);
        setLuminance(0);
        setContrast(0);
    }, [setHue, setSaturation, setValue, setContrast, setLuminance, selectedElementsIndex]);


    /**
     * Function to handle exporting an image of the canvas
     */
    const handleImageOfCanvasExport = () => {
        setDialogOpen(true);
        handleFileButtonClick()
    }

    /**
     * Function to open up the score window for all the images on the canvas.
     * @returns Void
     */
    const openScoreWindow = async () => {
        document.getElementById("scoreWindow").style.visibility = "visible";
        handleFileButtonClick()
    };

    return (
        <nav className="navbar">
            <div className="nav-left">
                <a href="/">Home</a>
                <div className={"fileDiv"}>
                    <p className={"fileButton"} onClick={() => handleFileButtonClick()}>
                        File
                    </p>
                    {/* Dropdown menu. Add <li> elements to expand the menu */}
                    {dropdownVisible && (
                        <div className={"dropdown"}>
                            <ul>
                                <li>
                                    <button
                                        className={"dropdownButton"}
                                        onClick={handleImageUpload}
                                    >Load Image</button>
                                </li>
                                <li>
                                    <button
                                        className={"dropdownButton"}
                                        onClick={() => {
                                        saveProjectDialog(project, setProject, images).then(handleFileButtonClick);
                                    }}
                                    >Save project</button>
                                </li>
                                <li>
                                    <button
                                        className={"dropdownButton"}
                                        onClick={handleImageOfCanvasExport}
                                    >Export as image </button>
                                </li>
                                <li>
                                    <button
                                        className={"dropdownButton"}
                                        onClick={openScoreWindow}
                                    >Open similarity metrics window</button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
                <p onClick={toggleLock}>{!isLocked ? "Lock Canvas" : "Unlock Canvas"}</p>
                <p onClick={toggleFilter}>
                    {!filter ? "Enable Filter" : "Disable Filter"}
                </p>
                {!filter ? null : (
                    <form className="filter-form">
                        {/*<FilterForm
                            label="Hue"
                            min={hueMin}
                            max={hueMax}
                            step={1}
                            value={hue}
                            setValue={setHue}
                            onValueChange={handleHueChange}
                        />*/}
                        <FilterForm
                            label="Saturation"
                            min={saturationMin}
                            max={saturationMax}
                            step={0.5}
                            value={saturation}
                            setValue={setSaturation}
                            onValueChange={handleSaturationChange}
                        />
                        <FilterForm
                            label="Value"
                            min={valueMin}
                            max={valueMax}
                            step={0.1}
                            value={value}
                            setValue={setValue}
                            onValueChange={handleValueChange}
                        />
                        <FilterForm
                            label="Luminance"
                            min={luminanceMin}
                            max={luminanceMax}
                            step={0.1}
                            value={luminance}
                            setValue={setLuminance}
                            onValueChange={handleLuminanceChange}
                        />
                        <FilterForm
                            label="Contrast"
                            min={contrastMin}
                            max={contrastMax}
                            step={1}
                            value={contrast}
                            setValue={setContrast}
                            onValueChange={handleContrastChange}
                        />
                        <p onClick={resetFilter}>Reset</p>
                    </form>
                )}
            </div>
            <div className="nav-right">
                {isLoading && <div className="nav-item-right">Loading images...</div>}
            </div>
        </nav>
    );
};

export default NavBar;
