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
					The goal of this project is to develop a software solution that helps
					archaeologists reconstruct original artifacts from smaller, damaged
					pieces. Specifically, the software will use images of archaeological
					textile fragments and let the archaeologists manually piece together
					the original.
					<br />
					<br />
					This project is a precursor to my Master's Thesis, which I plan to
					pursue in the spring semester of 2023. The challenge of assembling
					fragments of the past, particularly those that are fragile and
					damaged, is a significant one for archaeologists. This project aims to
					provide a tool that will make this process more efficient and
					effective.
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
