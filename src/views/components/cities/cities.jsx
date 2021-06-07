import React, { useEffect, useState } from 'react';
import CityActions from '../../../services/CityActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Cities = (props) => {

    const itemsPerPage = 15;
    const fields = ['name', 'zipCode', ' '];
    const [cities, setCities] = useState([]);

    useEffect(() => {
        CityActions.findAll()
            .then(response => {
                console.log(response);
                setCities(response);
            })
            .catch(error => console.log(error));
    }, []);

    const handleDelete = (id) => {
        const originalCities = [...cities];
        setCities(cities.filter(city => city.id !== id));
        CityActions.delete(id)
                   .catch(error => {
                        setCities(originalCities);
                        console.log(error.response);
                   });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des villes desservies
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/cities/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ cities }
              fields={ fields }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
              scopedSlots = {{
                'name':
                  item => <td><Link to={ "/components/cities/" + item.id }>{ item.name }</Link></td>
                ,
                ' ':
                  item =><td><CButton block color="danger" onClick={ () => handleDelete(item.id) }>Supprimer</CButton></td>
              }}
            />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Cities;