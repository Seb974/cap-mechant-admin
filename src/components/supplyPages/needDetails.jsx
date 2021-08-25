import React, { useContext, useEffect, useState } from 'react';
import { CButton, CCardBody, CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CRow } from '@coreui/react';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';

const NeedDetails = ({ goods, provision, provisions, setProvisions }) => {

    const { currentUser } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    const onChange = ({ currentTarget }) => {
        const newItems = goods.map(i => i.id === parseInt(currentTarget.name) ? {...i, quantity: currentTarget.value} : i);
        const newOrders = provisions.map(o => o.id === provision.id ? {...provision, goods: newItems} : o);
        setProvisions(newOrders);
    };

    return (
        <>
            {
            !isDefinedAndNotVoid(goods) ? <></> : 
                goods.map((item, index) => {
                    return(
                        <CCardBody key={ item.id }>
                            <CRow className="text-center mt-0">
                                <CCol md="1">{""}</CCol>
                            </CRow>
                            <CRow>
                                <CCol md="1">{""}</CCol>
                                <CCol md="10">
                                    <CRow>
                                        <CCol xs="12" sm="6">
                                            <CFormGroup>
                                                <CLabel htmlFor="name">Produit</CLabel>
                                                <CInput
                                                    id="name"
                                                    name={ item.id }
                                                    value={ item.product.name }
                                                    onChange={ onChange }
                                                    disabled={ true }
                                                />
                                            </CFormGroup>
                                        </CCol>

                                        <CCol xs="12" sm="3">
                                            <CFormGroup>
                                                <CLabel htmlFor="name">Stock
                                                </CLabel>
                                                <CInputGroup>
                                                    <CInput
                                                        id="stock"
                                                        type="number"
                                                        name={ item.id }
                                                        value={ item.stock }
                                                        onChange={ onChange }
                                                        disabled={ true }
                                                    />
                                                    <CInputGroupAppend>
                                                        <CInputGroupText>{ item.unit }</CInputGroupText>
                                                    </CInputGroupAppend>
                                                </CInputGroup>
                                            </CFormGroup>
                                        </CCol>

                                        <CCol xs="12" sm="3">
                                            <CFormGroup>
                                                <CLabel htmlFor="name">Commandé
                                                </CLabel>
                                                <CInputGroup>
                                                    <CInput
                                                        id="quantity"
                                                        type="number"
                                                        name={ item.id }
                                                        value={ item.quantity }
                                                        onChange={ onChange }
                                                        disabled={ false }
                                                    />
                                                    <CInputGroupAppend>
                                                        <CInputGroupText>{ item.unit }</CInputGroupText>
                                                    </CInputGroupAppend>
                                                </CInputGroup>
                                            </CFormGroup>
                                        </CCol>
                                    </CRow>
                                </CCol>
                            </CRow>
                        </CCardBody>
                    );
            })}
            <CRow className="text-center mt-0">
                <CCol md="1">{""}</CCol>
            </CRow>
        </>
    );
}
 
export default NeedDetails;