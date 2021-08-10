import React, { useContext, useEffect, useState } from 'react';
import OrderActions from '../../../services/OrderActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CCollapse, CWidgetIcon } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { isSameDate, getDateFrom, getArchiveDate } from 'src/helpers/days';
import Spinner from 'react-bootstrap/Spinner'
import OrderDetails from 'src/components/preparationPages/orderDetails';
import DayOffActions from 'src/services/DayOffActions';
import CIcon from '@coreui/icons-react';
import { updatePreparations } from 'src/data/dataProvider/eventHandlers/orderEvents';
import MercureContext from 'src/contexts/MercureContext';
import { getPackagesPlan } from 'src/helpers/packagePlanner';
import api from 'src/config/api';


const Preparations = (props) => {

    const itemsPerPage = 30;
    const fields = ['name', 'date', 'total', ' '];
    const { currentUser, seller, supervisor } = useContext(AuthContext);
    const { updatedOrders, setUpdatedOrders } = useContext(MercureContext);
    const [mercureOpering, setMercureOpering] = useState(false);
    const [orders, setOrders] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [labelLoading, setLabelLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [daysOff, setDaysOff] = useState([]);
    const [details, setDetails] = useState([]);
    const [csvContent, setCsvContent] = useState("");

    const csvCode = 'data:text/csv;charset=utf-8,SEP=,%0A' + encodeURIComponent(csvContent);

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        fetchDaysOff();
    }, []);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedOrders) && !mercureOpering) {
            setMercureOpering(true);
            updatePreparations(updatedOrders, getUTCDates(), orders, setOrders, currentUser, supervisor, setUpdatedOrders)
                .then(response => setMercureOpering(response));
        }
    }, [updatedOrders]);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    useEffect(() => getOrders(), [dates]);
    useEffect(() => getOrders(), [daysOff]);

    useEffect(() => {
        if (isDefinedAndNotVoid(orders))
            setCsvContent(getCsvContent());
    },[orders]);

    const getOrders = () => {
        setLoading(true);
        const UTCDates = getUTCDates(dates);
        const request = isAdmin || Roles.isPicker(currentUser) ?
            OrderActions.findPickersPreparations(UTCDates) :
            OrderActions.findPreparations(UTCDates, currentUser);
        request
            .then(response =>{
                setOrders(response);
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });
    }

    const fetchDaysOff = () => {
        DayOffActions
            .findActives()
            .then(closedDays => setDaysOff(closedDays));
    };

    const handleDelete = item => {
        const originalOrders = [...orders];
        setOrders(orders.filter(order => order.id !== item.id));
        OrderActions
            .delete(item, isAdmin)
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

    const getUTCDates = () => {
        let UTCEnd = 0;
        let UTCStart = 0;
        UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    }

    const getStart = date => {
        let i = 0;
        let dateStart = date;
        while ( isOffDay(dateStart) ) {
            dateStart = getDateFrom(date, i);
            i--;
        }
        return dateStart
    }

    const getEnd = date => {
        let i = 1;
        let dateEnd = getDateFrom(date, i);
        while ( isOffDay(dateEnd) ) {
            dateEnd = getDateFrom(date, i);
            i++;
        }
        return getDateFrom(date, i - 1);
    }

    const getReverseDeliveryDay = date => {
        let i = 0;
        let dateStart = getDateFrom(date, i - seller.recoveryDelay);
        while ( isOffDay(dateStart) ) {
            i--;
            dateStart = getDateFrom(date, i - seller.recoveryDelay);
        }
        return dateStart;
    };

    const getDeliveryDay = date => getDeliveryDate(date, seller.recoveryDelay);

    const getDeliveryDate = (date, delta) => new Date(date.getFullYear(), date.getMonth(), (date.getDate() + delta), 9, 0, 0);

    const isOffDay = date => daysOff.find(day => isSameDate(new Date(day.date), date)) !== undefined || date.getDay() === 0;

    const getUserCount = () => [...new Set(orders.map(order => order.email))].length;

    const getProductCount = () => {
        let allProducts = [];
        orders.map(order => {
            const products = order.items.map(item => item.product);
            allProducts = [...allProducts, ...products];
        });
        return [...new Set(allProducts.map(product => product.id))].length;
    };

    const toggleDetails = (index, e) => {
        e.preventDefault();
        const position = details.indexOf(index)
        let newDetails = details.slice()
        if (position !== -1) {
            newDetails.splice(position, 1)
        } else {
            newDetails = [...details, index]
        }
        setDetails(newDetails);
    }

    const handleLabel = id => {
        setLabelLoading(true);
        OrderActions
            .getZPLLabel(id)
            .then(response => {
                OrderActions
                    .getPrintableLabel(response.data)
                    .then(response => {
                        setLabelLoading(false);
                        const file = new Blob([response.data], {type: 'application/pdf'});
                        const fileURL = URL.createObjectURL(file);
                        window.open(fileURL, '_blank');
                    });
            })
            .catch(error => console.log(error));
    };

    const getCsvContent = () => {
        const header = ['Index', 'Client', 'Date liv.', 'Produit', 'Qte comm.', 'Unite', 'Stock', 'Unite', 'Adresse'].join(',');
        const data = orders.map((order, index) => 
            order.items.map(item => [
                index + 1,
                order.user.name,
                (new Date(order.deliveryDate)).toLocaleDateString('fr-FR', { timeZone: 'UTC'}),
                item.product.name,
                isDefined(item.orderedQty) ? item.orderedQty.toFixed(2) : "-",
                item.unit,
                isDefined(item.stock) ? item.stock.toFixed(2) : "-",
                item.unit,
                !isDefined(order.metas) ? '-' : getAddress(order.metas)
            ].join(',')).join('\n')
        ).join('\n');
        return [header, data].join('\n');
    };

    const getAddress = metas => {
        const address = isDefined(metas.address) ? metas.address.replaceAll(',', '') : '';
        const zipcode = isDefined(metas.zipcode) ? metas.zipcode : '';
        const city = isDefined(metas.city) ? metas.city : '';
        return address + ' ' + zipcode + ' - ' + city;
    };

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                <CRow>
                    <CCol xs="12" sm="6" md="6" className="my-2 d-flex justify-content-start align-items-center">
                        Liste des commandes à préparer
                    </CCol>
                    { (isAdmin || Roles.isPicker(currentUser) || Roles.isSupervisor(currentUser) || Roles.isSeller(currentUser)) &&
                        <CCol xs="12" sm="6" md="6" className="my-2 d-flex justify-content-end align-items-center">
                                <Link role="button" to="/components/orders/new" block={ true } variant="outline" color="success">CRÉER</Link>
                        </CCol>
                    }
                </CRow>
            </CCardHeader>
            <CCardBody>
                <CRow>
                    <CCol xs="12" sm="6" lg="4">
                        <CWidgetIcon text="Commandes" header={ orders.length } color="primary" iconPadding={false}>
                            <CIcon width={24} name="cil-clipboard"/>
                        </CWidgetIcon>
                    </CCol>
                    <CCol xs="12" sm="6" lg="4">
                        <CWidgetIcon text="Clients" header={ getUserCount() } color="warning" iconPadding={false}>
                            <CIcon width={24} name="cil-people"/>
                        </CWidgetIcon>
                    </CCol>
                    <CCol xs="12" sm="6" lg="4">
                        <CWidgetIcon text="Produits" header={ getProductCount() } color="danger" iconPadding={false}>
                            <CIcon width={24} name="cil-fastfood"/>
                        </CWidgetIcon>
                    </CCol>
                </CRow>
                <CRow>
                    <CCol xs="12" md="6">
                    <RangeDatePicker
                        minDate={ dates.start }
                        maxDate={ dates.end }
                        onDateChange={ handleDateChange }
                        label="Date"
                        className = "form-control mb-3"
                    />
                    </CCol>
                    { !loading && isDefinedAndNotVoid(orders) && 
                        <CCol xs="12" md="6" className="my-3 d-flex justify-content-end align-items-center">
                            <CButton color="primary" className="my-2" href={csvCode} download={`Recap-Ventes-${ getArchiveDate(dates.start) }-${ getArchiveDate(dates.end) }.csv`} target="_blank">
                                <CIcon name="cil-cloud-download" className="mr-2"/>Télécharger
                            </CButton>
                        </CCol>
                    }
                </CRow>
                { loading ? 
                    <CRow className="mx-5">
                        <CCol xs="12" lg="12" className="text-center mx-5">
                            <Spinner animation="border" variant="danger"/>
                        </CCol>
                    </CRow> 
                    :
                    <CDataTable
                        items={ orders }
                        fields={ isAdmin ? fields : fields.filter(f => f !== 'total') }
                        bordered
                        itemsPerPage={ itemsPerPage }
                        pagination
                        scopedSlots = {{
                            'name':
                                item => <td>
                                            <Link to="#" onClick={ e => { toggleDetails(item.id, e) }}>
                                                { item.isRemains ? 
                                                        <i className="fas fa-sync-alt mr-2"></i> :
                                                  isDefinedAndNotVoid(item.packages) ? 
                                                        <i className="fas fa-plane mr-2"></i> :
                                                        <i className="fas fa-truck mr-2"></i>
                                                }{ item.name }<br/>
                                                <small><i>{ item.metas.zipcode } { item.metas.city }</i></small>
                                            </Link>
                                        </td>
                            ,
                            'date':
                                item => <td>
                                            { 
                                                // isAdmin || Roles.isPicker(currentUser) || Roles.isSupervisor(currentUser) ?
                                            (isSameDate(new Date(item.deliveryDate), new Date()) ? "Aujourd'hui" : 
                                            isSameDate(new Date(item.deliveryDate), getDateFrom(new Date(), 1)) ? "Demain" :
                                            (new Date(item.deliveryDate)).toLocaleDateString('fr-FR', { timeZone: 'UTC'})) 
                                                // : 
                                                // isSameDate( getReverseDeliveryDay(new Date(item.deliveryDate), seller), new Date()) ? "Aujourd'hui" : 
                                                // isSameDate( getReverseDeliveryDay(new Date(item.deliveryDate), seller), getDateFrom(new Date(), 1)) ? "Demain" :
                                                // ( getReverseDeliveryDay(new Date(item.deliveryDate), seller).toLocaleDateString('fr-FR', { timeZone: 'UTC'}))
                                            }
                                        </td>
                            ,
                            'total':
                                item => <td>{ isDefined(item.totalHT) ? item.totalHT.toFixed(2) + " €" : " "}</td>
                            ,
                            ' ':
                                item => (
                                    <td className="mb-3 mb-xl-0 text-right">
                                        { isDefinedAndNotVoid(item.packages) && <CButton color="light" href={"#/components/parcels/" + item.id} target="_blank" className="mx-1 my-1"><i className="fas fa-list-ul"></i></CButton> }
                                        { isDefinedAndNotVoid(item.reservationNumber) && 
                                            <CButton color="light" onClick={ () => handleLabel(item.id) } className="mx-1 my-1">
                                                {!labelLoading ? 
                                                    <i className="fas fa-barcode" style={{ fontSize: '1.2em'}}></i> :
                                                    <>
                                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                                                        <span className="sr-only">Loading...</span>
                                                    </>
                                                }
                                            </CButton>
                                        }
                                        <CButton color="warning" disabled={ !isAdmin && !Roles.isSeller(currentUser) } href={ "#/components/orders/" + item.id } className="mx-1 my-1"><i className="fas fa-pen"></i></CButton>
                                        <CButton color="danger" disabled={ !(isAdmin || Roles.isSeller(currentUser) || (item.isRemains && Roles.isPicker(currentUser))) } onClick={ () => handleDelete(item) } className="mx-1 my-1"><i className="fas fa-trash"></i></CButton>
                                    </td>
                                )
                            ,
                            'details':
                                item => <CCollapse show={details.includes(item.id)}>
                                            <OrderDetails orders={ orders } order={ item } setOrders={ setOrders } id={ item.id }/>
                                        </CCollapse>
                        }}
                    />
                }
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Preparations;