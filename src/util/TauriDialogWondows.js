import {dialog, fs} from "@tauri-apps/api";
import {readFile, saveToFile} from "./FileHandling";


/**
 * Opens the "open project"-dialog window.
 * @param setProject {function(Object)} the setter for the project.
 * @param setElements {function(Object)} the setter for the elements.
 * @return {Promise<void>} when the dialog window closes.
 */
export const openProjectDialog = async (setProject, setElements) => {
    try {
        const filePath = await dialog.open({
            title: "Open Project",
            multiple: false,
            filters: [{name: "JSON Files", extensions: ["json"]}]
        });

        if (!filePath) return Promise.reject(Error("no file selected or operation cancelled"));

        const content = await readFile(filePath);
        let readProject = JSON.parse(content);
        setElements(readProject.elements);
        readProject.elements = undefined;
        setProject(readProject);
    } catch (error) {
        throw error;
    }
}


/**
 * Opens the "save project as"-dialog window.
 * @param project {Object} the project.
 * @param setProject {function(Object)} setter of the project.
 * @param elements {Object[]} the elements on the canvas.
 * @return {Promise<never>}
 */
export async function saveProjectDialog(project, setProject, elements) {
    elements.forEach((element) => {
        delete element.hueValues;
    })
    try {
        const filePath = await dialog.save({
            title: "Save Project As",
            filters: [{name: "JSON Files", extensions: ["json"]}]
        });

        //TODO: deal with error
        if (!filePath) return Promise.reject(Error("no file selected or operation cancelled"));

        let newProject = {
            ...project,
            // get the project name from the file path.
            name: filePath.replace(/^.*[\\/](.*?)\.[^.]+$/, "$1")
        };
        setProject(newProject);
        newProject = {...newProject, elements: elements}

        await saveToFile(JSON.stringify(newProject), filePath);
    } catch (error) {
        console.error("Error during file save dialog: ", error);
    }
}

/**
 * Opens a save dialog window to select where the exported image of the canvas should be saved.
 * @param image{Object} the image of the canvas. Needs to be in base64 dataURL form.
 * @returns {Promise<void>}
 */
export async function exportCanvasAsImageDialog(image) {
    const base64 = image.split(",")[1];
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    const filePath = await dialog.save({
        title: "Export Canvas as image",
        filters: [{name: "PNG Images", extensions: ["png"]}]
    });
    try {
        if (!filePath) return Promise.reject(); //no file selected or operation cancelled
        await fs.writeBinaryFile({
            path: filePath,
            contents: bytes
        })
        console.log("Image saved successfully to ", filePath);
    } catch (error) {
        console.error("Error during export of Canvas as image: ", error);
        alert("The program encountered an error.\n" +
            "The exported image is too large for the program to write to file.\n" +
            "Try selecting a lower number");
    }
}
