import React, { useEffect, useState } from 'react';
import { CCol, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CTextarea } from '@coreui/react';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import Image from './image';
import GroupActions from 'src/services/GroupActions';

const Characteristics = ({ product, categories, type, setProduct, errors, history}) => {

    const [groups, setGroups] = useState([]);

    useEffect(() => fetchGroups(), []);

    useEffect(() => {
        if (product.userGroups.length === 0 && groups.length > 0)
            setProduct({...product, userGroups: groups});
        if (product.userGroups.length > 0 && !Object.keys(product.userGroups[0]).includes('label') && groups.length > 0)
            setProduct({...product, userGroups: product.userGroups.map(userGroup => groups.find(group => group.value === userGroup.value))});
    }, [product, groups]);

    const handleUsersChange = userGroups => setProduct(product => ({...product, userGroups}));
    const handleCategoriesChange = categories => setProduct(product => ({...product, categories}));
    const handleChange = ({ currentTarget }) => setProduct({...product, [currentTarget.name]: currentTarget.value});

    const fetchGroups = () => {
        GroupActions.findAll()
                    .then(response => setGroups(response))
                    .catch(error => {
                        // TODO : Notification flash d'une erreur
                        history.replace("/components/products");
                    });
    };

    return (
        <>
            <CRow>
                <CCol xs="12" sm="6">
                    <CFormGroup>
                        <CLabel htmlFor="name">Nom</CLabel>
                        <CInput
                            id="name"
                            name="name"
                            value={ product.name }
                            onChange={ handleChange }
                            placeholder="Nom du produit"
                            invalid={ errors.name.length > 0 } 
                        />
                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                    </CFormGroup>
                </CCol>
                <CCol xs="12" sm="6">
                    <CFormGroup>
                        <CLabel htmlFor="sku">Code</CLabel>
                        <CInput
                            id="sku"
                            name="sku"
                            value={ product.sku }
                            onChange={ handleChange }
                            placeholder="Code interne"
                            disabled
                        />
                    </CFormGroup>
                </CCol>
            </CRow>
            <Image product={product} setProduct={setProduct} />
            <CRow className="mb-3">
                <CCol xs="12" sm="12">
                    <SelectMultiple name="categories" label="Catégories" value={ product.categories } error={ errors.categories } onChange={ handleCategoriesChange } data={ categories.map(category => ({value: category.id, label: category.name, isFixed: false})) }/>
                </CCol>
            </CRow>
            <CRow className="mb-3">
                <CCol xs="12" sm="12">
                    <SelectMultiple name="userGroups" label="Pour les utilisateurs" value={ product.userGroups } error={ errors.userGroups } onChange={ handleUsersChange } data={ groups }/>
                </CCol>
            </CRow>
            <CFormGroup row className="mb-4">
                <CCol xs="12" md="12">
                    <CLabel htmlFor="textarea-input">Description</CLabel>
                    <CTextarea name="fullDescription" id="fullDescription" rows="9" placeholder="Content..." onChange={ handleChange } value={ product.fullDescription } disabled={type === "mixed"}/>
                </CCol>
            </CFormGroup>
        </>
    );
}
 
export default Characteristics;