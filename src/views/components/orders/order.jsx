import React, { useState, useEffect, useContext } from 'react';
import Flatpickr from 'react-flatpickr';
import { French } from "flatpickr/dist/l10n/fr.js";
import { Link } from 'react-router-dom';
import OrderActions from 'src/services/OrderActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CFormGroup, CInvalidFeedback, CLabel, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Items from 'src/components/preparationPages/Items';
import AuthContext from 'src/contexts/AuthContext';
import { getOrderToWrite } from 'src/helpers/checkout';
import ProductsContext from 'src/contexts/ProductsContext';
import UserActions from 'src/services/UserActions';
import Roles from 'src/config/Roles';
import Select from 'src/components/forms/Select';
import { getStatus } from 'src/helpers/orders';

const Order = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const { products } = useContext(ProductsContext);
    const { currentUser, selectedCatalog } = useContext(AuthContext);
    const [order, setOrder] = useState({ name: "", email: "", deliveryDate: new Date() });
    const defaultErrors = { name: "", email: "", deliveryDate: "", phone: "", address: "" };
    const [informations, setInformations] = useState({ phone: '', address: '', address2: '', zipcode: '', city: '', position: isDefined(selectedCatalog) ? selectedCatalog.center : [0, 0]});
    const [errors, setErrors] = useState(defaultErrors);
    const [defaultItem, setDefaultItem] = useState({product: null, count: 0, orderedQty: "", unit: "", stock: 0});
    const [items, setItems] = useState([]);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [minDate, setMinDate] = useState(new Date());
    const [users, setUsers] = useState([]);
    const statuses = getStatus();

    useEffect(() => {
        // defineDefaultItem();
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));

        // if (Roles.isSeller(currentUser)) {
            fetchUsers();
        // }
        
        // fetchOrder(id);
    }, []);

    useEffect(() => fetchOrder(id), [id]);

    useEffect(() => setUserInformations(), [user]);

    useEffect(() => {
        if (!isDefinedAndNotVoid(items) || items.find(i => !isDefined(i.product)) !== undefined)
            fetchOrder(id);
    }, [products]);

    useEffect(() => {
        if (id === "new" && Roles.isSeller(currentUser) && !isDefined(user)) {
            setUser(users[0]);
        }
    }, [users])

    const fetchOrder = id => {
        if (id !== "new") {
            setEditing(true);
            OrderActions.find(id)
                .then(response => {
                    setOrder({...response, name: response.name, deliveryDate: new Date(response.deliveryDate)});        // email: response.email,
                    setItems(response.items.map((item, key) => ({...item, product: products.find(product => item.product.id === product.id), count: key})));
                    setInformations(response.metas);
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

    const fetchUser = user => {
        UserActions
            .find(user.id)
            .then(response => setUser(response));
    }

    const fetchUsers = () => {
        UserActions
            .findAll()
            .then(response => {
                const consumers = response.filter(u => !u.roles.includes("ROLE_SUPER_ADMIN"))       //  && !u.roles.includes("ROLE_ADMIN")
                setUsers(consumers);
            });
    }

    const setUserInformations = () => {
        if (isDefined(user)) {
            setOrder({...order, name: user.name, email: user.email});
            setInformations(user.metas);
        } 
    };

    const onDateChange = datetime => {
        const newDate = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 9, 0, 0);
        setOrder({...order, deliveryDate: newDate});
    };

    const handleStatusChange = ({ currentTarget }) => {
        setOrder({...order, status: currentTarget.value});
    };

    const handleUserChange = ({ currentTarget }) => {
        const newUser = users.find(u => parseInt(u.id) === parseInt(currentTarget.value));
        setUser(newUser);
    };

    const handleSubmit = () => {
        const orderToWrite = getOrderToWrite(order, user, informations, items, order.deliveryDate);
        const request = !editing ? OrderActions.create(orderToWrite) : OrderActions.patch(id, orderToWrite);
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
    };

    return !isDefined(order) || !isDefinedAndNotVoid(products) ? <></> : (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Commander pour un client" : "Modifier la commande " + (isDefined(order.id) ? order.id.toString().padStart(10, '0') : + "" ) }</h3>
                    </CCardHeader>
                    <CCardBody>
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
                                        style={{ height: "35px" }}
                                    />
                                    <CInvalidFeedback>{ errors.deliveryDate }</CInvalidFeedback>
                                </CFormGroup>
                            </CCol>
                            { !(isAdmin || Roles.isPicker(currentUser)) && Roles.isSeller(currentUser) ?
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <Select className="mr-2" name="selectedUser" label="Pour le compte de" onChange={ handleUserChange } value={ isDefined(user) ? user.id : 0 }>
                                        { users.map(user => <option value={ user.id }>{ user.name + " - " + user.email }</option>) }
                                    </Select>
                                </CCol>
                                : (isAdmin || Roles.isPicker(currentUser)) && id !== "new" ?
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <Select name="status" label="Statut" onChange={ handleStatusChange } value={ order.status }>
                                        { statuses.map((status, i) => <option key={ status.value } value={ status.value }>{ status.label }</option>) }
                                    </Select>
                                </CCol>
                            : <></>
                            }
                        </CRow>
                        <hr/>
                        <Items items={ items } setItems={ setItems }/>
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