import React, { useContext, useEffect, useState } from 'react';
import { CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CSelect, CSwitch } from '@coreui/react';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import TaxActions from 'src/services/TaxActions';
import PriceGroupActions from 'src/services/PriceGroupActions';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import SupplierActions from 'src/services/SupplierActions';

const SellerOptions = ({ product, setProduct, history }) => {

    const { currentUser } = useContext(AuthContext);
    const [taxes, setTaxes] = useState([]);
    const [priceGroups, setPriceGroups] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(Roles.hasAdminPrivileges(currentUser));

    useEffect(() => {
        fetchTaxes();
        fetchSuppliers();
        fetchPriceGroups();
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        if ((!isDefined(product.tax) || product.tax === "-1") && taxes.length > 0)
            setProduct({...product, tax: taxes[0]});
    }, [product, taxes]);

    useEffect(() => {
        if (product.prices.length === 0 && priceGroups.length > 0)
            setProduct({...product, prices: priceGroups.map(price => ({amount: 0, priceGroup: price})) });
    }, [product, priceGroups]);

    useEffect(() => {
        if (!isDefined(product.supplier) && isDefinedAndNotVoid(suppliers))
            setProduct({...product, supplier: suppliers[0] });
    }, [product, suppliers]);

    const handleChange = ({ currentTarget }) => setProduct({...product, [currentTarget.name]: currentTarget.value});
    const handleCheckBoxes = ({ currentTarget }) => setProduct({...product, [currentTarget.name]: !product[currentTarget.name]});
    const handleSupplierChange = ({ currentTarget }) => {
        const newSupplier = suppliers.find(supplier => supplier.id === parseInt(currentTarget.value));
        setProduct({...product, suppliers: [newSupplier]});
    };

    const fetchTaxes = () => {
        let request = TaxActions.findAll();
        request
            .then(response => setTaxes(response))
            .catch(error => {
                // TODO : Notification flash d'une erreur
                history.replace("/components/products");
            });
    };

    const fetchPriceGroups = () => {
        PriceGroupActions.findAll()
                    .then(response => setPriceGroups(response))
                    .catch(error => {
                        // TODO : Notification flash d'une erreur
                        history.replace("/components/products");
                    });
    };

    const fetchSuppliers = () => {
        SupplierActions
            .findAll()
            .then(response => setSuppliers(response))
            .catch(error => history.replace("/components/products"));
    };

    return (
        <>
            <CFormGroup row>
                <CCol xs="12" md="4">
                    <CLabel htmlFor="select">Fournisseur</CLabel>
                    <CSelect custom name="suppliers" id="suppliers" value={ isDefinedAndNotVoid(product.suppliers) ? product.suppliers[0].id : 0 } onChange={ handleSupplierChange }>
                        { suppliers.map(supplier => <option key={ supplier.id } value={ supplier.id }>{ supplier.name }</option>) }
                    </CSelect>
                </CCol>
                <CCol xs="12" md="4">
                    <CFormGroup>
                        <CLabel htmlFor="unit">Unité de vente</CLabel>
                        <CInput
                            id="unit"
                            name="unit"
                            value={ product.unit }
                            onChange={ handleChange }
                            placeholder="Unité"
                        />
                    </CFormGroup>
                </CCol>
                <CCol xs="12" md="4" className="mt-4">
                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                        <CCol xs="3" sm="2" md="3">
                            <CSwitch name="available" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ product.available } onChange={ handleCheckBoxes }/>
                        </CCol>
                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                            Disponible
                        </CCol>
                    </CFormGroup>
                </CCol>
            </CFormGroup>
        </>
    );
}
 
export default SellerOptions;