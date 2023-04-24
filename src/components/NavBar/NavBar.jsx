import React, { useContext, useState } from "react";
import "./NavBar.css";
import GridContext from "../../pages/Canvas/Context/GridContext";
import ResizeContext from "../../pages/Canvas/Context/ResizeContext";
import LockContext from "../../pages/Canvas/Context/LockContext";
import ImageContext from "../../pages/Canvas/Context/ImageContext";

const NavBar = () => {
	const { grid, setGrid } = useContext(GridContext);
	const { resize, setResize } = useContext(ResizeContext);
	const { lock, setLock } = useContext(LockContext);
	const { images, setImages } = useContext(ImageContext);
	const { filter, setFilter } = useContext(ImageContext);
	const { saturation, setSaturation } = useContext(ImageContext);
	const { hue, setHue } = useContext(ImageContext);
	const { contrast, setContrast } = useContext(ImageContext);
	const { luminance, setLuminance } = useContext(ImageContext);

	const [isLoading, setIsLoading] = useState(false);

	const handleImageUpload = (e) => {
		setIsLoading(true);
		const files = e.target.files;
		const newImages = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const reader = new FileReader();
			reader.onload = () => {
				const newImage = {
					imageUrl: reader.result,
					id: images.length + i + 1,
					// Other properties for the `shapeProps` object
				};
				newImages.push(newImage);
				if (newImages.length === files.length) {
					setImages([...images, ...newImages]);
					setIsLoading(false);
				}
			};
			reader.readAsDataURL(file);
		}
	};

	const gridOptions = [10, 20, 30, 40, 50];
	const gridText = grid !== 1 ? `Edit Grid (${grid} x ${grid})` : "Enable Grid";

	const toggleResize = () => {
		setResize((prevResize) => !prevResize);
	};

	const toggleLock = () => {
		setLock((prevLock) => !prevLock);
	};

	const changeGrid = () => {
		const nextGrid =
			gridOptions[(gridOptions.indexOf(grid) + 1) % gridOptions.length];
		setGrid(nextGrid);
	};

	const toggleFilter = () => {
		if (filter) {
			setIsLoading(true);
			setFilter(false);
		} else {
			setIsLoading(true);
			setFilter(true);
		}
		setIsLoading(false);
		console.log(filter);
	};

	const satUpdate = (e) => {
		setSaturation(e.target.value);
	};
	const hueUpdate = (e) => {
		setHue(e.target.value);
	};
	const lumUpdate = (e) => {
		setLuminance(e.target.value);
	};
	const contrastUpdate = (e) => {
		setContrast(e.target.value);
	};

	return (
		<nav className="navbar">
			<div className="nav-left">
				<a href="/">Home</a>
				<div>
					<input
						type="file"
						onChange={handleImageUpload}
						multiple
						accept="image/*"
						className="inputfile"
						id="file"
					/>
					<label htmlFor="file">Load Image</label>
				</div>
				<p onClick={grid !== 1 ? changeGrid : () => setGrid(10)}>{gridText}</p>
				{grid !== 1 && <p onClick={() => setGrid(1)}>Disable Grid</p>}
				<p onClick={toggleResize}>
					{resize ? "Disable Resize" : "Enable Resize"}
				</p>
				<p onClick={toggleLock}>{!lock ? "Lock Canvas" : "Unlock Canvas"}</p>
				<p onClick={toggleFilter}>
					{!filter ? "Enable Filter" : "Disable Filter"}
				</p>
				{!filter ? (
					""
				) : (
					<form className="filter-form">
						<p>H:</p>
						<input
							id="hue"
							type="number"
							min="0"
							max="259"
							step="1"
							value={hue}
							onChange={hueUpdate}
						/>
						<p>S:</p>
						<input
							id="saturation"
							type="number"
							min="-2"
							max="10"
							step="0.5"
							value={saturation}
							onChange={satUpdate}
						/>
						<label>L:</label>
						<input
							id="luminance"
							type="number"
							min="-2"
							max="2"
							step="0.1"
							value={luminance}
							onChange={lumUpdate}
						/>
						<label>Contrast:</label>
						<input
							id="contrast"
							type="number"
							min="-100"
							max="100"
							step="1"
							value={contrast}
							onChange={contrastUpdate}
						/>
					</form>
				)}
			</div>
			<div className="nav-right">
				{isLoading && <div className="nav-item-right">Loading images...</div>}
			</div>
		</nav>
	);
};

export default NavBar;
