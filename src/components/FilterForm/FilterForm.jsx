import React from "react";
import "./FilterForm.css";

const FilterForm = ({ label, min, max, step, value, onChange }) => (
	<>
		<p>{label}:</p>
		<input
			type="range"
			min={min}
			max={max}
			step={step}
			value={value}
			onChange={onChange}
		/>
		<input
			className="input-number-form"
			type="number"
			min={min}
			max={max}
			size={3}
			step={step}
			value={value}
			onChange={onChange}
		/>
	</>
);

export default FilterForm;
