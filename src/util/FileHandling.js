import {invoke} from "@tauri-apps/api/tauri";

/**
 * Saves a string into a file.
 * @param content {Object} to be saved.
 * @param filePath {string} the path to the file including the file name and type.
 */
export async function saveToFile(content, filePath) {
    await invoke("save_file", {filePath: filePath, content: content})
        .catch((error) => console.error("Error when saving to file: ", error));
}

/**
 * Reads the contents of a file.
 * @param filePath {string} of the file including name and type.
 * @return {Promise<String>} Promise resolving to the contents of the file.
 */
export function readFile(filePath) {
    return new Promise((resolve, reject) => {
        invoke("read_file", {filePath: filePath})
            .then((content) => {
                resolve(content);
            })
            .catch((error) => {
                console.error("Error reading from file: ", error);
                reject(error);
            });
    });
}