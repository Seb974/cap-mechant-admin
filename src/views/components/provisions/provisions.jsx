import React, { useContext, useEffect, useState } from 'react';
import ProvisionActions from '../../../services/ProvisionActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CCollapse, CFormGroup, CInputCheckbox, CLabel } from '@coreui/react';
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { isSameDate, getDateFrom } from 'src/helpers/days';
import Spinner from 'react-bootstrap/Spinner'
import OrderDetails from 'src/components/preparationPages/orderDetails';

import SelectMultiple from 'src/components/forms/SelectMultiple';

import SupplierActions from 'src/services/SupplierActions';
import SellerActions from 'src/services/SellerActions';

const Provisions = (props) => {

    const itemsPerPage = 30;
    const fields = ['Client', 'Fournisseur', 'Date', 'Total', ' '];
    const { currentUser } = useContext(AuthContext);
    const [provisions, setProvisions] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [details, setDetails] = useState([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const [selectedSellers, setSelectedSellers] = useState([]);

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        fetchSuppliers();
        fetchSellers();
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        if (suppliers.length > 0 && !isDefinedAndNotVoid(selectedSuppliers))
            setSelectedSuppliers(getFormattedEntities(suppliers));
    }, [suppliers]);

    useEffect(() => {
        if (sellers.length > 0 && !isDefinedAndNotVoid(selectedSellers))
            setSelectedSellers(getFormattedEntities(sellers));
    }, [sellers]);

    useEffect(() => {
        if (isDefinedAndNotVoid(selectedSuppliers) && isDefinedAndNotVoid(selectedSellers))
            fetchProvisions()
    }, [dates, selectedSuppliers, selectedSellers]);

    const fetchProvisions = () => {
        setLoading(true);
        const UTCDates = getUTCDates(dates);
        ProvisionActions.findSuppliersBetween(UTCDates, selectedSuppliers, selectedSellers, currentUser)
                .then(response =>{
                    console.log(response);
                    setProvisions(response);
                    setLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                });
    };

    const fetchSuppliers = () => {
        SupplierActions
            .findAll()
            .then(response => setSuppliers(response));
    };

    const fetchSellers = () => {
        SellerActions
            .findAll()
            .then(response => setSellers(response));
    };

    const handleDelete = item => {
        const originalProvisions = [...provisions];
        setProvisions(provisions.filter(provision => provision.id !== item.id));
        ProvisionActions.delete(item, isAdmin)
                      .catch(error => {
                           setProvisions(originalProvisions);
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

    const handleSuppliersChange = suppliers => setSelectedSuppliers(suppliers);
    const handleSellersChange = sellers => setSelectedSellers(sellers);

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    };

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

    const getFormattedEntities = suppliers => {
        return suppliers.map(supplier => ({ value: supplier['@id'], label: supplier.name, isFixed: false }));
    };

    const getProductName = (product, variation, size) => {
        const variationName = exists(variation, 'color') ? " - " + variation.color : "";
        const sizeName = exists(size, 'name') ? " " + size.name : "";
        return product.name + variationName + sizeName;
    };

    const exists = (entity, variable) => {
        return isDefined(entity) && isDefined(entity[variable]) && entity[variable].length > 0 && entity[variable] !== " ";
    };

    return (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader className="d-flex align-items-center">
                        Liste des approvisionnements
                        <CCol col="6" sm="4" md="2" className="ml-auto">
                            <Link role="button" to="/components/provisions/new" block variant="outline" color="success">CRÉER</Link>
                        </CCol>
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
                        <CRow>
                            <CCol xs="12" lg="6">
                                <SelectMultiple name="sellers" label="Vendeurs" value={ selectedSellers } onChange={ handleSellersChange } data={ getFormattedEntities(sellers) }/>
                            </CCol>
                            <CCol xs="12" lg="6">
                                <SelectMultiple name="suppliers" label="Founisseurs" value={ selectedSuppliers } onChange={ handleSuppliersChange } data={ getFormattedEntities(suppliers) }/>
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
                                items={ provisions }
                                fields={ fields }
                                bordered
                                itemsPerPage={ itemsPerPage }
                                pagination
                                scopedSlots = {{
                                    'Client':
                                        item => <td>
                                                    <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} >
                                                        { item.seller.name }
                                                        <br/>
                                                    </Link>
                                                </td>
                                    ,
                                    'Fournisseur':
                                        item => <td>
                                                    <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} >
                                                        { item.supplier.name }
                                                        <br/>
                                                    </Link>
                                                </td>
                                    ,
                                    'Date':
                                        item => <td style={{color: item.status === "WAITING" ? "dimgray" : "black"}}>
                                                    { isSameDate(new Date(item.provisionDate), new Date()) ? "Aujourd'hui" : 
                                                    isSameDate(new Date(item.provisionDate), getDateFrom(new Date(), -1)) ? "Hier" :
                                                    (new Date(item.provisionDate)).toLocaleDateString('fr-FR', { timeZone: 'UTC'})
                                                    }
                                                </td>
                                    ,
                                    'Total':
                                        item => <td style={{color: item.status === "WAITING" ? "dimgray" : "black"}}>
                                                    { isDefined(item.totalHT) ? item.totalHT.toFixed(2) + " €" : " "}
                                                    { item.goods.reduce((sum, current) => sum + (current.quantity * current.price), 0).toFixed(2) + " €"}
                                                </td>
                                    ,
                                    ' ':
                                        item => (
                                            <td className="mb-3 mb-xl-0 text-center" style={{color: item.status === "WAITING" ? "dimgray" : "black"}}>
                                                <CButton color="warning" disabled={ !isAdmin } href={ "#/components/provisions/" + item.id } className="mx-1 my-1"><i className="fas fa-pen"></i></CButton>
                                                <CButton color="danger" disabled={ !isAdmin } onClick={ () => handleDelete(item) } className="mx-1 my-1"><i className="fas fa-trash"></i></CButton>
                                            </td>
                                        )
                                    ,
                                    'details':
                                        item => <CCollapse show={details.includes(item.id)}>
                                                    <CDataTable
                                                        items={ item.goods }
                                                        fields={ ['Produit', 'Prix U', 'Quantité', 'Sous-total'] }
                                                        bordered
                                                        itemsPerPage={ itemsPerPage }
                                                        pagination
                                                        scopedSlots = {{
                                                            'Produit':
                                                                item => <td>{ getProductName(item.product, item.variation, item.size) }</td>
                                                            ,
                                                            'Prix U':
                                                                item => <td>{ item.price.toFixed(2) + " €" }</td>
                                                            ,
                                                            'Quantité':
                                                                item => <td>{ item.quantity.toFixed(2) + " " + item.unit }</td>
                                                            ,
                                                            'Sous-total':
                                                                item => <td>{ (item.quantity * item.price).toFixed(2) + " €" }</td>
                                                        }}
                                                    />
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

export default Provisions;