import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Canvas from "./pages/Canvas/Canvas";
import LandingPage from "./pages/LandingPage/LandingPage";
import "./App.css";
import {ProjectContextProvider} from "./contexts/ProjectContext";
import {ElementContextProvider} from "./contexts/ElementContext";
import {WindowModalOpenContextProvider} from "./contexts/WindowModalOpenContext";

const App = () => {
	return (
		<ProjectContextProvider>
			<ElementContextProvider>
				<WindowModalOpenContextProvider>
					<BrowserRouter>
						<Routes>
							<Route path="/" element={<LandingPage />} />
							<Route path="/canvas" element={<Canvas />} />
						</Routes>
					</BrowserRouter>
				</WindowModalOpenContextProvider>
			</ElementContextProvider>
		</ProjectContextProvider>
	);
};

export default App;
