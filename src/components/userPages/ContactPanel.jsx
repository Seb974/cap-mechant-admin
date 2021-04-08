import React from 'react';
import Field from '../forms/Field';

const ContactPanel = ({ user, phone, onUserChange, onPhoneChange, errors }) => {

    const handleChange = ({ currentTarget }) => {
        onPhoneChange(currentTarget.value);
    };

    const handleUserChange = ({ currentTarget }) => {
        onUserChange({...user, [currentTarget.name]: currentTarget.value});
    };

    return (
        <>
            <div className="row"><h4>Contact</h4></div>
            <div className="row mb-3">
                <div className="col-md-12">
                    <Field 
                        name="name"
                        label=" "
                        value={ user.name }
                        onChange={ handleUserChange }
                        placeholder="Nom"
                        error={ errors.name }
                    />
                </div>
            </div>
            <div className="row mb-5">
                <div className="col-md-6">
                    <Field 
                        name="email"
                        type="email"
                        label=" "
                        value={ user.email }
                        onChange={ handleUserChange }
                        placeholder="Adresse email"
                        error={ errors.email }
                    />
                </div>
                <div className="col-md-6">
                    <Field 
                        type="tel"
                        name="phone"
                        label=" "
                        value={ phone }
                        onChange={ handleChange }
                        placeholder="N° de téléphone"
                        error={ errors.phone }
                    />
                </div>
            </div>
        </>
    );
}
 
export default ContactPanel;