import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Canvas from "./pages/Canvas/Canvas";
import LandingPage from "./pages/LandingPage/LandingPage";
import "./App.css";

const App = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/canvas" element={<Canvas />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
