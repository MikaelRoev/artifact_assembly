import React from "react";
import {createRoot} from "react-dom/client";
import App from "./App/App";
import "./index.css";

/**
 * The root of the application.
 * @type {Root}
 */
const Root = createRoot(document.getElementById("root"));
Root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);
