import React, { useContext, useEffect, useState } from 'react';
import { CButton, CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CRow, CSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import ProductsContext from 'src/contexts/ProductsContext';
import { isDefined } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import Select from '../forms/Select';
import Roles from 'src/config/Roles';

const Item = ({ item, handleChange, handleDelete, total, index }) => {

    const [isAdmin, setIsAdmin] = useState(false);
    const { products } = useContext(ProductsContext);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), []);

    const onChange = ({ currentTarget }) => {
        handleChange({...item, [currentTarget.id]: currentTarget.value});
    };

    const onProductChange = ({ currentTarget }) => {
        const selection = products.find(product => parseInt(product.id) === parseInt(currentTarget.value));
        handleChange({...item, product: selection, unit: selection.unit});
    };

    return !isDefined(item) || !isDefined(item.product) ? <></> : (
        <>
            <CRow>
                <CCol xs="12" sm={ (isAdmin || Roles.isPicker(currentUser)) ? "4" : "3"}>
                    <CFormGroup>
                        <CLabel htmlFor="name">{"Produit " + (total > 1 ? index + 1 : "")}
                        </CLabel>
                        <CSelect custom id="product" value={ item.product.id } onChange={ onProductChange }>
                            { products.map(product => <option key={ product.id } value={ product.id }>{ product.name }</option>) }
                        </CSelect>
                    </CFormGroup>
                </CCol>
                <CCol xs="12" sm="2">
                    <Select name={ item.count } id="unit" value={ item.unit } label="Unité" onChange={ onChange }>
                        <option value="U">U</option>
                        <option value="Kg">Kg</option>
                        <option value="L">L</option>
                    </Select>
                </CCol>
                <CCol xs="12" sm="3">
                    <CFormGroup>
                        <CLabel htmlFor="name">Quantité
                        </CLabel>
                        <CInputGroup>
                            <CInput
                                id="orderedQty"
                                type="number"
                                name={ item.count }
                                value={ item.orderedQty }
                                onChange={ onChange }
                            />
                            <CInputGroupAppend>
                                <CInputGroupText>{ item.unit }</CInputGroupText>
                            </CInputGroupAppend>
                        </CInputGroup>
                    </CFormGroup>
                </CCol>

                <CCol xs="12" sm="3">
                    <CFormGroup>
                        <CLabel htmlFor="name">Stock actuel
                        </CLabel>
                        <CInputGroup>
                            <CInput
                                id="stock"
                                type="number"
                                name={ item.count }
                                value={ item.stock }
                                onChange={ onChange }
                            />
                            <CInputGroupAppend>
                                <CInputGroupText>{ item.unit }</CInputGroupText>
                            </CInputGroupAppend>
                        </CInputGroup>
                    </CFormGroup>
                </CCol>
                <CCol xs="12" sm="1" className="d-flex align-items-center justify-content-start mt-2">
                    <CButton 
                        name={ item.count }
                        size="sm" 
                        color="danger" 
                        onClick={ handleDelete }
                        disabled={ total <= 1 }
                    >
                        <CIcon name="cil-trash"/>
                    </CButton>
                </CCol>
            </CRow>
        </>
    );
}
 
export default Item;