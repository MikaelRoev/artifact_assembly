import React from "react";
import { useState } from "react";
import StageArea from "../../components/StageArea/StageArea";
import NavBar from "../../components/NavBar/NavBar";
import "./Canvas.css";
import GridContext from "./Context/GridContext";
import ResizeContext from "./Context/ResizeContext";
import LockContext from "./Context/LockContext";
import ImageContext from "./Context/ImageContext";

/**
 * Creates a project page.
 * @returns {Element}
 * @constructor
 */
const Canvas = () => {
	const [grid, setGrid] = useState(1);
	const [resize, setResize] = useState(false);
	const [lock, setLock] = useState(false);
	const [images, setImages] = useState([]);
	const [filter, setFilter] = useState(false);
	const [saturation, setSaturation] = useState(0);
	const [hue, setHue] = useState(0);
	const [contrast, setContrast] = useState(0);
	const [luminance, setLuminance] = useState(0);

	const providerValue = {
		grid,
		resize,
		lock,
		images,
		filter,
		saturation,
		hue,
		contrast,
		luminance,
		setSaturation,
		setHue,
		setContrast,
		setLuminance,
		setFilter,
		setResize,
		setGrid,
		setLock,
		setImages,
	};
	return (
		<ImageContext.Provider value={providerValue}>
			<GridContext.Provider value={providerValue}>
				<ResizeContext.Provider value={providerValue}>
					<LockContext.Provider value={providerValue}>
						<div className="stage-container">
							<NavBar />
							<StageArea uploadedImages={images} />
						</div>
					</LockContext.Provider>
				</ResizeContext.Provider>
			</GridContext.Provider>
		</ImageContext.Provider>
	);
};

export default Canvas;
