import React from "react";
import { useState } from "react";
import StageArea from "../../components/StageArea/StageArea";
import NavBar from "../../components/NavBar/NavBar";
import "./Canvas.css";
import GridContext from "./GridContext";

const Canvas = () => {
	const [grid, setGrid] = useState(10);

	const providerValue = {
		grid,
		setGrid,
	};
	return (
		<GridContext.Provider value={providerValue}>
			<div className="stage-container">
				<NavBar />
				<StageArea />
			</div>
		</GridContext.Provider>
	);
};

export default Canvas;
