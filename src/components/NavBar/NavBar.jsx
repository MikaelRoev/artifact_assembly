import React, {useContext, useState} from "react";
import "./NavBar.css";
import LockedContext from "../../contexts/LockedContext";
import ImageContext from "../../contexts/ImageContext";
import FilterEnabledContext from "../../contexts/FilterEnabledContext";
import ProjectContext from "../../contexts/ProjectContext";
import {saveProjectDialog} from "../FileHandling";
import {open} from "@tauri-apps/api/dialog";
import WindowModalOpenContext from "../../contexts/WindowModalOpenContext";

/**
 * Creates a navigation bar that is at the top of the project page.
 * @param stageRef Reference to the canvas stage
 * @returns {Element}
 * @constructor
 */
const NavBar = ({stageRef}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [fileDropdownVisible, setFileDropdownVisible] = useState(false);
    const [toolsDropdownVisible, setToolsDropdownVisible] = useState(false);

    const {isLocked, setIsLocked} = useContext(LockedContext);
    const {images, setImages, undo, redo} = useContext(ImageContext);
    const {project, setProject} = useContext(ProjectContext);
    const {filterEnabled, setFilterEnabled} = useContext(FilterEnabledContext);
    const {setIsDialogOpen, setIsScoreWindowOpen} = useContext(WindowModalOpenContext);

    const offset = 50;

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
                    fileName: file.split('\\')[file.split('\\').length - 1],
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

    const handleLockCanvasClick = () => {
        setIsLocked((prevLock) => !prevLock);
        handleToolsButtonClick();
    };

    const toggleFilter = () => {
        setFilterEnabled((prevFilter) => !prevFilter);
    };

    /**
     * Constant function to set the visibility of the file dropdown menu.
     */
    const handleFileButtonClick = () => {
        setFileDropdownVisible(!fileDropdownVisible)
    }

    /**
     * Constant function to set the visibility of the tools dropdown menu.
     */
    const handleToolsButtonClick = () => {
        setToolsDropdownVisible(!toolsDropdownVisible)
    }


    /**
     * Function to handle exporting an image of the canvas
     */
    const handleImageOfCanvasExport = () => {
        setIsDialogOpen(true);
        handleFileButtonClick()
    }

    /**
     * Function to open up the score window for all the images on the canvas.
     * @returns Void
     */
    const handleOpenScoreWindow = async () => {
        setIsScoreWindowOpen(true);
        handleToolsButtonClick()
    };

    /**
     * Function to find the work area. Works by finding the nearest image and moving the stage to that image.
     */
    const findWorkArea = () => {
        let nearestImage = null;
        let shortestDistance = Infinity
        let stage = stageRef.current
        const stageWidth = stage.width();
        const stageHeight = stage.height();

        // Position of the center of the current stage
        const currentStageCenterX = -stage.x() / stage.scaleX() + stageWidth / 2 / stage.scaleX();
        const currentStageCenterY = -stage.y() / stage.scaleY() + stageHeight / 2 / stage.scaleY();

        //Finding the closest image
        images.forEach(image => {
            const imagePosX = image.x;
            const imagePosY = image.y;

            const dx = imagePosX - currentStageCenterX;
            const dy = imagePosY - currentStageCenterY;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);


            if (distance < shortestDistance) {
                nearestImage = image;
                shortestDistance = distance;
            }
        });

        // Calculate the new X and Y values to move the stage to based on the nearest image
        if (nearestImage) {
            const newX = -nearestImage.x + (stageWidth / 2) - (nearestImage.width / 2);
            const newY = -nearestImage.y + (stageHeight / 2) - (nearestImage.height / 2);
            stage.to({
                x: newX,
                y: newY,
                scaleX: 1,
                scaleY: 1,
                duration: 0.5,
                onFinish: () => {
                    project.zoom = 1
                }
            })
        }
        handleToolsButtonClick();
    }

    return (
        <nav className="navbar">
            <div className="nav-left">
                <a href="/">Home</a>
                {/* TODO: move home button */}
                <div className={"fileDiv"}>
                    {/* TODO: make a tool dropdown menu*/}
                    <button className={"navButton"} onClick={handleFileButtonClick}>
                        File
                    </button>
                    {/* Dropdown menu. Add <li> elements to expand the menu */}
                    {fileDropdownVisible && (
                        <div className={"dropdown"}>
                            <ul>
                                <li>
                                    <button
                                        className={"dropdownButton"}
                                        onClick={handleImageUpload}>
                                        Load Image
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={"dropdownButton"}
                                        onClick={() => {
                                            saveProjectDialog(project, setProject, images).then(handleFileButtonClick);
                                        }}>
                                        Save project
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={"dropdownButton"}
                                        onClick={handleImageOfCanvasExport}>
                                        Export as image
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
                <div className={"fileDiv"}>
                    {/* TODO: make a tool dropdown menu*/}
                    <button className={"navButton"} onClick={handleToolsButtonClick}>
                        Tools
                    </button>
                    {toolsDropdownVisible && (
                        <div className={"dropdown"}>
                            <ul>
                                <li>
                                    <button
                                        className={"dropdownButton"}
                                        onClick={handleOpenScoreWindow}>
                                        Open similarity metrics window
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={"dropdownButton"}
                                        onClick={findWorkArea}>
                                        Go to work area
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={"dropdownButton"}
                                        onClick={handleLockCanvasClick}>
                                        {!isLocked ? "Lock Canvas" : "Unlock Canvas"}</button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
                <button className={"navButton"} onClick={toggleFilter}>
                    {!filterEnabled ? "Enable Filter" : "Disable Filter"}
                    {/* TODO: default enabled, move to filter window, check box*/}
                </button>
                <button className={"navButton"} onClick={undo}>Undo</button>
                <button className={"navButton"} onClick={redo}>Redo</button>
            </div>
            <div className="nav-right">
                {isLoading && <div className="nav-item-right">Loading images...</div>}
            </div>
        </nav>
    );
};

export default NavBar;
