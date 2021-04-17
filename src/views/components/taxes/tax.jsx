import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TaxActions from 'src/services/TaxActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInputFile, CInputGroup, CInputGroupAppend, CInputGroupText, CInvalidFeedback, CLabel, CRow, CSelect, CSwitch, CTextarea } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import Roles from 'src/config/Roles';
import StateInput from 'src/components/taxPages/stateInput';

const TaxPage = ({ match, history }) => {

    const { id = "new" } = match.params;
    const defaultRate = {count: 0, id: 0, name: "", rate: 0};
    const [editing, setEditing] = useState(false);
    const [tax, setTax] = useState({ name: "" });
    const [errors, setErrors] = useState({ name: "" });
    const [rates, setRates] = useState([defaultRate]);

    useEffect(() => fetchTax(id), []);
    useEffect(() => fetchTax(id), [id]);

    const handleChange = ({ currentTarget }) => setTax({...tax, [currentTarget.name]: currentTarget.value});
    const handleRateChange = ({ currentTarget }) => {
        let updatedRate = rates.find(rate => parseInt(rate.count) === parseInt(currentTarget.id));
        let filteredRates = rates.filter(rate => parseInt(rate.count) !== parseInt(updatedRate.count));
        setRates([...filteredRates, {...updatedRate, [currentTarget.name]: currentTarget.value}]);
    };

    const fetchTax = id => {
        if (id !== "new") {
            setEditing(true);
            TaxActions.find(id)
                .then( response => {
                    if (response.rates) {
                        let backendRates = response.rates.map( (rate, index) => {
                            return { 
                                count: (index + 1), 
                                id: 0, 
                                name: rate.name, 
                                rate: (parseFloat(rate.value) * 100).toFixed(2)
                            };
                        });
                        setRates(backendRates.length > 0 ? backendRates : rates);
                    }
                    setTax(response);
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/taxes");
                });
        }
    }

    const handleRateAdd = () => setRates([...rates, {...defaultRate, count: rates[rates.length -1].count + 1}]);
    const handleRateDelete = ({ currentTarget }) => setRates(rates.filter(rate => parseInt(rate.count) !== parseInt(currentTarget.name)));

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({...tax, rates: rates.map(rate => ({name: rate.name, value: (parseFloat(rate.rate) / 100).toFixed(3) }))});
        const request = !editing ? 
            TaxActions.create({...tax, rates: rates.map(rate => ({name: rate.name, value: (parseFloat(rate.rate) / 100).toFixed(3) }))}) : 
            TaxActions.update(id, {...tax, rates: rates.map(rate => ({name: rate.name, value: (parseFloat(rate.rate) / 100).toFixed(3) }))});

        request.then(response => {
                    setErrors({name: ""});
                    //TODO : Flash notification de succès
                    history.replace("/components/taxes");
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
                        <h3>{!editing ? "Créer une taxe" : "Modifier la taxe " + tax.name }</h3>
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
                                            value={ tax.name }
                                            onChange={ handleChange }
                                            placeholder="Nom de la taxe"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <hr className="mt-5"/>
                            <CLabel htmlFor="name" className="mb-4">Taux</CLabel>
                            { rates.map( rate => <StateInput key={ rate.count } rate={ rate } handleChange={ handleRateChange } handleDelete={ handleRateDelete }/> ) }
                            <CRow className="mt-4 mr-1 d-flex justify-content-start ml-1">
                                <CButton size="sm" color="warning" onClick={ handleRateAdd }><CIcon name="cil-plus"/> Ajouter un taux</CButton>
                            </CRow>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/taxes" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default TaxPage;