import React, { useState, useEffect, useContext } from 'react';
import Flatpickr from 'react-flatpickr';
import { French } from "flatpickr/dist/l10n/fr.js";
import { Link, Redirect } from 'react-router-dom';
import ProvisionActions from 'src/services/ProvisionActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CInvalidFeedback, CLabel, CRow, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getDateFrom, getFloat, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import ProductsContext from 'src/contexts/ProductsContext';
import Roles from 'src/config/Roles';
import Select from 'src/components/forms/Select';
import Goods from 'src/components/provisionPages/Goods';
import SupplierActions from 'src/services/SupplierActions';
import UserActions from 'src/services/UserActions';

const Provision = ({ match, history }) => {

    const today = new Date();
    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const { products } = useContext(ProductsContext);
    const { currentUser, seller } = useContext(AuthContext);
    const [provision, setProvision] = useState({ provisionDate: getDateFrom(today, today.getDay() === 6 ? 2 : 1), status: "ORDERED", seller });
    const defaultErrors = { provisionDate: "" };
    const [errors, setErrors] = useState(defaultErrors);
    const [defaultGood, setDefaultGood] = useState({product: products[0], count: 0, quantity: "", received: "", stock: 0, unit: "Kg"});     //  products[0].unit
    const [goods, setGoods] = useState([defaultGood]);
    const [suppliers, setSuppliers] = useState([]);
    const [availableSuppliers, setAvailableSuppliers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [sendingMode, setSendingMode] = useState("email");
    const [availableProducts, setAvailableProducts] = useState([]);
    const [consumers, setConsumers] = useState([]);

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        fetchUsers();
        fetchSuppliers();
        fetchProvision(id);
    }, []);

    useEffect(() => fetchProvision(id), [id]);

    useEffect(() => {
        if (isDefinedAndNotVoid(products) && !isDefined(defaultGood.product)) {
            setDefaultGood({...defaultGood, product: products[0], unit: products[0].unit})
        }
    }, [products]);

    useEffect(() => {
        if (isDefinedAndNotVoid(suppliers) && !isDefinedAndNotVoid(availableSuppliers) && isDefined(provision.user) ) {
            const filteredSuppliers = suppliers.filter(s => {
                const filtered = isDefinedAndNotVoid(s.products) && isDefinedAndNotVoid(provision.user.products) ? s.products.find(p => {
                    return provision.user.products.includes(p);
                }) !== undefined : false;
                return filtered;
            });
            const finalSuppliers = filteredSuppliers.length > 0 ? filteredSuppliers : suppliers;
            setAvailableSuppliers(finalSuppliers);
            if (id === "new")
                setProvision({...provision, supplier: finalSuppliers[0]});
        }
    }, [suppliers, provision]);

    useEffect(() => {
        if (isDefinedAndNotVoid(consumers) && !isDefined(provision.user))
            setProvision({...provision, user: consumers[0]});
    }, [consumers, provision.user]);

    useEffect(() => getAvailableProducts(), [provision, products])

    const getAvailableProducts = () => {
        const usersProducts = isDefined(provision.user) && isDefinedAndNotVoid(provision.user.products) ? products.filter(p => provision.user.products.includes(p['@id'])) : products;
        const suppliersProducts = isDefined(provision.supplier) && isDefinedAndNotVoid(provision.supplier.products) ? usersProducts.filter(p => provision.supplier.products.includes(p['@id'])) : products;
        if (isDefinedAndNotVoid(suppliersProducts)) {
            setDefaultGood({...defaultGood, product: suppliersProducts[0]});
        }
        setAvailableProducts(suppliersProducts);
    };

    const fetchUsers = () => {
        UserActions
            .findAll()
            .then(response => {
                setConsumers(response.filter(u => !u.roles.includes("ROLE_SUPER_ADMIN")  && !u.roles.includes("ROLE_SELLER")));
            });
    }

    const fetchProvision = id => {
        if (id !== "new") {
            setEditing(true);
            ProvisionActions.find(id)
                .then(response => {
                    setProvision({
                        ...response, 
                        provisionDate: new Date(response.provisionDate), 
                        status: isDefined(response.status) ? response.status : provision.status
                    });
                    const newGoods = response.goods.map((good, key) => {
                        return {
                        ...good,
                        price: isDefined(good.price) ? good.price : "",
                        received: isDefined(good.received) ? good.received : "",
                        product: products.find(product => good.product.id === product.id),
                        count: key
                    }});
                    setGoods(newGoods);
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/provisions");
                });
        }
    };

    const fetchSuppliers = () => {
        SupplierActions
            .findAll()
            .then(response => {
                const externSuppliers = response.map(s => ({...s, emails: isDefined(s.emails) ? s.emails.join(', ') : ''}));        // .filter(s => !s.isIntern)
                setSuppliers(externSuppliers);
            });
    };

    const onDateChange = datetime => {
        const newDate = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 9, 0, 0);
        setProvision({...provision, provisionDate: newDate});
    };

    const onStatusChange = ({ currentTarget }) => setProvision({...provision, [currentTarget.name]: currentTarget.value});

    const handleSendingModeChange = ({ currentTarget }) => setSendingMode(currentTarget.value);

    const handleSupplierChange = ({ currentTarget }) => {
        const newSupplier = suppliers.find(s => parseInt(s.id) === parseInt(currentTarget.value));
        setProvision({...provision, supplier: newSupplier});
    };

    const handleSupplierInfosChange = ({ currentTarget }) => {
        setProvision({...provision, supplier: {...provision.supplier, [currentTarget.name]: currentTarget.value} })
    };

    const handleConsumerChange = ({ currentTarget }) => {
        const newUser = consumers.find(c => c.id === parseInt(currentTarget.value));
        setProvision({...provision, user: newUser});
    };

    const handleSubmit = () => {
        const provisionToWrite = getProvisionToWrite();
        const request = !editing ? ProvisionActions.create(provisionToWrite) : ProvisionActions.patch(id, provisionToWrite);
        request.then(response => {
            setErrors(defaultErrors);
            //TODO : Flash notification de succès
            history.replace("/components/provisions");
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

    const getProvisionToWrite = () => {
        const { seller, supplier, provisionDate, status, user } = provision;
        const { id, emails, phone, ...othersVariables } = supplier;
        return {
            ...provision, 
            seller: seller['@id'],
            supplier: {id, phone, emails: emails.split(',').map(email => email.trim())},
            provisionDate: new Date(provisionDate),
            sendingMode,
            user: user['@id'],
            metas: user.metas['@id'],
            goods: goods.map(good => {
                const { product, quantity, received, stock } = good;
                return {
                    ...good,
                    product: product['@id'],
                    quantity: getFloat(quantity),
                    received: isDefined(received) && status === "RECEIVED" ? getFloat(received) : null,
                    stock: isDefined(stock) && status !== "RECEIVED" ? getFloat(stock) : null,
                };
            })
        }
    }

    return !isDefinedAndNotVoid(products) ? <Redirect to="/components/provisions"/> : !isDefined(provision) ? <></> : (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer un achat" : "Modifier l'achat" }</h3>
                    </CCardHeader>
                    <CCardBody>
                            <CRow>
                                <CCol xs="12" sm="12" md="12">
                                    <Select className="mr-2" name="user" label="Pour le client" onChange={ handleConsumerChange } value={ isDefined(provision.user) ? provision.user.id : 0 }>
                                        { consumers.map(consumer => <option key={ consumer.id } value={ consumer.id }>{ consumer.name }</option>) }
                                    </Select>
                                </CCol>
                            </CRow>
                            <CRow>
                                <hr/>
                                <CCol xs="12" sm="12" md="4" className="mt-4">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Date d'approvisionnement</CLabel>
                                        <Flatpickr
                                            name="provisionDate"
                                            value={ provision.provisionDate }
                                            onChange={ onDateChange }
                                            className="form-control form-control-sm"
                                            options={{
                                                mode: "single",
                                                dateFormat: "d/m/Y",
                                                locale: French,
                                                disable: [(date) => date.getDay() === 0],
                                            }}
                                            style={{ height: "35px" }}
                                        />
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="4" className="mt-4">
                                    <Select className="mr-2" name="status" label="Statut de la commande" onChange={ onStatusChange } value={ isDefined(provision.status) ? provision.status : "ORDERED" }>
                                        <option value="WAITING">En attente</option>
                                        <option value="ORDERED">A envoyer</option>
                                        <option value="RECEIVED">Reçue</option>
                                    </Select>
                                </CCol>
                                <CCol xs="12" sm="12" md="4" className="mt-4">
                                    <Select className="mr-2" name="sendMode" label="Mode d'envoi" value={ sendingMode } onChange={ handleSendingModeChange }>
                                        <option value={"email"}>{"Email"}</option>
                                        <option value={"sms"}>{"SMS"}</option>
                                        <option value={"email & sms"}>{"Email & SMS"}</option>
                                    </Select>
                                </CCol>
                            </CRow>
                            <hr className="mt-4"/>
                            <CRow>
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <Select className="mr-2" name="supplier" label="Fournisseur" onChange={ handleSupplierChange } value={ isDefined(provision.supplier) ? provision.supplier.id : 0 }>
                                        { availableSuppliers.map(supplier => <option key={ supplier.id } value={ supplier.id }>{ supplier.name }</option>) }
                                    </Select>
                                </CCol>
                                <CCol xs="12" lg="6" className="mt-4">
                                    <CLabel>Téléphone</CLabel>
                                    <CInputGroup>
                                        <CInputGroupPrepend>
                                            <CInputGroupText style={{ minWidth: '43px'}}><CIcon name="cil-phone"/></CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput
                                            name="phone"
                                            value={ isDefined(provision.supplier) && isDefined(provision.supplier.phone) && provision.supplier.phone.length > 0 ? provision.supplier.phone : "" }
                                            onChange={ handleSupplierInfosChange }
                                        />
                                    </CInputGroup>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" lg="12" className="mt-4">
                                    <CLabel>Email(s) <small className="ml-3"><i>séparation par ","</i></small></CLabel>
                                    <CInputGroup>
                                        <CInputGroupPrepend>
                                            <CInputGroupText style={{ minWidth: '43px'}}><CIcon name="cil-at"/></CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput
                                            name="emails"
                                            value={ isDefined(provision.supplier) && isDefined(provision.supplier.emails) && provision.supplier.emails.length > 0 ? provision.supplier.emails : "" }
                                            onChange={ handleSupplierInfosChange }
                                        />
                                    </CInputGroup>
                                </CCol>
                            </CRow>
                            <hr/>
                            { availableProducts.length > 0 && 
                                <>
                                    <Goods provision={ provision } goods={ goods } setGoods={ setGoods } defaultGood={ defaultGood } editing={ editing } availableProducts={ availableProducts }/>
                                    <hr className="mt-5 mb-5"/>
                                    <CRow className="mt-4 d-flex justify-content-center">
                                        <CButton onClick={ handleSubmit } size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                                    </CRow>
                                </>
                             }
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/provisions" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Provision;