import React, { useContext, useEffect, useState } from 'react';
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CProgress, CRow, CCallout} from '@coreui/react';
import { getActiveStatus } from 'src/helpers/orders';
import AuthContext from 'src/contexts/AuthContext';
import { getDateFrom, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import ProductsContext from 'src/contexts/ProductsContext';
import { updateStatusBetween } from 'src/data/dataProvider/eventHandlers/orderEvents';
import MercureContext from 'src/contexts/MercureContext';
import ProvisionActions from 'src/services/ProvisionActions';
import Select from 'src/components/forms/Select';
import { updateBetween } from 'src/data/dataProvider/eventHandlers/provisionEvents';

const SalesStats = () => {

    const status = getActiveStatus();
    const { products } = useContext(ProductsContext);
    const { currentUser, supervisor, seller } = useContext(AuthContext);
    const { updatedProvisions, setUpdatedProvisions } = useContext(MercureContext);
    const [mercureOpering, setMercureOpering] = useState(false);
    const [sales, setSales] = useState([]);
    const [dates, setDates] = useState({start: getDateFrom(new Date(), -30), end: new Date() });
    const [supplierSales, setSupplierSales] = useState([]);
    const [breaks, setBreaks] = useState([]);
    const [supplierLimit, setSupplierLimit] = useState(10);
    const [productLimit, setProductLimit] = useState(10);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedProvisions) && !mercureOpering) {
            setMercureOpering(true);
            updateBetween(getUTCDates(), sales, setSales, updatedProvisions, setUpdatedProvisions)
                .then(response => setMercureOpering(response));
        }
    }, [updatedProvisions]);

    useEffect(() => fetchSales(), [dates]);

    useEffect(() => {
        const suppliersStats = getSuppliersStats();
        const breaksSales = getBreaks();
        setSupplierSales(suppliersStats);
        setBreaks(breaksSales);
    }, [sales, products]);

    const fetchSales = () => {
        ProvisionActions
            .findBetween(getUTCDates(), [{ value: seller['@id'], label: seller.name }])
            .then(response => setSales(response.filter(p => isDefinedAndNotVoid(p.goods) )));       // && p.status === "RECEIVED"
    };

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])){
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const onSupplierLimitChange = ({ currentTarget }) => {
        const newLimit = currentTarget.value === "Tous" ? supplierSales.length : parseInt(currentTarget.value);
        setSupplierLimit(newLimit);
    };

    const onProductLimitChange = ({ currentTarget }) => {
        const newLimit = currentTarget.value === "Tous" ? products.length : parseInt(currentTarget.value);
        setProductLimit(newLimit);
    };

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    };

    const getClients = () => {
        let clients = [];
        sales.map(s => clients = clients.includes(s.email) ? clients : [...clients, s.email]);
        return clients.length;
    };

    const getSuppliersStats = () => {
        const suppliers = getSuppliers();
        const suppliersStats = suppliers.map(supplier => {
            let totalOrdered = 0;
            let totalDelivered = 0;
            sales.map(s => {
                if (supplier.id === s.supplier.id) {
                    totalOrdered += s.goods.reduce((sum, i) => sum += i.quantity, 0);
                    totalDelivered += s.goods.reduce((sum, i) => sum += isDefined(i.received) ? i.received : i.quantity, 0);
                }
            })
            return {...supplier, ordered: totalOrdered, delivered: totalDelivered, failed: totalOrdered - totalDelivered};
        });
        return suppliersStats;
    };

    const getSuppliers = () => {
        let suppliersArray = [];
        sales.map(s => {
            const newSupplier = suppliersArray.find(supplier => supplier.id === s.supplier.id);
            if (newSupplier === undefined) {
                suppliersArray = [...suppliersArray, s.supplier];
            }
        });
        return suppliersArray;
    };

    const getProductCount = () => {
        let products = [];
        sales.map(s => {
            products = [...products, ...s.goods.map(g => g.product)]
        });
        return [...new Set(products.map(p => p.id))].length;
    };

    const getBreaks = () => {
        const productsbroken = products.map(p => {
            let totalOrdered = 0;
            let totalFailed = 0;
            sales.map(s => {
                if (s.status === "RECEIVED") {
                    s.goods.map(i => {
                        if (i.product.id === p.id && isDefined(i.quantity) && isDefined(i.received)) {
                            totalOrdered += i.quantity;
                            totalFailed += (i.quantity - i.received);
                        }
                    });
                }
            });
            return { name: p.name, unit: p.unit, ordered: totalOrdered, broken: totalFailed };
        });
        return productsbroken.filter(b => b.ordered > 0);
    };

    const getVolume = () => {
        return sales.reduce((tSum, s) => {
            return tSum += s.goods.reduce((sum, i) => {
                const quantity = isDefined(i.received) ? i.received : i.quantity;
                return sum += i.product.unit.toUpperCase() !== "KG" ? quantity * i.product.weight : quantity;
            }, 0);
        }, 0). toFixed(2);
    };

    const getTotal = () => {
        return sales.reduce((tSum, s) => {
            return tSum += s.goods.reduce((sum, i) => {
                const quantity = isDefined(i.received) ? i.received : i.quantity;
                return sum += quantity * i.price;
            }, 0);
        }, 0). toFixed(2);
    };

    return (
        <CRow>
            <CCol>
            <CCard>
                <CCardHeader>
                    <CRow className="d-flex justify-content-start">
                        <CCol xs="12" sm="12" lg="12" className="mx-0">
                            <h6>Achats fournisseurs</h6>
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol xs="12" sm="12" lg="4">
                            <RangeDatePicker
                                minDate={ dates.start }
                                maxDate={ dates.end }
                                onDateChange={ handleDateChange }
                                label="Date(s)"
                                className="form-control"
                            />
                        </CCol>
                        <CCol xs="12" sm="12" lg="4">
                            <Select name="supplierLimit" label="Vue fournisseurs" onChange={ onSupplierLimitChange } value={ supplierLimit === supplierSales.length ? "Tous" : supplierLimit }>
                                <option value="5">5 fournisseurs</option>
                                <option value="10">10 fournisseurs</option>
                                <option value="20">20 fournisseurs</option>
                                <option value="Tous">Tous</option>
                            </Select>
                        </CCol>
                        <CCol xs="12" sm="12" lg="4">
                            <Select name="productLimit" label="Vue produits" onChange={ onProductLimitChange } value={ productLimit === products.length ? "Tous" : productLimit }>
                                <option value="5">5 produits</option>
                                <option value="10">10 produits</option>
                                <option value="20">20 produits</option>
                                <option value="Tous">Tous</option>
                            </Select>
                        </CCol>
                    </CRow>
                </CCardHeader>
                <CCardBody>
                <CRow>
                    <CCol xs="12" md={!isDefined(supervisor) ? "6" : "12"} xl={!isDefined(supervisor) ? "6" : "12"}>
                        <CRow>
                            <CCol sm={!isDefined(supervisor) ? "6" : "3"}>
                                <CCallout color="info">
                                    <small className="text-muted">Fournisseur(s)</small>
                                    <br />
                                    <strong className="h4">{ supplierSales.filter(p => p.ordered > 0).length }</strong>
                                </CCallout>
                            </CCol>
                            <CCol sm={!isDefined(supervisor) ? "6" : "3"}>
                                <CCallout color="danger">
                                    <small className="text-muted">{!isDefined(supervisor) ? "Rupture(s)" : "Commande(s)"}</small>
                                    <br />
                                    <strong className="h4">
                                        { !isDefined(supervisor) ?
                                            supplierSales.reduce((sum, b) => sum += isDefined(b.ordered) ? b.ordered : 0, 0) > 0 ?
                                                (supplierSales.reduce((sum, b) => sum += b.failed, 0) * 100 / supplierSales.reduce((sum, b) => sum += isDefined(b.ordered) ? b.ordered : 0, 0)).toFixed(2)+ '%' :
                                                0
                                            :
                                            sales.length
                                        }
                                    </strong>
                                </CCallout>
                            </CCol>
                            { isDefined(supervisor) &&
                                <>
                                    <CCol sm="3">
                                        <CCallout color="warning">
                                            <small className="text-muted">{ !isDefined(supervisor) ? "Clients" : "Volume" }</small>
                                            <br />
                                            <strong className="h4">{ !isDefined(supervisor) ? getClients() : (getVolume() + " Kg") }</strong>
                                        </CCallout>
                                    </CCol>
                                    <CCol sm="3">
                                        <CCallout color="success">
                                            <small className="text-muted">{ !isDefined(supervisor) ? "Commandes" : "Prix moyen du Kg" }</small>
                                            <br />
                                            <strong className="h4">
                                                {  !isDefined(supervisor) ? sales.length : 
                                                (isDefinedAndNotVoid(sales) ? (getTotal() / getVolume()).toFixed(2) : 0) + " €"
                                                }
                                            </strong>
                                        </CCallout>
                                    </CCol>
                                </>
                            }
                        </CRow>

                        <hr className="mt-0" />

                        { supplierSales
                            .filter(p => p.ordered > 0)
                            .sort((a, b) => (a.failed > b.failed) ? -1 : 1)
                            .filter((p, i) => i < supplierLimit)
                            .map((supplier, i) => {
                                const totalOrdered = supplierSales.reduce((sum, s) => sum += s.ordered, 0);
                                return (
                                    <div key={ i } className="progress-group mb-4">
                                        <div className="progress-group-prepend">
                                        <span className="progress-group-text">{ supplier.name }</span>
                                        </div>
                                        <div className="progress-group-bars">
                                            <div className="progress-group-header mb-0">
                                                <span className="ml-auto text-muted small">{ (supplier.ordered / totalOrdered * 100).toFixed(2) + "%" }</span>
                                            </div>
                                            <div className="progress-group-bars">
                                                <CProgress className="progress-xs" color="info" value={ (supplier.ordered / totalOrdered * 100).toFixed(2) } />
                                            </div>
                                            <div className="progress-group-header"></div>
                                            <div className="progress-group-bars">
                                                <CProgress className="progress-xs" color="danger" value={ (supplier.failed / supplier.ordered * 100).toFixed(2) } />
                                            </div>
                                            <div className="progress-group-footer d-flex justify-content-end">
                                                <span className="ml-auto text-muted small">{ (supplier.failed / supplier.ordered * 100).toFixed(2) + "%" }</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        }
                        { supplierSales.length > 0 && 
                            <div className="legend text-center">
                                <small>
                                <sup className="px-1"><CBadge shape="pill" color="info">&nbsp;</CBadge></sup>
                                Commandes
                                &nbsp;
                                <sup className="px-1"><CBadge shape="pill" color="danger">&nbsp;</CBadge></sup>
                                Ruptures
                                </small>
                            </div>
                        }
                    </CCol>
                    { !isDefined(supervisor) && 
                        <>
                            <CCol xs="12" md="6" xl="6">
                                <CRow>
                                    <CCol sm="6">
                                        <CCallout color="success">
                                            <small className="text-muted">{ !isDefined(supervisor) ? "Produit(s)" : "Prix moyen du Kg" }</small>
                                            <br />
                                            <strong className="h4">
                                                {  !isDefined(supervisor) ? getProductCount() :
                                                (isDefinedAndNotVoid(sales) ? (getTotal() / getVolume()).toFixed(2) : 0) + " €"
                                                }
                                            </strong>
                                        </CCallout>
                                    </CCol>
                                    <CCol sm="6">
                                        <CCallout color="warning">
                                            <small className="text-muted">{ !isDefined(supervisor) ? "Rupture(s)" : "Volume" }</small>
                                            <br />
                                            <strong className="h4">{ !isDefined(supervisor) ? getClients() : (getVolume() + " Kg") }</strong>
                                        </CCallout>
                                    </CCol>
                                </CRow>

                            <hr className="mt-0" />

                            { breaks
                                .filter(b => b.broken > 0)
                                .sort((a, b) => ( (a.broken/ a.ordered) > (b.broken / b.ordered)) ? -1 : 1)
                                .filter((b, i) => i < productLimit)
                                .map((b, i) => {
                                    return (
                                        <div key={ i } className="progress-group">
                                            <div className="progress-group-header">
                                                <span className="title">{ b.name }</span>
                                                <span className="ml-auto font-weight-bold">{ b.broken.toFixed(2) + ' ' + b.unit }  <span className="text-muted small">{ ' - ' + (b.broken / b.ordered * 100).toFixed(2) + '%' }</span></span>
                                            </div>
                                            <div className="progress-group-bars">
                                                <CProgress className="progress-xs" color="warning" value={ (b.broken / b.ordered * 100).toFixed(2) } />
                                            </div>
                                        </div>
                                    )
                                })
                            }
                            </CCol>
                        </>
                    }
                </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
  )
}

export default SalesStats
