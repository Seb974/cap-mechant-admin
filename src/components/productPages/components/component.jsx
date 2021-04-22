import React, { useContext, useEffect, useState } from 'react';
import { CButton, CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CRow, CSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import ProductsContext from 'src/contexts/ProductsContext';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';

const Component = ({ product, component, handleChange, handleDelete, total, index }) => {

    const { products } = useContext(ProductsContext);
    const [variants, setVariants] = useState([]);

    useEffect(() => {
        if ( isDefined(product.variations) )
            setVariants(component.product.variations);
    }, []);

    const onChange = ({ currentTarget }) => {
        handleChange({...component, [currentTarget.id]: currentTarget.value});
    };

    const onProductChange = ({ currentTarget }) => {
        const selection = products.find(product => parseInt(product.id) === parseInt(currentTarget.value));
        const newVariants = isDefined(selection.variations) ? selection.variations : null;
        const selectedVariant = isDefinedAndNotVoid(newVariants) ? newVariants[0] : null;
        const selectedSize = isDefined(selectedVariant) && isDefinedAndNotVoid(selectedVariant.sizes) ? selectedVariant.sizes[0] : null;
        handleChange({...component, product: selection, variation: selectedVariant, size: selectedSize});
        setVariants(isDefined(selection.variations) ? selection.variations : null);
    };

    const onVariantChange = ({ currentTarget }) => {
        const ids = currentTarget.value.split("-");
        const selectedVariant = component.product.variations.find(variation => variation.id === parseInt(ids[0]));
        const selectedSize = selectedVariant.sizes.find(size => size.id === parseInt(ids[1]));
        handleChange({...component, variation: selectedVariant, size: selectedSize});
    };

    return (
        <CRow>
            <CCol xs="12" sm="4">
                <CFormGroup>
                    <CLabel htmlFor="name">{"Produit " + (total > 1 ? index + 1 : "")}
                    </CLabel>
                    <CSelect custom id="product" value={ component.product.id } onChange={ onProductChange }>
                        { products.map(product => <option key={ product.id } value={ product.id }>{ product.name }</option>)}
                    </CSelect>
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="4">
                <CFormGroup>
                    <CLabel htmlFor="name">{"Variante " + (total > 1 ? index + 1 : "")}
                    </CLabel>
                    <CSelect custom name="variant" id="variant" disabled={ !variants || variants.length <= 0 } onChange={ onVariantChange } value={ isDefined(component.variation) && isDefined(component.size) ? component.variation.id + "-" + component.size.id : "0"}>
                        { !isDefinedAndNotVoid(variants) ? <option key="0" value="0">-</option> : 
                          variants.map((variant, index) => {
                                return variant.sizes.map((size, i) => <option key={ (index + "" + i) } value={variant.id + "-" + size.id}>{variant.color + " " + size.name}</option>);
                            })
                        }
                    </CSelect>
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="2">
                <CFormGroup>
                    <CLabel htmlFor="name">Quantité
                    </CLabel>
                    <CInputGroup>
                        <CInput
                            id="quantity"
                            type="number"
                            name={ component.count }
                            value={ component.quantity }
                            onChange={ onChange }
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>{ component.product.unit }</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CFormGroup>
            </CCol>
            { total > 1 && 
                <CCol xs="12" sm="2" className="d-flex align-items-center justify-content-start mt-2">
                    <CButton 
                        name={ component.count }
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
 
export default Component;