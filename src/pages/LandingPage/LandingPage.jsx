import React, {useContext} from "react";
import ProjectList from "../../components/ProjectList/ProjectList";
import "./LandingPage.css";
import { appWindow } from "@tauri-apps/api/window";
import { openProjectDialog } from "../../components/FileHandling";
import ProjectContext from "../../contexts/ProjectContext";
import ImageContext from "../../contexts/ImageContext";
import { useNavigate } from 'react-router-dom';

/**
 * Creates the initial landing page of the application.
 * @returns {Element}
 * @constructor
 */
const LandingPage = () => {
	const navigate = useNavigate()

	const {setProject} = useContext(ProjectContext);
	const {setImages} = useContext(ImageContext);

	/**
	 * Closes the application.
	 */
	async function handleQuitClick() {
		await appWindow.close();
	}

	/**
	 * Opens dialog window and goes to canvas of selected project.
	 */
	const handleOpenProjectClick = () => {
		openProjectDialog(setProject, setImages)
			.then(() => navigate('/canvas'))
			.catch(error => {
				if (error) console.error('Failed to open project:', error);
			});
	};

	return (
		<div className="container">
			<div className="left-main">
				<h1>
					Welcome to <br /> Artifact Assembly
				</h1>

				<div className="link-buttons-container">
					<a href="/canvas" className="link-button">
						New Project
					</a>
					<p onClick={handleOpenProjectClick} className="link-button">
						Open Project
					</p>
					<p onClick={handleQuitClick} className="link-button secondary">
						Quit
					</p>
				</div>
			</div>
			<div className="right-main">
				<h1>Projects</h1>
				<ProjectList />
			</div>
		</div>
	);
};

export default LandingPage;
