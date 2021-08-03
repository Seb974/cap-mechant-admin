import React, { useEffect, useState } from 'react';
import ZoneActions from '../../../services/ZoneActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable';
import { Link } from 'react-router-dom';
import CityActions from 'src/services/CityActions';

const Zones = (props) => {

    const itemsPerPage = 15;
    const fields = ['name', ' '];
    const [zones, setZones] = useState([]);

    useEffect(() => {
        ZoneActions.findAll()
            .then(response => setZones(response))
            .catch(error => console.log(error.response));
    }, []);

    const handleDelete = (zoneToDelete) => {

        const originalZones = [...zones];
        setZones(zones.filter(zone => zone.id !== zoneToDelete.id));
        updateCities(zoneToDelete.cities)
            .then(response => {
                ZoneActions
                    .delete(zoneToDelete.id)
                    .catch(error => {
                        setZones(originalZones);
                        console.log(error.response);
                    });
            });
    }

    const updateCities = async (zoneCities) => {
        const orphanCities = await Promise.all(zoneCities.map( async city => {
            return await CityActions.update(city.id, {...city, zone: null});
        }));
        return orphanCities;
    };

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des zones
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/zones/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ zones }
              fields={ fields }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
              scopedSlots = {{
                'name':
                  item => <td><Link to={ "/components/zones/" + item.id }>{ item.name }</Link></td>
                ,
                ' ':
                  item => <td><CButton block color="danger" onClick={ () => handleDelete(item) }>Supprimer</CButton></td>
              }}
            />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Zones;