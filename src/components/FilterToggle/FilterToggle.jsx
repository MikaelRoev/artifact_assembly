import "./FilterToggle.css"

function FilterToggle() {
    return (
        <label className="switch">
            <input type="checkbox"/>
            <span className="slider"/>
        </label>
    );
}

export default FilterToggle;