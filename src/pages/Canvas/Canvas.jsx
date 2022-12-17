import React from "react";
import StageArea from "../../components/StageArea/StageArea";
import NavBar from "../../components/NavBar/NavBar";
import "./Canvas.css";

const Canvas = () => {
	return (
		<div className="stage-container">
			<NavBar />
			<StageArea />
		</div>
	);
};

export default Canvas;
