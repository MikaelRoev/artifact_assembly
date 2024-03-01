import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Canvas from "./pages/Canvas/Canvas";
import LandingPage from "./pages/LandingPage/LandingPage";
import "./App.css";
import {ProjectProvider} from "./components/ProjectProvider";

const App = () => {
	return (
		<ProjectProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<LandingPage />} />
					<Route path="/canvas" element={<Canvas />} />
				</Routes>
			</BrowserRouter>
		</ProjectProvider>
	);
};

export default App;
