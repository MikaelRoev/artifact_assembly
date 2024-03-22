import "./FilterForm.css";

const FilterForm = ({ label, min, max, step, value, setValue }) => {

	const handleReset = () => {
		setValue(0, false);
	}

	const handleSliderChange = (e) => {
		setValue(parseFloat(e.target.value), true);
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
			/>
			<button
				onClick={handleReset}
				className={"resetButton"}
			>Reset</button>
		</div>
	);
}

export default FilterForm;
