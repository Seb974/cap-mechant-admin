import React, { useContext, useEffect, useState } from 'react';
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CFormGroup, CInputGroup, CInput, CInputGroupText, CLabel, CCollapse, CInputGroupPrepend, CToaster, CToast, CToastHeader, CToastBody } from '@coreui/react';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { getDateFrom, getFloat, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Spinner from 'react-bootstrap/Spinner'
import Select from 'src/components/forms/Select';
import SimpleDatePicker from 'src/components/forms/SimpleDatePicker';
import useWindowDimensions from 'src/helpers/screenDimensions';
import { Link } from 'react-router-dom';
import NeedDetails from 'src/components/supplyPages/needDetails';
import CIcon from '@coreui/icons-react';
import ProvisionActions from 'src/services/ProvisionActions';
import api from 'src/config/api';
import { Button } from 'react-bootstrap';

const Supplying = (props) => {

    const itemsPerPage = 30;
    const autohideValue = 4000;
    const { width } = useWindowDimensions();
    const today = getDateFrom(new Date(), 0, 4, 0);
    const fields = ['Fournisseur', 'Site', 'Sécurité', 'Stock', 'Besoin', 'Commande', 'Sélection'];
    const { currentUser, seller } = useContext(AuthContext);
    const allSuppliers = {id: -1, name: "Tous"};
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [provisions, setProvisions] = useState([]);
    const [visibleProvisions, setVisibleProvisions] = useState([]);
    const [availableSuppliers, setAvailableSuppliers] = useState([]);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [selectAll, setSelectAll] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(allSuppliers);
    const [details, setDetails] = useState([]);
    const [sendingMode, setSendingMode] = useState("email");
    const [toasts, setToasts] = useState([]);
    const successMessage = "Les commandes ont bien été envoyées.";
    const failMessage = "Les commandes ont bien été enregistrées, mais un problème est survenu lors de l'envoi de la notification au fournisseur.\n" +
                        "Veuillez s'il vous plaît les envoyer manuellement.";
    const successToast = { position: 'top-right', autohide: 3000, closeButton: true, fade: true, color: 'success', messsage: successMessage, title: 'Succès' };
    const failToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'warning', messsage: failMessage, title: 'Notification non envoyée' };

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), []);

    useEffect(() => getAvailableSuppliers(), [provisions]);

    useEffect(() => getWaitingProvisions(), [dates]);

    useEffect(() => getVisibleProvisions(), [provisions, selectedSupplier]);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    const getWaitingProvisions = () => {
        setLoading(true);
        const UTCDates = getUTCDates(dates);
        // ProvisionActions
            // .findNeedsPerSuppliersBetweenOrderDates(UTCDates)
            // .then(response => {
            //     const externProvisions = response.filter(p => !p.supplier.isIntern)
            //                                      .map(p => ({...p, selected: false, emailEnabled: false}));
            //     setProvisions(externProvisions);
            //     setLoading(false);
            // })
            // .catch(error => {
            //     console.log(error);
            //     setLoading(false);
            // });
        ProvisionActions
            .findInternProvisionBetween(UTCDates)
            .then(response => {
                setProvisions(response.map(p => ({...p, selected: false, emailEnabled: false})));
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });
    };

    const getVisibleProvisions = () => {
        if (!isDefined(selectedSupplier) || parseInt(selectedSupplier.id) === parseInt(allSuppliers.id))
            setVisibleProvisions(provisions);
        else
            setVisibleProvisions(provisions.filter(p => parseInt(p.supplier.id) === parseInt(selectedSupplier.id)))
    }

    const getAvailableSuppliers = () => {
        let newSuppliers = [];
        provisions.map(p => {
            if (!p.supplier.isIntern && newSuppliers.find(s => s.id === p.supplier.id) === undefined)
                newSuppliers = [...newSuppliers, p.supplier];
        });

        if (JSON.stringify(availableSuppliers.map(s => s.id)) !== JSON.stringify(newSuppliers.map(s => s.id))) {
            setAvailableSuppliers(newSuppliers);
            if (newSuppliers.length === 1)
                setSelectedSupplier(newSuppliers[0]);
        }
    };

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])){
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const handleSelect = item => {
        let newValue = null;
        const newProvisionsList = provisions.map(element => {
            newValue = !element.selected;
            return element.id === item.id ? {...element, selected: newValue} : element;
        });
        setProvisions(newProvisionsList);
        if (!newValue && selectAll)
            setSelectAll(false);
    };

    const handleSelectAll = () => {
        const newSelection = !selectAll;
        setSelectAll(newSelection);
        setProvisions(provisions.map(p => ({...p, selected: newSelection})));
    };

    const handleSupplierChange = ({ currentTarget }) => {
        const newSupplier = availableSuppliers.find(supplier => supplier.id === parseInt(currentTarget.value));
        setSelectedSupplier(newSupplier);
    };

    const handleDeliveryDateChange = (datetime, provision) => {
        if (isDefinedAndNotVoid(datetime)) {
            const newSelection = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 9, 0, 0);
            const newProvisions = provisions.map(p => p.id === provision.id ? {...provision, provisionDate: newSelection} : p);
            setProvisions(newProvisions);
        }
    };

    const handleSendingModeChange = ({ currentTarget }) => setSendingMode(currentTarget.value);

    const handleSupplierInfosChange = ({ currentTarget }) => {
        setSelectedSupplier({...selectedSupplier, [currentTarget.name]: currentTarget.value })
    };

    const handleSubmit = async () => {
        const provisionsToSend = getFormattedProvisions(visibleProvisions.filter(o => o.selected));
        const sentProvisions = await sendProvisions(provisionsToSend);
        const newProvisions = provisions.map(p => {
            const updated = sentProvisions.find(provision => provision.id === p.id);
            return updated === undefined ? p : updated;
        }).filter(p => !isDefined(p.integrated) || !p.integrated);
        setProvisions(newProvisions);
        const newToast = sentProvisions.findIndex(p => isDefined(p.integrated) && !p.integrated) !== -1 ? failToast : successToast;
        addToast(newToast);
    };

    const getFormattedProvisions = provisions => {
        return provisions.map(provision => {
            const { metas, user, goods, provisionDate } = provision;
            return {
                ...provision,
                // seller: isDefined(seller) ? seller['@id'] : '/api/sellers/1',
                supplier: {id: selectedSupplier.id, emails: Array.isArray(selectedSupplier.emails) ? selectedSupplier.emails : selectedSupplier.emails.split(',').map(email => email.trim()), phone: selectedSupplier.phone},
                provisionDate: new Date(provisionDate),
                user: user['@id'],
                metas: metas['@id'],
                status: "ORDERED",
                sendingMode,
                goods: goods.map(g => {
                    return {
                        ...g,
                        product: g.product['@id'],
                        quantity: getFloat(g.quantity),
                        unit: g.unit,
                    }
                })
            }
        });
    };

    const sendProvisions = async newProvisions => {
        let savedProvisions = [];
        for (const newProvision of newProvisions) {
            const savedProvision = await  ProvisionActions
                                            .update(newProvision.id, newProvision)
                                            .then(response => response.data);
            savedProvisions = [...savedProvisions, savedProvision];
          }

        return savedProvisions;
    };

    const handleEmailVision = (id, e) => {
        // e.preventDefault();
        ProvisionActions.getEmail(id);
    };

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    };

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
    };

    const addToast = newToast => setToasts([...toasts, newToast]);

    const toasters = (()=>{
        return toasts.reduce((toasters, toast) => {
          toasters[toast.position] = toasters[toast.position] || []
          toasters[toast.position].push(toast)
          return toasters
        }, {})
    })();

    return (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader>
                        <CRow className="mt-2">
                            <CCol xs="6" lg="6">
                                <CLabel>Gestion des achats</CLabel>
                            </CCol>
                            { (isAdmin || Roles.isSeller(currentUser)) &&
                                <CCol col="6" sm="6" md="6" className="d-flex justify-content-end">
                                    <Link role="button" to="/components/provisions/new" block variant="outline" color="success">CRÉER</Link>
                                </CCol>
                            }
                        </CRow>
                    </CCardHeader>
                    <CCardBody>
                        <CRow className="mt-2">
                            <CCol xs="12" lg="12">
                                <CLabel><h6><b> Définir les besoins</b></h6></CLabel>
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol xs="12" lg="6">
                                <RangeDatePicker
                                    minDate={ dates.start }
                                    maxDate={ dates.end }
                                    onDateChange={ handleDateChange }
                                    label="Bornes des commandes clients"
                                    className = "form-control mb-3"
                                />
                            </CCol>
                        </CRow> 
                        <CRow className="mt-4">
                            <CCol xs="12" lg="12">
                                <CLabel><h6><b> Sélection du fournisseur</b></h6></CLabel>
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol xs="12" md="6">
                                    <Select className="mr-2" name="supplier" label="Fournisseur" onChange={ handleSupplierChange } value={ isDefined(selectedSupplier) ? selectedSupplier.id : -1 }>
                                        <option value={ "-1" }>{ "Tous" }</option>
                                        { availableSuppliers.map(supplier => <option key={ supplier.id } value={ supplier.id }>{ supplier.name }</option>) }
                                    </Select>
                                </CCol>
                            <CCol xs="12" lg="6">
                                <CLabel>Téléphone</CLabel>
                                <CInputGroup>
                                    <CInputGroupPrepend>
                                        <CInputGroupText style={{ minWidth: '43px'}}><CIcon name="cil-phone"/></CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput
                                        name="phone"
                                        value={ isDefined(selectedSupplier) && isDefined(selectedSupplier.phone) && selectedSupplier.phone.length > 0 ? (parseInt(selectedSupplier.id) !== -1 ? selectedSupplier.phone : '-') : "" }
                                        onChange={ handleSupplierInfosChange }
                                        disabled={ !isDefined(selectedSupplier) || parseInt(selectedSupplier.id) === parseInt(allSuppliers.id) }
                                    />
                                </CInputGroup>
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol xs="12" lg="12" >
                                <CLabel>Email(s) <small className="ml-3"><i>séparation par ","</i></small></CLabel>
                                <CInputGroup>
                                    <CInputGroupPrepend>
                                        <CInputGroupText style={{ minWidth: '43px'}}><CIcon name="cil-at"/></CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput
                                        name="emails"
                                        value={ isDefined(selectedSupplier) && isDefined(selectedSupplier.emails) && selectedSupplier.emails.length > 0 ? (parseInt(selectedSupplier.id) !== -1 ? selectedSupplier.emails : "-") : "" }
                                        onChange={ handleSupplierInfosChange }
                                        disabled={ !isDefined(selectedSupplier) || parseInt(selectedSupplier.id) === parseInt(allSuppliers.id) }
                                    />
                                </CInputGroup>
                            </CCol>
                        </CRow>
                        { isDefined(selectedSupplier) && parseInt(selectedSupplier.id) !== -1 &&
                            <CRow>
                                <CCol xs="12" lg="4" className="mt-4">
                                    <Select className="mr-2" name="sendMode" label="Mode d'envoi" value={ sendingMode } onChange={ handleSendingModeChange }>
                                        <option value={"email"}>{"Email"}</option>
                                        <option value={"sms"}>{"SMS"}</option>
                                        <option value={"email & sms"}>{"Email & SMS"}</option>
                                    </Select>
                                </CCol>
                                <CCol xs="12" lg="2" className="mt-4 d-flex justify-content-center">
                                    <CButton color="success" className="mt-4" onClick={ handleSubmit } style={{width: '180px', height: '35px'}} disabled={ provisions.findIndex(o => o.selected) === -1 }>
                                        Commander
                                    </CButton>
                                </CCol>
                            </CRow>
                        }
                        <hr/>
                        <CRow className="mt-2">
                            <CCol xs="12" lg="6" className="mt-3">
                                <CLabel><h6><b> Liste des besoins</b></h6></CLabel>
                            </CCol>
                            { !(isAdmin || Roles.isPicker(currentUser)) && 
                                <CCol xs="12" lg="6" className="mt-3 d-flex align-items-start justify-content-end pr-5">
                                    <CFormGroup row variant="custom-checkbox" inline className="d-flex align-items-center">
                                        <input
                                            className="mx-1 my-2"
                                            type="checkbox"
                                            name="inline-checkbox"
                                            checked={ selectAll }
                                            onClick={ e => handleSelectAll(e) }
                                            disabled={ provisions.length === 0 }
                                            style={{zoom: 2.3}}
                                        />
                                        <label variant="custom-checkbox" htmlFor="inline-checkbox1" className="my-1">Tous</label>
                                    </CFormGroup>
                                </CCol>
                            }
                        </CRow>
                        { loading ?
                            <CRow>
                                <CCol xs="12" lg="12" className="text-center">
                                    <Spinner animation="border" variant="danger"/>
                                </CCol>
                            </CRow>
                            :
                            <CDataTable
                                items={ visibleProvisions }
                                fields={ width < 576 ? ['Site', 'Date de livraison', 'Sélection'] : (isAdmin ) ? fields : ['Fournisseur', 'Site', 'Date de livraison', ' ', 'Sélection'] }      // || Roles.isPicker(currentUser)
                                bordered
                                itemsPerPage={ itemsPerPage }
                                pagination
                                scopedSlots = {{
                                    'Fournisseur':
                                        item => <td style={{width: '30%'}}>
                                                    <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} >
                                                        <div className="mt-3">
                                                            { item.supplier.name }<br/>
                                                            <small><i>{ 'Le ' + (new Date(item.orderDate)).toLocaleDateString() + ' à ' + (new Date(item.orderDate)).toLocaleTimeString() }</i></small>
                                                        </div>
                                                    </Link>
                                                </td>
                                    ,
                                    'Site':
                                        item => <td style={{width: '30%'}}>
                                                    <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} >
                                                        <div className="mt-3">
                                                            { item.user.name }<br/>
                                                            <small><i>{ 'N°' + item.id.toString().padStart(10, '0') }</i></small>
                                                        </div>
                                                    </Link>
                                                </td>
                                    ,
                                    'Date de livraison':
                                        item => <td style={{width: '15%'}}>
                                                    <SimpleDatePicker selectedDate={ new Date(item.provisionDate) } minDate={ today < new Date(item.provisionDate) ? today : new Date(item.provisionDate) } onDateChange={ datetime => handleDeliveryDateChange(datetime, item) } label=" "/>
                                                </td>
                                    ,
                                    ' ':
                                        item => <td style={{width: '15%', textAlign: 'center', margin: 'auto'}}>
                                            <Button
                                                className="mt-3"
                                                variant="warning"
                                                href={ api.API_DOMAIN  + '/api/provisions/' + item.id + '/email'} 
                                                onClick={ e => handleEmailVision(item.id, e) } 
                                                target="_blank"
                                                hidden={ !isDefined(item.integrated) || item.integrated }
                                            >
                                                <CIcon className="mr-2" name="cil-envelope-letter"/><span className="mt-4">Voir la notification</span>
                                            </Button>
                                        </td>
                                    ,
                                    'Sélection':
                                        item => <td style={{width: '10%', textAlign: 'center', margin: 'auto'}}>
                                                    <input
                                                        className="mt-2 mb-1 my-1"
                                                        type="checkbox"
                                                        name="inline-checkbox"
                                                        checked={ item.selected }
                                                        onClick={ () => handleSelect(item) }
                                                        style={{zoom: 2.3}}
                                                    />
                                                </td>
                                    ,
                                    'details':
                                        item => <CCollapse show={details.includes(item.id)}>
                                                    <NeedDetails goods={ item.goods } provision={ item } provisions={ provisions } setProvisions={ setProvisions }/>
                                                </CCollapse>
                                }}
                            />
                        }
                    </CCardBody>
                </CCard>
            </CCol>

            <CCol sm="12" lg="6">
              {Object.keys(toasters).map((toasterKey) => (
                <CToaster
                  position={toasterKey}
                  key={'toaster' + toasterKey}
                >
                  {
                    toasters[toasterKey].map((toast, key)=>{
                    return(
                      <CToast
                        key={ 'toast' + key }
                        show={ true }
                        autohide={ toast.autohide }
                        fade={ toast.fade }
                        color={ toast.color }
                        style={{ color: 'white' }}
                      >
                        <CToastHeader closeButton={ toast.closeButton }>
                            { toast.title }
                        </CToastHeader>
                        <CToastBody style={{ backgroundColor: 'white', color: "black" }}>
                            { toast.messsage }
                        </CToastBody>
                      </CToast>
                    )
                  })
                  }
                </CToaster>
              ))}
            </CCol>

        </CRow>
    );
}

export default Supplying;