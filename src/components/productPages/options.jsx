import React from 'react';
import { CCol, CFormGroup, CSwitch } from '@coreui/react';

const Options = ({ product, setProduct }) => {

    const handleCheckBoxes = ({ currentTarget }) => setProduct({...product, [currentTarget.name]: !product[currentTarget.name]});

    return (
        <>
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
                            <CSwitch name="requireLegalAge" className="mr-1" color="danger" shape="pill" checked={ product.requireLegalAge } onChange={ handleCheckBoxes }/>
                        </CCol>
                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                            Interdit aux -18ans
                        </CCol>
                    </CFormGroup>
                </CCol>
            </CFormGroup>
        </>
    );
}
 
export default Options;