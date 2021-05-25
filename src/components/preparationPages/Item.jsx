import React, { useContext, useEffect, useState } from 'react';
import { CButton, CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CRow, CSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import ProductsContext from 'src/contexts/ProductsContext';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';

const Item = ({ product, item, handleChange, handleDelete, total, index }) => {

    const { products } = useContext(ProductsContext);
    const [variants, setVariants] = useState([]);
    const { settings } = useContext(AuthContext);
    const [price, setPrice] = useState(0);

    useEffect(() => getPrice(), []);
    useEffect(() => getPrice(), [settings]);

    const onChange = ({ currentTarget }) => {
        handleChange({...item, [currentTarget.id]: currentTarget.value});
    };

    const onProductChange = ({ currentTarget }) => {
        const selection = products.find(product => parseInt(product.id) === parseInt(currentTarget.value));
        const newVariants = isDefined(selection.variations) ? selection.variations : null;
        const selectedVariant = isDefinedAndNotVoid(newVariants) ? newVariants[0] : null;
        const selectedSize = isDefined(selectedVariant) && isDefinedAndNotVoid(selectedVariant.sizes) ? selectedVariant.sizes[0] : null;
        handleChange({...item, product: selection, variation: selectedVariant, size: selectedSize, price: getProductPrice(selection)});
        setVariants(isDefined(selection.variations) ? selection.variations : null);
    };

    const onVariantChange = ({ currentTarget }) => {
        const ids = currentTarget.value.split("-");
        const selectedVariant = item.product.variations.find(variation => variation.id === parseInt(ids[0]));
        const selectedSize = selectedVariant.sizes.find(size => size.id === parseInt(ids[1]));
        handleChange({...item, variation: selectedVariant, size: selectedSize});
    };

    const getPrice = () => {
        const productPrice = item.product.prices.find(price => price.priceGroup.id === settings.priceGroup.id).amount;
        onChange({currentTarget: {id: "price", value: productPrice}});
    }

    const getProductPrice = product => {
        return product.prices.find(price => price.priceGroup.id === settings.priceGroup.id).amount;
    };

    return !isDefined(item) || !isDefined(item.product) ? <></> : (
        <CRow>
            <CCol xs="12" sm="4">
                <CFormGroup>
                    <CLabel htmlFor="name">{"Produit " + (total > 1 ? index + 1 : "")}
                    </CLabel>
                    <CSelect custom id="product" value={ item.product.id } onChange={ onProductChange }>
                        { products.map(product => <option key={ product.id } value={ product.id }>{ product.name }</option>)}
                    </CSelect>
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="4">
                <CFormGroup>
                    <CLabel htmlFor="name">{"Variante"}
                    </CLabel>
                    <CSelect custom name="variant" id="variant" disabled={ !variants || variants.length <= 0 } onChange={ onVariantChange } value={ isDefined(item.variation) && isDefined(item.size) ? item.variation.id + "-" + item.size.id : "0"}>
                        { !isDefinedAndNotVoid(variants) ? <option key="0" value="0">-</option> : 
                          variants.map((variant, index) => {
                                return variant.sizes.map((size, i) => <option key={ (index + "" + i) } value={variant.id + "-" + size.id}>{variant.color + " - " + size.name}</option>);
                            })
                        }
                    </CSelect>
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="4">
                <CFormGroup>
                    <CLabel htmlFor="name">Prix
                    </CLabel>
                    <CInputGroup>
                        <CInput
                            id="price"
                            type="number"
                            name={ item.count }
                            value={ item.price }
                            onChange={ onChange }
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>€</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="4">
                <CFormGroup>
                    <CLabel htmlFor="name">Quantité
                    </CLabel>
                    <CInputGroup>
                        <CInput
                            id="orderedQty"
                            type="number"
                            name={ item.count }
                            value={ item.orderedQty }
                            onChange={ onChange }
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>{ item.product.unit }</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CFormGroup>
            </CCol>
            { total > 1 && 
                <CCol xs="12" sm="1" className="d-flex align-items-center justify-content-start mt-2">
                    <CButton 
                        name={ item.count }
                        size="sm" 
                        color="danger" 
                        onClick={ handleDelete }
                    >
                        <CIcon name="cil-trash"/>
                    </CButton>
                </CCol>
            }
        </CRow>
    );
}
 
export default Item;