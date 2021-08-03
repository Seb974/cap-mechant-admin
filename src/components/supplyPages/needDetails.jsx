import React, { useContext, useEffect, useState } from 'react';
import { CButton, CCardBody, CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CRow } from '@coreui/react';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';

const NeedDetails = ({ orders, product }) => {

    const { currentUser } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(false);
    const [consumers, setConsumers] = useState([]);

    useEffect(() => getConsumers(), [orders, product]);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    const getConsumers = () => {
        let newConsumers = [];
        orders.map(o => {
            o.items.map(i => {
                if (i.product.id === product.id)
                    newConsumers = [...newConsumers, {name: o.name, quantity: i.orderedQty, unit: i.unit, stock: i.stock }];
            });
        });
        setConsumers(newConsumers);
    };

    const onChange = ({ currentTarget }) => setConsumers({...consumers, [currentTarget.id]: currentTarget.value});

    return (
        <>
            { !isDefinedAndNotVoid(consumers) ? <></> : consumers.map((item, index) => {
                if (isAdmin || Roles.isPicker(currentUser) || Roles.isSupervisor(currentUser) || (!isAdmin && product.seller.users.find(user => user.id == currentUser.id) !== undefined)) {
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
                                                <CLabel htmlFor="name">{"Client " + (consumers.length > 1 ? index + 1 : "")}
                                                </CLabel>
                                                <CInput
                                                    id="name"
                                                    name={ item.id }
                                                    value={ item.name }
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
                                                        disabled={ true }
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
                } else return <></>
            })}
            <CRow className="text-center mt-0">
                <CCol md="1">{""}</CCol>
            </CRow>
        </>
    );
}
 
export default NeedDetails;