import React, { useContext, useEffect, useState } from 'react';
import OrderActions from '../../../services/OrderActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CFormGroup, CInputGroup, CInput, CInputGroupAppend, CInputGroupText } from '@coreui/react';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { getEvolutionPoints, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Spinner from 'react-bootstrap/Spinner'
import Select from 'src/components/forms/Select';
import SupplierActions from 'src/services/SupplierActions';
import { getStatus } from 'src/helpers/orders';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import ProductsContext from 'src/contexts/ProductsContext';
import { getProductGroups } from 'src/helpers/products';

const Supplying = (props) => {

    const itemsPerPage = 30;
    const rates = getEvolutionPoints();
    const fields = ['Produit', 'date', 'total', 'selection', ' '];
    const { currentUser } = useContext(AuthContext);
    const { products } = useContext(ProductsContext);
    const [orders, setOrders] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [selectAll, setSelectAll] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const selectedStatus = getStatus().filter(s => !["ON_PAYMENT", "ABORTED"].includes(s.value));
    const [productGroups, setProductGroups] = useState(getProductGroups());
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [evolution, setEvolution] = useState(0);


    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        getOrders();
        fetchSuppliers();
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    useEffect(() => getOrders(), [dates]);

    useEffect(() => {
        if (isDefinedAndNotVoid(orders) && isDefinedAndNotVoid(products) && isDefinedAndNotVoid(productGroups)) {
            const productsToDisplay = getProductsList();
            setDisplayedProducts(productsToDisplay);
        }
    }, [orders, products, productGroups, evolution]);

    const getOrders = () => {
        setLoading(true);
        const UTCDates = getUTCDates(dates);
        OrderActions.findStatusBetween(UTCDates, selectedStatus, currentUser)
                .then(response => {
                    console.log(response);
                    setOrders(response.map(data => ({...data, selected: false})));
                    setLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                });
    }

    const fetchSuppliers = () => {
        SupplierActions
            .findAll()
            .then(response => {
                    setSuppliers(response);
                    setSelectedSupplier(response[0]);
                });
    };

    const handleGroupChange = productGroups => setProductGroups(productGroups);

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])){
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const handleSelect = item => {
        let newValue = null;
        const newProductsList = displayedProducts.map(element => {
            newValue = !element.selected;
            return element.id === item.id ? {...element, selected: newValue} : element;
        });
        setDisplayedProducts(newProductsList);
        if (newValue && selectAll)
            setSelectAll(false);
    };

    const handleSelectAll = () => {
        const newSelection = !selectAll;
        setSelectAll(newSelection);
        const newProductsList = displayedProducts.map(product => (isSelectable(product) ? {...product, selected: newSelection} : product));
        setDisplayedProducts(newProductsList);
    };

    const handleCommandChange = ({ currentTarget }, item) => {
        const newProductList = displayedProducts.map(element => (element.id === item.id ? {...element, quantity: currentTarget.value} : element));
        setDisplayedProducts(newProductList);
    };

    const handleSupplierChange = ({ currentTarget }) => {
        const newSupplier = suppliers.find(supplier => supplier.id === parseInt(currentTarget.value));
        setSelectedSupplier(newSupplier);
    };

    const handleEvolutionChange = ({ currentTarget }) => {
        const newRate = parseInt(currentTarget.value);
        setEvolution(newRate);
    }

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    };

    const isSelectable = product => {
        const { quantity } = product;
        return ((typeof quantity === 'string' && quantity.length > 0) || typeof quantity !== 'string') && parseInt(quantity) > 0;
    };

    const getProductsList = () => {
        const groupSelection = productGroups.map(p => p.value);
        const groupProducts = products.filter(p => groupSelection.includes(p.productGroup));
        const productsList = getProductsArray(groupProducts);
        return extractSales(productsList);
    };

    const getProductsArray = groups => {
        let productsList = [];
        groups.map(product => {
            if (isDefinedAndNotVoid(product.variations))
                product.variations.map(variation => {
                    if (isDefinedAndNotVoid(variation.sizes))
                        variation.sizes.map(size => {
                            productsList = [...productsList, getVariantProduct(product, variation, size)]
                        });
                });
            else
                productsList = [...productsList, getSimpleProduct(product)];
        });
        return productsList;
    };

    const getSimpleProduct = product => {
        return { 
            product: { id: product.id, name: product.name },
            variation: null,
            size: null,
            stock: product.stock,
            unit: product.unit,
            selected: false
        };
    }

    const getVariantProduct = (product, variation, size) => {
        return {
            product: { id: product.id, name: product.name },
            variation: { id: variation.id, name: variation.color },
            size: { id: size.id, name: size.name },
            stock: size.stock,
            unit: product.unit,
            selected: false
        };
    };

    const extractSales = elements => elements.map((element, index) => addSales(element, index));

    const addSales = (element, index) => {
        let sales = 0;
        const { security, quantity } = element.stock;
        orders.map(order => {
            if (!order.isRemains)
                sales = extractProduct(element, order, sales);
        });
        const evolutedSales = sales * (1 + evolution / 100);
        const qty = (evolutedSales + security - quantity);
        return {...element, id: index, quantity: qty > 0 ? Math.ceil(qty) : 0, sales: evolutedSales.toFixed(2) };
    };

    const extractProduct = (element, order, sales) => {
        order.items.map(item => {
            if (isItemProduct(item, element)) {
                const itemQty = item.unit === item.product.unit || !isDefined(item.preparedQty) || item.isAdjourned ? item.orderedQty : item.preparedQty;
                sales += itemQty;
            }
        })
        return sales;
    };

    const isItemProduct = (item, element) => {
        const { product, variation, size } = element;
        if (item.product.id === product.id) {
            if (isDefined(variation) && isDefined(item.variation) && variation.id === item.variation.id) {
                if (isDefined(size) && isDefined(item.size) && size.id === item.size.id)
                    return true;
            } else if (!isDefined(variation) && !isDefined(size) && !isDefined(item.variation) && !isDefined(item.size)) {
                return true;
            }
        }
        return false;
    };

    const getProductName = (product, variation, size) => {
        const variationName = exists(variation, 'name') ? " - " + variation.name : "";
        const sizeName = exists(size, 'name') ? " " + size.name : "";
        return product.name + variationName + sizeName;
    };

    const exists = (entity, variable) => {
        return isDefined(entity) && isDefined(entity[variable]) && entity[variable].length > 0 && entity[variable] !== " ";
    };

    const getSignPostName = item => {
        return (
            item.stock.quantity <= item.stock.security ?
                <span>
                    <i className="fas fa-exclamation-triangle mr-1 text-danger"></i> { getProductName(item.product, item.variation, item.size) }
                </span>
            : item.stock.quantity <= item.sales ?
                <span>
                    <i className="fas fa-info-circle mr-1 text-warning"></i> { getProductName(item.product, item.variation, item.size) }
                </span>
            : item.stock.quantity <= item.stock.alert ? 
                <span>
                    <i className="fas fa-info-circle mr-1 text-warning"></i> { getProductName(item.product, item.variation, item.size) }
                </span>
            : getProductName(item.product, item.variation, item.size)
        );
    };

    return (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader>
                        Liste des produits
                    </CCardHeader>
                    <CCardBody>
                        <CRow>
                            <CCol xs="12" lg="4">
                            <RangeDatePicker
                                minDate={ dates.start }
                                maxDate={ dates.end }
                                onDateChange={ handleDateChange }
                                label="Date"
                                className = "form-control mb-3"
                            />
                            </CCol>
                            <CCol xs="12" lg="8">
                                <SelectMultiple name="productGroups" label="Groupes de produits" value={ productGroups } onChange={ handleGroupChange } data={ getProductGroups() }/>
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol xs="12" lg="4" className="mt-4">
                                <Select className="mr-2" name="supplier" label="Evolution des besoins" value={ evolution } onChange={ handleEvolutionChange }>
                                    { rates.map(rate => <option key={ rate.value } value={ rate.value }>{ rate.label }</option>) }
                                </Select>
                            </CCol>
                            <CCol xs="12" lg="6" className="mt-4">
                                <Select className="mr-2" name="supplier" label="Fournisseur" value={ isDefined(selectedSupplier) ? selectedSupplier.id : 0 } onChange={ handleSupplierChange }>
                                    { suppliers.map(supplier => <option key={ supplier.id } value={ supplier.id }>{ supplier.name }</option>) }
                                </Select>
                            </CCol>
                            <CCol xs="12" lg="2" className="mt-4 d-flex align-items-end">
                                <CFormGroup row variant="custom-checkbox" inline className="d-flex align-items-center">
                                    <input
                                        className="mx-1 my-2"
                                        type="checkbox"
                                        name="inline-checkbox"
                                        checked={ selectAll }
                                        onClick={ handleSelectAll }
                                        disabled={ displayedProducts.length === 0 }
                                        style={{zoom: 2.3}}
                                    />
                                    <label variant="custom-checkbox" htmlFor="inline-checkbox1" className="my-1">Tous</label>
                                </CFormGroup>
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
                                items={ displayedProducts }
                                fields={ ['Produit', 'Sécurité', 'Stock', 'Besoin', 'Commande', 'Sélection'] }
                                bordered
                                itemsPerPage={ itemsPerPage }
                                pagination
                                scopedSlots = {{
                                    'Produit':
                                        item => <td style={{width: '25%'}}>{ getSignPostName(item) }</td>
                                    ,
                                    'Sécurité':
                                        item => <td style={{width: '15%'}}>{ item.stock.security + " " + item.unit }</td>
                                    ,
                                     'Stock':
                                        item => <td style={{width: '15%'}}>{ item.stock.quantity + " " + item.unit }</td>
                                    ,
                                    'Besoin':
                                        item => <td style={{width: '15%'}}>{ item.sales + " " + item.unit }</td>
                                    ,
                                    'Commande':
                                        item => <td style={{width: '20%'}}>
                                                    <CInputGroup>
                                                        <CInput
                                                            type="number"
                                                            name={ item.id }
                                                            value={ item.quantity }
                                                            onChange={ e => handleCommandChange(e, item) }
                                                        />
                                                        <CInputGroupAppend>
                                                            <CInputGroupText style={{ minWidth: '43px'}}>{ item.unit }</CInputGroupText>
                                                        </CInputGroupAppend>
                                                    </CInputGroup>
                                                </td>
                                    ,
                                    'Sélection':
                                        item => <td style={{width: '10%', textAlign: 'center'}}>
                                                    <input
                                                        className="mx-1 my-1"
                                                        type="checkbox"
                                                        name="inline-checkbox"
                                                        checked={ item.selected }
                                                        onClick={ () => handleSelect(item) }
                                                        disabled={ item.status === "WAITING" }
                                                        style={{zoom: 2.3}}
                                                    />
                                                </td>
                                }}
                            />
                        }
                        { displayedProducts.length > 0 &&
                            <CRow className="mt-4 d-flex justify-content-center align-items-start">
                                {/* <Select className="mr-2" name="supplier" label=" " value={ selectedSupplier.id } onChange={ handleSupplierChange } style={{width: '180px', height: '35px'}}>
                                    { suppliers.map(supplier => <option key={ supplier.id } value={ supplier.id }>{ supplier.name }</option>) }
                                </Select> */}
                                <CButton size="sm" color="success" onClick={ () => console.log("click") } className={ "ml-2" } style={{width: '180px', height: '35px'}} disabled={ orders.findIndex(o => o.selected) === -1 }>
                                    Commander
                                </CButton>
                            </CRow>
                        }
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default Supplying;