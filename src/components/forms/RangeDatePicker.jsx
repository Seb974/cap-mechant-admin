import 'flatpickr/dist/themes/material_blue.css';
import { French } from "flatpickr/dist/l10n/fr.js";
import React from 'react';
import Flatpickr from 'react-flatpickr';

const RangeDatePicker = ({minDate, maxDate, onDateChange, label="Date", className = ""}) => {
    return (
        <>
            <label htmlFor="date" className="date-label">{ label }</label>
            <Flatpickr
                name="date"
                value={ [minDate, maxDate] }
                onChange={ onDateChange }
                className={`form-control ${ className }`}
                options={{
                    mode: "range",
                    dateFormat: "d/m/Y",
                    locale: French,
                }}
            />
        </>
    );
}
 
export default RangeDatePicker;