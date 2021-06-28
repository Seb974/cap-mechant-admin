import { CButton, CCard, CCardBody, CCardHeader, CCol, CCollapse, CDataTable, CRow, CWidgetIcon } from '@coreui/react';
import React, { useContext, useEffect, useState } from 'react';
import Select from 'src/components/forms/Select';
import { Link } from 'react-router-dom';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import AuthContext from 'src/contexts/AuthContext';
import { getDeliveredStatus } from 'src/helpers/orders';
import OrderActions from 'src/services/OrderActions';
import { getDateFrom, isSameDate } from 'src/helpers/days';
import Roles from 'src/config/Roles';
import DelivererActions from 'src/services/DelivererActions';
import TouringActions from 'src/services/TouringActions';


const DelivererAccount = (props) => {

    const itemsPerPage = 30;
    const status = getDeliveredStatus();
    const { currentUser } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(false);
    const [details, setDetails] = useState([]);
    const [deliverers, setDeliverers] = useState([]);
    const [tourings, setTourings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewedDeliveries, setViewedDeliveries] = useState([]);
    const [selectedDeliverer, setSelectedDeliverer] = useState(null);
    const [priceView, setPriceView] = useState("HT");
    const [dates, setDates] = useState({start: new Date(), end: new Date() });

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        fetchDeliverers();
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        if (!isDefined(selectedDeliverer) && isDefinedAndNotVoid(deliverers))
            setSelectedDeliverer(deliverers[0]);
    }, [selectedDeliverer, deliverers]);

    useEffect(() => {
        if (isDefined(selectedDeliverer))
            fetchTourings();
    }, [selectedDeliverer, dates]);
    useEffect(() => setViewedDeliveries(getDeliveries()), [tourings]);

    const fetchTourings = () => {
        const UTCDates = getUTCDates(dates);
        TouringActions.findDelivererBetween(UTCDates, selectedDeliverer)
                .then(response =>{
                    setTourings(response);
                    setLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                });
    };

    const fetchDeliverers = () => {
        DelivererActions
            .findAll()
            .then(response => setDeliverers(response.filter(d => !d.isIntern)));
    };

    const handleDelivererChange = ({ currentTarget }) => {
        const newSelection = deliverers.find(seller => seller.id === parseInt(currentTarget.value));
        setSelectedDeliverer(newSelection);
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
        const ownerPart = selectedDeliverer.ownerRate;
        const totalHT = viewedDeliveries.reduce((sum, current) => sum += current.totalHT, 0);
        const totalTTC = viewedDeliveries.reduce((sum, current) => sum += current.totalTTC, 0);
        const totalToPay = getPartToPay(totalHT, ownerPart);
        const totalToPayTTC = getPartToPay(totalTTC, ownerPart);
        const lastTouring = viewedDeliveries.reduce((max, current) => new Date(current.end) > max ? new Date(current.end) : max, new Date(viewedDeliveries[0].end));
        console.log(totalHT);
        console.log(totalTTC);
        console.log(totalToPay);
        console.log(totalToPayTTC);
        console.log(lastTouring);
    };

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    };

    const getDeliveries = () => {
        const selectedTourings = tourings.map(touring => {
            const { id, start, end } = touring;
            const totalHT = getTotalHT(touring);
            const totalTTC = getTotalTTC(touring);
            const ownerPart = selectedDeliverer.ownerRate;
            return {
                id: id.toString().padStart(10, '0'),
                start,
                end,
                totalHT,
                totalTTC,
                totalToPay: getPartToPay(totalHT, ownerPart),
                totalToPayTTC: getPartToPay(totalTTC, ownerPart)
            };
        });
        return selectedTourings;
    };

    const getTotalHT = touring => selectedDeliverer.cost * (isDefinedAndNotVoid(touring.orderEntities) ? touring.orderEntities.length : 0);

    const getTotalTTC = touring => {
        const delivererTax = !selectedDeliverer.isIntern ? selectedDeliverer.tax.catalogTaxes.find(catalogTax => catalogTax.catalog.id === selectedDeliverer.catalog.id) : 0;
        return getTotalHT(touring) * (1 + delivererTax.percent)
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

    return !isDefined(viewedDeliveries) ? <></> : (
        <CCard>
            <CCardHeader className="d-flex align-items-center">
                Liste des livraisons par livreur
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
                        <Select className="mr-2" name="deliverer" label="Vendeur" onChange={ handleDelivererChange } value={ isDefined(selectedDeliverer) ? selectedDeliverer.id : 0 }>
                            { deliverers.map(deliverer => <option key={ deliverer.id } value={ deliverer.id }>{ deliverer.name }</option>) }
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
                    items={ viewedDeliveries }
                    fields={ ['Commande', 'Date', 'Total', 'Total Net'] }
                    bordered
                    itemsPerPage={ itemsPerPage }
                    pagination
                    hover
                    scopedSlots = {{
                        'Commande':
                            item => <td>
                                        { (new Date(item.start)).toLocaleString('fr-FR', { timeZone: 'UTC'}) }
                                    </td>
                        ,
                        'Date':
                            item => <td>
                                        { (new Date(item.end)).toLocaleString('fr-FR', { timeZone: 'UTC'}) }
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
                    { isAdmin && viewedDeliveries.length > 0 &&
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
 
export default DelivererAccount;