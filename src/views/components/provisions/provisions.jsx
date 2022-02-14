import React, { useContext, useEffect, useState } from 'react';
import ProvisionActions from '../../../services/ProvisionActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CCollapse, CFormGroup, CInputCheckbox, CLabel, CWidgetIcon, CCardFooter } from '@coreui/react';
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { isSameDate, getDateFrom, getArchiveDate } from 'src/helpers/days';
import Spinner from 'react-bootstrap/Spinner'
import SelectMultiple from 'src/components/forms/SelectMultiple';
import SupplierActions from 'src/services/SupplierActions';
import ProvisionModal from 'src/components/provisionPages/provisionModal';
import CIcon from '@coreui/icons-react';
import MercureContext from 'src/contexts/MercureContext';
import { updateBetween } from 'src/data/dataProvider/eventHandlers/provisionEvents';
import 'src/assets/css/form.css';

const Provisions = (props) => {

    const itemsPerPage = 30;
    const fields = ['Client', 'Fournisseur', 'Date', 'Total', ' '];
    const { currentUser, seller } = useContext(AuthContext);
    const [provisions, setProvisions] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [details, setDetails] = useState([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const { updatedProvisions, setUpdatedProvisions } = useContext(MercureContext);
    const [mercureOpering, setMercureOpering] = useState(false);
    const [csvContent, setCsvContent] = useState("");

    const csvCode = 'data:text/csv;charset=utf-8,SEP=,%0A' + encodeURIComponent(csvContent);

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        fetchSuppliers();
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        if (suppliers.length > 0 && !isDefinedAndNotVoid(selectedSuppliers))
            setSelectedSuppliers(getFormattedEntities(suppliers));
    }, [suppliers]);

    useEffect(() => {
        if (isDefinedAndNotVoid(selectedSuppliers))
            fetchProvisions()
    }, [dates, selectedSuppliers]);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedProvisions) && !mercureOpering) {
            setMercureOpering(true);
            updateBetween(getUTCDates(), provisions, setProvisions, updatedProvisions, setUpdatedProvisions)
                .then(response => setMercureOpering(response));
        }
    }, [updatedProvisions]);

    useEffect(() => {
        if (isDefinedAndNotVoid(provisions))
            setCsvContent(getCsvContent());
    },[provisions]);

    const fetchProvisions = () => {
        setLoading(true);
        const UTCDates = getUTCDates(dates);
        ProvisionActions.findAllSuppliersBetween(UTCDates, selectedSuppliers, currentUser)
                .then(response =>{
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
            .then(response => {
                const externSuppliers = response;
                setSuppliers(externSuppliers);
            });
    };

    const handleDelete = item => {
        const originalProvisions = [...provisions];
        setProvisions(provisions.filter(provision => provision.id !== item.id));
        ProvisionActions.delete(item.id, isAdmin)
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

    const getFormattedEntities = entities => {
        return entities.map(entity => ({ value: entity['@id'], label: entity.name, isFixed: false }));
    };

    const getProductName = (product, variation, size) => {
        const variationName = exists(variation, 'color') ? " - " + variation.color : "";
        const sizeName = exists(size, 'name') ? " " + size.name : "";
        return product.name + variationName + sizeName;
    };

    const exists = (entity, variable) => {
        return isDefined(entity) && isDefined(entity[variable]) && entity[variable].length > 0 && entity[variable] !== " ";
    };

    const getTotalProvision = provision => provision.goods.reduce((sum, current) => {
        return sum + ((isDefined(current.received) ? current.received : 0) * (isDefined(current.price) ? current.price : 0))
    }, 0);
    const getSupplierCount = () => [...new Set(provisions.map(provision => provision.supplier.id))].length;

    const getProductCount = () => {
        let allProducts = [];
        provisions.map(provision => {
            const products = provision.goods.map(good => good.product);
            allProducts = [...allProducts, ...products];
        });
        return [...new Set(allProducts.map(product => product.id))].length;
    };

    const getCsvContent = () => {
        const header = ['Index', 'Fournisseur', 'Client', 'Date liv.', 'Produit', 'Qte comm.', 'Unite', 'Qte reçue', 'Unite', 'Statut', 'Mode d\'envoi', 'Adresse'].join(',');
        const data = provisions.map((provision, index) => 
            provision.goods.map(good => [
                index + 1,
                provision.supplier.name,
                isDefined(provision.user) ? provision.user.name : '-',
                (new Date(provision.provisionDate)).toLocaleDateString('fr-FR', { timeZone: 'UTC'}),
                good.product.name,
                isDefined(good.quantity) ? good.quantity.toFixed(2) : "-",
                good.unit,
                isDefined(good.received) ? good.received.toFixed(2) : "-",
                good.unit,
                provision.status === "RECEIVED" ? "Réceptionné" : "Envoyé",
                provision.sendingMode,
                !isDefined(provision.metas) ? '-' : getAddress(provision.metas)
            ].join(',')).join('\n')
        ).join('\n');
        return [header, data].join('\n');
    };

    const getAddress = metas => {
        const address = isDefined(metas.address) ? metas.address.replaceAll(',', '') : '';
        const zipcode = isDefined(metas.zipcode) ? metas.zipcode : '';
        const city = isDefined(metas.city) ? metas.city : '';
        return address + ' ' + zipcode + ' - ' + city;
    };

    return (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader className="d-flex align-items-center">
                        Liste des approvisionnements
                        { isAdmin &&
                            <CCol col="6" sm="4" md="2" className="ml-auto">
                                <Link role="button" to="/components/provisions/new" block variant="outline" color="success">CRÉER</Link>
                            </CCol>
                        }
                    </CCardHeader>
                    <CCardBody>
                        <CRow>
                            <CCol xs="12" sm="6" lg="4">
                                <CWidgetIcon text="Commandes" header={ provisions.length } color="primary" iconPadding={false}>
                                    <CIcon width={24} name="cil-clipboard"/>
                                </CWidgetIcon>
                            </CCol>
                            <CCol xs="12" sm="6" lg="4">
                                <CWidgetIcon text="Fournisseurs" header={ getSupplierCount() } color="warning" iconPadding={false}>
                                    <CIcon width={24} name="cil-people"/>
                                </CWidgetIcon>
                            </CCol>
                            <CCol xs="12" sm="6" lg="4">
                                <CWidgetIcon text="Produits" header={ getProductCount() } color="danger" iconPadding={false}>
                                    <CIcon width={24} name="cil-fastfood"/>
                                </CWidgetIcon>
                            </CCol>
                        </CRow>
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
                            <CCol xs="12" lg="6">
                                <SelectMultiple className="supplier-select" name="suppliers" label="Founisseurs" value={ selectedSuppliers } onChange={ handleSuppliersChange } data={ getFormattedEntities(suppliers) }/>
                            </CCol>
                        </CRow>
                        { loading ?
                            <CRow>
                                <CCol xs="12" lg="12" className="text-center">
                                    <Spinner animation="border" variant="danger"/>
                                </CCol>
                            </CRow>
                            :
                            <>
                                { isDefinedAndNotVoid(provisions) && 
                                    <CRow className="">
                                        <CCol xs="12" lg="12" className="my-3 d-flex justify-content-start">
                                            <CButton color="primary" className="mb-2" href={csvCode} download={`Recap-Achats-${ getArchiveDate(dates.start) }-${ getArchiveDate(dates.end) }.csv`} target="_blank">
                                                <CIcon name="cil-cloud-download" className="mr-2"/>Télécharger
                                            </CButton>
                                        </CCol>
                                    </CRow>
                                }
                                <CDataTable
                                    items={ provisions }
                                    fields={ isAdmin ? fields : fields.filter(f => f !== 'Total') }
                                    bordered
                                    itemsPerPage={ itemsPerPage }
                                    pagination
                                    hover
                                    scopedSlots = {{
                                        'Client':
                                            item => <td>
                                                        <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} >
                                                            { isDefined(item.user) ? item.user.name : '-' }
                                                            <br/>
                                                            <small><i>Commande S{ item.id.toString().padStart(10, '0') }</i></small>
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
                                            item => <td style={{color: item.status === "RECEIVED" ? "dimgray" : "black"}}>
                                                        { isSameDate(new Date(item.provisionDate), new Date()) ? "Aujourd'hui" : 
                                                        isSameDate(new Date(item.provisionDate), getDateFrom(new Date(), -1)) ? "Hier" :
                                                        isSameDate(new Date(item.provisionDate), getDateFrom(new Date(), 1)) ? "Demain" :
                                                        (new Date(item.provisionDate)).toLocaleDateString('fr-FR', { timeZone: 'UTC'})
                                                        }
                                                    </td>
                                        ,
                                        'Total':
                                            item => <td style={{color: item.status === "RECEIVED" ? "dimgray" : "black"}}>
                                                        { item.status === "RECEIVED" ? (getTotalProvision(item)).toFixed(2) + " €" : "-"}
                                                    </td>
                                        ,
                                        ' ':
                                            item => (
                                                <td className="mb-3 mb-xl-0 text-right">
                                                    { item.status === "ORDERED" && <ProvisionModal item={ item } provisions={ provisions } setProvisions={ setProvisions }/> }
                                                    <CButton color="warning" disabled={ !isAdmin && !Roles.isSeller(currentUser) } href={ "#/components/provisions/" + item.id } className="mx-1 my-1"><i className="fas fa-pen"></i></CButton>
                                                    <CButton color="danger" disabled={ !isAdmin && !Roles.isSeller(currentUser) } onClick={ () => handleDelete(item) } className="mx-1 my-1"><i className="fas fa-trash"></i></CButton>
                                                </td>
                                            )
                                        ,
                                        'details':
                                            item => <CCollapse show={details.includes(item.id)}>
                                                        <CDataTable
                                                            items={ item.goods }
                                                            fields={  ['Produit', 'Stock', 'Commandé', 'Reçu'] }
                                                            bordered
                                                            itemsPerPage={ itemsPerPage }
                                                            pagination
                                                            hover
                                                            scopedSlots = {{
                                                                'Produit':
                                                                    item => <td>{ getProductName(item.product, item.variation, item.size) }</td>
                                                                ,
                                                                'Stock':
                                                                    item => <td>{ isDefined(item.stock) ? item.stock.toFixed(2) + " " + item.unit : "-" }</td>
                                                                ,
                                                                'Commandé':
                                                                    item => <td>{ item.quantity.toFixed(2) + " " + item.unit }</td>
                                                                ,
                                                                'Reçu':
                                                                    item => <td>{ isDefined(item.received) ? item.received.toFixed(2) + " " + item.unit : "-" }</td>
                                                            }}
                                                        />
                                                    </CCollapse>
                                    }}
                                />
                            </>
                        }
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default Provisions;