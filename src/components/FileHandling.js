import {invoke} from "@tauri-apps/api/tauri";
import {dialog} from "@tauri-apps/api";

/**
 * Saves a string into a file.
 * @param content to be saved.
 * @param filePath the path to the file including the file name and type.
 */
async function saveToFile(content, filePath){
    await invoke('save_file', {filePath: filePath, content: content})
        .catch((error) => console.error('Error when saving to file: ', error));
}

/**
 * Reads the contents of a file.
 * @param filePath of the file including name and type.
 * @return {Promise<String>} Promise resolving to the contents of the file.
 */
function readFile(filePath){
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
 * Opens the "open project"-dialog window
 * @return {Promise<void>} when the dialog window closes.
 */
export const openProjectDialog = async (setProject, setElements) => {
    try {
        const filePath = await dialog.open({
            title: "Open Project",
            multiple: false,
            filters: [{name: 'JSON Files', extensions: ['json']}]
        });
        if (filePath) {
            const content = await readFile(filePath);
            let readProject = JSON.parse(content);
            setElements(readProject.elements);
            readProject.elements = undefined;
            setProject(readProject);
        } else {
            console.log('No file selected or operation cancelled.');
        }
    } catch (error) {
        console.error('Error during open project dialog: ', error);
    }
}


/**
 * Opens the "save project as"-dialog window.
 */
export const saveProjectDialog = async (project, setProject, elements) => {
    try {
        const filePath = await dialog.save({
            title: 'Save Project As',
            filters: [{name: 'JSON Files', extensions: ['json']}]
        });
        if (filePath) {
            let newProject = {
                ...project,
                // get the project name from the file path.
                name: filePath.replace(/^.*[\\/](.*?)\.[^.]+$/, '$1')
            };
            setProject(newProject);
            newProject = {...newProject, elements: elements}
            await saveToFile(JSON.stringify(newProject), filePath);
        } else {
            console.log('No file selected or operation cancelled.');
        }
    } catch (error) {
        console.error('Error during file save dialog: ', error);
    }
};