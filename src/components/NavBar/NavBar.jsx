import React, { useContext } from "react";
import "./NavBar.css";
import GridContext from "../../pages/Canvas/GridContext";

const NavBar = () => {
	const { setGrid, grid } = useContext(GridContext);

	const changeGrid = () => {
		const gridOptions = [10, 20, 30, 40, 50];
		let currentIndex = gridOptions.indexOf(grid);
		currentIndex = (currentIndex + 1) % gridOptions.length;
		setGrid(gridOptions[currentIndex]);
	};

	return (
		<nav className="navbar">
			<div className="nav-left">
				<a href="/">Home</a>
				<p>File</p>
				<p>Edit</p>
				{grid !== 1 ? (
					<p onClick={changeGrid}>{`${grid} x ${grid}`}</p>
				) : (
					<p onClick={() => setGrid(10)}>Enable Grid</p>
				)}
				{grid !== 1 ? <p onClick={() => setGrid(1)}>Remove Grid</p> : null}
			</div>
			<div className="nav-right">
				<p className="nav-item-right">{"Oseberg1"}</p>
			</div>
		</nav>
	);
};

export default NavBar;
