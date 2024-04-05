import "./FilterToggle.css"

/**
 * Component that is a filter toggle.
 * @param label {string} the name of the filter.
 * @param setValue {function(boolean) || function(function():boolean)} the setter function of the filter.
 * @param id {string} the unique id of the filter toggle.
 * @return {JSX.Element} the filter toggle.
 * @constructor
 */
function FilterToggle({label, setValue, id}) {
    return (
        <div
            className="form-group"
            id={id}>
            <p>{label}</p>
            <label
                className="switch"
                onMouseDown={() => setValue(value => !value)}>
                <input type="checkbox" name={"toggleCheckbox"}/>
                <span className="slider rounded"/>
            </label>
        </div>
    );
}

export default FilterToggle;