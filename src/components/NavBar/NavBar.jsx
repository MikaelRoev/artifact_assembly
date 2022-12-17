import React from "react";
import "./NavBar.css";

const NavBar = (ImageID) => {
	return (
		<div className="navbar">
			<div className="nav-left">
				<a className="nav-item" href="/">
					Home
				</a>
				<p className="nav-item">File</p>
				<p className="nav-item">Edit</p>
				<p className="nav-item">View</p>
				<p className="nav-item">Run</p>
				<p className="nav-item">Help</p>
				<p className="nav-item">Reset</p>
			</div>
			<div className="nav-right">
				<p className="nav-item-right">{"Oseberg1"}</p>
			</div>
		</div>
	);
};

export default NavBar;
