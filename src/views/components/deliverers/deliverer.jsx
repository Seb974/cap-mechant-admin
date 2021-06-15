import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import DelivererActions from 'src/services/DelivererActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CInputGroupText, CInputGroupAppend, CInputGroup, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getFloat, getInt, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import '../../../assets/css/searchBar.css';
import UserSearchMultiple from 'src/components/forms/UserSearchMultiple';
import UserSearchSimple from 'src/components/forms/UserSearchSimple';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';

const Deliverer = ({ match, history }) => {

    const { id = "new" } = match.params;
    const { currentUser } = useContext(AuthContext);
    const [editing, setEditing] = useState(false);
    const defaultDeliverer = {name: "", cost: "", isPercent: "", isIntern: ""};
    const [deliverer, setDeliverer] = useState({...defaultDeliverer, isPercent: false, isIntern: false });
    const [errors, setErrors] = useState(defaultDeliverer);
    const [users, setUsers] = useState([]);
    const [isAdmin, setIsAdmin] = useState([]);

    
    useEffect(() => {
        fetchDeliverer(id);
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
    }, []);

    useEffect(() => fetchDeliverer(id), [id]);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    
    const handleChange = ({ currentTarget }) => setDeliverer({...deliverer, [currentTarget.name]: currentTarget.value});
    const handleIsPercent = ({ currentTarget }) => setDeliverer({... deliverer, [currentTarget.name] : !deliverer[currentTarget.name]});
    const handleIsIntern = ({ currentTarget }) => {
        setUsers(!deliverer[currentTarget.name] ? null : []);
        setDeliverer({... deliverer, [currentTarget.name] : !deliverer[currentTarget.name]});
    };

    const fetchDeliverer = id => {
        if (id !== "new") {
            setEditing(true);
            DelivererActions.find(id)
                .then(response => {
                    setDeliverer(response);
                    if (isDefinedAndNotVoid(response.users)) {
                        const dbUsers = response.isIntern ? response.users[0] : response.users;
                        setUsers(dbUsers);
                    } else {
                        const nullUser = response.isIntern ? null : [];
                        setUsers(nullUser);
                    }
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/deliverers");
                });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const delivererToWrite = getDelivererToWrite();
        const request = !editing ? DelivererActions.create(delivererToWrite) : DelivererActions.update(id, delivererToWrite);
        request.then(response => {
                    setErrors(defaultDeliverer);
                    //TODO : Flash notification de succès
                    history.replace("/components/deliverers");
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
    };

    const getDelivererToWrite = () => {
        return {
            ...deliverer, 
            cost: getFloat(deliverer.cost),
            users: isDefinedAndNotVoid(users) ? (!deliverer.isIntern ? users.map(user => user['@id']) : [users['@id']]) : []
        };
    };

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>Créer un livreur</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nom</CLabel>
                                        <CInput
                                            id="name"
                                            name="name"
                                            value={ deliverer.name }
                                            onChange={ handleChange }
                                            placeholder="Nom du livreur"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" md="6" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="isIntern" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ deliverer.isIntern } onChange={ handleIsIntern }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Interne</CCol>
                                    </CFormGroup>
                                </CCol>
                            </CRow>

                            <CRow className="mt-4">
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">{ deliverer.isPercent ? "Pourcentage sur livraison" : "Montant de la livraison" }</CLabel>
                                        <CInputGroup>
                                            <CInput
                                                id="cost"
                                                name="cost"
                                                type="number"
                                                value={ deliverer.cost }
                                                onChange={ handleChange }
                                                placeholder="Remise"
                                                invalid={ errors.cost.length > 0 } 
                                            />
                                            <CInputGroupAppend>
                                                <CInputGroupText>{ deliverer.isPercent ? '%' : '€' }</CInputGroupText>
                                            </CInputGroupAppend>
                                        </CInputGroup>
                                        <CInvalidFeedback>{ errors.cost }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" md="6" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="isPercent" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ deliverer.isPercent } onChange={ handleIsPercent }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Coût en pourcentage</CCol>
                                    </CFormGroup>
                                </CCol>
                            </CRow>

                            { !deliverer.isIntern ? 
                                <UserSearchMultiple users={ users } setUsers={ setUsers }/>
                             : 
                                <>
                                    <hr className="mt-4 mx-2"/>
                                    <UserSearchSimple user={ users } setUser={ setUsers }/>
                                </>
                            }
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/deliverers" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Deliverer;