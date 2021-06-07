import React from 'react';
import { CButton, CCol, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import Component from './component';

const Components = ({ product, components, setComponents, defaultComponent }) => {

    const handleComponentAdd = () => {
        setComponents([
            ...components, 
            {...defaultComponent, count: components[components.length -1].count + 1}
        ])
    };

    const handleComponentChange = component => {
        const filteredComponents = components.filter(option => parseInt(option.count) !== parseInt(component.count));
        setComponents([...filteredComponents, component].sort((a, b) => (a.count > b.count) ? 1 : -1));
    };

    const handleComponentDelete = ({currentTarget}) => {
        const component = components.find(option => parseInt(option.count) === parseInt(currentTarget.name));
        setComponents(components.filter(element => parseInt(element.count) !== parseInt(component.count)));
    };

    return (
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
                                <Component
                                    product={product}
                                    component={ component } 
                                    handleChange={ handleComponentChange } 
                                    handleDelete={ handleComponentDelete } 
                                    total={ components.length } 
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
                <CButton size="sm" color="info" onClick={ handleComponentAdd }><CIcon name="cil-plus"/> Ajouter un produit</CButton>
            </CRow>
        </>
    );
}
 
export default Components;