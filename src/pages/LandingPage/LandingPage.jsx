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
					This program is intended for archeologists and restorators to use to
					piece together a complete picture of fragments found in archeological
					sites without physically handling the fragile fragments themselves
					<br />
					<br />
					This is an early version of part of my planned Master Thesis for the
					spring semester of 2023 in the master's program Applied Computer
					Science at NTNU Gjøvik. This program also serves as contribution to
					the course IMT4894 Advanced Project Work.
					<br />
					-Casper F. Gulbrandsen
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
