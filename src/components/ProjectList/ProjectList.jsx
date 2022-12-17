import React from "react";
import "./ProjectList.css";

const ProjectList = () => {
	return (
		<table className={"project-list-container"}>
			<thead className={"header"}>
				<tr>
					<th className={"headerCell"}>
						<h3>Project name</h3>
					</th>
					<th className={"headerCell"}>
						<h3>Time</h3>
					</th>
					<th className={"headerCell"}>
						<h3>Size</h3>
					</th>
				</tr>
			</thead>
			<tbody className={"tableBody"}>
				<tr className={"tableRow"}>
					<td>
						<h3>Oseberg</h3>
					</td>
					<td>
						<h3>11.11.2011 13:3</h3>
					</td>
					<td>
						<h3>245MB</h3>
					</td>
				</tr>
				<tr className={"tableRow"}>
					<td>
						<h3>Oseberg2</h3>
					</td>
					<td>
						<h3>11.11.2011 13:37</h3>
					</td>
					<td>
						<h3>245MB</h3>
					</td>
				</tr>
				<tr className={"tableRow"}>
					<td>
						<h3>Oseberg3</h3>
					</td>
					<td>
						<h3>11.11.2011 13:37</h3>
					</td>
					<td>
						<h3>245MB</h3>
					</td>
				</tr>
				<tr className={"tableRow"}>
					<td>
						<h3>Oseberg4</h3>
					</td>
					<td>
						<h3>11.11.2011 13:37</h3>
					</td>
					<td>
						<h3>245MB</h3>
					</td>
				</tr>
				<tr className={"tableRow"}>
					<td>
						<h3>Oseberg5</h3>
					</td>
					<td>
						<h3>11.11.2011 13:37</h3>
					</td>
					<td>
						<h3>245MB</h3>
					</td>
				</tr>
				<tr className={"tableRow"}>
					<td>
						<h3>Oseberg6</h3>
					</td>
					<td>
						<h3>11.11.2011 13:37</h3>
					</td>
					<td>
						<h3>245MB</h3>
					</td>
				</tr>
			</tbody>
		</table>
	);
};

export default ProjectList;
