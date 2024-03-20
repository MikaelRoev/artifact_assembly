import React from "react";
import "./FilterForm.css";

const FilterForm = ({ label, min, max, step, value, setValue, onChange }) => {
	const handleReset = () => {
		setValue(0);
		onChange(0);
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
				onChange={(e) => onChange(Number(e.target.value))}
			/>
			<input
				className="input-number-form"
				type="number"
				min={min}
				max={max}
				size={3}
				step={step}
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
			/>
			<p onClick={handleReset}>Reset</p>
		</>
	);
}

export default FilterForm;
