import React, { useContext } from "react";
import "./NavBar.css";
import GridContext from "../../pages/Canvas/GridContext";

const NavBar = (ImageID) => {
	const { setGrid, grid } = useContext(GridContext);

	const changeGrid = () => {
		if (grid === 50) setGrid(10);
		else setGrid(50);
	};

	const removeGrid = () => {
		setGrid(1);
	};

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
				<p className="nav-item">{`${grid} x ${grid}`}</p>
				<button onClick={changeGrid}>Change grid</button>
				<button onClick={removeGrid}>Remove Grid</button>
			</div>
			<div className="nav-right">
				<p className="nav-item-right">{"Oseberg1"}</p>
			</div>
		</div>
	);
};

export default NavBar;
