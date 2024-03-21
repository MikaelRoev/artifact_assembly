import React, {useContext, useState} from "react";
import "./NavBar.css";
import LockedContext from "../../contexts/LockedContext";
import ImageContext from "../../contexts/ImageContext";
import FilterEnabledContext from "../../contexts/FilterEnabledContext";
import ProjectContext from "../../contexts/ProjectContext";
import {openProjectDialog, saveProjectDialog} from "../FileHandling";
import {open} from "@tauri-apps/api/dialog";
import WindowModalOpenContext from "../../contexts/WindowModalOpenContext";

/**
 * Creates a navigation bar that is at the top of the project page.
 * @returns {Element}
 * @constructor
 */
const NavBar = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const {isLocked, setIsLocked} = useContext(LockedContext);
    const {images, setImages} = useContext(ImageContext);
    const {project, setProject} = useContext(ProjectContext);
    const {filterEnabled, setFilterEnabled} = useContext(FilterEnabledContext);
    const {setIsDialogOpen, setIsScoreWindowOpen} = useContext(WindowModalOpenContext);

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
        setFilterEnabled((prevFilter) => !prevFilter);
    };

    /**
     * Constant function to set the visibility of the file dropdown menu.
     */
    const handleFileButtonClick = () => {
        setDropdownVisible(!dropdownVisible)
    }


    /**
     * Function to handle exporting an image of the canvas
     */
    const handleImageOfCanvasExport = () => {
        console.log("1")
        setIsDialogOpen(true);
        console.log("2")
        handleFileButtonClick()
    }

    /**
     * Function to open up the score window for all the images on the canvas.
     * @returns Void
     */
    const handleOpenScoreWindow = async () => {
        setIsScoreWindowOpen(true);
        handleFileButtonClick()
    };

    return (
        <nav className="navbar">
            <div className="nav-left">
                <a href="/">Home</a>
                <div className={"fileDiv"}>
                    <button className={"navButton"} onClick={handleFileButtonClick}>
                        File
                    </button>
                    {/* Dropdown menu. Add <li> elements to expand the menu */}
                    {dropdownVisible && (
                        <div className={"dropdown"}>
                            <ul>
                                <li>
                                    <button
                                        className={"dropdownButton"}
                                        onClick={() => {
                                            saveProjectDialog(project, setProject, images)
                                                .then(handleFileButtonClick)
                                                .catch(()=>{});
                                        }}
                                    >Save project
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={"dropdownButton"}
                                        onClick={() => {
                                            openProjectDialog(setProject, setImages)
                                                .then(handleFileButtonClick)
                                                .catch(()=>{});
                                        }}
                                    >Open Project
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={"dropdownButton"}
                                        onClick={handleImageUpload}
                                    >Load Image
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={"dropdownButton"}
                                        onClick={handleImageOfCanvasExport}
                                    >Export As Image
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={"dropdownButton"}
                                        onClick={handleOpenScoreWindow}
                                    >Open Similarity Metrics Window
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
                <button className={"navButton"}
                        onClick={toggleLock}>{!isLocked ? "Lock Canvas" : "Unlock Canvas"}</button>
                <button className={"navButton"} onClick={toggleFilter}>
                    {!filterEnabled ? "Enable Filter" : "Disable Filter"}
                </button>
            </div>
            <div className="nav-right">
                {isLoading && <div className="nav-item-right">Loading images...</div>}
            </div>
        </nav>
    );
};

export default NavBar;
