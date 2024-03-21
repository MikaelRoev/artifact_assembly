import React from "react";
import "./FilterForm.css";

const FilterForm = ({ label, min, max, step, value, setValue }) => {
	const handleReset = () => {
		setValue(0);
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
				onChange={(e) => setValue(parseFloat(e.target.value))}
			/>
			<input
				className="input-number-form"
				type="number"
				min={min}
				max={max}
				size={3}
				step={step}
				value={value}
				onChange={(e) => setValue(parseFloat(e.target.value))}
			/>
			<button
				onClick={handleReset}
				className={"resetButton"}
			>Reset</button>
		</div>
	);
}

export default FilterForm;
