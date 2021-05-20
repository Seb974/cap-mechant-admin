import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SellerActions from 'src/services/SellerActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CInputGroupText, CInputGroupAppend, CInputGroup } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getFloat, getInt, isDefinedAndNotVoid } from 'src/helpers/utils';
import '../../../assets/css/searchBar.css';
import UserSearchMultiple from 'src/components/forms/UserSearchMultiple';

const Seller = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const defaultSeller = {name: "", delay: "", ownerRate: ""};
    const [seller, setSeller] = useState({...defaultSeller });
    const [errors, setErrors] = useState(defaultSeller);
    const [users, setUsers] = useState([]);

    useEffect(() => fetchSeller(id), []);
    useEffect(() => fetchSeller(id), [id]);

    const handleChange = ({ currentTarget }) => setSeller({...seller, [currentTarget.name]: currentTarget.value});

    const fetchSeller = id => {
        if (id !== "new") {
            setEditing(true);
            SellerActions.find(id)
                .then(response => {
                    setSeller(response);
                    if (isDefinedAndNotVoid(response.users))
                        setUsers(response.users);
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/sellers");
                });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const sellerToWrite = getSellerToWrite();
        const request = !editing ? SellerActions.create(sellerToWrite) : SellerActions.update(id, sellerToWrite);
        request.then(response => {
                    setErrors(defaultSeller);
                    //TODO : Flash notification de succès
                    history.replace("/components/sellers");
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

    const getSellerToWrite = () => {
        return {
            ...seller, 
            ownerRate: getFloat(seller.ownerRate),
            delay: getInt(seller.delay),
            users: users.map(user => user['@id'])
        };
    };

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>Créer un vendeur</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="12" md="12">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nom</CLabel>
                                        <CInput
                                            id="name"
                                            name="name"
                                            value={ seller.name }
                                            onChange={ handleChange }
                                            placeholder="Nom du vendeur"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>

                            <CRow className="mt-4">
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Rétribution sur vente</CLabel>
                                        <CInputGroup>
                                            <CInput
                                                id="ownerRate"
                                                name="ownerRate"
                                                type="number"
                                                value={ seller.ownerRate }
                                                onChange={ handleChange }
                                                placeholder="Marge par vente"
                                                invalid={ errors.ownerRate.length > 0 } 
                                            />
                                            <CInputGroupAppend>
                                                <CInputGroupText>%</CInputGroupText>
                                            </CInputGroupAppend>
                                        </CInputGroup>
                                        <CInvalidFeedback>{ errors.ownerRate }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" md="6">
                                <CFormGroup>
                                        <CLabel htmlFor="name">Délais entre réception et livraison</CLabel>
                                        <CInputGroup>
                                            <CInput
                                                id="delay"
                                                name="delay"
                                                type="number"
                                                value={ seller.delay }
                                                onChange={ handleChange }
                                                placeholder=" "
                                                invalid={ errors.delay.length > 0 } 
                                            />
                                            <CInputGroupAppend>
                                                <CInputGroupText>Jour(s)</CInputGroupText>
                                            </CInputGroupAppend>
                                        </CInputGroup>
                                        <CInvalidFeedback>{ errors.delay }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <UserSearchMultiple users={ users } setUsers={ setUsers }/>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/sellers" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Seller;