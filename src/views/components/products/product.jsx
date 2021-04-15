import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductActions from 'src/services/ProductActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInputFile, CInputGroup, CInputGroupAppend, CInputGroupText, CInvalidFeedback, CLabel, CRow, CSelect, CSwitch, CTextarea } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import Roles from 'src/config/Roles';
// import Select from '../../components/forms/Select';
// import UnitActions from '../../services/UnitActions';
// import ProductActions from '../../services/ProductActions';
// import CategoryActions from '../../services/CategoryActions';
// import SupplierActions from '../../services/SupplierActions';
// import SupplierInput from '../../components/SupplierInput';
// import RoleActions from '../../services/RoleActions';
// import SelectMultiple from '../../components/forms/SelectMultiple';

const ProductPage = ({ match, history }) => {

    const { id = "new" } = match.params;
    const userRoles = Roles.getRoles();
    // const defauxltSupplier = {id: -1, name: ""};
    // const userRoles = RoleActions.getRoles();
    const [editing, setEditing] = useState(false);
    const [product, setProduct] = useState({name: "", userGroups: userRoles, image: "", unit: "Kg", productGroup: "J + 1", fullDescription: "", stock: {alert: "", security:""}, stockManaged: true, tax: "0", uniquePrice: true, prices: { BASE: "", USER_VIP: "", PRO_CHR:"", PRO_GC: "", PRO_VIP: ""}, available: true, requireLegalAge: false, new: true});
    const [errors, setErrors] = useState({name: "", userGroups: "", image: "", unit: "", productGroup: "", fullDescription: "", stock: {alert: "", security:""}, stockManaged: "", tax: "", uniquePrice: "", prices: { BASE: "", USER_VIP: "", PRO_CHR:"", PRO_GC: "", PRO_VIP: ""}, available: "", requireLegalAge: "", new: ""});
    // const [product, setProduct] = useState({name: "", code:"", description: "", category: "", picture: "", suppliers: "", unit: "", mainSupplierId: 1, userCategories: userRoles});
    // const [errors, setErrors] = useState({name: "", code:"", description: "", category: "", picture: "", suppliers: "", unit: "", userCategories: ""});
    // const [units, setUnits] = useState([]);
    // const [categories, setCategories] = useState([]);
    // const [suppliers, setSuppliers] = useState([]);
    // const [supplierOptions, setSupplierOptions] = useState([defaultSupplier]);
    // const [mainSupplier, setMainSupplier] = useState(0);

    useEffect(() => fetchDatas(id), []);
    useEffect(() => fetchDatas(id), [id]);

    const handleUsersChange = userGroups => setProduct(product => ({...product, userGroups}));
    const handleChange = ({ currentTarget }) => setProduct({...product, [currentTarget.name]: currentTarget.value});
    const handleCheckBoxes = ({ currentTarget }) => setProduct({...product, [currentTarget.name]: !product[currentTarget.name]})

    // useEffect(() => {
    //     if (suppliers !== null && suppliers !== undefined && suppliers.length > 0) {
    //         let newSupplierOptions = [...supplierOptions];
    //         let defaultOption = supplierOptions.findIndex(option => option.id === -1);
    //         if (defaultOption !== -1) {
    //             newSupplierOptions[defaultOption] = {id: suppliers[0].id, name: suppliers[0].name};
    //             setSupplierOptions(newSupplierOptions);
    //             setMainSupplier(suppliers[0].id);
    //             setProduct(product => {
    //                 return {...product, mainSupplierId: suppliers[0].id};
    //             });
    //         }
    //     }
    // }, [suppliers, product]);

    const fetchDatas = async id => {
        // let backEndCategories = categories.length === 0 ? await fetchCategories() : categories;
        // let backEndUnits = units.length === 0 ? await fetchUnits() : units;
        // let backEndSuppliers = suppliers.length === 0 ? await fetchSuppliers() : suppliers;
        if (id !== "new") {
            setEditing(true);
            await fetchProduct(id);
        } else {
            setProduct({
                ...product, 
                // category: backEndCategories[0].id,
                // unit: backEndUnits[0].id,
                // suppliers: []
            });
        }
    }

    const fetchProduct = async id => {
        try {
            const backEndProduct = await ProductActions.find(id);
            // const backEndSuppliers = backEndProduct.suppliers === null || backEndProduct.suppliers === undefined || backEndProduct.suppliers.length === 0 ? supplierOptions : backEndProduct.suppliers.map(supplier => { return {id: supplier.id, name: supplier.name}});
            // const backEndUserCategories = backEndProduct.userCategories === null || backEndProduct.userCategories === undefined ? userRoles : userRoles.filter(role => backEndProduct.userCategories.includes(role.value));
            // setProduct({ ...backEndProduct, userCategories: backEndUserCategories, category: backEndProduct.category.id, unit: backEndProduct.unit.id });
            // setSupplierOptions(backEndSuppliers);
            setProduct(backEndProduct);
            // if (backEndProduct.mainSupplierId !== null && backEndProduct.mainSupplierId !== undefined)
            //     setMainSupplier(backEndProduct.mainSupplierId);
        } catch (error) {
            console.log(error);
            // TODO : Notification flash d'une erreur
            history.replace("/components/products");
        }
    }

    // const fetchCategories = async () => {
    //     let response = [];
    //     try {
    //         const data = await CategoryActions.findAll();
    //         setCategories(data);
    //         if (!product.category) {
    //             setProduct({...product, category: data[0].id});
    //         }
    //         response = data;
    //     } catch(error) {
    //         console.log(error.response);
    //         // TODO : Notification flash d'une erreur
    //         history.replace("/products");
    //     }
    //     return response;
    // }

    // const fetchSuppliers = async () => {
    //     let response = [];
    //     try {
    //         const data = await SupplierActions.findAll();
    //         setSuppliers(data);
    //         if (!product.suppliers) {
    //             setProduct({...product, suppliers: data});
    //         }
    //         response = data;
    //     } catch(error) {
    //         console.log(error.response);
    //         // TODO : Notification flash d'une erreur
    //         history.replace("/products");
    //     }
    //     return response;
    // }

    // const fetchUnits = async () => {
    //     let response = [];
    //     try {
    //         const data = await UnitActions.findAll();
    //         setUnits(data);
    //         if (!product.unit) {
    //             setProduct({...product, unit: data[0].id});
    //         }
    //         response = data;
    //     } catch(error) {
    //         console.log(error.response);
    //         // TODO : Notification flash d'une erreur
    //         history.replace("/products");
    //     }
    //     return response;
    // }

    // const handleSupplierAdd = e => {
    //     e.preventDefault();
    //     if (supplierOptions.length < suppliers.length) {
    //         let next = suppliers.findIndex(supplier => supplierOptions.find(selection => selection.id === supplier.id) === undefined);
    //         setSupplierOptions(supplierOptions => {
    //             return [...supplierOptions, {id: suppliers[next].id, name: suppliers[next].name}];
    //         });
    //     }
    // }

    // const handleSupplierChange = ({ currentTarget }) => {
    //     let newSupplierOptions = [...supplierOptions];
    //     let index = parseInt(currentTarget.name);
    //     let newSupplier = suppliers.find(supplier => supplier.id === parseInt(currentTarget.value));
    //     newSupplierOptions[index] = {id: newSupplier.id, name: newSupplier.name};
    //     setSupplierOptions(newSupplierOptions);
    // }

    // const handleMainChange = (e, selectedMain) => {
    //     let newMain = parseInt(selectedMain) !== parseInt(mainSupplier) ? selectedMain : 0;
    //     setMainSupplier(newMain);
    //     setProduct(product => {
    //         return {...product, mainSupplierId: newMain};
    //     });
    // }

    // const handleDeleteOption = ({ currentTarget }) => {
    //     setSupplierOptions(supplierOptions => {
    //         return supplierOptions.filter(option => option.id !== parseInt(currentTarget.name));
    //     });
    // }

    // const handleUsersChange = (userCategories) => {
    //     setProduct(product => {
    //         return {...product, userCategories};
    //     });
    // }

    const handleSubmit = (e) => {
        e.preventDefault();
        // const request = !editing ? ProductActions.create(product, supplierOptions) : ProductActions.update(id, product, supplierOptions);
        const request = !editing ? ProductActions.create(product) : ProductActions.update(id, product);
        request.then(response => {
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
    }

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
                                    <CInputFile name="image" custom id="custom-file-input" value={ product.image } onChange={ handleChange }/>
                                    <CLabel htmlFor="custom-file-input" variant="custom-file">{product.image === "" ? "Choose file..." : product.image.substring(product.image.lastIndexOf('\\') +1 ) }</CLabel>
                                </CCol>
                            </CFormGroup >
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12">
                                    <SelectMultiple name="userGroups" label="Pour les utilisateurs" value={ product.userGroups } error={ errors.userGroups } onChange={ handleUsersChange } data={ userRoles }/>
                                </CCol>
                            </CRow>
                            <CFormGroup row className="mb-4">
                                <CCol xs="12" md="12">
                                    <CLabel htmlFor="textarea-input">Description</CLabel>
                                    <CTextarea name="textarea-input" id="textarea-input" rows="9" placeholder="Content..." onChange={ handleChange }>
                                        { product.fullDescription }
                                    </CTextarea>
                                </CCol>
                            </CFormGroup>
                            <hr className="mt-5 mb-5"/>
                            <CFormGroup row>
                                <CCol xs="12" md="4">
                                    <CLabel htmlFor="select">TVA</CLabel>
                                    <CSelect custom name="tax" id="tax" value={ product.tax } onChange={ handleChange }>
                                        <option value="0">TVA Réduite - 2,1%</option>
                                        <option value="1">TVA Normale - 8,5%</option>
                                    </CSelect>
                                </CCol>
                                <CCol xs="12" md="4">
                                    <CLabel htmlFor="select">{ product.uniquePrice ? "Prix" : "Prix de base"}</CLabel>
                                    <CInput
                                        type="number"
                                        name="BASE" 
                                        id="BASE" 
                                        value={ product.prices['BASE'] } 
                                        onChange={ handleChange } 
                                        placeholder={ product.uniquePrice ? "Prix HT" : "Prix de base HT"}
                                    />
                                </CCol>
                                <CFormGroup row className="mt-4 mb-0 ml-1 d-flex align-items-end">
                                    <CCol xs="3" sm="3">
                                        <CSwitch name="uniquePrice" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ product.uniquePrice } onChange={ handleCheckBoxes }/>
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
                                            value={ product.prices['PRO_CHR'] } 
                                            onChange={ handleChange } 
                                            placeholder="Prix de base HT"
                                        />
                                    </CCol>
                                    <CCol xs="12" md="4" className="mt-4">
                                        <CLabel htmlFor="select">Prix Grands Comptes</CLabel>
                                        <CInput
                                            type="number"
                                            name="PRO_GC" 
                                            id="PRO_GC" 
                                            value={ product.prices['PRO_GC'] } 
                                            onChange={ handleChange } 
                                            placeholder="Prix de base HT"
                                        />
                                    </CCol>
                                    <CCol xs="12" md="4" className="mt-4">
                                        <CLabel htmlFor="select">Prix VIP</CLabel>
                                        <CInput
                                            type="number"
                                            name="PRO_VIP" 
                                            id="PRO_VIP" 
                                            value={ product.prices['PRO_VIP'] } 
                                            onChange={ handleChange } 
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
                                            onChange={ handleChange } 
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
                                            onChange={ handleChange } 
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