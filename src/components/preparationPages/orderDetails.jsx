import React, { useContext, useEffect, useState } from 'react';
import { CButton, CCardBody, CCol, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import OrderDetailsItem from './orderDetailsItem';
import { getPreparedOrder } from 'src/helpers/checkout';
import OrderActions from 'src/services/OrderActions';
import { isDefined } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';

const OrderDetails = ({ orders = null, order, setOrders = null, isDelivery = false }) => {

    const { currentUser } = useContext(AuthContext);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    const [isAdmin, setIsAdmin] = useState(false);
    const [viewedOrder, setViewedOrder] = useState({
        ...order, 
        items: order.items.map(item => ({
            ...item, 
            preparedQty: (isDefined(item.preparedQty) ? item.preparedQty : ""), 
            isAdjourned: (isDefined(item.isAdjourned) ? item.isAdjourned : false)
        })) 
    });

    const onSubmit = () => {
        console.log(getPreparedOrder(viewedOrder, currentUser));
        OrderActions
            .update(order.id, getPreparedOrder(viewedOrder, currentUser))
            .then(response => setOrders(orders.filter(o => o.id !== order.id)))
            .catch(error => console.log(error));
    };

    return (
        <>
            { viewedOrder.items.map((item, index) => {
                if (isAdmin || (!isAdmin && item.product.seller.users.find(user => user.id == currentUser.id) !== undefined)) {
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
                                        isDelivery={ isDelivery }
                                    />
                                </CCol>
                            </CRow>
                        </CCardBody>
                    );
                } else return <></>
            })}
            <CRow className="text-center mt-0">
                <CCol md="1">{""}</CCol>
            </CRow>
            { !isDelivery &&
                <CRow className="mt-2 mb-5 d-flex justify-content-center">
                    <CButton size="sm" color="success" onClick={ onSubmit }><CIcon name="cil-plus"/>Terminer</CButton>
                </CRow>
            }
        </>
    );
}
 
export default OrderDetails;