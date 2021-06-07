import React, { useEffect, useState } from 'react';
import RelaypointActions from '../../../services/RelaypointActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Relaypoints = (props) => {

    const itemsPerPage = 15;
    const fields = ['name', 'city', ' '];
    const [relaypoints, setRelaypoints] = useState([]);

    useEffect(() => {
        RelaypointActions.findAll()
            .then(response => {
                console.log(response);
                setRelaypoints(response);
            })
            .catch(error => console.log(error));
    }, []);

    const handleDelete = (id) => {
        const originalRelaypoints = [...relaypoints];
        setRelaypoints(relaypoints.filter(city => city.id !== id));
        RelaypointActions.delete(id)
                   .catch(error => {
                        setRelaypoints(originalRelaypoints);
                        console.log(error.response);
                   });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des points relais
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/relaypoints/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ relaypoints }
              fields={ fields }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
              scopedSlots = {{
                'name':
                  item => <td><Link to={ "/components/relaypoints/" + item.id }>{ item.name }</Link></td>
                ,
                'city':
                  item => <td>{ item.metas.city }</td>
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
 
export default Relaypoints;