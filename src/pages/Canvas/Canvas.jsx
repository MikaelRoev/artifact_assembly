import React from "react";
import { useState } from "react";
import StageArea from "../../components/StageArea/StageArea";
import NavBar from "../../components/NavBar/NavBar";
import "./Canvas.css";
import GridContext from "./Context/GridContext";
import ResizeContext from "./Context/ResizeContext";
import LockContext from "./Context/LockContext";

const Canvas = () => {
	const [grid, setGrid] = useState(1);
	const [resize, setResize] = useState(false);
	const [lock, setLock] = useState(false);

	const providerValue = {
		grid,
		resize,
		lock,
		setResize,
		setGrid,
		setLock,
	};
	return (
		<GridContext.Provider value={providerValue}>
			<ResizeContext.Provider value={providerValue}>
				<LockContext.Provider value={providerValue}>
					<div className="stage-container">
						<NavBar />
						<StageArea />
					</div>
				</LockContext.Provider>
			</ResizeContext.Provider>
		</GridContext.Provider>
	);
};

export default Canvas;
