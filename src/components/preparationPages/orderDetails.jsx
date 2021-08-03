import React, { useContext, useEffect, useState } from 'react';
import { CButton, CCardBody, CCol, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import OrderDetailsItem from './orderDetailsItem';
import { getPreparedOrder } from 'src/helpers/checkout';
import OrderActions from 'src/services/OrderActions';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import PackageList from './packageList';

const OrderDetails = ({ orders = null, order, setOrders = null, isDelivery = false, id = order.id }) => {

    const { currentUser } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(false);
    const [viewedOrder, setViewedOrder] = useState(null);
    const [displayedOrder, setDisplayedOrder] = useState(null);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        if (isDefinedAndNotVoid(orders) && JSON.stringify(displayedOrder) !== JSON.stringify(order)) {
            const newDisplayedOrder = orders.find(o => o.id === id);
            const currentOrder = {
                ...newDisplayedOrder,
                items: newDisplayedOrder.items.map(item => ({
                    ...item, 
                    preparedQty: (isDefined(item.preparedQty) ? item.preparedQty : ""), 
                    isAdjourned: (isDefined(item.isAdjourned) ? item.isAdjourned : false)
                }))
            };
            setDisplayedOrder(newDisplayedOrder);
            setViewedOrder(currentOrder);
        }
    }, [orders]);

    const onOrderChange = currentOrder => {
        const newOrders = orders.map(order => order.id === currentOrder.id ? currentOrder : order);
        setViewedOrder(currentOrder);
        setOrders(newOrders);
    };

    const onSubmit = () => {
        console.log(getPreparedOrder(viewedOrder, currentUser));
        OrderActions
            .update(viewedOrder.id, getPreparedOrder(viewedOrder, currentUser))
            .then(response => {
                setOrders(orders.filter(o => o.id !== response.data.id));
            })
            .catch(error => console.log(error));
    };

    return (
        <>
            { !isDefined(viewedOrder) ? <></> : viewedOrder.items.map((item, index) => {
                if (isAdmin || Roles.isPicker(currentUser) || Roles.isSupervisor(currentUser) || (!isAdmin && item.product.seller.users.find(user => user.id == currentUser.id) !== undefined)) {
                    return(
                        <CCardBody key={ item.id }>
                            <CRow className="text-center mt-0">
                                <CCol md="1">{""}</CCol>
                            </CRow>
                            <CRow>
                                <CCol md="1">{""}</CCol>
                                <CCol md="10">
                                    <OrderDetailsItem
                                        item={ item }
                                        order={ viewedOrder }
                                        setOrder={ onOrderChange } 
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
            { !isDefined(viewedOrder) || !isDefinedAndNotVoid(viewedOrder.packages) ? <></> : viewedOrder.packages.map((_pack, i) => {
                if (isAdmin || Roles.isPicker(currentUser) || Roles.isSupervisor(currentUser)) {
                    return(
                        <CCardBody key={ i }>
                            <CRow className="text-center mt-0">
                                <CCol md="1">{""}</CCol>
                            </CRow>
                            <CRow>
                                <CCol md="1">{""}</CCol>
                                <CCol md="10">
                                    <PackageList _package={ _pack } total={ viewedOrder.packages.length } index={ i }/>
                                </CCol>
                            </CRow>
                        </CCardBody>
                    );
                }
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