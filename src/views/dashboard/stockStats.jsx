import React, { useContext, useEffect, useState } from 'react';
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CProgress, CRow, CCallout, CLabel} from '@coreui/react';
import OrderActions from 'src/services/OrderActions';
import { getActiveStatus } from 'src/helpers/orders';
import AuthContext from 'src/contexts/AuthContext';
import { getDateFrom, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { isSameDate } from 'src/helpers/days';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import ProductsContext from 'src/contexts/ProductsContext';
import Roles from 'src/config/Roles';
import CIcon from '@coreui/icons-react';
import { updateStatusBetween } from 'src/data/dataProvider/eventHandlers/orderEvents';
import MercureContext from 'src/contexts/MercureContext';
import Select from 'src/components/forms/Select';
import { updateBetween } from 'src/data/dataProvider/eventHandlers/provisionEvents';
import ProvisionActions from 'src/services/ProvisionActions';

const StockStats = () => {

    const status = getActiveStatus();
    const { products } = useContext(ProductsContext);
    const { currentUser, supervisor, seller } = useContext(AuthContext);
    const { updatedProvisions, setUpdatedProvisions } = useContext(MercureContext);
    const [mercureOpering, setMercureOpering] = useState(false);
    const [sales, setSales] = useState([]);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [breaks, setBreaks] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedProvisions) && !mercureOpering) {
            setMercureOpering(true);
            updateBetween(getUTCDates(), sales, setSales, updatedProvisions, setUpdatedProvisions)
                .then(response => setMercureOpering(response));
        }
    }, [updatedProvisions]);

    useEffect(() => {
        if (isDefined(seller))
            fetchSales()
    }, [dates, seller]);

    useEffect(() => setStocks(defineStocks()), [sales, products]);

    useEffect(() => setBreaks(getBreaks()), [stocks]);

    const fetchSales = () => {
        ProvisionActions
            .findBetween(getUTCDates(), [{ value: seller['@id'], label: seller.name }])
            .then(response => setSales(response.filter(p => isDefinedAndNotVoid(p.goods) )));       // && p.status === "RECEIVED"
    };

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])){
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 4, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    };

    const defineStocks = () => {
        let newStocks = [];
        products.map(product => {
            newStocks = getStock(product, newStocks);
        });
        return newStocks;
    };

    const getStock = (product, stocks) => {
        // if (isDefined(product.stock))
            stocks = [...stocks, {...product.stock, name: product.name, unit: product.unit }];
        // else if (isDefinedAndNotVoid(product.variations)) {
        //     product.variations.map(variation => {
        //         if (isDefinedAndNotVoid(variation.sizes)) {
        //             variation.sizes.map(size => {
        //                 stocks = [...stocks, {...size.stock, name: getProductName(product, variation, size), unit: product.unit }];
        //             });
        //         }
        //     });
        // }
        return stocks;
    };

    // const getProductName = (product, variation, size) => {
    //     const variationName = exists(variation, variation.color) ? " - " + variation.color : "";
    //     const sizeName = exists(size, size.name) ? " " + size.name : "";
    //     return product.name + variationName + sizeName;
    // };

    // const exists = (entity, entityName) => {
    //     return isDefined(entity) && isDefined(entityName) && entityName.length > 0 && entityName !== " ";
    // };

    const getBreaks = () => {
        const brokenStocks = products.map(p => {
            let totalOrdered = 0;
            sales.map(s => {
                s.goods.map(i => {
                    if (i.product.id === p.id && !isDefined(i.received))
                        totalOrdered += i.quantity;
                });
            });
            return { ...p, ordered: totalOrdered };
        });
        return brokenStocks.filter(b => b.ordered > 0);
    };

    const getColor = item => {
        const percent = isDefined(item) && isDefinedAndNotVoid(breaks) ? (item.ordered * 100 / breaks.reduce((sum, i) => sum += i.ordered, 0)).toFixed(2) : 0;
        return  percent < 5 ? "success" : 
                percent >= 5 && percent < 10 ? "info" :
                percent >= 10 && percent < 20 ? "warning" : "danger";
    };

    const getConsumers = item => {
        let consumers = [];
        sales.map(s => {
            if (isDefined(s.user)) {
                s.goods.map(i => {
                    if (item.id === i.product.id)
                        consumers = [...consumers, { user: s.user}];
                });
            }
        });
        return [...new Set(consumers.map(c => c.user.id))].length;
    };

    const onLimitChange = ({ currentTarget }) => {
        const newLimit = currentTarget.value === "Tous" ? products.length : parseInt(currentTarget.value);
        setLimit(newLimit);
    };

    return (
        <CRow>
            <CCol>
            <CCard>
                <CCardHeader>
                    <CRow className="d-flex justify-content-start">
                        <CCol xs="12" sm="12" lg="12" className="mx-0">
                            <h6>Commandes clients</h6>
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol xs="12" sm="12" lg="6">
                            <RangeDatePicker
                                minDate={ dates.start }
                                maxDate={ dates.end }
                                onDateChange={ handleDateChange }
                                label="Date(s)"
                                className="form-control"
                            />
                        </CCol>
                        <CCol xs="12" sm="12" lg="6">
                            <Select name="limit" label="Vue" onChange={ onLimitChange } value={ limit === products.length ? "Tous" : limit }>
                                <option value="5">5 produits</option>
                                <option value="10">10 produits</option>
                                <option value="20">20 produits</option>
                                <option value="Tous">Tous</option>
                            </Select>
                        </CCol>
                    </CRow>
                </CCardHeader>
                <CCardBody>

                    <table className="table table-hover table-outline mb-0 d-none d-sm-table">
                        <thead className="thead-light">
                            <tr>
                                <th>Produit</th>
                                <th>% Demande</th>
                                <th className="text-center">Commandé</th>
                            </tr>
                        </thead>
                            <tbody>
                                { breaks.length > 0 ? breaks
                                    .sort((a, b) => (a.ordered > b.ordered) ? 1 : -1)
                                    .sort((a, b) => (a.quantity - a.ordered) > (b.quantity - b.ordered) ? 1 : -1)
                                    .filter((b, i) => i < limit)
                                    .map((b, i) => {
                                        return (
                                            <tr key={ i }>
                                                <td>
                                                    <div>{ b.name }</div>
                                                </td>
                                                <td>
                                                    <div className="clearfix">
                                                        <div className="float-left">
                                                        <strong>{ (b.ordered * 100 / breaks.reduce((sum, i) => sum += i.ordered, 0)).toFixed(2) + '%' }</strong>
                                                        </div>
                                                        <div className="float-right">
                                                            <small className="text-muted">{ getConsumers(b) + ( getConsumers(b) <= 1 ? " client" : " clients") }</small>
                                                        </div>
                                                    </div>
                                                    <CProgress className="progress-xs" color={ getColor(b) } value={ (b.ordered * 100 / breaks.reduce((sum, i) => sum += i.ordered, 0)).toFixed(2) } />
                                                </td>
                                                <td className="text-center">
                                                    <strong>{ b.ordered + " " + b.unit }</strong>
                                                </td>
                                            </tr>
                                        )
                                    })
                                    : <tr><td colSpan="3" className="text-center">
                                        <i><b>Aucune commande sur la période sélectionnée</b></i>
                                    </td></tr>
                                }
                            </tbody>
                    </table>
                </CCardBody>
            </CCard>
        </CCol>
    </CRow>
  )
}

export default StockStats;
