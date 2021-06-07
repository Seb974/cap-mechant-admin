import React from 'react';
import { CCol, CFormGroup, CInputFile, CLabel } from '@coreui/react';

const Image = ({ product, setProduct }) => {

    const handleImageChange = ({ currentTarget }) => setProduct({...product, image: currentTarget.files[0]});

    return (
        <>
            <CFormGroup row className="ml-1 mt-4 mb-0">
                <CLabel>Image</CLabel>
            </CFormGroup>
            <CFormGroup row className="ml-1 mr-1 mt-0 mb-3">
                <CCol xs="12" md="12">
                    <CLabel>Image</CLabel>
                    <CInputFile name="image" custom id="custom-file-input" onChange={ handleImageChange }/>
                    <CLabel htmlFor="custom-file-input" variant="custom-file">
                        { product.image === null || product.image === undefined ?
                            "Choose file..." :
                            product.image.filePath !== undefined ? 
                                product.image.filePath :
                                product.image.name 
                        }
                    </CLabel>
                </CCol>
            </CFormGroup >
        </>
    );
}
 
export default Image;