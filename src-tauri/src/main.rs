use tokio::fs::File;
use tokio::io::AsyncWriteExt;
use tokio::io::AsyncReadExt;
use tauri::InvokeError;

#[cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

/*
Saves a contents  to a file at a file path.
content - contents of the file.
file_path - path to the file including filename and file type.
*/
#[tauri::command]
async fn save_file(content: String, file_path: String) -> Result<(), InvokeError> {
    let mut file = File::create(&file_path).await
        .map_err(|err| InvokeError::from(format!("Failed to create file: {}", err)))?;

    file.write_all(content.as_bytes()).await
        .map_err(|err| InvokeError::from(format!("Failed to write to file: {}", err)))?;

    Ok(())
}

/*
Reads contents form a file at a file path.
file_path - path to the file to be read.
*/
#[tauri::command]
async fn read_file(file_path: String) -> Result<String, InvokeError> {
    let mut file = File::open(&file_path).await
        .map_err(|err| InvokeError::from(format!("Failed to open file: {}", err)))?;

    let mut contents = String::new();
    file.read_to_string(&mut contents).await
        .map_err(|err| InvokeError::from(format!("Failed to read file: {}", err)))?;

    Ok(contents)
}

/*w
The main function that runs the tauri application.
*/
fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![save_file, read_file])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
