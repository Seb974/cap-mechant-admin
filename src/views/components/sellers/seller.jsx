import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import SellerActions from 'src/services/SellerActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CInputGroupText, CInputGroupAppend, CInputGroup, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getDateFrom, getFloat, getHourFrom, getInt, isDefinedAndNotVoid } from 'src/helpers/utils';
import '../../../assets/css/searchBar.css';
import UserSearchMultiple from 'src/components/forms/UserSearchMultiple';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';

const Seller = ({ match, history }) => {

    const { id = "new" } = match.params;
    const { currentUser } = useContext(AuthContext);
    const [editing, setEditing] = useState(false);
    const defaultSeller = {name: "", delay: "", ownerRate: "", needsRecovery: "", recoveryDelay: "", delayInDays: ""};
    const [seller, setSeller] = useState({...defaultSeller, needsRecovery: false, delayInDays: true });
    const [errors, setErrors] = useState(defaultSeller);
    const [users, setUsers] = useState([]);
    const [isAdmin, setIsAdmin] = useState([]);
    
    useEffect(() => {
        fetchSeller(id);
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
    }, []);

    useEffect(() => fetchSeller(id), [id]);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    
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

    const handleRecovery = ({ currentTarget }) => setSeller({...seller, needsRecovery: !seller.needsRecovery});
    const handleDelayType = ({ currentTarget }) => setSeller({...seller, delayInDays: !seller.delayInDays});

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!seller.needsRecovery || (seller.needsRecovery && delaysConsistency())) {
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
        } else {
            setErrors({...errors, delay: "Le délai de préparation ne peut être inférieur au délai de récupération"});
        }
    };

    const delaysConsistency = () => {
        const today = new Date();
        const preparationDelay = getDelayFromDays(today, seller.delay);
        const recovery = seller.delayInDays ? 
            getDelayFromDays(today, parseInt(seller.recoveryDelay)) :
            getDelayFromMinutes(today, parseInt(seller.recoveryDelay));
        return recovery.getTime() <= preparationDelay.getTime();
    };

    const getDelayFromDays = (today, days) => {
        return new Date(today.getFullYear(), today.getMonth(), (today.getDate() + parseInt(days)), 9, 0, 0);
    };

    const getDelayFromMinutes = (today, minutes) => {
        const days = Math.floor(minutes / 60) >= 24 ? Math.floor( Math.floor(minutes / 60) / 24) : 0;
        const hours = days > 0 ? Math.floor((minutes - days * 24 * 60)/ 60) : Math.floor(minutes / 60);
        const trueMinutes = minutes % 60;
        return new Date(today.getFullYear(), today.getMonth(), (today.getDate() + days), (9 + hours), trueMinutes, 0);
    };

    const getSellerToWrite = () => {
        return {
            ...seller, 
            ownerRate: getFloat(seller.ownerRate),
            delay: getInt(seller.delay),
            recoveryDelay: seller.needsRecovery ? getInt(seller.recoveryDelay) : null,
            users: isDefinedAndNotVoid(users) ? users.map(user => user['@id']) : []
        };
    };

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{ isAdmin ? (id === "new" ? "Créer un vendeur" : "Modifier le vendeur " + seller.name) : "Gérer les administrateurs"}</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nom</CLabel>
                                        <CInput
                                            id="name"
                                            name="name"
                                            value={ seller.name }
                                            onChange={ handleChange }
                                            placeholder="Nom du vendeur"
                                            invalid={ errors.name.length > 0 }
                                            disabled={ !isAdmin }
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                { isAdmin && 
                                    <CCol xs="12" md="6" className="mt-4">
                                        <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                            <CCol xs="3" sm="2" md="3">
                                                <CSwitch name="needsRecovery" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ seller.needsRecovery } onChange={ handleRecovery }/>
                                            </CCol>
                                            <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Récupération des produits</CCol>
                                        </CFormGroup>
                                    </CCol>
                                }
                            </CRow>

                            { isAdmin && seller.needsRecovery &&
                                <CRow className="mt-3">
                                    <CCol xs="12" md="6" className="mt-4">
                                        <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                            <CCol xs="3" sm="2" md="3">
                                                <CSwitch name="delayInDays" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ seller.delayInDays } onChange={ handleDelayType }/>
                                            </CCol>
                                            <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Décalage en jour</CCol>
                                        </CFormGroup>
                                    </CCol>
                                    <CCol xs="12" md="6">
                                        <CFormGroup>
                                            <CLabel htmlFor="name">Délais entre récupération et livraison</CLabel>
                                            <CInputGroup>
                                                <CInput
                                                    id="recoveryDelay"
                                                    name="recoveryDelay"
                                                    type="number"
                                                    value={ seller.recoveryDelay }
                                                    onChange={ handleChange }
                                                    placeholder=" "
                                                    invalid={ errors.recoveryDelay.length > 0 } 
                                                />
                                                <CInputGroupAppend>
                                                    <CInputGroupText>{ seller.delayInDays ? "Jour(s)" : "Minute(s)" }</CInputGroupText>
                                                </CInputGroupAppend>
                                            </CInputGroup>
                                            <CInvalidFeedback>{ errors.recoveryDelay }</CInvalidFeedback>
                                        </CFormGroup>
                                    </CCol>
                                </CRow>
                            }
                            { isAdmin && 
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
                                    <CCol xs="12" md={isAdmin ? "6" : "12"}>
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
                                                <CInvalidFeedback>{ errors.delay }</CInvalidFeedback>
                                            </CInputGroup>
                                        </CFormGroup>
                                    </CCol>
                                </CRow>
                            }
                            <UserSearchMultiple users={ users } setUsers={ setUsers }/>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Seller;