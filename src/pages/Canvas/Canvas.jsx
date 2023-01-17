import React from "react";
import { useState } from "react";
import StageArea from "../../components/StageArea/StageArea";
import NavBar from "../../components/NavBar/NavBar";
import "./Canvas.css";
import GridContext from "./GridContext";
import ResizeContext from "./ResizeContext";

const Canvas = () => {
	const [grid, setGrid] = useState(1);
	const [resize, setResize] = useState(false);

	const providerValue = {
		grid,
		resize,
		setResize,
		setGrid,
	};
	return (
		<GridContext.Provider value={providerValue}>
			<ResizeContext.Provider value={providerValue}>
				<div className="stage-container">
					<NavBar />
					<StageArea />
				</div>
			</ResizeContext.Provider>
		</GridContext.Provider>
	);
};

export default Canvas;
