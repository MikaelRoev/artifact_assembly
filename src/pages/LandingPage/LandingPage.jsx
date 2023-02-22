import React from "react";
import ProjectList from "../../components/ProjectList/ProjectList";
import "./LandingPage.css";
import { appWindow } from "@tauri-apps/api/window";

const LandingPage = () => {
	async function handleClick() {
		await appWindow.close();
	}
	return (
		<div className="container">
			<div className="left-main">
				<h1>
					Welcome to <br /> Artifact Assembly
				</h1>

				<a href="/canvas" className="link-button">
					Continue Project
				</a>
				<p className="link-button">New Project</p>
				<p className="link-button secondary">Settings</p>
				<p onClick={handleClick} className="link-button secondary">
					Quit
				</p>
			</div>
			<div className="right-main">
				<h1>Projects</h1>
				<ProjectList />
			</div>
		</div>
	);
};

export default LandingPage;
