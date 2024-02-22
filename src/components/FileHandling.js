import {dialog} from "@tauri-apps/api";
import {invoke} from "@tauri-apps/api/tauri";
import {useContext} from "react";
import ProjectContext from "../pages/Canvas/Context/ProjectContext";
import {Image} from "react-konva";
import Konva from "konva";

const FileHandling = () => {

    const { projectName, setProjectName, projectDescription, setProjectDescription} = useContext(ProjectContext);

    /**
     * Opens the "open project"-dialog window
     * @param {Konva.Stage} stage of the project.
     * @return {Promise<void>} when the dialog window closes.
     */
    const openProjectDialog = async (stage) => {
        try {
            const filePath = await dialog.open({
                title: "Open Project",
                multiple: false,
                filters: [{name: 'JSON Files', extensions: ['json']}]
            });
            if (filePath) {
                jsonToProject(await readFile(filePath), stage);
            } else {
                console.log('No file selected or operation cancelled.');
            }
        } catch (error) {
            console.error('Error during open project dialog: ', error);
        }
    }


    /**
     * Opens the "save project as"-dialog window.
     * @param {Konva.Stage} stage of the project.
     */
    const saveProjectDialog = async (stage) => {
        try {
            const filePath = await dialog.save({
                title: 'Save Project As',
                filters: [{name: 'JSON Files', extensions: ['json']}]
            });
            if (filePath) {
                // get the project name from the file path.
                setProjectName(filePath.replace(/^.*[\\/](.*?)\.[^.]+$/, '$1'));
                await saveToFile(projectToJSON(stage), filePath);
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
     * @param {Konva.Stage} stage of the project.
     * @returns {string} containing the resulting JSON.
     */
    const projectToJSON = (stage)   => {
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
     * @param {string} json representation of the project.
     * @param {Konva.Stage} stage of the project.
     */
    const jsonToProject = (json, stage) => {
        try {
            const project = JSON.parse(json);
            setProjectName(project.name);
            setProjectDescription(project.description);
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
    };
}

export default FileHandling;