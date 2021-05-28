import React, { useState, useEffect, useContext } from 'react';
import Flatpickr from 'react-flatpickr';
import { French } from "flatpickr/dist/l10n/fr.js";
import { Link } from 'react-router-dom';
import OrderActions from 'src/services/OrderActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CSwitch } from '@coreui/react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import CIcon from '@coreui/icons-react';
import { isDefined } from 'src/helpers/utils';
import Items from 'src/components/preparationPages/Items';
import UserSearchSimple from 'src/components/forms/UserSearchSimple';
import ClientPart from 'src/components/preparationPages/ClientPart';
import AuthContext from 'src/contexts/AuthContext';
import DeliveryContext from 'src/contexts/DeliveryContext';
import CityActions from 'src/services/CityActions';
import { getOrderToWrite, validateForm } from 'src/helpers/checkout';
import GroupActions from 'src/services/GroupActions';
import ProductsContext from 'src/contexts/ProductsContext';
import UserActions from 'src/services/UserActions';

const Order = ({ match, history }) => {

    const { id = "new" } = match.params;
    const defaultVariant = null;
    const [editing, setEditing] = useState(false);
    const { products } = useContext(ProductsContext);
    const { selectedCatalog, setSettings, settings } = useContext(AuthContext);
    const { setCities, condition, relaypoints, setCondition } = useContext(DeliveryContext);
    const [order, setOrder] = useState({ name: "", email: "", deliveryDate: new Date() });
    const defaultErrors = { name: "", email: "", deliveryDate: "", phone: "", address: "" };
    const [informations, setInformations] = useState({ phone: '', address: '', address2: '', zipcode: '', city: '', position: isDefined(selectedCatalog) ? selectedCatalog.center : [0, 0]});
    const [errors, setErrors] = useState(defaultErrors);
    const defaultVariantSize = defaultVariant !== null && products[0].variations[0].sizes && products[0].variations[0].sizes.length > 0 ? products[0].variations[0].sizes[0] : null;
    const defaultProduct = {product: products[0], variation: defaultVariant, size: defaultVariantSize};
    const defaultItem = {...defaultProduct, count: 0, orderedQty: "", preparedQty: "", deliveredQty: "", price: defaultProduct.product.prices[0].amount, unit: defaultProduct.product.unit};
    const [objectDiscount, setObjectDiscount] = useState(null);
    const [groups, setGroups] = useState([]);
    const [items, setItems] = useState([defaultItem]);
    const [user, setUser] = useState(null);
    const [discount, setDiscount] = useState(0);
    const [minDate, setMinDate] = useState(new Date());

    useEffect(() => {
        fetchCities();
        fetchGroups();
        fetchOrder(id);
    }, []);

    useEffect(() => fetchOrder(id), [id]);

    useEffect(() => {
        setUserInformations();
    }, [user]);

    useEffect(() => {
        if (groups.length > 0) {
            const userSettings = getUserGroup();
            setSettings(userSettings);
        }
    }, [user, groups]);

    const fetchOrder = id => {
        if (id !== "new") {
            setEditing(true);
            OrderActions.find(id)
                .then(response => {
                    setOrder({...response, name: response.name, email: response.email, deliveryDate: new Date(response.deliveryDate)});
                    setItems(response.items.map((item, key) => ({...item, product: products.find(product => item.product.id === product.id), count: key})));
                    setInformations(response.metas);
                    setCondition(response.appliedCondition);
                    setMinDate(new Date(response.deliveryDate));
                    if (isDefined(response.user))
                        fetchUser(response.user);
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/preparations");
                });
        }
    };

    const fetchCities = () => {
        CityActions
            .findAll()
            .then(response => setCities(response));
    }

    const fetchGroups = () => {
        GroupActions
            .findAll()
            .then(response => setGroups(response));
    }

    const fetchUser = user => {
        UserActions
            .find(user.id)
            .then(response => setUser(response));
    }

    const setUserInformations = () => {
        if (isDefined(user)) {
            setOrder({...order, name: user.name, email: user.email});
            if (hasCompleteProfile(user) )
               setInformations(user.metas);
        } 
    };

    const hasCompleteProfile = (user) => {
        return isDefined(user.metas) && isDefined(user.metas.address) &&
               isDefined(user.metas.zipcode) && isDefined(user.metas.city) &&
               isDefined(user.metas.position);
    };

    const onDateChange = datetime => {
        const newDate = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 9, 0, 0);
        setOrder({...order, deliveryDate: newDate});
    };

    const handleSubmit = () => {
        const newErrors = validateForm(order, informations, selectedCatalog, condition, relaypoints);
        if (isDefined(newErrors) && Object.keys(newErrors).length > 0) {
            setErrors({...errors, ...newErrors});
        } else {
            const orderToWrite = getOrderToWrite(order, user, informations, items, order.deliveryDate, objectDiscount, selectedCatalog, condition, settings);
            const request = !editing ? OrderActions.create(orderToWrite) : OrderActions.update(id, orderToWrite);
            request.then(response => {
                setErrors(defaultErrors);
                //TODO : Flash notification de succès
                history.replace("/components/preparations");
            })
            .catch( ({ response }) => {
                const { violations } = response.data;
                if (violations) {
                    const apiErrors = {};
                    violations.forEach(({propertyPath, message}) => {
                        apiErrors[propertyPath] = message;
                    });
                    setErrors(apiErrors);
                }
                //TODO : Flash notification d'erreur
            });
        }
    };

    const getUserGroup = () => {
        const defaultGroup = groups.find(group => group.value === "ROLE_USER");
        if (!isDefined(user))
            return defaultGroup
        else {
            const shopGroups = groups.filter(group => group.hasShopAccess && group.value !== "ROLE_USER");
            const userGroup = shopGroups.find(group => user.roles.includes(group.value));
            return isDefined(userGroup) ? userGroup : defaultGroup;
        }
    }

    return !isDefined(order) ? <></> : (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Commander pour un client" : "Modifier la commande " + (isDefined(order.id) ? order.id.toString().padStart(10, '0') : + "" ) }</h3>
                    </CCardHeader>
                    <CCardBody>
                        <Tabs defaultActiveKey="items" id="uncontrolled-tab-example">
                            <Tab eventKey="items" title="Commande">
                                <CRow>
                                    <CCol xs="12" sm="12" md="6" className="mt-4">
                                        <CFormGroup>
                                            <CLabel htmlFor="name">Date de livraison</CLabel>
                                            <Flatpickr
                                                name="deliveryDate"
                                                value={ order.deliveryDate }
                                                onChange={ onDateChange }
                                                className="form-control form-control-sm"
                                                options={{
                                                    mode: "single",
                                                    dateFormat: "d/m/Y",
                                                    minDate: minDate,
                                                    locale: French,
                                                    disable: [(date) => date.getDay() === 0],
                                                }}
                                            />
                                            <CInvalidFeedback>{ errors.deliveryDate }</CInvalidFeedback>
                                        </CFormGroup>
                                    </CCol>
                                </CRow>
                                <hr className="my-2"/>
                                <UserSearchSimple user={ user } setUser={ setUser } label="Client"/>
                                <hr/>
                                <Items items={ items } setItems={ setItems } defaultItem={ defaultItem } editing={ editing }/>
                            </Tab>
                            <Tab eventKey="metas" title="Client">
                                <ClientPart
                                    user={ order }
                                    informations={ informations }
                                    objectDiscount={ objectDiscount }
                                    displayedRelaypoints={ relaypoints }
                                    setUser={ setOrder }
                                    setInformations={ setInformations }
                                    setDiscount={ setDiscount }
                                    setObjectDiscount={ setObjectDiscount }
                                    errors={ errors }
                                />
                            </Tab>
                        </Tabs>
                        <hr className="mt-5 mb-5"/>
                        <CRow className="mt-4 d-flex justify-content-center">
                            <CButton onClick={ handleSubmit } size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                        </CRow>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/preparations" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Order;