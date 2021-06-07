import React from 'react';
import { CButton, CCol, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import Variation from './variation';

const Variations = ({ variations, setVariations, defaultSize, defaultVariation }) => {
    
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

    const handleVariantDelete = ({currentTarget}) => {
        const variation = variations.find(option => parseInt(option.count) === parseInt(currentTarget.name));
        setVariations(variations.filter(element => parseInt(element.count) !== parseInt(variation.count)));
    };

    const handleVariationChange = variation => {
        const filteredVariations = variations.filter(option => parseInt(option.count) !== parseInt(variation.count));
        setVariations([...filteredVariations, variation].sort((a, b) => (a.count > b.count) ? 1 : -1));
    };

    const handleVariationAdd = () => setVariations([...variations, {...defaultVariation, count: variations[variations.length -1].count + 1}]);

    return (
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
                                <Variation
                                    key={ index } 
                                    variation={ variation } 
                                    handleOptionAdd={ handleOptionAdd } 
                                    handleOptionDelete={ handleOptionDelete } 
                                    handleVariantDelete={ handleVariantDelete } 
                                    handleChange={ handleVariationChange } 
                                    total={ variations.length } 
                                    index={ index }
                                />
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
    );
}

export default Variations;