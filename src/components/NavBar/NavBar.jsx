import React, {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {open} from "@tauri-apps/api/dialog";
import {openProjectDialog, saveProjectDialog} from "../../util/FileHandling";
import LockedContext from "../../contexts/LockedContext";
import ElementContext from "../../contexts/ElementContext";
import ProjectContext from "../../contexts/ProjectContext";
import SelectContext from "../../contexts/SelectContext";
import StageRefContext from "../../contexts/StageRefContext";
import {ConfirmCloseModalContext} from "../ConfirmCloseModal/ConfirmCloseModal";
import {ExportImageModalContext} from "../ExportImageModal/ExportImageModal";
import {SimilarityMetricsWindowContext} from "../SimilarityMetricsWindow/SimilarityMetricsWindow";
import {FilterWindowContext} from "../FilterWindow/FilterWindow";
import "./NavBar.css";

/**
 * Component for the navigation bar that is at the top of the canvas page.
 * @returns {JSX.Element} the navigation bar.
 * @constructor
 */
const NavBar = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [fileDropdownVisible, setFileDropdownVisible] = useState(false);
    const [toolsDropdownVisible, setToolsDropdownVisible] = useState(false);

    const {isLocked, setIsLocked} = useContext(LockedContext);
    const {elements, setElements, undo, redo} = useContext(ElementContext);
    const {project, setProject} = useContext(ProjectContext);
    const {getStage, addImage} = useContext(StageRefContext);
    const {setIsSimilarityMetricsWindowOpen} = useContext(SimilarityMetricsWindowContext);
    const {setIsExportImageModalOpen} = useContext(ExportImageModalContext);
    const {selectedElementsIndex, selectOnly} = useContext(SelectContext);
    const {setIsFilterWindowOpen} = useContext(FilterWindowContext);
    const {
        setIsConfirmModalOpen,
        setOnSave,
        setOnDoNotSave
    } = useContext(ConfirmCloseModalContext);

    const navigate = useNavigate();

    const xOffset = 200;
    const yOffset = 75;

    /**
     * Closes the project and returns to the landing page.
     */
    const goToLandingPage = () => {
        setElements([]);
        navigate("/");
    }

    /**
     * Checks if there is an element at the position.
     * @param position {{x: number, y: number}} the position to check.
     * @return {boolean}
     *  true if there are at least one element at the position,
     *  false if there are no elements at the position.
     */
    const isAnyElementAtPosition = (position) => {
        return elements.some((element) => {
            return element.x === position.x && element.y === position.y
        })
    }

    /**
     * Finds the first available position not taken by an element.
     * @param position {{x: number, y: number}} the starting position to search from.
     * @return {{x: number, y: number}} the first available position.
     */
    const findFirstFreePosition = (position) => {
        while (isAnyElementAtPosition(position)) {
            position.x += xOffset;
            position.y += yOffset;
        }
        return {x: position.x, y: position.y}
    }

    /**
     * Asynchronous function for uploading of images.
     * @returns {Promise<void>}
     */
    const handleImageUpload = async () => {
        setIsLoading(true);
        // open file explorer dialog window
        const result = await open({
            title: "Load Image",
            filters: [{name: "Images", extensions: ["jpg", "png"]}],
            multiple: true,
            //defaultPath: await appDataDir()
        });
        if (result?.length > 0) {
            let position = {x: 0, y: 0};
            let idAdder = 0 //For when multiple images are loaded at the same time
            result.forEach((file) => {
                position = findFirstFreePosition(position);
                const imageState = {
                    type: "Image",
                    id: (Date.now() + idAdder).toString(),
                    x: position.x,
                    y: position.y,
                    filePath: file,
                };
                addImage(imageState);
                idAdder++
                position.x += xOffset;
                position.y += yOffset;
            });
        }
        setIsLoading(false);
        handleFileButtonClick()
    };

    /**
     * Clocks the canvas.
     */
    const handleLockCanvasClick = () => {
        setIsLocked((prevLock) => !prevLock);
        handleToolsButtonClick();
    };

    /**
     * Constant function to set the visibility of the file dropdown menu.
     */
    const handleFileButtonClick = () => {
        setFileDropdownVisible(!fileDropdownVisible);
        setToolsDropdownVisible(false);
    }

    /**
     * Constant function to set the visibility of the tools dropdown menu.
     */
    const handleToolsButtonClick = () => {
        setToolsDropdownVisible(!toolsDropdownVisible);
        setFileDropdownVisible(false);
    }

    /**
     * useEffect to align the dropdown menu with the button.
     */
    useEffect(() => {
        if (fileDropdownVisible) {
            const file = document.querySelector(".fileDiv").getBoundingClientRect();
            const dropdown = document.querySelector(".fileDiv .dropdown");
            dropdown.style.left = file.left.toFixed(0) + "px";
        }
    }, [fileDropdownVisible]);

    /**
     * useEffect to align the dropdown menu with the button.
     */
    useEffect(() => {
        if (toolsDropdownVisible) {
            const tools = document.querySelector(".toolsDiv").getBoundingClientRect();
            const dropdown = document.querySelector(".toolsDiv .dropdown");
            dropdown.style.left = tools.left.toFixed(0) + "px";
        }
    }, [toolsDropdownVisible]);

    /**
     * Function to handle exporting an image of the canvas
     */
    const handleImageOfCanvasExport = () => {
        setIsExportImageModalOpen(true);
        handleFileButtonClick()
    }

    /**
     * Function to open up the similarity metrics window for all the selected images.
     */
    const handleOpenScoreWindow = async () => {
        setIsSimilarityMetricsWindowOpen(true);
        handleToolsButtonClick();
    };

    /**
     * Function to open up the filter window for all the selected images.
     */
    const handleOpenFilterWindow = async () => {
        setIsFilterWindowOpen(true);
        handleToolsButtonClick();
    };

    const handleLockPiecesTogether = () => {
        const newGroup = {
            type: "Group",
            groupElements: []
        }

        for (const element of selectedElementsIndex) {
            const groupElement = elements[element];
            newGroup.groupElements.push(groupElement);
        }

        const newElements = elements.filter((element, index) =>
            !selectedElementsIndex.includes(index)
        )
        setElements([...newElements, newGroup])

        selectOnly();

        handleFileButtonClick()
    }

    /**
     * Function to find the work area. Works by finding the nearest element and moving the stage to that element.
     */
    const findWorkArea = () => {
        let nearestElement = null;
        let shortestDistance = Infinity;
        const stage = getStage();
        const stageWidth = stage.width();
        const stageHeight = stage.height();

        // Position of the center of the current stage
        const currentStageCenterX = -stage.x() / stage.scaleX() + stageWidth / 2 / stage.scaleX();
        const currentStageCenterY = -stage.y() / stage.scaleY() + stageHeight / 2 / stage.scaleY();

        //Finding the closest element
        elements.forEach(element => {
            const elementPosX = element.x;
            const elementPosY = element.y;

            const dx = elementPosX - currentStageCenterX;
            const dy = elementPosY - currentStageCenterY;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);


            if (distance < shortestDistance) {
                nearestElement = element;
                shortestDistance = distance;
            }
        });

        // Calculate the new X and Y values to move the stage to based on the nearest element
        if (nearestElement) {
            const newX = -nearestElement.x + (stageWidth / 2) - (nearestElement.width / 2);
            const newY = -nearestElement.y + (stageHeight / 2) - (nearestElement.height / 2);
            stage.to({
                x: newX,
                y: newY,
                scaleX: 1,
                scaleY: 1,
                duration: 0.5,
                onFinish: () => {
                    project.zoom = 1;
                }
            })
        }
        handleToolsButtonClick();
    }

    return (
        <nav className="navbar">
            <div className="nav-left">
                <div className="fileDiv navDiv">
                    <button className="navButton" onClick={handleFileButtonClick}>
                        File
                    </button>
                    {/* Dropdown menu. Add <li> elements to expand the menu */}
                    {fileDropdownVisible && (
                        <div className="dropdown">
                            <ul>
                                <li>
                                    <button
                                        className="dropdownButton"
                                        onClick={() => {
                                            saveProjectDialog(project, setProject, elements)
                                                .then(handleFileButtonClick)
                                                .catch(() => {
                                                });
                                        }}>
                                        Save project
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdownButton"
                                        onClick={() => {
                                            openProjectDialog(setProject, setElements)
                                                .then(handleFileButtonClick)
                                                .catch(() => {
                                                });
                                        }}>
                                        Open Project
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdownButton"
                                        onClick={handleImageUpload}>
                                        Load Image
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdownButton"
                                        onClick={handleImageOfCanvasExport}>
                                        Export As Image
                                    </button>
                                </li>
                                <li>
                                    <button className="dropdownButton"
                                            onClick={() => {
                                                setFileDropdownVisible(false);
                                                setOnSave(() => () => {
                                                    saveProjectDialog(project, setProject, elements)
                                                        .then(goToLandingPage)
                                                        .catch(() => {
                                                        });
                                                });
                                                setOnDoNotSave(() => () => goToLandingPage());
                                                setIsConfirmModalOpen(true);
                                            }}>
                                        Close Project
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
                <div className="toolsDiv navDiv">
                    <button className="navButton" onClick={handleToolsButtonClick}>
                        Tools
                    </button>
                    {toolsDropdownVisible && (
                        <div className="dropdown">
                            <ul>
                                <li>
                                    <button
                                        className="dropdownButton"
                                        onClick={handleOpenScoreWindow}>
                                        Similarity Metrics
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdownButton"
                                        onClick={handleOpenFilterWindow}>
                                        Filters
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdownButton"
                                        onClick={findWorkArea}>
                                        Find Work Area
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdownButton"
                                        onClick={handleLockPiecesTogether}>
                                        Lock Selected Together
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdownButton"
                                        onClick={handleLockCanvasClick}>
                                        {!isLocked ? "Lock Canvas" : "Unlock Canvas"}</button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
                <div>
                    <button className="navButton undoRedo" onClick={undo}>⭯</button>
                    <button className="navButton undoRedo" onClick={redo}>⭮</button>
                </div>
            </div>
            <div className="nav-right">
                {isLoading && <div className="nav-item-right">Loading Images...</div>}
            </div>
        </nav>
    );
};

export default NavBar;