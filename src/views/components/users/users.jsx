import React, { useContext, useEffect, useState } from 'react'
import UserActions from '../../../services/UserActions'
import Roles from '../../../config/Roles'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import { Spinner } from 'react-bootstrap';

const Users = (props) => {

    const itemsPerPage = 15;
    const { currentUser } = useContext(AuthContext);
    const fields = ['name', 'email', 'roles', ' '];
    const [users, setUsers] = useState([]);
    const [importLoading, setImportLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(Roles.hasAdminPrivileges(currentUser));

    const getBadge = role => {
      const name = role.toUpperCase();
      return name.includes('ADMIN') ? 'danger' :
             name.includes('VIP') ? 'warning' :
             name.includes('USER') ? 'secondary' : 'success';
    }

    useEffect(() => fetchUsers(), []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    const fetchUsers = () => {
        UserActions.findAll()
          .then(response => {
              const newUsers = !isAdmin ? response.filter(u => !Roles.hasAdminPrivileges({...u, roles: Roles.filterRoles(u.roles)})) : response;
              setUsers(newUsers);
          })
          .catch(error => console.log(error.response));
    };

    const handleDelete = (id) => {
      const originalUsers = [...users];
      setUsers(users.filter(user => user.id !== id));
      UserActions.delete(id)
                 .catch(error => {
                      setUsers(originalUsers);
                      console.log(error.response);
                 });
  };

  const handleImport = () => {
    setImportLoading(true)
    UserActions
        .import()
        .then(response => setImportLoading(false))
        .catch(error => {
            setImportLoading(false);
            console.log(error);
        });
  };

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
              Liste des utilisateurs
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <CButton block variant="outline" color="success" onClick={ handleImport }>
                      { importLoading ? 
                          <Spinner as="span" animation="border" size="sm"role="status"/>
                        :
                        <span>IMPORTER</span>
                      }
                    </CButton>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ users }
              fields={ isAdmin ? fields : fields.filter(f => f !== 'roles' && f !== ' ') }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
              scopedSlots = {{
                'name':
                  item => <td><Link to={"/components/users/" + item.id}>{ item.name }</Link></td>
                ,
                'roles':
                  item => (
                    <td>
                        <CBadge color={ getBadge(Roles.filterRoles(item.roles)) }>
                            { (Roles.filterRoles(item.roles)).substring(5).replace('_', ' ',) }
                        </CBadge>
                    </td>
                ),
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
 
export default Users;