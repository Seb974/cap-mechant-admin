import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GroupActions from 'src/services/GroupActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput,  CInvalidFeedback, CLabel, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';

const Group = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const [group, setGroup] = useState({ label: ""});
    const [errors, setErrors] = useState({label: ""});

    useEffect(() => fetchGroup(id), []);
    useEffect(() => fetchGroup(id), [id]);

    const handleChange = ({ currentTarget }) => setGroup({...group, [currentTarget.name]: currentTarget.value});

    const fetchGroup = id => {
        if (id !== "new") {
            setEditing(true);
            GroupActions.find(id)
                .then( response => setGroup(response))
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/groups");
                });
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const request = !editing ? GroupActions.create(group) : GroupActions.update(id, group);
        request.then(response => {
                    setErrors({label: ""});
                    //TODO : Flash notification de succès
                    history.replace("/components/groups");
                })
               .catch( ({ response }) => {
                   if (response) {
                       const { violations } = response.data;
                       if (violations) {
                           const apiErrors = {};
                           violations.forEach(({propertyPath, message}) => {
                               apiErrors[propertyPath] = message;
                           });
                           setErrors(apiErrors);
                       }
                       //TODO : Flash notification d'erreur
                   }
               });
    }

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer un groupe d'utilisateur" : "Modifier le groupe" + group.label }</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="12">
                                    <CFormGroup>
                                        <CLabel htmlFor="label">Nom</CLabel>
                                        <CInput
                                            id="label"
                                            name="label"
                                            value={ group.label }
                                            onChange={ handleChange }
                                            placeholder="Nom du groupe"
                                            invalid={ errors.label.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.label }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/groups" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default Group;