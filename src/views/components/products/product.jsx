import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductActions from 'src/services/ProductActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInputFile, CInputGroup, CInputGroupAppend, CInputGroupText, CInvalidFeedback, CLabel, CRow, CSelect, CSwitch, CTextarea } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import Roles from 'src/config/Roles';
import CategoryActions from 'src/services/CategoryActions';
import TaxActions from 'src/services/TaxActions';

const ProductPage = ({ match, history }) => {

    const { id = "new" } = match.params;
    const userRoles = Roles.getRoles();
    const [taxes, setTaxes] = useState([]);
    const [editing, setEditing] = useState(false);
    const [categories, setCategories] = useState([]);
    const [product, setProduct] = useState({name: "", userGroups: userRoles, image: null, unit: "Kg", productGroup: "J + 1", fullDescription: "", stock: {quantity: 0, alert: "", security:""}, stockManaged: true, tax: "-1", uniquePrice: true, prices: [{name: 'BASE', price:""}, {name: 'USER_VIP', price:""}, {name: 'PRO_CHR', price:""}, {name: 'PRO_GC', price:""}, {name: 'PRO_VIP', price:""}], available: true, requireLegalAge: false, new: true, categories: []});
    const [errors, setErrors] = useState({name: "", userGroups: "", image: "", unit: "", productGroup: "", fullDescription: "", stock: {alert: "", security:""}, stockManaged: "", tax: "", uniquePrice: "", prices: [{name: 'BASE', price:""}, {name: 'USER_VIP', price:""}, {name: 'PRO_CHR', price:""}, {name: 'PRO_GC', price:""}, {name: 'PRO_VIP', price:""}], available: "", requireLegalAge: "", new: "", categories: ""});
    
    useEffect(() => {
        fetchCategories();
        fetchTaxes();
        fetchProduct(id);
    }, []);
    
    useEffect(() => fetchProduct(id), [id]);

    useEffect(() => {
        if (product.tax === "-1" && taxes.length > 0)
            setProduct({...product, tax: taxes[0]});
    }, [product, taxes]);
    
    const handleImageChange = ({ currentTarget }) => setProduct({...product, image: currentTarget.files[0]});
    const handleUsersChange = userGroups => setProduct(product => ({...product, userGroups}));
    const handleCategoriesChange = categories => setProduct(product => ({...product, categories}));
    const handleChange = ({ currentTarget }) => setProduct({...product, [currentTarget.name]: currentTarget.value});
    const handleStockChange = ({currentTarget}) => setProduct({...product, stock: {...product.stock, [currentTarget.name]: currentTarget.value}});
    const handleCheckBoxes = ({ currentTarget }) => setProduct({...product, [currentTarget.name]: !product[currentTarget.name]});
    
    const handleUniquePrice = ({ currentTarget }) => {
        if (product[currentTarget.name])
            setProduct({...product, [currentTarget.name]: !product[currentTarget.name]});
        else {
            const uniqueValue = product.prices.find(price => price.name === 'BASE').price;
            setProduct({
                ...product, 
                [currentTarget.name]: !product[currentTarget.name], 
                prices: product[currentTarget.name] ? product.prices : product.prices.map(price => ({...price, price: uniqueValue}))
            });
        }
    };

    const handlePriceChange = ({ currentTarget }) => { 
        let updatedPrice = product.prices.find(price => price.name === currentTarget.name);
        const filteredPrices = product.prices.filter(price => price.name !== updatedPrice.name);
        !product.uniquePrice ?
            setProduct({...product, prices: [...filteredPrices, {...updatedPrice, price: currentTarget.value}]}) :
            setProduct({...product, prices: product.prices.map(price => ({...price, price: currentTarget.value}))});
    };

    const fetchProduct = id => {
        if (id !== "new") {
            setEditing(true);
            let request = ProductActions.find(id);
            request
                .then(response => {
                    const basePrice = response.prices.find(price => price.name === 'BASE').price;
                    setProduct({...response, 
                        userGroups: Roles.getSelectedRoles(response.userGroups), 
                        categories: response.categories.map(category => ({value: category.id, label: category.name, isFixed: false})),
                        uniquePrice: response.prices.every(price => price.price === basePrice)
                    });
                })
                .catch(error => {
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/products");
                });
        } else
            setEditing(false);
    };

    const fetchCategories = () => {
        let request = CategoryActions.findAll()
        request
            .then(response => setCategories(response))
            .catch(error => {
                // TODO : Notification flash d'une erreur
                history.replace("/components/products");
            });
    };

    const fetchTaxes = () => {
        let request = TaxActions.findAll();
        request
            .then(response => setTaxes(response))
            .catch(error => {
                // TODO : Notification flash d'une erreur
                history.replace("/components/products");
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let productToWrite = {
            ...product, 
            userGroups: product.userGroups.map(group => group.value), 
            tax: product.tax['@id'],
            categories: product.categories.map(category => categories.find(element => element.id === category.value)['@id']),
            prices: Object.keys(product.prices).map((key, index) => ({name: key, price: Object.values(product.prices)[index]}))
        };
        console.log(productToWrite);
        if (product.image !== null && product.image !== undefined) {
            ProductActions.createImage(product.image)
                          .then(image => writeProduct({...productToWrite, image}));
        } else {
            writeProduct(productToWrite);
        }
    };

    const writeProduct = productToWrite => {
        const request = !editing ? ProductActions.create(productToWrite) : ProductActions.update(id, productToWrite);
        request
            .then(response => {
                setErrors({name: ""});
                //TODO : Flash notification de succès
                history.replace("/components/products");
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

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer un produit" : "Modifier " + product.name }</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nom</CLabel>
                                        <CInput
                                            id="name"
                                            name="name"
                                            value={ product.name }
                                            onChange={ handleChange }
                                            placeholder="Nom du produit"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="sku">Code</CLabel>
                                        <CInput
                                            id="sku"
                                            name="sku"
                                            value={ product.sku }
                                            onChange={ handleChange }
                                            placeholder="Code interne"
                                            disabled
                                        />
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CFormGroup row className="ml-1 mt-4 mb-0">
                                <CLabel>Image</CLabel>
                            </CFormGroup>
                            <CFormGroup row className="ml-1 mr-1 mt-0 mb-3">
                                <CCol xs="12" md="12">
                                    <CLabel>Image</CLabel>
                                    <CInputFile name="image" custom id="custom-file-input" onChange={ handleImageChange }/>
                                    <CLabel htmlFor="custom-file-input" variant="custom-file">{product.image === null || product.image === undefined ? "Choose file..." : product.image.name }</CLabel>
                                </CCol>
                            </CFormGroup >
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12">
                                    <SelectMultiple name="categories" label="Catégories" value={ product.categories } error={ errors.categories } onChange={ handleCategoriesChange } data={ categories.map(category => ({value: category.id, label: category.name, isFixed: false})) }/>
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12">
                                    <SelectMultiple name="userGroups" label="Pour les utilisateurs" value={ product.userGroups } error={ errors.userGroups } onChange={ handleUsersChange } data={ userRoles }/>
                                </CCol>
                            </CRow>
                            <CFormGroup row className="mb-4">
                                <CCol xs="12" md="12">
                                    <CLabel htmlFor="textarea-input">Description</CLabel>
                                    <CTextarea name="fullDescription" id="fullDescription" rows="9" placeholder="Content..." onChange={ handleChange } value={ product.fullDescription }/>
                                </CCol>
                            </CFormGroup>
                            <hr className="mt-5 mb-5"/>
                            <CFormGroup row>
                                <CCol xs="12" md="4">
                                    <CLabel htmlFor="select">TVA</CLabel>
                                    <CSelect custom name="tax" id="tax" value={ product.tax } onChange={ handleChange }>
                                        { taxes.map(tax => <option key={ tax.id } value={ tax.id }>{ tax.name }</option>)}
                                    </CSelect>
                                </CCol>
                                <CCol xs="12" md="4">
                                    <CLabel htmlFor="select">{ product.uniquePrice ? "Prix" : "Prix de base"}</CLabel>
                                    <CInput
                                        type="number"
                                        name="BASE" 
                                        id="BASE" 
                                        value={ product.prices.find(price => price.name === "BASE").price }
                                        onChange={ handlePriceChange } 
                                        placeholder={ product.uniquePrice ? "Prix HT" : "Prix de base HT"}
                                    />
                                </CCol>
                                <CFormGroup row className="mt-4 mb-0 ml-1 d-flex align-items-end">
                                    <CCol xs="3" sm="3">
                                        <CSwitch name="uniquePrice" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ product.uniquePrice } onChange={ handleUniquePrice }/>
                                    </CCol>
                                    <CCol tag="label" xs="9" sm="9" className="col-form-label">
                                        Prix unique
                                    </CCol>
                                </CFormGroup>
                            </CFormGroup>
                            { !product.uniquePrice && 
                                <CFormGroup row>
                                    <CCol xs="12" md="4" className="mt-4">
                                        <CLabel htmlFor="select">Prix CHR</CLabel>
                                        <CInput
                                            type="number"
                                            name="PRO_CHR" 
                                            id="PRO_CHR" 
                                            value={ product.prices.find(price => price.name === "PRO_CHR").price } 
                                            onChange={ handlePriceChange } 
                                            placeholder="Prix de base HT"
                                        />
                                    </CCol>
                                    <CCol xs="12" md="4" className="mt-4">
                                        <CLabel htmlFor="select">Prix Grands Comptes</CLabel>
                                        <CInput
                                            type="number"
                                            name="PRO_GC" 
                                            id="PRO_GC" 
                                            value={ product.prices.find(price => price.name === "PRO_GC").price }      // product.prices['PRO_GC']
                                            onChange={ handlePriceChange } 
                                            placeholder="Prix de base HT"
                                        />
                                    </CCol>
                                    <CCol xs="12" md="4" className="mt-4">
                                        <CLabel htmlFor="select">Prix VIP</CLabel>
                                        <CInput
                                            type="number"
                                            name="PRO_VIP" 
                                            id="PRO_VIP" 
                                            value={ product.prices.find(price => price.name === "PRO_VIP").price }     // product.prices['PRO_VIP']
                                            onChange={ handlePriceChange } 
                                            placeholder="Prix de base HT"
                                        />
                                    </CCol>
                                </CFormGroup>
                            }
                            <hr className="mt-5 mb-5"/>
                            <CFormGroup row>
                                <CCol xs="12" md="4">
                                    <CLabel htmlFor="select">Unité de vente</CLabel>
                                    <CSelect custom name="unit" id="unit" value={ product.unit } onChange={ handleChange }>
                                        <option value="Kg">Kilogramme</option>
                                        <option value="U">Unité</option>
                                    </CSelect>
                                </CCol>
                                <CCol xs="12" md="4">
                                    <CLabel htmlFor="select">Poids moyen</CLabel>
                                    <CInput
                                        type="number"
                                        name="weight" 
                                        id="weight" 
                                        value={ product.weight } 
                                        onChange={ handleChange } 
                                        placeholder="Poids en Kg"
                                        disabled={ product.unit === "Kg" }
                                    />
                                </CCol>
                                <CCol xs="12" md="4">
                                    <CLabel htmlFor="select">Durée de vie</CLabel>
                                    <CSelect custom name="productGroup" id="productGroup" value={ product.productGroup } onChange={ handleChange }>
                                        <option value="J + 1">J + 1</option>
                                        <option value="J + 3">J + 3</option>
                                        <option value="J + 6">J + 6</option>
                                        <option value="J + 10">J + 10</option>
                                    </CSelect>
                                </CCol>
                            </CFormGroup>
                            <CFormGroup row>
                                <CCol xs="12" md="4" className="mt-4">
                                    <CLabel htmlFor="alert">Niveau d'alerte</CLabel>
                                    <CInputGroup>
                                        <CInput
                                            type="number"
                                            name="alert"
                                            id="alert" 
                                            value={ product.stock.alert } 
                                            onChange={ handleStockChange } 
                                            placeholder="Stock d'alerte"
                                        />
                                        <CInputGroupAppend>
                                            <CInputGroupText>{ product.unit }</CInputGroupText>
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
                                            value={ product.stock.security } 
                                            onChange={ handleStockChange } 
                                            placeholder="Stock de sécurité"
                                        />
                                        <CInputGroupAppend>
                                            <CInputGroupText>{ product.unit }</CInputGroupText>
                                        </CInputGroupAppend>
                                    </CInputGroup>
                                </CCol>
                                <CFormGroup row className="mt-4 mb-0 ml-1 d-flex align-items-end">
                                    <CCol xs="3" sm="3">
                                        <CSwitch name="stockManaged" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ product.stockManaged } onChange={ handleCheckBoxes }/>
                                    </CCol>
                                    <CCol tag="label" xs="9" sm="9" className="col-form-label">
                                        Stock bloquant
                                    </CCol>
                                </CFormGroup>
                            </CFormGroup>
                            <hr className="mt-5 mb-5"/>
                            <CFormGroup row>
                                <CCol xs="12" md="4" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="available" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ product.available } onChange={ handleCheckBoxes }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                                            Disponible
                                        </CCol>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" md="4" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="new" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ product.new } onChange={ handleCheckBoxes }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                                            Nouveauté
                                        </CCol>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" md="4" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="requireLegalAge" className="mr-1" color="danger" shape="pill" checked={ product.requireLegalAge } onChange={ handleCheckBoxes }/>    {/* variant="opposite" */}
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                                            Interdit aux -18ans
                                        </CCol>
                                    </CFormGroup>
                                </CCol>
                            </CFormGroup>
                            <hr className="mt-5 mb-5"/>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/products" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default ProductPage;