import React from 'react';
import "./ProjectList.css";

/**
 * Represents the list of projects on the landing page.
 */
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
        </table>
    );
};

export default ProjectList;
