import React, { useContext } from "react";
import "./NavBar.css";
import GridContext from "../../pages/Canvas/GridContext";
import ResizeContext from "../../pages/Canvas/ResizeContext";

const NavBar = () => {
	const { setGrid, grid } = useContext(GridContext);
	const { setResize, resize } = useContext(ResizeContext);

	const gridText = grid !== 1 ? `Edit Grid (${grid} x ${grid})` : "Enable Grid";

	const changeGrid = () => {
		const gridOptions = [10, 20, 30, 40, 50];
		let currentIndex = gridOptions.indexOf(grid);
		currentIndex = (currentIndex + 1) % gridOptions.length;
		setGrid(gridOptions[currentIndex]);
	};

	const toggleResize = () => {
		setResize((prevResize) => !prevResize);
	};

	return (
		<nav className="navbar">
			<div className="nav-left">
				<a href="/">Home</a>
				<p>File</p>
				<p onClick={grid !== 1 ? changeGrid : () => setGrid(10)}>{gridText}</p>
				{grid !== 1 && <p onClick={() => setGrid(1)}>Disable Grid</p>}
				<p onClick={toggleResize}>
					{resize ? "Disable Resize" : "Enable Resize"}
				</p>
			</div>
			<div className="nav-right">
				<p className="nav-item-right">{"Oseberg1"}</p>
			</div>
		</nav>
	);
};

export default NavBar;
