import React, { useEffect, useState } from 'react';
import GroupActions from '../../../services/GroupActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';

const Groups = (props) => {

    const itemsPerPage = 15;
    const fields = ['label', ' '];
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        GroupActions.findAll()
            .then(response => {
              console.log(response);
              setGroups(response);
            })
            .catch(error => console.log(error.response));
    }, []);

    const handleDelete = (id) => {
        const originalGroups = [...groups];
        setGroups(groups.filter(group => group.id !== id));
        console.log("Supprimé");
        // GroupActions.delete(id)
        //                .catch(error => {
        //                     setGroups(originalGroups);
        //                     console.log(error.response);
        //                });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des groupes d'utilisateurs
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/groups/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ groups }
              fields={ fields }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
              scopedSlots = {{
                'label':
                  item => <td><Link to={ "/components/groups/" + item.id }>{ item.label }</Link></td>
                ,
                ' ':
                  item =><td><CButton block color="danger" disabled={ item.isFixed  } onClick={ () => handleDelete(item.id) }>Supprimer</CButton></td>
              }}
            />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Groups;