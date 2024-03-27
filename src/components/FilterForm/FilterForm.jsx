import "./FilterForm.css";

const FilterForm = ({ label, min, max, step, value, setValue, id }) => {
	return (
		<div className="form-group" id={id}>
			<p>{label}:</p>
			<input
                className="input-slide-form"
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => setValue(e.target.value, true)}
				onMouseDown={(e) => setValue(e.target.value, false)}
			/>
			<input
				className="input-number-form"
				type="number"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => setValue(e.target.value, false)}
			/>
			<button
				className="resetButton"
				onClick={() => setValue(0, false)}
			>Reset</button>
		</div>
	);
}

export default FilterForm;
