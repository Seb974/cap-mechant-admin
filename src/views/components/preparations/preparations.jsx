import React, { useContext, useEffect, useState } from 'react';
import OrderActions from '../../../services/OrderActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CCollapse } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { isSameDate, getDateFrom } from 'src/helpers/days';
import Spinner from 'react-bootstrap/Spinner'
import { Button } from 'bootstrap';
import OrderDetails from 'src/components/preparationPages/orderDetails';
import DayOffActions from 'src/services/DayOffActions';
const Preparations = (props) => {

    const itemsPerPage = 30;
    const fields = ['name', 'date', 'total', ' '];      // 'show_details',
    const { currentUser, seller } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [daysOff, setDaysOff] = useState([]);

    const [details, setDetails] = useState([])

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        fetchDaysOff();
        // getOrders();
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    useEffect(() => getOrders(), [dates]);
    useEffect(() => getOrders(), [daysOff]);

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

    const handleDelete = (id) => {
        const originalOrders = [...orders];
        setOrders(orders.filter(order => order.id !== id));
        OrderActions
            .delete(id)
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
        if (Roles.isSeller(currentUser) && isDefined(seller) && isDefined(seller.needsRecovery)) {
            const dateStart = isOffDay(dates.start) ? dates.start : getDeliveryDay(getStart(dates.start), seller);
            const dateEnd = isOffDay(dates.end) ? dates.end : getDeliveryDay(getEnd(dates.end), seller);
            UTCStart = new Date(dateStart.getFullYear(), dateStart.getMonth(), dateStart.getDate(), 4, 0, 0);
            UTCEnd = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), dateEnd.getDate() + 1, 3, 59, 0);
        } else {
            UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
            UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        }
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

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des commandes à préparer
                { isAdmin &&
                    <CCol col="6" sm="4" md="2" className="ml-auto">
                            <Link role="button" to="/components/orders/new" block variant="outline" color="success">CRÉER</Link>
                    </CCol>
                }
            </CCardHeader>
            <CCardBody>
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
                        fields={ fields }
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
                                            { isAdmin || Roles.isPicker(currentUser) ?
                                            (isSameDate(new Date(item.deliveryDate), new Date()) ? "Aujourd'hui" : 
                                            isSameDate(new Date(item.deliveryDate), getDateFrom(new Date(), 1)) ? "Demain" :
                                            (new Date(item.deliveryDate)).toLocaleDateString('fr-FR', { timeZone: 'UTC'})) 
                                            : 
                                            isSameDate( getReverseDeliveryDay(new Date(item.deliveryDate), seller), new Date()) ? "Aujourd'hui" : 
                                            isSameDate( getReverseDeliveryDay(new Date(item.deliveryDate), seller), getDateFrom(new Date(), 1)) ? "Demain" :
                                            ( getReverseDeliveryDay(new Date(item.deliveryDate), seller).toLocaleDateString('fr-FR', { timeZone: 'UTC'}))
                                            }
                                        </td>
                            ,
                            'total':
                                item => <td>{ isDefined(item.totalHT) ? item.totalHT.toFixed(2) + " €" : " "}</td>
                            ,
                            ' ':
                                item => (
                                    <td className="mb-3 mb-xl-0 text-center">
                                        <CButton color="warning" disabled={ !isAdmin } href={ "#/components/orders/" + item.id } className="mx-1 my-1"><i className="fas fa-pen"></i></CButton>
                                        <CButton color="danger" disabled={ !isAdmin } onClick={ () => handleDelete(item.id) } className="mx-1 my-1"><i className="fas fa-trash"></i></CButton>
                                    </td>
                                )
                            ,
                            'details':
                                item => <CCollapse show={details.includes(item.id)}>
                                            <OrderDetails orders={ orders } order={ item } setOrders={ setOrders }/>
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