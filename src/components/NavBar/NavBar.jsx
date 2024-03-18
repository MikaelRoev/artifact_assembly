import React, {useContext, useEffect, useRef, useState} from "react";
import FilterForm from "../FilterForm/FilterForm";
import "./NavBar.css";
import LockedContext from "../../contexts/LockedContext";
import ImageContext from "../../contexts/ImageContext";
import FilterContext from "../../contexts/FilterContext";
import ProjectContext from "../../contexts/ProjectContext";
import {saveProjectDialog} from "../FileHandling";
import {open} from "@tauri-apps/api/dialog";

/**
 * Creates a navigation bar that is at the top of the project page.
 * @returns {Element}
 * @constructor
 */
const NavBar = ({takeScreenshot}) => {
    const {isLocked, setIsLocked} = useContext(LockedContext);
    const {images, setImages} = useContext(ImageContext);
    const {project, setProject} = useContext(ProjectContext);
    const {
        filter,
        setFilter,
        saturation,
        setSaturation,
        hue,
        setHue,
        contrast,
        setContrast,
        luminance,
        setLuminance,
    } = useContext(FilterContext);

    const [isLoading, setIsLoading] = useState(false);
    const [numberValue, setNumberValue] = useState(100);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const inputRef = useRef(null);

    const offset = 20;

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
	 * @param e
	 * @returns {Promise<void>}
	 */
	const handleImageUpload = async () => {
        setIsLoading(true);
        // open file explorer dialog window
        const result = await open({
            title: "Load Image",
            filters: [{name: 'Images', extensions: ['jpg', 'png']}],
            multiple: true
        });
        if (result?.length > 0) {
            let position = {x: 0, y: 0};
            const newImages = result.map((file) => {
                position = findFirstFreePosition(position);
                const newImage = {
                    className: 'Image',
                    filePath: file,
                    name: file,
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

        /*
		const files = e.target.files;
		const newImages = [];

        let x = 0;
        let y = 0;

        await Promise.all(
            Array.from(files).map(async (file) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                try {
                    const imageUrl = await new Promise((resolve, reject) => {
                        reader.onload = () => {
                            resolve(reader.result);
                        };
                        reader.onerror = () => {
                            reject(reader.error);
                        };
                    });
                    while (isAnyImageAtPosition(x, y)) {
                        x += offset;
                        y += offset;
                    }
                    const newImage = {
                        className: 'Image',
                        imageUrl,
                        id: Date.now().toString(), // Assign a unique identifier using Date.now()
                        name: file.name,
                        x: x,
                        y: y,
                        // Other properties for the `shapeProps` object
                    };
                    newImages.push(newImage);
                    x += offset;
                    y += offset;
                } catch (error) {
                    console.error(error);
                }
            })
        );

        setImages([...images, ...newImages]);
        setIsLoading(false);
        e.target.value = ""; // Clear the input value after the upload is complete

         */
        handleFileButtonClick()
    };

    const toggleLock = () => {
        setIsLocked((prevLock) => !prevLock);
    };

    const toggleFilter = () => {
        setFilter((prevFilter) => !prevFilter);
    };

    const handleHueChange = (e) => setHue(e.target.value);
    const handleSaturationChange = (e) => setSaturation(e.target.value);
    const handleLuminanceChange = (e) => setLuminance(e.target.value);
    const handleContrastChange = (e) => setContrast(e.target.value);

    const resetFilter = () => {
        setHue(0);
        setSaturation(0);
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
     * Constant function to update the number inside the numberinput for scaling the screenshot
     * @param e
     */
    const handleInputChange = (e) => {
        setNumberValue(parseInt(e.target.value))
    }

    /**
     * Effect for handling taking a screenshot of the current stage visible on the screen.
     */
    useEffect(() => {
        const handleScreenShot = () => {
            takeScreenshot(inputRef.current.value);
            handleFileButtonClick()
        }

        const screenshot = document.getElementById("ssButton");
        if (screenshot) {
            screenshot.addEventListener("click", handleScreenShot, false);
            return () => screenshot.removeEventListener("click", handleScreenShot);
        }
    }, [takeScreenshot, handleFileButtonClick]);

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
                    <div className={"fileButton"} onClick={() => handleFileButtonClick()}>
                        File
                    </div>
                    {/* Dropdown menu. Add <li> elements to expand the menu */}
                    {dropdownVisible && (
                        <div className={"dropdown"}>
                            <ul>
                                <li onClick={handleImageUpload}>
                                    <span id={"loadImageButton"}>Load Image</span>
                                </li>
                                <li onClick={() => {
                                    saveProjectDialog(project, setProject, images).then(handleFileButtonClick);
                                }}>
                                    <span id={"saveProjectButton"}>Save project</span>
                                </li>
                                <li>
                                    <span className={"screenShotButton"} id={"ssButton"}>Export as image </span>
                                    <input
                                        ref={inputRef}
                                        type={"number"}
                                        id={"scale"}
                                        min={100}
                                        max={1000}
                                        step={10}
                                        value={numberValue}
                                        onChange={handleInputChange}
                                    />
                                    <span>%</span>
                                </li>
                                <li onClick={openScoreWindow}>
                                    <span id={"showScoreWindowButton"}>Open similarity metrics window</span>
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
                        <FilterForm
                            label="Hue"
                            min={0}
                            max={259}
                            step={1}
                            value={hue}
                            onChange={handleHueChange}
                        />
                        <FilterForm
                            label="Saturation"
                            min={-2}
                            max={10}
                            step={0.5}
                            value={saturation}
                            onChange={handleSaturationChange}
                        />
                        <FilterForm
                            label="Luminance"
                            min={-2}
                            max={2}
                            step={0.1}
                            value={luminance}
                            onChange={handleLuminanceChange}
                        />
                        <FilterForm
                            label="Contrast"
                            min={-100}
                            max={100}
                            step={1}
                            value={contrast}
                            onChange={handleContrastChange}
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
