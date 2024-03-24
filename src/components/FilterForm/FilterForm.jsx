import "./FilterForm.css";

const FilterForm = ({ label, min, max, step, value, setValue }) => {
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
				onChange={(e) => setValue(parseFloat(e.target.value), true)}
				onMouseDown={(e) => setValue(parseFloat(e.target.value), false)}
			/>
			<input
				className="input-number-form"
				type="number"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => setValue(parseFloat(e.target.value), false)}
			/>
			<button
				onClick={() => setValue(0, false)}
				className={"resetButton"}
			>Reset</button>
		</div>
	);
}

export default FilterForm;
