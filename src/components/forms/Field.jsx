import React from 'react';

const Field = ({ name, label, value, onChange, placeholder = "", type = "text", error = "", required = false, id = "", boots="", disabled=false }) => {
    return (
        <div className={"form-group " + boots }>
            <label htmlFor={ name }>{ label }</label>
            <input
                type={ type }
                value={ value }
                onChange={ onChange }
                className={"form-control" + (error && " is-invalid")}
                placeholder={ placeholder || label }
                name={ name }
                id={ id || name }
                required={ required }
                disabled={ disabled }
            />
            { error && <p className="invalid-feedback">{ error }</p> }
        </div>
    );
}
 
export default Field;