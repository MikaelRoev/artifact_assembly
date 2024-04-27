import React, {useContext, useState} from "react";
import {useNavigate} from "react-router-dom";
import {appWindow} from "@tauri-apps/api/window";
import {openProjectDialog} from "../../util/FileHandling";
import ProjectList from "../../components/ProjectList/ProjectList";
import ProjectContext from "../../contexts/ProjectContext";
import StageContext from "../../contexts/StageContext";
import "./LandingPage.css";

/**
 * Creates the initial landing page of the application.
 * @returns {JSX.Element}
 * @constructor
 */
const LandingPage = () => {
    const navigate = useNavigate();

    const {setProject} = useContext(ProjectContext);
    const [projectElements, setProjectElements] = useState([]);

    /**
     * Closes the application.
     */
    async function handleQuitClick() {
        await appWindow.close();
    }

    /**
     * Opens dialog window and goes to canvas of selected project.
     */
    function handleOpenProjectClick() {
        openProjectDialog(setProject, setProjectElements)
            .then(() => navigate("/canvas", { state: { projectElements: projectElements }}))
            .catch(error => {
                if (error) console.error("Failed to open project:", error);
            });
    }

    /**
     * Opens the canvas page.
     */
    function handleNewProjectClick() {
        navigate("/canvas")
    }

    return (
        <div className="container">
            <div className="left-main">
                <h1>
                    Welcome to <br/> Artifact Assembly
                </h1>

                <div className="link-buttons-container">
                    <button onClick={handleNewProjectClick} className="link-button">
                        New Project
                    </button>
                    <button onClick={handleOpenProjectClick} className="link-button">
                        Open Project
                    </button>
                    <button onClick={handleQuitClick} className="link-button secondary">
                        Quit
                    </button>
                </div>
            </div>
            <div className="right-main">
                <h1>Projects</h1>
                <ProjectList/>
            </div>
        </div>
    );
};

export default LandingPage;
