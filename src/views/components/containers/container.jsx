import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContainerActions from 'src/services/ContainerActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CInputGroupText, CInputGroupAppend, CInputGroup, CSwitch, CSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import TaxActions from 'src/services/TaxActions';
import { getFloat, isDefinedAndNotVoid } from 'src/helpers/utils';
import CatalogPrice from 'src/components/containerPages/catalogPrice';
import CatalogActions from 'src/services/CatalogActions';

const Container = ({ match, history }) => {

    const { id = "new" } = match.params;
    const defaultCatalog = {id: -1, name: "", amount: 0};
    const [editing, setEditing] = useState(false);
    const [taxes, setTaxes] = useState([]);
    const [catalogs, setCatalogs] = useState([]);
    const [catalogOptions, setCatalogOptions] = useState([defaultCatalog]);
    const defaultErrors = {name: "", available: "", max: "", tare: "", tax: "", length: "", width: "", height: ""};
    const defaultStock = {quantity: 0, alert: 0, security: 0};
    const [container, setContainer] = useState({ name: "", max: "", tare: "", available: true, tax: "", length: "", width: "", height: "", stock: defaultStock });
    const [errors, setErrors] = useState(defaultErrors);

    useEffect(() => {
        fetchCatalogs();
        fetchTaxes();
        fetchContainer(id);
    }, []);

    useEffect(() => fetchContainer(id), [id]);

    useEffect(() => {
        if (Object.keys(container.tax).length === 0 && taxes.length > 0)
            setContainer({...container, tax: taxes[0]});
    }, [taxes, container]);

    useEffect(() => {
        if (isDefinedAndNotVoid(catalogs)) {
            let newCatalogOptions = [...catalogOptions];
            let defaultOption = catalogOptions.findIndex(option => option.id === -1);
            if (defaultOption !== -1) {
                newCatalogOptions[defaultOption] = {...catalogs[0], amount: newCatalogOptions[defaultOption].amount };
                setCatalogOptions(newCatalogOptions);
            }
        }
    }, [catalogs, container]);

    const handleChange = ({ currentTarget }) => setContainer({...container, [currentTarget.name]: currentTarget.value});
    const handleCheckBoxes = ({ currentTarget }) => setContainer({...container, [currentTarget.name]: !container[currentTarget.name]});
    const handleStockChange = ({ currentTarget }) => setContainer({...container, stock: {...container.stock, [currentTarget.name]: currentTarget.value}})

    const fetchContainer = id => {
        if (id !== "new") {
            setEditing(true);
            ContainerActions.find(id)
                .then( response => {
                    const { catalogPrices, ...container } = response; 
                    setContainer(container);
                    if (catalogPrices.length > 0) {
                        setCatalogOptions(catalogPrices.map(catalog => ({...catalog.catalog, amount: catalog.amount})));
                    }
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/containers");
                });
        }
    };

    const fetchCatalogs = () => {
        CatalogActions.findAll()
            .then(response => setCatalogs(response));       // .filter(catalog => catalog.needsParcel)
    };

    const fetchTaxes = () => {
        TaxActions
            .findAll()
            .then(response => setTaxes(response))
            .catch(error => {
                // TODO : Notification flash d'une erreur
                history.replace("/components/containers");
            });
    };

    const handleAdd = e => {
        e.preventDefault();
        if (catalogOptions.length < catalogs.length) {
            let next = catalogs.findIndex(catalog => catalogOptions.find(selection => selection.id === catalog.id) === undefined);
            setCatalogOptions(catalogOptions => {
                return [...catalogOptions, {...catalogs[next], amount: 0}];
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const containerToWrite = getContainerToWrite();
        console.log(containerToWrite);
        const request = !editing ? ContainerActions.create(containerToWrite) : ContainerActions.update(id, containerToWrite);
        request.then(response => {
                    setErrors(defaultErrors);
                    //TODO : Flash notification de succès
                    history.replace("/components/containers");
                })
               .catch( ({ response }) => {
                   if (response) {
                       const { violations } = response.data;
                       if (violations) {
                           const apiErrors = {};
                           violations.forEach(({propertyPath, message}) => {
                               apiErrors[propertyPath] = message;
                           });
                           setErrors(apiErrors);
                       }
                       //TODO : Flash notification d'erreur
                   }
               });
    };

    const getContainerToWrite = () => {
        return {
            ...container, 
            tax: container.tax['@id'],
            max: getFloat(container.max),
            tare: getFloat(container.tare),
            length: getFloat(container.length),
            width: getFloat(container.width),
            height: getFloat(container.height),
            stock: {
                ...container.stock, 
                quantity: getFloat(container.stock.quantity),
                alert: getFloat(container.stock.alert),
                security: getFloat(container.stock.security),
            },
            catalogPrices: catalogOptions.map(catalog => ({catalog: catalog['@id'], amount: getFloat(catalog.amount) }))
        };
    }

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>Créer un colis</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nom</CLabel>
                                        <CInput
                                            id="name"
                                            name="name"
                                            value={ container.name }
                                            onChange={ handleChange }
                                            placeholder="Nom du colis"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" md="6" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="available" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ container.available } onChange={ handleCheckBoxes }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Disponible</CCol>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="12" md="4">
                                    <CLabel htmlFor="select">TVA</CLabel>
                                    <CSelect custom name="tax" id="tax" value={ container.tax['@id'] } onChange={ handleChange }>
                                        { taxes.map(tax => <option key={ tax.id } value={ tax['@id'] }>{ tax.name }</option>)}
                                    </CSelect>
                                </CCol>
                                <CCol xs="12" sm="12" md="4">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Poids maximal</CLabel>
                                        <CInput
                                            id="max"
                                            name="max"
                                            value={ container.max }
                                            onChange={ handleChange }
                                            placeholder="Poids max en Kg"
                                            invalid={ errors.max.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.max }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="4">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Tare</CLabel>
                                        <CInput
                                            id="tare"
                                            name="tare"
                                            value={ container.tare }
                                            onChange={ handleChange }
                                            placeholder="Tare en Kg"
                                            invalid={ errors.tare.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.tare }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="12" md="4">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Longueur</CLabel>
                                        <CInput
                                            id="length"
                                            name="length"
                                            value={ container.length }
                                            onChange={ handleChange }
                                            placeholder="Longueur en cm"
                                            invalid={ errors.length.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.length }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="4">
                                    <CFormGroup>
                                    <CLabel htmlFor="name">Largeur</CLabel>
                                        <CInput
                                            id="width"
                                            name="width"
                                            value={ container.width }
                                            onChange={ handleChange }
                                            placeholder="Largeur en cm"
                                            invalid={ errors.width.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.width }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="4">
                                    <CFormGroup>
                                    <CLabel htmlFor="name">Hauteur</CLabel>
                                        <CInput
                                            id="height"
                                            name="height"
                                            value={ container.height }
                                            onChange={ handleChange }
                                            placeholder="Hauteur en cm"
                                            invalid={ errors.height.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.height }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" md="4" className="mt-4">
                                    <CLabel htmlFor="alert">Etat du stock</CLabel>
                                    <CInputGroup>
                                        <CInput
                                            type="number"
                                            name="quantity"
                                            id="quantity" 
                                            value={ container.stock.quantity } 
                                            onChange={ handleStockChange } 
                                            placeholder="Etat du stock"
                                        />
                                        <CInputGroupAppend>
                                            <CInputGroupText>U</CInputGroupText>
                                        </CInputGroupAppend>
                                    </CInputGroup>
                                </CCol>
                                <CCol xs="12" md="4" className="mt-4">
                                    <CLabel htmlFor="alert">Niveau d'alerte</CLabel>
                                    <CInputGroup>
                                        <CInput
                                            type="number"
                                            name="alert"
                                            id="alert" 
                                            value={ container.stock.alert } 
                                            onChange={ handleStockChange } 
                                            placeholder="Stock d'alerte"
                                        />
                                        <CInputGroupAppend>
                                            <CInputGroupText>U</CInputGroupText>
                                        </CInputGroupAppend>
                                    </CInputGroup>
                                </CCol>
                                <CCol xs="12" md="4" className="mt-4">
                                    <CLabel htmlFor="select">Niveau de blocage</CLabel>
                                    <CInputGroup>
                                        <CInput
                                            type="number"
                                            name="security"
                                            id="security" 
                                            value={ container.stock.security } 
                                            onChange={ handleStockChange } 
                                            placeholder="Stock de sécurité"
                                        />
                                        <CInputGroupAppend>
                                            <CInputGroupText>U</CInputGroupText>
                                        </CInputGroupAppend>
                                    </CInputGroup>
                                </CCol>
                            </CRow>
                            <hr className="mt-5"/>
                            <CLabel htmlFor="name" className="mb-1">Prix</CLabel>
                            { catalogOptions.map((catalog, index) => {
                                return <CatalogPrice 
                                            key={ catalog.id } 
                                            index={ index }
                                            details={ catalog } 
                                            options={ catalogOptions } 
                                            catalogs={ catalogs }
                                            setCatalogOptions={ setCatalogOptions }
                                        />
                                })
                            }
                            <CRow className="mt-4 mr-1 d-flex justify-content-start ml-1">
                                <CButton size="sm" color="warning" onClick={ handleAdd }><CIcon name="cil-plus"/> Ajouter un prix</CButton>
                            </CRow>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/containers" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Container;