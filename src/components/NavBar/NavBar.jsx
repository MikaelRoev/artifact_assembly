import React, {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {open} from "@tauri-apps/api/dialog";
import {openProjectDialog, saveProjectDialog} from "../../util/TauriDialogWondows";
import LockedContext from "../../contexts/LockedContext";
import ElementContext from "../../contexts/ElementContext";
import ProjectContext from "../../contexts/ProjectContext";
import StageRefContext from "../../contexts/StageRefContext";
import {ConfirmCloseModalContext} from "../ConfirmCloseModal/ConfirmCloseModal";
import {ExportImageModalContext} from "../ExportImageModal/ExportImageModal";
import {SimilarityMetricsWindowContext} from "../SimilarityMetricsWindow/SimilarityMetricsWindow";
import {FilterWindowContext} from "../FilterWindow/FilterWindow";
import "./NavBar.css";
import FilterEnabledContext from "../../contexts/FilterEnabledContext";

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
    const {stageRef} = useContext(StageRefContext);
    const {filterEnabled, setFilterEnabled} = useContext(FilterEnabledContext);
    const {setIsSimilarityMetricsWindowOpen} = useContext(SimilarityMetricsWindowContext);
    const {setIsExportImageModalOpen} = useContext(ExportImageModalContext);
    const {setIsFilterWindowOpen} = useContext(FilterWindowContext);
    const {
        setIsConfirmModalOpen,
        setOnSave,
        setOnDoNotSave
    } = useContext(ConfirmCloseModalContext);

    const navigate = useNavigate();

    const xOffset = 200;
    const offsetRowCount = 10;
    const yOffset = 400;

    /**
     * Closes the project and returns to the landing page.
     */
    function goToLandingPage() {
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
    function isAnyElementAtPosition(position) {
        return elements.some(element => {
            return element.x === position.x && element.y === position.y
        })
    }

    /**
     * Finds the first available position not taken by an element.
     * @param position {{x: number, y: number}} the starting position to search from.
     * @return {{x: number, y: number}} the first available position.
     */
    function findFirstFreePosition(position) {
        while (isAnyElementAtPosition(position)) {
            position = newPosition(position);
        }
        return {x: position.x, y: position.y}
    }

    function newPosition(position) {
        let x = position.x + xOffset;
        let y = position.y;
        if (x > xOffset * offsetRowCount) {
            x = 0;
            y += yOffset;
        }
        return {x, y};
    }

    /**
     * Asynchronous function for uploading of images.
     * @returns {Promise<void>}
     */
    async function handleImageUpload() {
        setIsLoading(true);
        // open file explorer dialog window
        const result = await open({
            title: "Load Image",
            filters: [{name: "Images", extensions: ["jpg", "png"]}],
            multiple: true
        });
        if (result?.length > 0) {
            let position = {x: 0, y: 0};
            let idAdder = 0; //For when multiple images are loaded at the same time
            const newImages = result.map((file) => {
                position = findFirstFreePosition(position);
                const newImage = {
                    type: "Image",
                    id: (Date.now() + idAdder).toString(),
                    x: position.x,
                    y: position.y,
                    fileName: file.split("\\")[file.split("\\").length - 1],
                    filePath: file,
                };
                idAdder++
                position = newPosition(position);
                return newImage;
            });
            setElements([...elements, ...newImages]);
        }
        setIsLoading(false);
        setFileDropdownVisible(false);
    }

    /**
     * Clocks the canvas.
     */
    function handleLockCanvasClick() {
        setIsLocked((prevLock) => !prevLock);
        setToolsDropdownVisible(false);
    }

    /**
     * Function to set the visibility of the file dropdown menu.
     */
    function handleFileButtonClick() {
        setFileDropdownVisible(!fileDropdownVisible);
        setToolsDropdownVisible(false);
    }

    /**
     * Function to set the visibility of the tools dropdown menu.
     */
    function handleToolsButtonClick() {
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
    function handleImageOfCanvasExport() {
        setIsExportImageModalOpen(true);
        setFileDropdownVisible(false);
    }

    /**
     * Function to open up the similarity metrics window for all the selected images.
     */
    async function handleOpenScoreWindow() {
        setIsSimilarityMetricsWindowOpen(true);
        setToolsDropdownVisible(false);
    }

    /**
     * Function to open up the filter window for all the selected images.
     */
    async function handleOpenFilterWindow() {
        setIsFilterWindowOpen(true);
        setToolsDropdownVisible(false);
    }

    /*
    function handleLockPiecesTogether() {
        const newGroup = {
            type: "Group",
            groupElements: []
        }

        for (const index of selectedElementsIndex) {
            const groupElement = elements[index];
            newGroup.groupElements.push(groupElement);
        }

        const newElements = elements.filter((element, index) =>
            !selectedElementsIndex.includes(index)
        )
        setElements([...newElements, newGroup])

        selectOnly();

        handleFileButtonClick()
    }

     */

    /**
     * Function to find the work area. Works by finding the nearest element and moving the stage to that element.
     */
    function findWorkArea() {
        let nearestElement = null;
        let shortestDistance = Infinity;
        let stage = stageRef.current;
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
                duration: 0.5
            })
        }
        setToolsDropdownVisible(false);
    }

    return (
        <nav className="navbar">
            <div className="nav-left">
                <div className="fileDiv navDiv">
                    <button className="navButton" onClick={handleFileButtonClick}>
                        File
                    </button>
                    {fileDropdownVisible && (
                        <div className="dropdown">
                            <ul>
                                <li>
                                    <button
                                        className="dropdownButton"
                                        onClick={() => {
                                            saveProjectDialog(project, setProject, elements)
                                                .then(setFileDropdownVisible(false))
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
                                                .then(setFileDropdownVisible(false))
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
                                        onClick={() => {
                                            setFilterEnabled((prevFilter) => !prevFilter);
                                            setToolsDropdownVisible(false);
                                        }}>
                                        {!filterEnabled ? "Enable Filters" : "Disable Filters"}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdownButton"
                                        onClick={findWorkArea}>
                                        Find Work Area
                                    </button>
                                </li>
                                {/*
                                <li>
                                    <button
                                        className="dropdownButton"
                                        disabled={selectedElements.length <= 1}
                                        onClick={handleLockPiecesTogether}>
                                        Lock Selected Together
                                    </button>
                                </li>
                                */}
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