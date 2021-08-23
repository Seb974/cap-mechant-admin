import React, { useContext, useEffect, useState } from 'react';
import { CButton, CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CRow, CSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import ProductsContext from 'src/contexts/ProductsContext';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import Select from '../forms/Select';
import Roles from 'src/config/Roles';

const Good = ({ provision, good, handleChange, handleDelete, total, index, editing, availableProducts }) => {

    const [isAdmin, setIsAdmin] = useState(false);
    const { products } = useContext(ProductsContext);
    // const [variants, setVariants] = useState([]);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        getUnit();
        // if (isDefined(good.product.variations))
        //     setVariants(good.product.variations);
    }, []);

    const onChange = ({ currentTarget }) => handleChange({...good, [currentTarget.id]: currentTarget.value});

    const onProductChange = ({ currentTarget }) => {
        const selection = products.find(product => parseInt(product.id) === parseInt(currentTarget.value));
        // const newVariants = isDefined(selection.variations) ? selection.variations : null;
        // const selectedVariant = isDefinedAndNotVoid(newVariants) ? newVariants[0] : null;
        // const selectedSize = isDefined(selectedVariant) && isDefinedAndNotVoid(selectedVariant.sizes) ? selectedVariant.sizes[0] : null;
        handleChange({...good, product: selection,  unit: selection.unit});
        // setVariants(isDefined(selection.variations) ? selection.variations : null);
    };

    // const onVariantChange = ({ currentTarget }) => {
    //     const ids = currentTarget.value.split("-");
    //     const selectedVariant = good.product.variations.find(variation => variation.id === parseInt(ids[0]));
    //     const selectedSize = selectedVariant.sizes.find(size => size.id === parseInt(ids[1]));
    //     handleChange({...good, variation: selectedVariant, size: selectedSize});
    // };

    const getUnit = () => onChange({currentTarget: {id: "unit", value: good.product.unit}});

    // const getVariantName = (variantName, sizeName) => {
    //     const isVariantEmpty = variantName.length === 0 || variantName.replace(" ","").length === 0;
    //     const isSizeEmpty = sizeName.length === 0 || sizeName.replace(" ","").length === 0;
    //     return isVariantEmpty ? sizeName : isSizeEmpty ? variantName : variantName + " - " + sizeName;
    // };

    return !isDefined(good) || !isDefined(good.product) ? <></> : (
        <>
        <CRow>
            <CCol xs="12" md={ isAdmin ? "4" : "4"}>
                <CFormGroup>
                    <CLabel htmlFor="name">{"Produit " + (total > 1 ? index + 1 : "")}
                    </CLabel>
                    <CSelect custom id="product" value={ good.product.id } onChange={ onProductChange }>
                        { availableProducts.map(product => <option key={ product.id } value={ product.id }>{ product.name }</option>) }
                    </CSelect>
                </CFormGroup>
            </CCol>
            <CCol xs="12" md={ isAdmin ? "4" : "2"}>
                <CFormGroup>
                    <CLabel htmlFor="name">Commandé
                    </CLabel>
                    <CInputGroup>
                        <CInput
                            id="quantity"
                            type="number"
                            name={ good.count }
                            value={ good.quantity }
                            onChange={ onChange }
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>{ good.unit }</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CFormGroup>
            </CCol>
            <CCol xs="12" md={ isAdmin ? "4" : "2"}>
                { provision.status === "RECEIVED" ? 
                    <CFormGroup>
                        <CLabel htmlFor="name">Reçue</CLabel>
                        <CInputGroup>
                            <CInput
                                id="received"
                                type="number"
                                name={ good.count }
                                value={ good.received }
                                onChange={ onChange }
                                disabled={ provision.status !== "RECEIVED" }
                            />
                            <CInputGroupAppend>
                                <CInputGroupText>{ good.unit }</CInputGroupText>
                            </CInputGroupAppend>
                        </CInputGroup>
                    </CFormGroup>
                :
                    <CFormGroup>
                        <CLabel htmlFor="name">Stock</CLabel>
                        <CInputGroup>
                            <CInput
                                id="stock"
                                type="number"
                                name={ good.count }
                                value={ good.stock }
                                onChange={ onChange }
                                disabled={ provision.status === "RECEIVED" }
                            />
                            <CInputGroupAppend>
                                <CInputGroupText>{ good.unit }</CInputGroupText>
                            </CInputGroupAppend>
                        </CInputGroup>
                    </CFormGroup>
                }
            </CCol>
            <CCol xs="12" md={isAdmin ? "3" : "2"}>
                <Select name={ good.count } id="unit" value={ good.unit } label="Unité" onChange={ onChange }>
                    <option value="U">U</option>
                    <option value="Kg">Kg</option>
                </Select>
            </CCol>
            <CCol xs="12" md="1" className="d-flex align-items-center justify-content-end mt-2">
                <CButton 
                    name={ good.count }
                    size="sm" 
                    color="danger" 
                    onClick={ handleDelete }
                    disabled={ total <= 1 }
                >
                    <CIcon name="cil-trash"/>
                </CButton>
            </CCol>
        </CRow>
        </>
    );
}
 
export default Good;