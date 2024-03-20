import React from "react";
import "./FilterForm.css";

const FilterForm = ({ label, min, max, step, value, setValue, onValueChange }) => {
	const handleReset = () => {
		setValue(0);
		onValueChange(0);
	}

	return (
		<>
			<p>{label}:</p>
			<input
                className={"input-slide-form"}
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onValueChange(Number(e.target.value))}
			/>
			<input
				className="input-number-form"
				type="number"
				min={min}
				max={max}
				size={3}
				step={step}
				value={value}
				onChange={(e) => onValueChange(Number(e.target.value))}
			/>
			<button onClick={handleReset}>Reset</button>
		</>
	);
}

export default FilterForm;
