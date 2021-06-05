import React, { useContext, useEffect, useState } from 'react';
import DelivererActions from '../../../services/DelivererActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';

const Deliverers = (props) => {

    const itemsPerPage = 15;
    const { currentUser } = useContext(AuthContext);
    const fields = ['name', 'totalToPay', ' '];
    const [deliverers, setDeliverers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), []);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        DelivererActions.findAll()
            .then(response => {
                console.log(response);
                setDeliverers(response);
            })
            .catch(error => console.log(error));
    }, []);

    const handleDelete = (id) => {
        const originalDeliverers = [...deliverers];
        setDeliverers(deliverers.filter(deliverer => deliverer.id !== id));
        DelivererActions
            .delete(id)
            .catch(error => {
                setDeliverers(originalDeliverers);
                console.log(error.response);
            });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des vendeurs
                { isAdmin &&
                  <CCol col="6" sm="4" md="2" className="ml-auto">
                      <Link role="button" to="/components/deliverers/new" block variant="outline" color="success">CRÉER</Link>
                  </CCol>
                }
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ deliverers }
              fields={ fields }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
              scopedSlots = {{
                'name':
                  item => <td><Link to={ "/components/deliverers/" + item.id }>{ item.name }</Link></td>
                ,
                ' ':
                  item =><td><CButton block color="danger" disabled={ !isAdmin } onClick={ () => handleDelete(item.id) }>Supprimer</CButton></td>
              }}
            />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Deliverers;