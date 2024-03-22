import React from "react";
import "./FilterForm.css";

const FilterForm = ({ label, min, max, step, value, setValue }) => {
	const [sliderValue, setSliderValue] = React.useState(0);

	const handleReset = () => {
		setValue(0);
		setSliderValue(0);
	}

	const handleSliderChange = (e) => {
		console.log(e.target.value);
		setSliderValue(parseFloat(e.target.value));
	}

	const handleSliderEnd = () => {
		console.log('Slider has ended');
		setValue(sliderValue);
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
				value={sliderValue}
				onChange={handleSliderChange}
				onMouseUp={handleSliderEnd}
			/>
			<input
				className="input-number-form"
				type="number"
				min={min}
				max={max}
				size={3}
				step={step}
				value={sliderValue}
				onChange={handleSliderChange}
				onMouseUp={handleSliderEnd}
			/>
			<button
				onClick={handleReset}
				className={"resetButton"}
			>Reset</button>
		</div>
	);
}

export default FilterForm;
