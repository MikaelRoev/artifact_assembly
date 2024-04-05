import React from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
import App from "./App";

/**
 * The root of the application.
 * @type {Root}
 */
const Root = createRoot(document.getElementById("Root"));
Root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);
