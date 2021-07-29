import React, { useContext, useEffect, useState } from 'react';
import OrderActions from '../../../services/OrderActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CCollapse, CFormGroup, CInputCheckbox, CLabel, CWidgetIcon, CCardFooter } from '@coreui/react';
import { Link, Redirect } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { isSameDate, getDateFrom, getArchiveDate } from 'src/helpers/days';
import Spinner from 'react-bootstrap/Spinner'
import OrderDetails from 'src/components/preparationPages/orderDetails';
import PlatformContext from 'src/contexts/PlatformContext';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import { getStatus, getStatusName } from 'src/helpers/orders';
import CIcon from '@coreui/icons-react';
import { updateStatusBetween } from 'src/data/dataProvider/eventHandlers/orderEvents';
import MercureContext from 'src/contexts/MercureContext';

const Orders = (props) => {

    const itemsPerPage = 30;
    const fields = ['Client', 'Date', 'Total', 'Statut', ' '];
    const { platform } = useContext(PlatformContext);
    const { currentUser, supervisor } = useContext(AuthContext);
    const { updatedOrders, setUpdatedOrders } = useContext(MercureContext);
    const [mercureOpering, setMercureOpering] = useState(false);
    const [orders, setOrders] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [details, setDetails] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(getStatus().filter(s => !["ON_PAYMENT", "ABORTED"].includes(s.value)));
    const [csvContent, setCsvContent] = useState("");

    const csvCode = 'data:text/csv;charset=utf-8,SEP=,%0A' + encodeURIComponent(csvContent);

    useEffect(() => {
        const isUserAdmin = Roles.hasAdminPrivileges(currentUser);
        setIsAdmin(isUserAdmin);
        getOrders();
    }, []);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedOrders)&& !mercureOpering) {
            setMercureOpering(true);
            updateStatusBetween(updatedOrders, dates, selectedStatus, orders, setOrders, currentUser, supervisor, setUpdatedOrders)
                .then(response => setMercureOpering(response));
        }
    }, [updatedOrders]);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    useEffect(() => {
        if (isDefinedAndNotVoid(selectedStatus))
            getOrders();
    }, [dates, selectedStatus]);

    useEffect(() => {
        if (isDefinedAndNotVoid(orders))
            setCsvContent(getCsvContent());
    },[orders])

    const getOrders = () => {
        setLoading(true);
        const UTCDates = getUTCDates(dates);
        OrderActions.findStatusBetween(UTCDates, selectedStatus, currentUser)
                .then(response =>{
                    setOrders(response.map(data => ({...data, selected: false})));
                    setLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                });
    }

    const handleDelete = item => {
        const originalOrders = [...orders];
        setOrders(orders.filter(order => order.id !== item.id));
        OrderActions.delete(item, isAdmin)
                      .catch(error => {
                           setOrders(originalOrders);
                           console.log(error.response);
                      });
    }

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])){
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const handleStatusChange = status => setSelectedStatus(status);

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    };

    const getTurnover = () => orders.reduce((sum, current) => sum + current.totalHT, 0);

    const getUserCount = () => [...new Set(orders.map(order => order.email))].length;

    const toggleDetails = (index, e) => {
        e.preventDefault();
        const position = details.indexOf(index);
        let newDetails = details.slice();
        if (position !== -1) {
            newDetails.splice(position, 1);
        } else {
            newDetails = [...details, index];
        }
        setDetails(newDetails);
    };

    const getCsvContent = () => orders.map(item => 
        [
            item.name,
            (new Date(item.deliveryDate)).toLocaleDateString('fr-FR', { timeZone: 'UTC'}),
            isDefined(item.totalHT) ? item.totalHT.toFixed(2) : "-",
            isDefined(item.totalHT) ? "euros" : "-",
            getStatusName(item.status)
        ].join(',')
    ).join('\n');

    return !(isAdmin || Roles.isPicker(currentUser)) ? <Redirect to="/"/> : (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader>
                        Liste des commandes
                    </CCardHeader>
                    <CCardBody>
                    <CRow>
                        <CCol xs="12" sm="6" lg="3">
                            <CWidgetIcon text="Commandes" header={ orders.length } color="primary" iconPadding={false}>
                                <CIcon width={24} name="cil-clipboard"/>
                            </CWidgetIcon>
                            </CCol>
                            <CCol xs="12" sm="6" lg="3">
                            <CWidgetIcon text="Clients" header={ getUserCount() } color="info" iconPadding={false}>
                                <CIcon width={24} name="cil-people"/>
                            </CWidgetIcon>
                            </CCol>
                            <CCol xs="12" sm="6" lg="3">
                            <CWidgetIcon text="Moyenne" header={ (getUserCount() > 0 ? (getTurnover() / getUserCount()).toFixed(2) : "0.00") + " €"} color="warning" iconPadding={false}>
                                <CIcon width={24} name="cil-chart"/>
                            </CWidgetIcon>
                            </CCol>
                            <CCol xs="12" sm="6" lg="3">
                            <CWidgetIcon text="Total" header={ getTurnover().toFixed(2) + " €" } color="danger" iconPadding={false}>
                                <CIcon width={24} name="cil-money"/>
                            </CWidgetIcon>
                        </CCol>
                    </CRow>
                        <CRow>
                            <CCol xs="12" lg="6">
                                <RangeDatePicker
                                    minDate={ dates.start }
                                    maxDate={ dates.end }
                                    onDateChange={ handleDateChange }
                                    label="Date"
                                    className = "form-control mb-3"
                                />
                            </CCol>
                            <CCol xs="12" lg="6">
                                <SelectMultiple name="status" label="Statuts" value={ selectedStatus } onChange={ handleStatusChange } data={ getStatus() }/>
                            </CCol>
                        </CRow>
                        { loading ? 
                            <CRow>
                                <CCol xs="12" lg="12" className="text-center">
                                    <Spinner animation="border" variant="danger"/>
                                </CCol>
                            </CRow>
                            :
                            <CDataTable
                                items={ orders }
                                fields={ fields }
                                bordered
                                itemsPerPage={ itemsPerPage }
                                pagination
                                scopedSlots = {{
                                    'Client':
                                        item => <td>
                                                    <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} disabled={ item.status === "WAITING" }>
                                                        { item.isRemains ? 
                                                            <i className="fas fa-sync-alt mr-2"></i> :
                                                        isDefinedAndNotVoid(item.packages) ? 
                                                        <i className="fas fa-plane mr-2"></i> :
                                                            <i className="fas fa-truck mr-2"></i>
                                                        }{ item.name }<br/>
                                                        <small><i>{ item.metas.zipcode } { item.metas.city }</i></small>
                                                        <br/>
                                                    </Link>
                                                </td>
                                    ,
                                    'Date':
                                        item => <td style={{color: item.status === "WAITING" ? "dimgray" : "black"}}>
                                                    { isSameDate(new Date(item.deliveryDate), new Date()) ? "Aujourd'hui" : 
                                                    isSameDate(new Date(item.deliveryDate), getDateFrom(new Date(), 1)) ? "Demain" :
                                                    (new Date(item.deliveryDate)).toLocaleDateString('fr-FR', { timeZone: 'UTC'})
                                                    }
                                                </td>
                                    ,
                                    'Total':
                                        item => <td style={{color: item.status === "WAITING" ? "dimgray" : "black"}}>
                                                    { isDefined(item.totalHT) ? item.totalHT.toFixed(2) + " €" : " "}
                                                </td>
                                    ,
                                    'Statut':
                                        item => <td style={{color: item.status === "WAITING" ? "dimgray" : "black"}}>
                                                    { getStatusName(item.status) }
                                                </td>
                                    ,
                                    ' ':
                                        item => (
                                            <td className="mb-3 mb-xl-0 text-center" style={{color: item.status === "WAITING" ? "dimgray" : "black"}}>
                                                <CButton color="warning" disabled={ !isAdmin } href={ "#/components/orders/" + item.id } className="mx-1 my-1"><i className="fas fa-pen"></i></CButton>
                                                <CButton color="danger" disabled={ !isAdmin } onClick={ () => handleDelete(item) } className="mx-1 my-1"><i className="fas fa-trash"></i></CButton>
                                            </td>
                                        )
                                    ,
                                    'details':
                                        item => <CCollapse show={details.includes(item.id)}>
                                                    <OrderDetails order={ item } isDelivery={ true }/>
                                                </CCollapse>
                                }}
                            />
                        }
                    </CCardBody>
                    <CCardFooter className="d-flex justify-content-start">
                        { isDefinedAndNotVoid(orders) && 
                            <CRow>
                                <CCol xs="12" lg="12" className="mb-3">
                                    <CButton color="primary" className="mb-2" href={csvCode} download={`FraisPei-Recap-${ getArchiveDate(dates.start) }-${ getArchiveDate(dates.end) }.csv`} target="_blank">
                                        <CIcon name="cil-cloud-download" className="mr-2"/>Télécharger (.csv)
                                    </CButton>
                                </CCol>
                            </CRow>
                        }
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default Orders;