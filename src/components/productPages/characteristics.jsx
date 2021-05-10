import React, { useEffect, useState } from 'react';
import { CCol, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CTextarea } from '@coreui/react';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import Image from './image';
import GroupActions from 'src/services/GroupActions';
import CatalogActions from 'src/services/CatalogActions';
import { isDefinedAndNotVoid } from 'src/helpers/utils';

const Characteristics = ({ product, categories, type, setProduct, errors, history}) => {

    const [groups, setGroups] = useState([]);
    const [catalogs, setCatalogs] = useState([]);

    useEffect(() => {
        fetchGroups();
        fetchCatalogs();
    }, []);

    useEffect(() => {
        if (product.userGroups.length === 0 && groups.length > 0)
            setProduct({...product, userGroups: groups});
        if (product.userGroups.length > 0 && !Object.keys(product.userGroups[0]).includes('label') && groups.length > 0)
            setProduct({...product, userGroups: product.userGroups.map(userGroup => groups.find(group => group.value === userGroup.value))});
    }, [product, groups]);

    useEffect(() => {
        if (!isDefinedAndNotVoid(product.catalogs) && catalogs.length > 0)
            setProduct({...product, catalogs: catalogs});
    }, [product, catalogs]);

    const handleUsersChange = userGroups => setProduct(product => ({...product, userGroups}));
    const handleCatalogsChange = catalogs => setProduct(product => ({...product, catalogs}));
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

    const fetchCatalogs = () => {
        CatalogActions
            .findAll()
            .then(response => {
                const suitedCatalogs = response.map(catalog => {
                    return {...catalog, value: catalog.id, label: catalog.name, isFixed: false};
                });
                setCatalogs(suitedCatalogs);
            })
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
            <CRow className="mb-3">
                <CCol xs="12" sm="12">
                    <SelectMultiple name="catalogs" label="Sur les catalogues" value={ product.catalogs } error={ errors.catalogs } onChange={ handleCatalogsChange } data={ catalogs }/>
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