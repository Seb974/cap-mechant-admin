import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ProductActions from 'src/services/ProductActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInputFile, CInputGroup, CInputGroupAppend, CInputGroupText, CInputRadio, CInvalidFeedback, CLabel, CRow, CSelect, CSwitch, CTextarea } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import Roles from 'src/config/Roles';
import CategoryActions from 'src/services/CategoryActions';
import TaxActions from 'src/services/TaxActions';
import Variation from 'src/components/productPages/variation';
import Component from 'src/components/productPages/component';
import ProductsContext from 'src/contexts/ProductsContext';

const ProductPage = ({ match, history }) => {

    const { id = "new" } = match.params;
    const userRoles = Roles.getRoles();
    const [taxes, setTaxes] = useState([]);
    const defaultSize = {count: 0, name: ""};
    const [editing, setEditing] = useState(false);
    const [categories, setCategories] = useState([]);
    const { products } = useContext(ProductsContext);
    const defaultVariant = products[0].variations && products[0].variations.length > 0 ? products.variations[0] : null;
    const defaultVariantSize = defaultVariant !== null && products[0].variations[0].sizes && products[0].variations[0].sizes.length > 0 ? products[0].variations[0].sizes[0] : null;
    const defaultProduct = {product: products[0], variation: defaultVariant, size: defaultVariantSize};
    const defaultComponent = {...defaultProduct, count: 0, quantity: ""};
    const defaultStock = {quantity: 0, alert: "", security:""};
    const defaultVariation = {count: 0, name: "", image: null, sizes: [defaultSize]};
    const [product, setProduct] = useState({name: "", weight:"", userGroups: userRoles, image: null, unit: "Kg", productGroup: "J + 1", fullDescription: "", stock: defaultStock, stockManaged: true, tax: "-1", uniquePrice: true, prices: [{name: 'BASE', price:""}, {name: 'USER_VIP', price:""}, {name: 'PRO_CHR', price:""}, {name: 'PRO_GC', price:""}, {name: 'PRO_VIP', price:""}], available: true, requireLegalAge: false, new: true, isMixed: false, categories: []});
    const [errors, setErrors] = useState({name: "", weight: "", userGroups: "", image: "", unit: "", productGroup: "", fullDescription: "", stock: {alert: "", security:""}, stockManaged: "", tax: "", uniquePrice: "", prices: [{name: 'BASE', price:""}, {name: 'USER_VIP', price:""}, {name: 'PRO_CHR', price:""}, {name: 'PRO_GC', price:""}, {name: 'PRO_VIP', price:""}], available: "", requireLegalAge: "", new: "", isMixed: "", categories: ""});
    const [variations, setVariations] = useState([defaultVariation]);
    const [components, setComponents] = useState([defaultComponent]);
    const [type, setType] = useState("simple");
    
    useEffect(() => {
        if (products === undefined || products === null || products.length <= 0) {
            history.replace("/components/products")
        }
        fetchCategories();
        fetchTaxes();
        fetchProduct(id);
    }, []);

    useEffect(() => fetchProduct(id), [id]);

    useEffect(() => {
        if (product.tax === "-1" && taxes.length > 0)
            setProduct({...product, tax: taxes[0]});
    }, [product, taxes]);
    
    const handleProductTypeChange = ({ currentTarget }) => {
        setType(currentTarget.value);
        setProduct({...product, isMixed: currentTarget.value === "mixed", fullDescription: currentTarget.value !== "mixed" ? product.fullDescription : "" });
    };
    const handleImageChange = ({ currentTarget }) => setProduct({...product, image: currentTarget.files[0]});
    const handleUsersChange = userGroups => setProduct(product => ({...product, userGroups}));
    const handleCategoriesChange = categories => setProduct(product => ({...product, categories}));
    const handleChange = ({ currentTarget }) => setProduct({...product, [currentTarget.name]: currentTarget.value});
    const handleStockChange = ({currentTarget}) => setProduct({...product, stock: {...product.stock, [currentTarget.name]: currentTarget.value}});
    const handleCheckBoxes = ({ currentTarget }) => setProduct({...product, [currentTarget.name]: !product[currentTarget.name]});
    const handleVariationAdd = () => setVariations([...variations, {...defaultVariation, count: variations[variations.length -1].count + 1}]);
    const handleComponentAdd = () => setComponents([...components, {...defaultComponent, count: components[components.length -1].count + 1}]);
    const handleVariantDelete = ({currentTarget}) => {
        const variation = variations.find(option => parseInt(option.count) === parseInt(currentTarget.name));
        setVariations(variations.filter(element => parseInt(element.count) !== parseInt(variation.count)));
    };
    const handleComponentDelete = ({currentTarget}) => {
        const component = components.find(option => parseInt(option.count) === parseInt(currentTarget.name));
        setComponents(components.filter(element => parseInt(element.count) !== parseInt(component.count)));
    };
    const handleOptionAdd = ({ currentTarget }) => {
        const variation = variations.find(option => parseInt(option.count) === parseInt(currentTarget.name));
        const filteredVariations = variations.filter(option => option.count !== variation.count);
        setVariations([...filteredVariations, {...variation, sizes: [...variation.sizes, {...defaultSize, count: variation.sizes[variation.sizes.length -1].count + 1}]}].sort((a, b) => (a.count > b.count) ? 1 : -1))
    };
    const handleOptionDelete = ({ currentTarget }) => {
        const variation = variations.find(option => parseInt(option.count) === parseInt(currentTarget.name));
        const options = variation.sizes.filter(option => parseInt(option.count) !== parseInt(currentTarget.id));
        const filteredVariations = variations.filter(option => parseInt(option.count) !== parseInt(variation.count));
        setVariations([...filteredVariations, {...variation, sizes: options}].sort((a, b) => (a.count > b.count) ? 1 : -1));
    };
    const handleVariationChange = variation => {
        const filteredVariations = variations.filter(option => parseInt(option.count) !== parseInt(variation.count));
        setVariations([...filteredVariations, variation].sort((a, b) => (a.count > b.count) ? 1 : -1));
    };
    const handleComponentChange = component => {
        const filteredComponents = components.filter(option => parseInt(option.count) !== parseInt(component.count));
        setComponents([...filteredComponents, component].sort((a, b) => (a.count > b.count) ? 1 : -1));
    };
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
                    const {prices, categories, stock, variations} = response;
                    const basePrice = prices.find(price => price.name === 'BASE').price;
                    setProduct({...response, 
                        userGroups: Roles.getSelectedRoles(response.userGroups), 
                        categories: categories.map(category => ({value: category.id, label: category.name, isFixed: false})),
                        uniquePrice: prices.every(price => price.price === basePrice),
                        stock: stock !== null && stock !== undefined ? stock : 
                               variations && variations.length > 0 ? variations[0].sizes[0].stock : defaultStock
                    });
                    setType(defineType(response));
                    setVariations(mapVariations(response.variations));
                    setComponents(mapComponents(response.components));
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    // history.replace("/components/products");
                });
        } else
            setEditing(false);
    };

    const defineType = product => {
        return product.isMixed ? "mixed" : product.variations && product.variations.length > 0 ? "with-variations" : "simple";
    };

    const mapVariations = backendVariations => {
        if (backendVariations && backendVariations.length > 0) {
            return backendVariations.map((variation, index) => {
                return {
                    ...variation, 
                    count: index, 
                    name: variation.color,
                    sizes: variation.sizes.map((size, i) => {
                        return {...size, count: i};
                    })
                };
            });
        }
        return [defaultVariation];
    };

    const mapComponents = backendComponents => {
        if (backendComponents && backendComponents.length > 0) {
            return backendComponents.map((component, index) => ({...component, count: index}))
        }
        return [defaultComponent];
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (type === "with-variations" && JSON.stringify(variations) !== JSON.stringify([defaultVariation])) {
            const writingVariations = await writeVariations();
            adaptProduct(writingVariations);
        } else if(type === "mixed" && JSON.stringify(components) !== JSON.stringify([defaultComponent])) {
            const adaptedComponents = adaptComponents();
            adaptProduct([], adaptedComponents);
            console.log(adaptedComponents);
        } else
            adaptProduct();
    };

    const adaptProduct = (variations = [], components = []) => {
        const {image, stock,...noImgProduct} = product;
        let productToWrite = {
            ...noImgProduct,
            // stock: variations === null ? stock : null,
            stock: type === "simple" ? stock : null,
            userGroups: type === "mixed" ? null : product.userGroups.map(group => group.value), 
            tax: product.tax['@id'],
            categories: product.categories.map(category => categories.find(element => element.id === category.value)['@id']),
            stockManaged: type === "mixed" ? null : noImgProduct.stockManaged,
            unit: type === "mixed" ? "U" : noImgProduct.unit,
            fullDescription: type === "mixed" ? createDescription() : noImgProduct.fullDescription,
            weight: type === "mixed" ? getTotalWeight() : noImgProduct.weight.length <= 0 ? noImgProduct.weight : 1,
            variations,
            components
        };
        console.log(productToWrite);
        if (image && !image.filePath) {
            ProductActions.createImage(product.image)
                          .then(image => writeProduct({...productToWrite, image}));
        } else {
            writeProduct(productToWrite);
        }
    }

    const adaptComponents = () => {
        return components.map(component => {
            const { count, variation, size, ...mainVarComponent} = component;
            const minComponent = {...mainVarComponent, product: mainVarComponent.product['@id'], quantity: parseFloat(mainVarComponent.quantity) };
            return variation === null ? minComponent : {...minComponent, variation: variation['@id'], size: size['@id']};
        });
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

    const writeVariations = async () => {
        const savedVariations = await Promise.all(variations.map( async variation => {
            const {image, ...noImgVar} = variation;
            const suitedVariation = {
                ...noImgVar,
                color: variation.name,
                sizes: variation.sizes.map(size => {
                    return {
                        ...size,
                        name: size.name,
                        stock: {
                            ...size.stock,
                            quantity: size.stock !== undefined && size.stock !== null && size.stock.quantity ? size.stock.quantity : 0,
                            alert: parseFloat(product.stock.alert), 
                            security: parseFloat(product.stock.security)
                        }
                    }
                })
            };
            if (image && !image.filePath) {
                const savedImage = await ProductActions.createImage(image);
                return await suitedVariation['@id'] ? 
                    ProductActions.updateVariation(suitedVariation.id, {...suitedVariation, image: savedImage}) :
                    ProductActions.createVariation({...suitedVariation, image: savedImage});
            } else
                return await suitedVariation['@id'] ? 
                    ProductActions.updateVariation(suitedVariation.id, suitedVariation) :
                    ProductActions.createVariation(suitedVariation);
        }));
        return savedVariations;
    };

    const createDescription = () => {
        let description = '"' + product.name + '" est composé de : ';
        components.map((component, index) => {
            let separator = index < components.length - 1 ? (index === components.length - 2 ? ' et ' : ', ') : '.';
            description += component.product.name + ' (' + (component.product.unit === 'Kg' ? '~ ' : '') + component.quantity + ' ' + component.product.unit + ')' + separator;
        });
        return description + ' Composition d\'environ ' + getTotalWeight() + ' Kg.';
    };

    const getTotalWeight = () => {
        let totalWeight = 0;
        components.map((component) => {
            let unitWeight = component.product.weight === null || component.product.weight === undefined ? 1 : component.product.weight;
            totalWeight += unitWeight * component.quantity;
        });
        return totalWeight;
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
                                    <CLabel htmlFor="custom-file-input" variant="custom-file">{product.image === null || product.image === undefined ? "Choose file..." : product.image.filePath !== undefined ? product.image.filePath : product.image.name }</CLabel>
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
                                    <CTextarea name="fullDescription" id="fullDescription" rows="9" placeholder="Content..." onChange={ handleChange } value={ product.fullDescription } disabled={type === "mixed"}/>
                                </CCol>
                            </CFormGroup>
                            <CFormGroup row className="ml-1 mt-0 mb-4">
                                <CLabel>Type de produit</CLabel>
                            </CFormGroup>
                            <CFormGroup row>
                                <CCol md="1">{""}</CCol>
                                <CCol xs="12" md="4">
                                    <CFormGroup variant="custom-radio" inline className="d-flex align-items-center">
                                        <CInputRadio custom id="inline-radio1" name="inline-radios" value="simple" checked={type === "simple"} onClick={handleProductTypeChange}/>
                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio1">Simple</CLabel>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" md="4">
                                    <CFormGroup variant="custom-radio" inline className="d-flex align-items-center">
                                        <CInputRadio custom id="inline-radio2" name="inline-radios" value="with-variations" checked={type === "with-variations"} onClick={handleProductTypeChange}/>
                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio2">Variant</CLabel>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" md="3">
                                    <CFormGroup variant="custom-radio" inline className="d-flex align-items-center">
                                        <CInputRadio custom id="inline-radio3" name="inline-radios" value="mixed" checked={type === "mixed"} onClick={handleProductTypeChange}/>
                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio3">Composé</CLabel>
                                    </CFormGroup>
                                </CCol>
                            </CFormGroup>
                            { type === "with-variations" && (
                                <>
                                    { variations.map((variation, index) => {
                                        return (
                                            <>
                                                <CRow className="text-center mt-4">
                                                    <CCol md="1">{""}</CCol>
                                                    <CCol md="10"><hr/></CCol>
                                                </CRow>
                                                <CRow>
                                                    <CCol md="1">{""}</CCol>
                                                    <CCol md="10">
                                                        <Variation key={ index } variation={ variation } handleOptionAdd={ handleOptionAdd } handleOptionDelete={ handleOptionDelete } handleVariantDelete={ handleVariantDelete } handleChange={ handleVariationChange } total={ variations.length } index={ index }/>
                                                    </CCol>
                                                </CRow>
                                            </>
                                        );
                                    })}
                                    <CRow className="text-center mt-4">
                                        <CCol md="1">{""}</CCol>
                                        <CCol md="10"><hr/></CCol>
                                    </CRow>
                                    <CRow className="mt-3 d-flex justify-content-center">
                                        <CButton size="sm" color="info" onClick={ handleVariationAdd }><CIcon name="cil-plus"/> Ajouter une variante</CButton>
                                    </CRow>
                                </>
                            )}
                            { type === "mixed" &&
                                <>
                                    { components.map((component, index) => {
                                        return(
                                            <>
                                                <CRow className="text-center mt-4">
                                                    <CCol md="1">{""}</CCol>
                                                    <CCol md="10"><hr/></CCol>
                                                </CRow>
                                                <CRow>
                                                    <CCol md="1">{""}</CCol>
                                                    <CCol md="10">
                                                        <Component component={ component } handleChange={ handleComponentChange } handleDelete={ handleComponentDelete } total={ components.length } index={ index }/>
                                                    </CCol>
                                                </CRow>
                                            </>
                                        );
                                    })}
                                    <CRow className="text-center mt-4">
                                        <CCol md="1">{""}</CCol>
                                        <CCol md="10"><hr/></CCol>
                                    </CRow>
                                    <CRow className="mt-3 d-flex justify-content-center">
                                        <CButton size="sm" color="info" onClick={ handleComponentAdd }><CIcon name="cil-plus"/> Ajouter un produit</CButton>
                                    </CRow>
                                </>
                            }
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
                                            value={ product.prices.find(price => price.name === "PRO_GC").price }
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
                                            value={ product.prices.find(price => price.name === "PRO_VIP").price }
                                            onChange={ handlePriceChange } 
                                            placeholder="Prix de base HT"
                                        />
                                    </CCol>
                                </CFormGroup>
                            }
                            { type !== "mixed" &&
                                <>
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
                                </>
                            }
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