import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AddressPanel from 'src/components/userPages/AddressPanel';
import AdminSection from 'src/components/userPages/AdminSection';
import ContactPanel from 'src/components/userPages/ContactPanel';
import AuthContext from 'src/contexts/AuthContext';
import UserActions from 'src/services/UserActions';
import Roles from 'src/config/Roles';

const UserPage = ({ history, match }) => {

    const { id = "new" } = match.params;
    const { currentUser } = useContext(AuthContext);
    const initialInformations =  AddressPanel.getInitialInformations();
    const [editing, setEditing] = useState(false);
    const [user, setUser] = useState({name:"", email: "", password: "", confirmPassword: "", roles: "ROLE_USER"});
    const [informations, setInformations] = useState(initialInformations);
    const [errors, setErrors] = useState({name:"", email: "", password: "", confirmPassword: "", phone: "", address: "", address2: "", zipcode: "", city: "", position: "", roles: ""});

    useEffect(() => fetchUser(id), []);
    useEffect(() => fetchUser(id), [id]);

    const fetchUser = async id => {
        if (id !== undefined && id !== "new") {
            setEditing(true);
            try {
                const newUser = await UserActions.find(id);
                setUser(user => {
                    return {...newUser,
                                roles: newUser.roles === null || newUser.roles === undefined || newUser.roles.length === 0 ? Roles.getDefaultRole() : Roles.filterRoles(newUser.roles),
                                password: user.password,
                                confirmPassword: user.confirmPassword
                            };
                    });
                if (newUser.metas !== null && newUser.metas !== undefined) {
                    let userMetas = {...informations};
                    Object.entries(newUser.metas).forEach(([key, value]) => {
                        if (key !== 'position')
                            userMetas = {...userMetas, [key]: (value !== null && value !== undefined) ? value : initialInformations[key]}
                        else
                            userMetas = {...userMetas, position: value !== null && value !== undefined && value > 0 ? value : initialInformations.position}
                    });
                    setInformations(userMetas);
                }
            } catch (error) {
                console.log(error.response);
                // TODO : Notification flash d'une erreur
                history.replace("/users");
            }
        }
    };

    const onInformationsChange = (newInformations) => setInformations(newInformations);
    const onUserInputChange = (newUser) => setUser(newUser);

    const onUpdatePosition = (newInformations) => {
        setInformations(informations => { 
            return {...newInformations, address2: informations.address2, phone: informations.phone};
        });
    };

    const onPhoneChange = (phone) => {
        setInformations(informations => { 
            return {...informations, phone}
        });
    };

    const getFormattedUser = () => {
        let updatedUser = {};
        const { name, email, password, confirmPassword, metas, roles } = user;
        if (password.length > 0 || confirmPassword.length > 0) {
            if (password !== confirmPassword) {
                setErrors({...errors, confirmPassword: "Les mots de passe saisis ne correspondent pas."});
                return null;
            } else {
                updatedUser = {...updatedUser, password};
            }
        } else if (!editing) {
            setErrors({...errors, password: "Un mot de passe est obligatoire."});
            return null;
        }
        return {...updatedUser, name, email,
                    metas: metas === null || metas === undefined || metas.id === null || metas.id === undefined ? informations : {...informations, id: metas.id},
                    roles: Array.isArray(roles) ? roles : [roles],
        };
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let apiErrors = {};
        const updatedUser = getFormattedUser();
        if (updatedUser !== null) {
            const request = !editing ? UserActions.create(updatedUser) : UserActions.update(id, updatedUser);
            request.then(response => {
                        setErrors({});
                        //TODO : Flash notification de succès
                        history.replace("/users");
                    })
                   .catch( ({ response }) => {
                        const { violations } = response.data;
                        if (violations) {
                            violations.forEach(({propertyPath, message}) => {
                                apiErrors[propertyPath] = message;
                            });
                            setErrors(apiErrors);
                        }
                         //TODO : Flash notification d'erreur
                   });
        }
    };

    return (
        <div className="container">
            <div className="row mb-3"><h2>{!editing ? "Créer un utilisateur" : "Modifier l'utilisateur '" + user.name + "'"}</h2></div>
            <form onSubmit={ handleSubmit }>
                <ContactPanel user={ user } phone={ informations.phone } onUserChange={ onUserInputChange } onPhoneChange={ onPhoneChange } errors={ errors }/>
                { Roles.hasAllPrivileges(currentUser) && <AdminSection user={ user } onUserChange={ onUserInputChange } errors={ errors } /> }
                <hr/>
                <div className="row"><h4>Adresse</h4></div>
                <AddressPanel informations={ informations } onInformationsChange={ onInformationsChange } onPositionChange={ onUpdatePosition } errors={ errors }/>
                <div className="form-group text-center">
                    <button type="submit" className="btn btn-success mb-2">Enregistrer</button>
                </div>
            </form>
            <div className="row mb-5">
                <Link to="/components/users" className="btn btn-link">Retour à la liste</Link>
            </div>
        </div>
    );
}

export default UserPage;