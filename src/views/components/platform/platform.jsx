import CIcon from '@coreui/icons-react';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInputGroupAppend, CInputGroupText, CInvalidFeedback, CLabel, CRow, CSwitch } from '@coreui/react';
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserSearchMultiple from 'src/components/forms/UserSearchMultiple';
import AddressPanel from 'src/components/userPages/AddressPanel';
import Roles from 'src/config/Roles';
import AuthContext from 'src/contexts/AuthContext';
import { getFloat, getInt, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import PlatformActions from 'src/services/PlatformActions';

const Platform = ({ history, match }) => {

    const { id = "new" } = match.params;
    const { currentUser } = useContext(AuthContext);
    const initialPosition = AddressPanel.getInitialInformations();
    const initialInformations = {...initialPosition};
    const [platform, setPlatform] = useState({name: ""});
    const initialErrors = {name: "", ...initialInformations};
    const [informations, setInformations] = useState(initialInformations);
    const [errors, setErrors] = useState(initialErrors);
    const [pickers, setPickers] = useState([]);
    const [isAdmin, setIsAdmin] = useState([]);
    
    useEffect(() => {
        fetchPlatform();
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
    }, []);

    useEffect(() => {
        fetchPlatform();
    }, [id]);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    
    const handleChange = ({ currentTarget }) => setPlatform({...platform, [currentTarget.name]: currentTarget.value});
    const handleInformationChange = ({ currentTarget }) => setInformations({...informations, [currentTarget.name]: currentTarget.value});

    const fetchPlatform = () => {
        PlatformActions
            .find()
            .then(response => {
                if (isDefined(response)) {
                    const {metas, pickers, ...mainPlatform} = response;
                    setPlatform(mainPlatform);
                    if (isDefinedAndNotVoid(metas))
                        setInformations(metas);
                    if (isDefinedAndNotVoid(pickers))
                        setPickers(pickers);
                }
            })
            .catch(error => {
                console.log(error);
                // TODO : Notification flash d'une erreur
                history.replace("/dashboard");
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const platformToWrite = getPlatformToWrite();
        console.log(platformToWrite);
        const request = !isDefined(platform['@id']) ? PlatformActions.create(platformToWrite) : PlatformActions.update(platform.id, platformToWrite);
        request.then(response => {
                    setErrors(initialErrors);
                    //TODO : Flash notification de succès
                    // history.replace("#");
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

    const getPlatformToWrite = () => {
        return {
            ...platform,
            metas: {...informations},
            pickers: pickers.map(picker => picker['@id'])
        };
    };

    return !isDefined(platform) ? <></> : (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>Modifiez vos informations</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nom</CLabel>
                                        <CInput
                                            id="name"
                                            name="name"
                                            value={ platform.name }
                                            onChange={ handleChange }
                                            placeholder="Nom de l'établissement"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="phone">N° Téléphone</CLabel>
                                        <CInput
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={ informations.phone }
                                            onChange={ handleInformationChange }
                                            placeholder="N° de téléphone"
                                            invalid={ errors.phone.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.phone }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <AddressPanel informations={ informations } setInformations={ setInformations } errors={ errors } />
                            <UserSearchMultiple users={ pickers } setUsers={ setPickers }/>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/dashboard" className="btn btn-link">Retour à l'acccueil</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Platform;