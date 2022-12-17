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
					Welcome to <br /> Past Perfect Desktop
				</h1>
				<p>
					This program is designed for archaeologists and restorers to digitally
					reconstruct complete artifacts from fragments found at excavation
					sites, without the need to physically handle the fragile pieces.
					<br />
					<br />
					This software serves as part of my Master Thesis for the spring
					semester of 2023 in the Applied Computer Science program at NTNU
					Gjøvik, as well as a contribution to the IMT4894 Advanced Project Work
					course.
					<br />
					<br />
				</p>
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
