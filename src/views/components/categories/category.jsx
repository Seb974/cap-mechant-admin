import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoryActions from 'src/services/CategoryActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInputFile, CInputGroup, CInputGroupAppend, CInputGroupText, CInvalidFeedback, CLabel, CRow, CSelect, CSwitch, CTextarea } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import Roles from 'src/config/Roles';


const CategoryPage = ({ match, history }) => {

    const { id = "new" } = match.params;
    const userRoles = Roles.getRoles();
    const [editing, setEditing] = useState(false);
    const [category, setCategory] = useState({ name: "", userGroups: userRoles });
    const [errors, setErrors] = useState({ name: "", userGroups: "" });

    useEffect(() => fetchCategory(id), []);
    useEffect(() => fetchCategory(id), [id]);

    const handleUsersChange = userGroups => setCategory(category => ({...category, userGroups}));
    const handleChange = ({ currentTarget }) => setCategory({...category, [currentTarget.name]: currentTarget.value});

    const fetchCategory = id => {
        if (id !== "new") {
            setEditing(true);
            CategoryActions.find(id)
                .then( response => setCategory({...response, userGroups: Roles.getSelectedRoles(response.userGroups)}) )
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/categories");
                });
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const request = !editing ? 
            CategoryActions.create({...category, userGroups: category.userGroups.map(group => group.value)}) : 
            CategoryActions.update(id, {...category, userGroups: category.userGroups.map(group => group.value)});

        request.then(response => {
                    setErrors({name: ""});
                    //TODO : Flash notification de succès
                    history.replace("/components/categories");
                })
               .catch( ({ response }) => {
                    const { violations } = response.data;
                    if (violations) {
                        const apiErrors = {};
                        violations.forEach(({propertyPath, message}) => {
                            apiErrors[propertyPath] = message;
                        });
                        setErrors(apiErrors);
                    }
                    //TODO : Flash notification d'erreur
               });
    }

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer une catégorie" : "Modifier la catégorie" + category.name }</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="12">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nom</CLabel>
                                        <CInput
                                            id="name"
                                            name="name"
                                            value={ category.name }
                                            onChange={ handleChange }
                                            placeholder="Nom de la catégorie"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12">
                                    <SelectMultiple name="userGroups" label="Pour les utilisateurs" value={ category.userGroups } error={ errors.userGroups } onChange={ handleUsersChange } data={ userRoles }/>
                                </CCol>
                            </CRow>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/categories" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default CategoryPage;