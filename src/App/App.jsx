import React from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Canvas from "../pages/Canvas/Canvas";
import LandingPage from "../pages/LandingPage/LandingPage";
import {ProjectContextProvider} from "../contexts/ProjectContext";
import {ElementContextProvider} from "../contexts/ElementContext";
import "./App.css";

/**
 * The application component.
 * @return {JSX.Element} the application component.
 * @constructor
 */
const App = () => {
    return (
        <ProjectContextProvider>
            <ElementContextProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<LandingPage/>}/>
                        <Route path="/canvas" element={<Canvas/>}/>
                    </Routes>
                </BrowserRouter>
            </ElementContextProvider>
        </ProjectContextProvider>
    );
};

export default App;
