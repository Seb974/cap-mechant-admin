import React from 'react';
import { CFormGroup, CInput, CInvalidFeedback, CLabel, CValidFeedback } from '@coreui/react';

const Field = ({ name, value, onChange, label = "", placeholder = "", type = "text", error = "", id = "", autocomplete="", disabled=false, required=false, valid=false, maxLength=255 }) => {
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
                maxLength={ maxLength }
            />
            <CValidFeedback>Cool! Input is valid</CValidFeedback>
            <CInvalidFeedback>{ error }</CInvalidFeedback>
        
        </CFormGroup>
    );
}
 
export default Field;