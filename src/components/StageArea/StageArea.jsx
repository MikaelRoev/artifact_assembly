import React, { useEffect } from "react";
import {Stage, Layer, Group, Text, Rect} from "react-konva";
import { useState, useRef } from "react";
import { invoke } from '@tauri-apps/api/tauri'
import { dialog } from '@tauri-apps/api';
import Konva from "konva";
import SelectedGroup from "../SelectedGroup/SelectedGroup";

/**
 * Creates the canvas area in the project page.
 * @param uploadedImages is the initial images on the canvas.
 * @param stageRef is the reference for the stage used.
 * @returns {Element}
 * @constructor
 */
const StageArea = ({ uploadedImages, stageRef}) => {
	const [images, setImages] = useState([]);
	//const [selectedImageId, setSelectedImageId] = useState(null);
	const [history, setHistory] = useState([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [ctrlPressed, setCtrlPressed] = useState(false);

	const selectedGroupRef= useRef(null);

	const maxUndoSteps = 20;
	const zoomScale = 1.17; //How much zoom each time
	const zoomMin = 0.001; //zoom out limit
	const zoomMax = 300; //zoom in limit

	let projectName = "";
	let projectDescription = "";

	useEffect(() => {
		console.log("Render");
	});

	/**
	 * Sets the images when the list of uploaded images changes.
	 */
	useEffect(() => {
		setImages(uploadedImages);
	}, [uploadedImages]);



	/**
	 * Sets up and cleans up the delete event listener.
	 */
	useEffect(() => {

		/**
	 	* Deletes the selected elements if the delete key is pressed.
	 	* @param e the event.
		 */
		const handleDeletePressed = (e) => {
			if (e.key === "Delete" && selectedGroupRef.current) {
				console.log(`elements ${selectedGroupRef.current} deleted`);
				selectedGroupRef.current.removeChildren();
			}
		};
		document.addEventListener("keydown", handleDeletePressed);
		return () => {
			document.removeEventListener("keydown", handleDeletePressed);
		};
	});

	/**
	 * Updates the uploaded images when an image changes state.
	 */
	useEffect(() => {
		// Update the uploadedImages prop when the images state changes
		uploadedImages.forEach((uploadedImage) => {
			const index = images.findIndex((image) => image.id === uploadedImage.id);
			if (index >= 0) {
				uploadedImages[index] = images[index];
			}
		});
	}, [images, uploadedImages]);

	/**
	 * If there are any saved images in the local storage, sets the images to the saved images.
	 * else sets them as the uploaded images,
	useEffect(() => {
		const savedImages = localStorage.getItem("savedImages");
		if (savedImages) {
			setImages(JSON.parse(savedImages));
		} else {
			setImages(uploadedImages);
		}
	}, [uploadedImages]);
		*/

	/**
	 * Sets up and cleans up the save event listener.
	 */
	useEffect(() => {
		/**
		 * Saves the image positions if ctrl + S is pressed.
		 * @param e the event.
		 */
		const handleSavePressed = (e) => {
			if (e.ctrlKey && e.key === "s") {
				e.preventDefault();
				saveProjectDialog().then(() => {console.log('Project saved!');});
				openProjectDialog().then(() => {console.log('Project opened!');});
 			}
		};
		document.addEventListener("keydown", handleSavePressed);
		return () => {
			document.removeEventListener("keydown", handleSavePressed);
		};
	});

	const openProjectDialog = async () => {
		try {
			const filePath = await dialog.open({
				title: "Open Project",
				multiple: false,
				filters: [{name: 'JSON Files', extensions: ['json']}]
			});
			if (filePath) {
				jsonToProject(await readFile(filePath));
			} else {
				console.log('No file selected or operation cancelled.');
			}
		} catch (error) {
			console.error('Error during open project dialog: ', error);
		}
	}

	/**
	 * Opens the save project as dialog window.
	 */
	const saveProjectDialog = async () => {
		try {
			const filePath = await dialog.save({
				title: 'Save Project As',
				filters: [{name: 'JSON Files', extensions: ['json']}]
			});
			if (filePath) {
				// get the project name from the file path.
				projectName = filePath.replace(/^.*[\\/](.*?)\.[^.]+$/, '$1');
				await saveToFile(projectToJSON(), filePath);
				await readFile(filePath);
			} else {
				console.log('No file selected or operation cancelled.');
			}
		} catch (error) {
			console.error('Error during file save dialog: ', error);
		}
	};

	/**
	 * Parses the project into a JSON representation.
	 * @returns {string} containing the resulting JSON.
	 */
	const projectToJSON = ()   => {
		const stage = stageRef.current.getStage();
		const layerList = stage.getChildren();

		const project = {
			name: projectName,
			description: projectDescription,
			x: stage.x(),
			y: stage.y(),
			zoom: stage.scaleX(),
			layers: []
		};

		layerList.forEach(layer => {
			const layerData = {
				name: layer.name(),
				id: layer.id(),
				elements: [],
			};

			layer.getChildren().forEach(element => {
				const className = element.getClassName();

				const elementData = {
					name: element.name(),
					className: className,
					x: element.x(),
					y: element.y(),
					filePath: ""
				};
				if (className === 'Image') {
					elementData.filePath = '../images/lol.jpg';
				}

				layerData.elements.push({
					name: element.name(),
					className: className,
					x: element.x(),
					y: element.y()
				});
			});

			project.layers.push(layerData);
		});

		return JSON.stringify(project);
	}

	/**
	 * Parses a JSON representation of a project into the project.
	 * @param {string} json - The JSON representation of the project.
	 */
	const jsonToProject = (json) => {
		try {
			const project = JSON.parse(json);
			projectName = project.name;
			projectDescription = project.description;
			const stage = stageRef.current;
			if (stage === null) return;

			// Set stage properties
			stage.x(project.x);
			stage.y(project.y);
			stage.scaleX(project.zoom);
			stage.scaleY(project.zoom);

			// Reconstruct layers and elements
			project.layers.forEach(layerData => {
				// Reconstruct layer
				const layer = new Konva.Layer({
					name: layerData.name,
					id: layerData.id
				});

				// Reconstruct elements
				layerData.elements.forEach(elementData => {
					let element;
					if (elementData.className === 'Image') {
						// Reconstruct image element
						element = new Konva.Image({
							name: elementData.name,
							x: elementData.x,
							y: elementData.y,
							image: new Image(), // You may need to load the image separately
							draggable: true
						});
						// Set image source
						element.image.src = elementData.filePath;
					} else {
						// Reconstruct other types of elements
						// For example, shapes, text, etc.
						// You need to handle other types of elements here
					}

					// Add the element to the layer
					layer.add(element);
				});

				// Add the layer to the stage
				stage.add(layer);
			});

			// Layer order might need to be reconstructed
			//can you help me...
		} catch (error) {
			console.error('Error parsing JSON: ', error);
		}
	}

	/**
	 * Saves a string into a file.
	 * @param content to be saved.
	 * @param filePath the path to the file including the file name and type.
	 */
	const saveToFile = async (content, filePath) => {
		await invoke('save_file', {filePath: filePath, content: content})
			.catch((error) => console.error('Error when saving to file: ', error));
	};

	/**
	 * Reads the contents of a file.
	 * @param filePath of the file including name and type.
	 * @return {Promise<String>} Promise resolving to the contents of the file.
	 */
	const readFile = (filePath) => {
		return new Promise((resolve, reject) => {
			invoke('read_file', { filePath: filePath })
				.then((content) => {
					resolve(content);
				})
				.catch((error) => {
					console.error('Error reading from file: ', error);
					reject(error);
				});
		});
	}

	/**
	 * Sets up and cleans up the undo event listener.
	 */
	useEffect(() => {
		/**
		 * Undo the last step in the history if ctrl + z is pressed.
		 * @param e the event.
		 */
		const handleUndoPressed = (e) => {
			if (e.ctrlKey && e.key === "z") {
				e.preventDefault();
				Undo();
			}
		};
		document.addEventListener("keydown", handleUndoPressed);
		return () => {
			document.removeEventListener("keydown", handleUndoPressed);
		};
	}, [history, historyIndex]);

	/**
	 * Set up and cleans up the deselect check.
	 */
	useEffect(() => {
		/**
		 * The mouse event handler.
		 * @param e
		 */
		const handleMouseDown = (e) => {
			if (e.type === 'mousedown' && !ctrlPressed) {
				handleDeselect();
			}
		};

		/**
		 * The ctrl key down event handler.
		 * @param e
		 */
		const handleCtrlDown = (e) => {
			if (e.key === 'Control') {
				setCtrlPressed(true);
			}
		};

		/**
		 * The ctrl key up event handler.
		 * @param e
		 */
		const handleCtrlUp = (e) => {
			if (e.key === 'Control') {
				setCtrlPressed(false);
			}
		};

		document.addEventListener('mousedown', handleMouseDown);
		document.addEventListener('keydown', handleCtrlDown);
		document.addEventListener('keyup', handleCtrlUp);

		return () => {
			document.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('keydown', handleCtrlDown);
			document.removeEventListener('keyup', handleCtrlUp);
		};
	}, [ctrlPressed]);

	/**
	 * Handles the selecting of en element
	 * @param element to be selected
	 */
	const handleSelect = (element) => {
		const selectedGroup = selectedGroupRef.current;
		console.log("selectedGroup: ", selectedGroup)
		if (selectedGroup) {
			console.log(selectedGroup)
			selectedGroup.add(element);
		}
	};
	const handleDeselect = () => {
		const selectedGroup = selectedGroupRef.current;
		if (selectedGroup) {
			elements.add(selectedGroup.getChildren());
			selectedGroup.removeChildren();

		}
	};

	/**
	 * Zooms the Konva stage when a mouse or touchpad scroll event is triggered.
	 *
	 * @param {Object} event - The event object containing information about the scroll event.
	 */
	const zoomStage = (event) => {
		event.evt.preventDefault();

		const stage = stageRef.current;
		if (!stage) {
			return;
		}

		const oldScale = stage.scaleX();
		const pointer = stage.getPointerPosition();
		const mousePointTo = {
			x: (pointer.x - stage.x()) / oldScale,
			y: (pointer.y - stage.y()) / oldScale,
		};

		const zoomFactor = event.evt.deltaY < 0 ? zoomScale : 1 / zoomScale;
		const newScale = clamp(oldScale * zoomFactor, zoomMin, zoomMax);

		stage.scale({ x: newScale, y: newScale });

		const newPos = {
			x: pointer.x - mousePointTo.x * newScale,
			y: pointer.y - mousePointTo.y * newScale,
		};
		stage.position(newPos);
		stage.batchDraw();
	};

	/**
	 * Clamps a numeric value between a minimum and maximum range.
	 * @param {number} value - The numeric value to be clamped.
	 * @param {number} min - The minimum value of the range.
	 * @param {number} max - The maximum value of the range.
	 * @returns {number} The clamped value.
	 */
	const clamp = (value, min, max) => {
		return Math.min(Math.max(value, min), max);
	};

	/**
	 * Undoes the last action in the history.
	 */
	const Undo = () => {
		if (historyIndex > 0) {
			setHistoryIndex(historyIndex - 1);
			setImages(history[historyIndex - 1]);
		}
	};

	/**
	 * Updates the history of the canvas by adding changes.
	 * @param change the change to be added.
	 */
	const updateHistory = (change) => {
		// Update history
		const newHistory = history.slice(0, historyIndex + 1);
		newHistory.push(change);

		// Enforce the maximum number of undo steps
		if (newHistory.length > maxUndoSteps) {
			newHistory.shift(); // Remove the oldest state
		} else {
			setHistoryIndex(historyIndex + 1);
		}
		setHistory(newHistory);
	}

	// Callback function to get the groupRef from SelectedGroup
	const handleGroupRef = (ref) => {
		selectedGroupRef.current = ref;
	};

	const elements = [
		<Rect
			key="rect"
			x={20}
			y={20}
			width={100}
			height={50}
			fill="blue"
		/>,
		<Text
			key="text"
			x={150}
			y={20}
			text="Hello, Konva!"
			fontSize={20}
			fill="green"
		/>,
		<Group key="group" >
			<Rect
				x={250}
				y={20}
				width={50}
				height={50}
				fill="red"
			/>
			<Rect
				x={250}
				y={80}
				width={50}
				height={50}
				fill="yellow"
			/>
		</Group>
	]

	return (
		<>
			<Stage
				className="stage"
				width={window.innerWidth}
				height={window.innerHeight}
				//draggable
				onWheel={zoomStage}
				ref={stageRef}>
				<Layer className="layer">
					<SelectedGroup groupRefCallback={handleGroupRef}>
						<Rect width={100} height={100} fill="red"/>
						<Rect width={100} height={100} x={200} y={200} fill="blue"/>
					</SelectedGroup>
					{
						// elements
						(elements.length > 0) && elements.map((element, index) => {
							// for each
							return React.cloneElement(element, {
								// add select
								onClick: (event) => {
									handleSelect(element);
									event.target.moveToTop();
									//TODO: make group move on top
								},
								onTap: (event) => {
									handleSelect(element);
									event.target.moveToTop();
								},
								// add mouse pointer change
								onMouseEnter: (e) => {
									// Adds a pointer cursor when hovering over the image
									const container = e.target.getStage().container();
									container.style.cursor = "pointer";
								},
								onMouseLeave: (e) => {
									const container = e.target.getStage().container();
									container.style.cursor = "default";
								},
								// add change update?
								/*
								onDragEnd: (e) => {
									const changes = images.slice();
									changes[index] = {
										...shapeProps,
										x: e.target.x(),
										y: e.target.y(),
									};
									setImages(changes);
									updateHistory(changes);

								},
								 */
							});

						})
							/*
							<ElementNode
								key={element.key}

								onSelect={() => {
									select(element);
								}}
								onChange={(newAttrs) => {
									const changes = images.slice();
									changes[index] = newAttrs;
									setImages(changes);
									updateHistory(changes);
								}}
							>
								{element}
							</ElementNode>
							 */
					}

					{/*
						//SelectedGroup
						<ElementNode isSelected={true}
							/*onChange={(newAttrs) => {
							const changes = images.slice();
							changes[index] = newAttrs;
							setImages(changes);
							updateHistory(changes);
						}}
						>
							<Group ref={selectedGroupRef}/>
						</ElementNode>
					*/}
					{/*images.length > 0 &&
						images.map((image, i) => {
							return (
								<ImageNode
									key={image.id} // Updated key prop
									imageURL={image.imageUrl}
									shapeProps={image}
									isSelected={image.id === selectedImageId}
									onSelect={() => {
										selectImageId(image.id);
									}}
									onChange={(newAttrs) => {
										const changes = images.slice();
										changes[i] = newAttrs;
										setImages(changes);
										updateHistory(changes);
									}}
								/>
							);
						})*/}
				</Layer>
			</Stage>
		</>
	);
};

export default StageArea;
