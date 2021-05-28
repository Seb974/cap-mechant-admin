import React, { useState } from 'react';
import { CButton, CCardBody, CCol, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import OrderDetailsItem from './orderDetailsItem';
import { getPreparedOrder } from 'src/helpers/checkout';
import OrderActions from 'src/services/OrderActions';

const OrderDetails = ({ order }) => {

    const [viewedOrder, setViewedOrder] = useState({...order, items: order.items.map(item => ({...item, preparedQty: "", isAdjourned: false})) });

    const onSubmit = () => {
        OrderActions
            .update(order.id, getPreparedOrder(viewedOrder))
            .then(response => window.location.reload())
            .catch(error => console.log(error));
    };

    return (
        <>
            { viewedOrder.items.map((item, index) => {
                return(
                    <CCardBody>
                        <CRow className="text-center mt-0">
                            <CCol md="1">{""}</CCol>
                        </CRow>
                        <CRow>
                            <CCol md="1">{""}</CCol>
                            <CCol md="10">
                                <OrderDetailsItem
                                    item={ item }
                                    order={ viewedOrder }
                                    setOrder={ setViewedOrder } 
                                    total={ order.items.length } 
                                    index={ index }
                                />
                            </CCol>
                        </CRow>
                    </CCardBody>
                );
            })}
            <CRow className="text-center mt-0">
                <CCol md="1">{""}</CCol>
            </CRow>
            <CRow className="mt-2 mb-5 d-flex justify-content-center">
                <CButton size="sm" color="success" onClick={ onSubmit }><CIcon name="cil-plus"/>Terminer</CButton>
            </CRow>
        </>
    );
}
 
export default OrderDetails;