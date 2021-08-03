import React, { useEffect, useState } from 'react';
import SupervisorActions from '../../../services/SupervisorActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';

const Supervisors = (props) => {

    const itemsPerPage = 15;
    const fields = ['supervisor', ' '];
    const [supervisors, setSupervisors] = useState([]);

    useEffect(() => {
        SupervisorActions.findAll()
            .then(response => setSupervisors(response))
            .catch(error => console.log(error.response));
    }, []);

    const handleDelete = (id) => {
        const originalSupervisors = [...supervisors];
        setSupervisors(supervisors.filter(supervisor => supervisor.id !== id));
        SupervisorActions.delete(id)
                       .catch(error => {
                            setSupervisors(originalSupervisors);
                            console.log(error.response);
                       });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des superviseurs
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/supervisors/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ supervisors }
              fields={ fields }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
              scopedSlots = {{
                'supervisor':
                  item => <td><Link to={ "/components/supervisors/" + item.id }>
                                  { item.supervisor.name }<br/>
                                  <small><i>{ item.supervisor.email }</i></small>
                              </Link>
                          </td>
                ,
                ' ':
                  item => <td><CButton block color="danger" onClick={ () => handleDelete(item.id) }>Supprimer</CButton></td>
              }}
            />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Supervisors;