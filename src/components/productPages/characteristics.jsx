import React, { useContext, useEffect, useState } from 'react';
import { CCol, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CSelect, CTextarea } from '@coreui/react';
import Select from 'src/components/forms/Select';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import Image from '../forms/image';
import GroupActions from 'src/services/GroupActions';
import CatalogActions from 'src/services/CatalogActions';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import SellerActions from 'src/services/SellerActions';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';

const Characteristics = ({ product, categories, type, setProduct, errors, history}) => {

    const { currentUser } = useContext(AuthContext);
    const [groups, setGroups] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [catalogs, setCatalogs] = useState([]);
    const [isAdmin, setIsAdmin] = useState(Roles.hasAdminPrivileges(currentUser));

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        fetchGroups();
        fetchSellers();
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

    useEffect(() => {
        if (!isDefinedAndNotVoid(product.seller) && sellers.length > 0)
            setProduct({...product, seller: sellers[0]});
    }, [product, sellers]);

    const handleUsersChange = userGroups => setProduct(product => ({...product, userGroups}));
    const handleCatalogsChange = catalogs => setProduct(product => ({...product, catalogs}));
    const handleChange = ({ currentTarget }) => setProduct({...product, [currentTarget.name]: currentTarget.value});
    const handleSellerChange = ({ currentTarget }) => setProduct({...product, seller: sellers.find(seller => seller.id === parseInt(currentTarget.value))});
    const handleCategoriesChange = ({ currentTarget }) => setProduct({...product, categories: categories.find(seller => seller['@id'] === currentTarget.value)});

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

    const fetchSellers = () => {
        SellerActions.findAll()
                    .then(response => setSellers(response))
                    .catch(error => {
                        // TODO : Notification flash d'une erreur
                        history.replace("/components/products");
                    });
    };

    return (
        <>
            <CRow className="mb-3">
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
            { isAdmin &&
                <>
                    <Image entity={ product } setEntity={ setProduct } />
                    <CRow className="mb-3">
                        <CCol xs="12" sm="12">
                            <Select name="seller" label="Vendeur" value={ isDefined(product.seller) ? product.seller.id : 0 } error={ errors.seller } onChange={ handleSellerChange } required={ true }>
                                { sellers.map(seller => <option value={ seller.id }>{ seller.name }</option>) }
                            </Select>
                        </CCol>
                    </CRow>
                </>
            }
            <CRow className="mb-3">
                <CCol xs="12" sm={ isAdmin ? "6" : "12"}>
                    <Select custom name="categories" id="categories" value={ isDefined(product.categories) ? product.categories['@id'] : 0 } onChange={ handleCategoriesChange }>
                        { categories.map(c => <option key={ c.id } value={ c['@id'] }>{ c.name }</option>) }
                    </Select>
                    {/* <SelectMultiple name="categories" label="Catégories" value={ product.categories } error={ errors.categories } onChange={ handleCategoriesChange } data={ categories.map(category => ({value: category.id, label: category.name, isFixed: false})) }/> */}
                </CCol>
                { isAdmin &&
                    <CCol xs="12" sm="6">
                        <CLabel htmlFor="select">Durée de vie</CLabel>
                        <CSelect custom name="productGroup" id="productGroup" value={ product.productGroup } onChange={ handleChange }>
                            <option value="J + 1">J + 1</option>
                            <option value="J + 3">J + 3</option>
                            <option value="J + 6">J + 6</option>
                            <option value="J + 10">J + 10</option>
                        </CSelect>
                    </CCol>
                }
            </CRow>
            { isAdmin &&
                <>
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
            }
        </>
    );
}
 
export default Characteristics;