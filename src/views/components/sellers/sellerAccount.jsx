import { CButton, CCard, CCardBody, CCardHeader, CCol, CCollapse, CDataTable, CRow, CWidgetIcon } from '@coreui/react';
import React, { useContext, useEffect, useState } from 'react';
import Select from 'src/components/forms/Select';
import { Link } from 'react-router-dom';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import SellerActions from 'src/services/SellerActions';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import AuthContext from 'src/contexts/AuthContext';
import { getDeliveredStatus } from 'src/helpers/orders';
import OrderActions from 'src/services/OrderActions';
import { getDateFrom, isSameDate } from 'src/helpers/days';
import Roles from 'src/config/Roles';


const SellerAccount = (props) => {

    const itemsPerPage = 30;
    const status = getDeliveredStatus();
    const { currentUser } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(false);
    const [details, setDetails] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewedOrders, setViewedOrders] = useState([]);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [priceView, setPriceView] = useState("HT");
    const [dates, setDates] = useState({start: new Date(), end: new Date() });

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        fetchSellers();
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        if (!isDefined(selectedSeller) && isDefinedAndNotVoid(sellers))
            setSelectedSeller(sellers[0]);
    }, [selectedSeller, sellers]);

    useEffect(() => fetchOrders(), [selectedSeller, dates]);
    useEffect(() => setViewedOrders(getOrders()), [orders]);

    const fetchOrders = () => {
        const UTCDates = getUTCDates(dates);
        OrderActions.findStatusBetween(UTCDates, status, currentUser)
                .then(response =>{
                    setOrders(response);
                    setLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                });
    };

    const fetchSellers = () => {
        SellerActions
            .findAll()
            .then(response => setSellers(response));
    };

    const handleSellerChange = ({ currentTarget }) => {
        const newSelection = sellers.find(seller => seller.id === parseInt(currentTarget.value));
        setSelectedSeller(newSelection);
    };

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])){
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const handlePriceView = ({ currentTarget }) => setPriceView(currentTarget.value);

    const handlePay = () => {
        const ownerPart = selectedSeller.ownerRate;
        const totalHT = viewedOrders.reduce((sum, current) => sum += current.totalHT, 0);
        const totalTTC = viewedOrders.reduce((sum, current) => sum += current.totalTTC, 0);
        const totalToPay = getPartToPay(totalHT, ownerPart);
        const totalToPayTTC = getPartToPay(totalTTC, ownerPart);
        const lastOrder = viewedOrders.reduce((max, current) => new Date(current.deliveryDate) > max ? new Date(current.deliveryDate) : max, new Date(viewedOrders[0].deliveryDate));
        console.log(totalHT);
        console.log(totalTTC);
        console.log(totalToPay);
        console.log(totalToPayTTC);
        console.log(lastOrder);
    };

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    };

    const getOrders = () => {
        const sellerOrders = orders.map(order => {
            const { id, name, deliveryDate } = order;
            const totalHT = getTotalHT(order);
            const totalTTC = getTotalTTC(order);
            const ownerPart = selectedSeller.ownerRate
            return {
                id: id.toString().padStart(10, '0'),
                name,
                deliveryDate,
                totalHT,
                totalTTC,
                totalToPay: getPartToPay(totalHT, ownerPart),
                totalToPayTTC: getPartToPay(totalTTC, ownerPart)
            };
        });
        return sellerOrders.filter(order => order.totalHT > 0);
    };

    const getTotalHT = order => {
        return order.items.reduce((sum, current) => 
            sum += current.product.seller.id === selectedSeller.id ? current.deliveredQty * current.price : 0, 0);
    };


    const getTotalTTC = order => {
        return order.items.reduce((sum, current) => 
            sum += current.product.seller.id === selectedSeller.id ? current.deliveredQty * current.price * (1 + current.taxRate) : 0, 0);
    };

    const getPartToPay = (total, rate) => total * (1 - (rate / 100));

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

    return (
        <CCard>
            <CCardHeader className="d-flex align-items-center">
                Liste des ventes par vendeur
            </CCardHeader>
            <CCardBody>
                <CRow>
                    {/* <CCol xs="12" sm="6" lg="3">
                        <CWidgetIcon text="Commandes" header={ provisions.length } color="primary" iconPadding={false}>
                            <CIcon width={24} name="cil-clipboard"/>
                        </CWidgetIcon>
                        </CCol>
                        <CCol xs="12" sm="6" lg="3">
                        <CWidgetIcon text="Fournisseurs" header={ getSupplierCount() } color="info" iconPadding={false}>
                            <CIcon width={24} name="cil-people"/>
                        </CWidgetIcon>
                        </CCol>
                        <CCol xs="12" sm="6" lg="3">
                        <CWidgetIcon text="Moyenne" header={ (provisions.length > 0 ? (getTurnover() / provisions.length).toFixed(2) : "0.00") + " €"} color="warning" iconPadding={false}>
                            <CIcon width={24} name="cil-chart"/>
                        </CWidgetIcon>
                        </CCol>
                        <CCol xs="12" sm="6" lg="3">
                        <CWidgetIcon text="Total" header={ getTurnover().toFixed(2) + " €" } color="danger" iconPadding={false}>
                            <CIcon width={24} name="cil-money"/>
                        </CWidgetIcon>
                    </CCol> */}
                </CRow>
                <CRow>
                    <CCol xs="12" sm="12" md="4" className="mt-4">
                        <Select className="mr-2" name="seller" label="Vendeur" onChange={ handleSellerChange } value={ isDefined(selectedSeller) ? selectedSeller.id : 0 }>
                            { sellers.map(seller => <option key={ seller.id } value={ seller.id }>{ seller.name }</option>) }
                        </Select>
                    </CCol>
                    <CCol xs="12" sm="12" md="4" className="mt-4">
                        <RangeDatePicker
                            minDate={ dates.start }
                            maxDate={ dates.end }
                            onDateChange={ handleDateChange }
                            label="Date"
                            className = "form-control mb-3"
                        />
                    </CCol>
                    <CCol xs="12" sm="12" md="4" className="mt-4">
                        <Select className="mr-2" name="priceView" label="Affichage" onChange={ handlePriceView } value={ priceView }>
                            <option value={ "HT" }>{ "Hors taxe" }</option>
                            <option value={ "TTC" }>{ "Taxes comprises" }</option>
                        </Select>
                    </CCol>
                </CRow>
                <CDataTable
                    items={ viewedOrders }
                    fields={ ['Commande', 'Date', 'Total', 'Total Net'] }
                    bordered
                    itemsPerPage={ itemsPerPage }
                    pagination
                    hover
                    scopedSlots = {{
                        'Commande':
                            item => <td>
                                        <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} >
                                            { item.name }<br/>
                                            <small><i>{ "N°" + item.id }</i></small>
                                            <br/>
                                        </Link>
                                    </td>
                        ,
                        'Date':
                            item => <td>
                                        { (new Date(item.deliveryDate)).toLocaleDateString('fr-FR', { timeZone: 'UTC'}) }
                                    </td>
                        ,
                        'Total':
                            item => <td>
                                        { priceView === "HT" ? item.totalHT.toFixed(2) : item.totalTTC.toFixed(2) } €
                                    </td>
                        ,
                        'Total Net':
                            item => <td>
                                        { priceView === "HT" ? item.totalToPay.toFixed(2): item.totalToPayTTC.toFixed(2) } €
                                    </td>
                        }}
                    />
                    { isAdmin && viewedOrders.length > 0 &&
                        <CRow className="mt-4 d-flex justify-content-center align-items-start">
                            <CButton size="sm" color="success" onClick={ handlePay } style={{width: '140px', height: '35px'}}>
                                Clôturer
                            </CButton>
                        </CRow>
                    }
            </CCardBody>
        </CCard>
    );
}
 
export default SellerAccount;