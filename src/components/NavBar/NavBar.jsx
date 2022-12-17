import React, { useContext } from "react";
import "./NavBar.css";
import GridContext from "../../pages/Canvas/GridContext";

const NavBar = (ImageID) => {
	const { setGrid, grid } = useContext(GridContext);

	const changeGrid = () => {
		switch (grid) {
			case 1:
				setGrid(10);
				break;
			case 10:
				setGrid(20);
				break;
			case 20:
				setGrid(30);
				break;
			case 30:
				setGrid(40);
				break;
			case 40:
				setGrid(50);
				break;

			default:
				setGrid(10);
		}
	};

	return (
		<nav className="navbar">
			<div className="nav-left">
				<a href="/">Home</a>
				<p>File</p>
				<p>Edit</p>
				<p onClick={changeGrid}>{grid !== 1 ? `${grid} x ${grid}` : "Grid"}</p>
				<p onClick={() => setGrid(1)}>{grid !== 1 ? "Remove Grid" : ""}</p>
			</div>
			<div className="nav-right">
				<p className="nav-item-right">{"Oseberg1"}</p>
			</div>
		</nav>
	);
};

export default NavBar;
