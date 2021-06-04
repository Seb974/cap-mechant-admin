import React, { useContext } from 'react';
import { CCard, CCardBody, CCardFooter, CCardHeader, CCol, CRow } from '@coreui/react';
import TouringLocation from 'src/components/map/touring/touringLocation';
import DeliveryContext from 'src/contexts/DeliveryContext';
import { Link } from 'react-router-dom';

const MapVisualization = (props) => {
    
    const { tourings } = useContext(DeliveryContext);

    return (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader>
                        Tournées en cours : { tourings.length > 0 ? tourings.length : "Aucune" }
                    </CCardHeader>
                    <CCardBody>
                        <CRow>
                            <TouringLocation/>
                        </CRow>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/tourings" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default MapVisualization;