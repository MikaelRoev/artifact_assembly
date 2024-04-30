import React from "react";
import "./FilterToggle.css"

/**
 * Component that is a filter toggle.
 * @param label {string} the name of the filter.
 * @param onToggle {function(boolean) || function(function():boolean)} the setter function of the filter.
 * @param id {string} the unique id of the filter toggle.
 * @param isChecked {boolean} whether or not the filter is toggled on.
 * @return {JSX.Element} the filter toggle.
 * @constructor
 */
const FilterToggle = ({label, onToggle, id, isChecked}) => {
    return (
        <div
            className="toggle-group"
            id={id}>
            <p>{label}</p>
            <label
                className="switch"
                onMouseDown={() => onToggle()}>
                <input
                    type="checkbox"
                    name="toggleCheckbox"
                    checked={isChecked}
                />
                <span className="slider rounded"/>
            </label>
        </div>
    );
}

export default FilterToggle;