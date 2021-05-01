import React, { useEffect } from 'react';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import { CButton, CCol, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getWeekDays } from 'src/helpers/days';

const Condition = ({ entity, condition, groups, taxes, setEntity, handleDeleteRule, errors, total, index }) => {

    useEffect(() => {
        if (Object.keys(condition.tax).length === 0 && taxes.length > 0)
            setNewCondition({...condition, tax: taxes[0]});
    }, [taxes, condition]);

    const handleUsersChange = groups => setNewCondition({...condition, userGroups: groups});
    const handleDaysChange = days => setNewCondition({...condition, days});
    const handleChange = ({ currentTarget }) => setNewCondition({...condition, [currentTarget.name]: currentTarget.value});

    const setNewCondition = condition => {
        const newConditions = [...entity.conditions.filter(option => option.count !== condition.count)];
        setEntity({...entity, conditions: [...newConditions, condition].sort((a, b) => (a.count > b.count) ? 1 : -1)});
    };

    return (
        <>
            <hr className="mt-4"/>
            <CRow className="mt-0 mb-4">
                <CCol xs="2" sm="2" className="mx-0">
                    <CLabel className="mt-0">{total > 1 ? "Règle N°" + (index + 1) : "Règle"}</CLabel>
                </CCol>
                { total > 1 && 
                        <CCol xs="10" sm="10" className="d-flex justify-content-end" >
                            <CButton 
                                name={ condition.count }
                                size="sm" 
                                color="danger" 
                                onClick={ handleDeleteRule }
                            >
                                <CIcon name="cil-trash"/>
                            </CButton>
                        </CCol>
                    }
            </CRow>
            <CRow>
                <CCol xs="12" sm="6" className="mx-0">
                    <SelectMultiple name="userGroups" label="Applicable pour les utilisateurs" value={ condition.userGroups } error={ errors.conditions } onChange={ handleUsersChange } data={ groups }/>
                </CCol>
                <CCol xs="12" sm="6" className="mx-0">
                    <SelectMultiple name="openedFor" label="Jours désservis" value={ condition.days } error={ errors.conditions } onChange={ handleDaysChange } data={ getWeekDays() }/>
                </CCol>
            </CRow>
            <CRow className="mt-4">
            <CCol xs="12" sm="4" className="mx-0">
                <CFormGroup>
                    <CLabel htmlFor="name">Prix HT</CLabel>
                    <CInput
                        type="number"
                        id="price"
                        name="price"
                        value={ condition.price }
                        onChange={ handleChange }
                        placeholder="Prix HT de la livraison"
                        invalid={ errors.name.length > 0 } 
                    />
                    <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="4" className="mx-0">
                <CFormGroup>
                    <CLabel htmlFor="name">Panier min. pour livraison offerte</CLabel>
                    <CInput
                        type="number"
                        id="minForFree"
                        name="minForFree"
                        value={ condition.minForFree }
                        onChange={ handleChange }
                        placeholder="Valeur du panier"
                        invalid={ errors.name.length > 0 } 
                    />
                    <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                </CFormGroup>
            </CCol>
            <CCol xs="12" md="4">
                <CLabel htmlFor="select">TVA</CLabel>
                <CSelect custom name="tax" id="tax" value={ condition.tax['@id'] } onChange={ handleChange }>
                    { taxes.map(tax => <option key={ tax.id } value={ tax['@id'] }>{ tax.name }</option>)}
                </CSelect>
            </CCol>
            </CRow>
        </>
    );
}

export default Condition;