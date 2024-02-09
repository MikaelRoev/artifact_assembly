import React, {useContext, useRef, useState} from "react";
import FilterForm from "../FilterForm/FilterForm";
import "./NavBar.css";
import GridContext from "../../pages/Canvas/Context/GridContext";
import ResizeContext from "../../pages/Canvas/Context/ResizeContext";
import LockContext from "../../pages/Canvas/Context/LockContext";
import ImageContext from "../../pages/Canvas/Context/ImageContext";



const NavBar = ({ takeScreenshot }) => {
	const { grid, setGrid } = useContext(GridContext);
	const { resize, setResize } = useContext(ResizeContext);
	const { lock, setLock } = useContext(LockContext);
	const {
		images,
		setImages,
		filter,
		setFilter,
		saturation,
		setSaturation,
		hue,
		setHue,
		contrast,
		setContrast,
		luminance,
		setLuminance,
	} = useContext(ImageContext);

	const [isLoading, setIsLoading] = useState(false);

	const handleImageUpload = async (e) => {
		setIsLoading(true);
		const files = e.target.files;
		const newImages = [];

		await Promise.all(
			Array.from(files).map(async (file) => {
				const reader = new FileReader();
				reader.readAsDataURL(file);
				try {
					const imageUrl = await new Promise((resolve, reject) => {
						reader.onload = () => {
							resolve(reader.result);
						};
						reader.onerror = () => {
							reject(reader.error);
						};
					});
					const newImage = {
						imageUrl,
						id: Date.now(), // Assign a unique identifier using Date.now()
						// Other properties for the `shapeProps` object
					};
					newImages.push(newImage);
				} catch (error) {
					console.error(error);
				}
			})
		);

		setImages([...images, ...newImages]);
		setIsLoading(false);
		e.target.value = ""; // Clear the input value after the upload is complete
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
		setFilter((prevFilter) => !prevFilter);
	};

	const handleHueChange = (e) => setHue(e.target.value);
	const handleSaturationChange = (e) => setSaturation(e.target.value);
	const handleLuminanceChange = (e) => setLuminance(e.target.value);
	const handleContrastChange = (e) => setContrast(e.target.value);

	const resetFilter = () => {
		setHue(0);
		setSaturation(0);
		setLuminance(0);
		setContrast(0);
	};

	const handleScreenShot = () => {
		takeScreenshot();
	}

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
				{/* <p onClick={grid !== 1 ? changeGrid : () => setGrid(10)}>{gridText}</p>
				{grid !== 1 && <p onClick={() => setGrid(1)}>Disable Grid</p>} */}
				{/* <p onClick={toggleResize}>
					{resize ? "Disable Resize" : "Enable Resize"}
				</p> */}
				<p onClick={toggleLock}>{!lock ? "Lock Canvas" : "Unlock Canvas"}</p>
				<p onClick={toggleFilter}>
					{!filter ? "Enable Filter" : "Disable Filter"}
				</p>
				{!filter ? null : (
					<form className="filter-form">
						<FilterForm
							label="Hue"
							min={0}
							max={259}
							step={1}
							value={hue}
							onChange={handleHueChange}
						/>
						<FilterForm
							label="Saturation"
							min={-2}
							max={10}
							step={0.5}
							value={saturation}
							onChange={handleSaturationChange}
						/>
						<FilterForm
							label="Luminance"
							min={-2}
							max={2}
							step={0.1}
							value={luminance}
							onChange={handleLuminanceChange}
						/>
						<FilterForm
							label="Contrast"
							min={-100}
							max={100}
							step={1}
							value={contrast}
							onChange={handleContrastChange}
						/>
						<p onClick={resetFilter}>Reset</p>
					</form>
				)}
				<p className={"screenShotButton"} onClick={handleScreenShot}>Take screenshot</p>
			</div>
			<div className="nav-right">
				{isLoading && <div className="nav-item-right">Loading images...</div>}
			</div>
		</nav>
	);
};

export default NavBar;
