import React from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Canvas from "../pages/Canvas/Canvas";
import LandingPage from "../pages/LandingPage/LandingPage";
import {ProjectContextProvider} from "../contexts/ProjectContext";
import "./App.css";

/**
 * The application component.
 * @return {JSX.Element} the application component.
 * @constructor
 */
const App = () => {
    return (
        <ProjectContextProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage/>}/>
                    <Route path="/canvas" element={<Canvas/>}/>
                </Routes>
            </BrowserRouter>
        </ProjectContextProvider>
    );
};

export default App;
