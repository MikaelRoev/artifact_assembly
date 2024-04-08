import React, {useContext} from "react";
import FilterInteractionContext from "../../contexts/FilterInteractionContext";
import "./FilterForm.css";

/**
 * Component that represents a filter form that asks the user for a filter value.
 * This includes a slider and a spin box.
 * @param label {string} the name of the filter.
 * @param min {number} the minimum value the filter can be.
 * @param max {number} the maximum value the filter can be.
 * @param step {number} how big each increment in the slider or spin box is.
 * @param value {number} the current value of the filter.
 * @param setValue {function(string, boolean)} the setter function of the filter value.
 * First parameter is the value as a string.
 * The second parameter:
 *  true - it will overwrite the previous history commit.
 *  false (default) - it will make a new history commit.
 * @param id {string} the unique identification of the filter form.
 * @return {JSX.Element} the filter form.
 * @constructor
 */
const FilterForm = ({label, min, max, step, value, setValue, id}) => {
    const {setIsFilterInteracting} = useContext(FilterInteractionContext);

    return (
        <div className="form-group" id={id}>
            <p>{label}</p>
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
                onFocus={() => setIsFilterInteracting(true)}
                onBlur={() => setIsFilterInteracting(false)}
            />
            <button
                className="resetButton"
                onClick={() => setValue('0', false)}>
                Reset
            </button>
        </div>
    );
}

export default FilterForm;
