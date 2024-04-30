import React from "react";
import "./FilterToggle.css"

/**
 * Component that is a filter toggle.
 * @param label {string} the name of the filter.
 * @param setValue {function(boolean) || function(function():boolean)} the setter function of the filter.
 * @param id {string} the unique id of the filter toggle.
 * @return {JSX.Element} the filter toggle.
 * @constructor
 */
const FilterToggle = ({label, setValue, id}) => {
    // TODO: get and set filter toggle according to value and set value

    return (
        <div
            className="toggle-group"
            id={id}>
            <p>{label}</p>
            <label
                className="switch"
                onMouseDown={() => setValue()}>
                <input type="checkbox" name={"toggleCheckbox"}/>
                <span className="slider rounded"/>
            </label>
        </div>
    );
}

export default FilterToggle;