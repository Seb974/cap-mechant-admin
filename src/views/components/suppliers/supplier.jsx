import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import SupplierActions from 'src/services/SupplierActions';
import SellerActions from '../../../services/SellerActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInputFile, CInputGroup, CInputGroupAppend, CInputGroupText, CInvalidFeedback, CLabel, CRow, CSelect, CSwitch, CTextarea } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Select from 'src/components/forms/Select';


const Supplier = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [isAdmin, setIsAdmin] = useState(false);
    const [editing, setEditing] = useState(false);
    const { currentUser } = useContext(AuthContext);
    const [supplier, setSupplier] = useState({ name: "", seller: null, emails: [], phone: "", isIntern: false, vifCode: "" });
    const [sellers, setSellers] = useState([]);
    const [errors, setErrors] = useState({ name: "", seller: "", emails: "", phone: "", isIntern: "", vifCode: "" });

    useEffect(() => {
        fetchSellers();
        fetchSupplier(id);
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
    }, []);

    useEffect(() => fetchSupplier(id), [id]);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        if (!isDefined(supplier.seller) && isDefinedAndNotVoid(sellers)) {
            setSupplier({...supplier, seller: sellers[0]});
        }
    }, [sellers, supplier]);

    const handleChange = ({ currentTarget }) => setSupplier({...supplier, [currentTarget.name]: currentTarget.value});

    const fetchSupplier = id => {
        if (id !== "new") {
            setEditing(true);
            SupplierActions.find(id)
                .then(response => setSupplier(response))
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/suppliers");
                });
        }
    };

    const fetchSellers = () => {
        SellerActions.findAll()
            .then(response => setSellers(response))
            .catch(error => console.log(error));
    };

    const handleSellerChange = ({ currentTarget }) => {
        const newSeller = sellers.find(seller => seller.id === parseInt(currentTarget.value));
        setSupplier({...supplier, seller: newSeller });
    };

    const handleIsIntern = () => setSupplier({...supplier, isIntern: !supplier.isIntern});

    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedSupplier = {...supplier, seller: supplier.seller['@id'], vifCode: !supplier.isIntern ? null : supplier.vifCode};
        const request = !editing ? SupplierActions.create(formattedSupplier) : SupplierActions.update(id, formattedSupplier);
        request.then(response => {
                    setErrors({ name: "", seller: "", emails: "", phone: "", isIntern: "", vifCode: "" });
                    //TODO : Flash notification de succès
                    history.replace("/components/suppliers");
                })
               .catch( error => {
                    const { response } = error;
                    if (isDefined(response)) {
                        const { violations } = response.data;
                        if (violations) {
                            const apiErrors = {};
                            violations.forEach(({propertyPath, message}) => {
                                apiErrors[propertyPath] = message;
                            });
                            setErrors(apiErrors);
                        }
                        //TODO : Flash notification d'erreur
                    } else 
                        console.log(error);
               });
    }

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer un fournisseur" : "Modifier le fournisseur \"" + supplier.name + "\"" }</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nom</CLabel>
                                        <CInput
                                            id="name"
                                            name="name"
                                            value={ supplier.name }
                                            onChange={ handleChange }
                                            placeholder="Nom du fournisseur"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                { isAdmin ? 
                                    isDefined(supplier.seller) && 
                                        <CCol xs="12" sm="6">
                                            <Select name="seller" label="Vendeur" value={ supplier.seller.id } onChange={ handleSellerChange }>
                                                { sellers.map(seller => <option key={seller.id} value={ seller.id }>{ seller.name }</option>) }
                                            </Select>
                                        </CCol>
                                    :
                                    <CCol xs="12" md="6" className="mt-4">
                                        <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                            <CCol xs="3" sm="2" md="3">
                                                <CSwitch name="isIntern" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ supplier.isIntern } onChange={ handleIsIntern }/>
                                            </CCol>
                                            <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Fournisseur interne</CCol>
                                        </CFormGroup>
                                    </CCol>
                                }
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="emails">Emails</CLabel>
                                        <CInput
                                            id="emails"
                                            name="emails"
                                            value={ isDefined(supplier.emails) ? supplier.emails.join(', ') : "" }
                                            onChange={ handleChange }
                                            placeholder="Emails du fournisseur"
                                            invalid={ errors.emails.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.emails }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="phone">Portable</CLabel>
                                        <CInput
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={ supplier.phone }
                                            onChange={ handleChange }
                                            placeholder="Portable du fournisseur"
                                            invalid={ errors.phone.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.phone }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                                <CRow>
                                    { isAdmin &&
                                        <CCol xs="12" md="6" className="mt-4">
                                            <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                                <CCol xs="3" sm="2" md="3">
                                                    <CSwitch name="isIntern" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ supplier.isIntern } onChange={ handleIsIntern }/>
                                                </CCol>
                                                <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Fournisseur interne</CCol>
                                            </CFormGroup>
                                        </CCol>
                                    }
                                    {supplier.isIntern && 
                                        <CCol xs="12" sm="6">
                                            <CFormGroup>
                                                <CLabel htmlFor="name">Code VIF</CLabel>
                                                <CInput
                                                    id="vifCode"
                                                    name="vifCode"
                                                    value={ supplier.vifCode }
                                                    onChange={ handleChange }
                                                    placeholder="Code site VIF"
                                                    invalid={ errors.vifCode.length > 0 } 
                                                />
                                                <CInvalidFeedback>{ errors.vifCode }</CInvalidFeedback>
                                            </CFormGroup>
                                        </CCol>
                                    }
                                </CRow>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/suppliers" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Supplier;