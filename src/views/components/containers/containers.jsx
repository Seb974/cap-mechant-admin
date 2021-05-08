import React, { useEffect, useState } from 'react';
import ContainerActions from '../../../services/ContainerActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';

const Containers = (props) => {

    const itemsPerPage = 15;
    const fields = ['name', ' '];
    const [containers, setContainers] = useState([]);

    useEffect(() => {
        ContainerActions.findAll()
            .then(response => {
              console.log(response);
              setContainers(response);
            })
            .catch(error => console.log(error.response));
    }, []);

    const handleDelete = (id) => {
        const originalContainers = [...containers];
        setContainers(containers.filter(container => container.id !== id));
        ContainerActions.delete(id)
                       .catch(error => {
                            setContainers(originalContainers);
                            console.log(error.response);
                       });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des colis
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/containers/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ containers }
              fields={ fields }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
              scopedSlots = {{
                'name':
                  item => <td><Link to={ "/components/containers/" + item.id }>{ item.name }</Link></td>
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
 
export default Containers;