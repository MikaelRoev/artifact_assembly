import React from "react";
import "./FilterForm.css";

const FilterForm = ({ label, min, max, step, value, setValue, onStart, onReset }) => {

	const handleSliderChange = (e) => {
		setValue(parseFloat(e.target.value));
	}

	return (
		<div className={"form-group"}>
			<p>{label}:</p>
			<input
                className={"input-slide-form"}
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={handleSliderChange}
				onMouseDown={onStart}
			/>
			<input
				className="input-number-form"
				type="number"
				min={min}
				max={max}
				size={3}
				step={step}
				value={value}
				onChange={handleSliderChange}
				onMouseDown={onStart}
			/>
			<button
				onClick={onReset}
				className={"resetButton"}
			>Reset</button>
		</div>
	);
}

export default FilterForm;
