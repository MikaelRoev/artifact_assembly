import React from "react";
import ProjectList from "../../components/ProjectList/ProjectList";
import "./LandingPage.css";

const LandingPage = () => {
	return (
		<div className="container">
			<div className="left-main">
				<h1>
					Welcome to <br /> Past Perfect Desktop
				</h1>
				<p>
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero magnam
					quod adipisci, qui sunt porro excepturi nobis repellendus? Unde neque
					eaque aspernatur explicabo eligendi? Soluta quam doloremque possimus
					distinctio assumenda?
				</p>
				<a href="/canvas" className="link-button">
					Continue Project
				</a>
				<p className="link-button">New Project</p>
				<p className="link-button secondary">Settings</p>
				<p className="link-button secondary">Quit</p>
			</div>
			<div className="right-main">
				<h1>Projects</h1>
				<ProjectList />
			</div>
		</div>
	);
};

export default LandingPage;
