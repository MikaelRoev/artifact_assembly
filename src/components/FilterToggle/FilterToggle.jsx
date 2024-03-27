import "./FilterToggle.css"

function FilterToggle({ label, setValue, id }) {
    return (
        <div
            className="form-group"
            id={id}>
            <p>{label}</p>
            <label
                className="switch"
                onMouseDown={()=> setValue(value => !value)}>
                <input type="checkbox"/>
                <span className="slider"/>
            </label>
        </div>
    );
}

export default FilterToggle;