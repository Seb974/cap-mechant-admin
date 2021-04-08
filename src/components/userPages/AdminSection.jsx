import React, { useState } from 'react';
import Field from '../forms/Field';
import Select from '../forms/Select';
import Roles from '../../config/Roles';

const AdminSection = ({ user, onUserChange, errors}) => {

    const roles = Roles.getRoles();
    const [selectedRole, setSelectedRole] = useState(Roles.getDefaultRole());

    const handleUserChange = ({ currentTarget }) => {
        onUserChange({...user, [currentTarget.name]: currentTarget.value});
    };

    return (
        <>
            <div className="row">
                <div className="col-md-6">
                    <Field
                        name="password"
                        type="password"
                        label="Mot de passe"
                        value={ user.password }
                        error={ errors.password }
                        onChange={ handleUserChange }
                    />
                </div>
                <div className="col-md-6 mb-5">
                    <Field
                        name="confirmPassword"
                        type="password"
                        label="Confirmation"
                        placeholder="Confirmation du mot de passe"
                        value={ user.confirmPassword }
                        error={ errors.confirmPassword }
                        onChange={ handleUserChange }
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <Select name="roles" label="Catégorie d'utilisateur" value={ user.roles } error={ errors.category } onChange={ handleUserChange }>
                        { roles.map( (role, key) => <option key={ key } value={ role.value }>{ role.label }</option> ) }
                    </Select>
                </div>
            </div>
        </>
    );
}
 
export default AdminSection;