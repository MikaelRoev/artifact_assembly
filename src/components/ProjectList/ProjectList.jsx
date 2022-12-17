import React from "react";
import "./ProjectList.css";

const ProjectList = () => {
	return (
		<div className={"project-list-container"}>
			<div className={"header"}>
				<h3 className={"headerCell"}>Project name</h3>
				<h3 className={"headerCell"}>Time</h3>
				<h3 className={"headerCell"}>Size</h3>
			</div>
			<div className={"tableBody"}>
				<div className={"tableRow"}>
					<h3 className={"tableCell"}>Oseberg</h3>
					<h3 className={"tableCell"}>11.11.2011 13:37</h3>
					<h3 className={"tableCell"}>245MB</h3>
				</div>
				<div className={"tableRow"}>
					<h3 className={"tableCell"}>Oseber2</h3>
					<h3 className={"tableCell"}>11.11.2011 13:37</h3>
					<h3 className={"tableCell"}>245MB</h3>
				</div>
				<div className={"tableRow"}>
					<h3 className={"tableCell"}>Oseberg3</h3>
					<h3 className={"tableCell"}>11.11.2011 13:37</h3>
					<h3 className={"tableCell"}>245MB</h3>
				</div>
				<div className={"tableRow"}>
					<h3 className={"tableCell"}>Oseberg4</h3>
					<h3 className={"tableCell"}>11.11.2011 13:37</h3>
					<h3 className={"tableCell"}>245MB</h3>
				</div>
				<div className={"tableRow"}>
					<h3 className={"tableCell"}>Oseberg5</h3>
					<h3 className={"tableCell"}>11.11.2011 13:37</h3>
					<h3 className={"tableCell"}>245MB</h3>
				</div>
				<div className={"tableRow"}>
					<h3 className={"tableCell"}>Oseberg6</h3>
					<h3 className={"tableCell"}>11.11.2011 13:37</h3>
					<h3 className={"tableCell"}>245MB</h3>
				</div>
			</div>
		</div>
	);
};

export default ProjectList;
