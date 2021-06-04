import React from 'react';
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';
import TouringLocation from 'src/components/map/touring/touringLocation';

const MapVisualization = (props) => {
    return (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader>
                        Tournées en cours
                    </CCardHeader>
                    <CCardBody>
                        <CRow>
                            <TouringLocation/>
                        </CRow>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default MapVisualization;