import React from 'react';
import { CFormGroup, CInput, CInvalidFeedback, CLabel, CValidFeedback } from '@coreui/react';

const Field = ({ name, label, value, onChange, placeholder = "", type = "text", error = "", id = "", autocomplete="", disabled=false, required=false, valid=false }) => {
    return (
        <CFormGroup>
            <CLabel htmlFor={ name }>{ label }</CLabel>
            <CInput 
                name={ name }
                type={ type }
                id={ id || name }
                value={ value }
                autoComplete={ autocomplete }
                placeholder={ placeholder || label }
                required={ required }
                disabled={ disabled }
                invalid={ error.length > 0 }
                valid={ valid }
                onChange={ onChange }
            />
            <CValidFeedback>Cool! Input is valid</CValidFeedback>
            <CInvalidFeedback>{ error }</CInvalidFeedback>
        
        </CFormGroup>
    );
}
 
export default Field;