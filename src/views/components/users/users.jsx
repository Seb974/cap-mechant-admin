import React, { useEffect, useState } from 'react'
import UserActions from '../../../services/UserActions'
import Roles from '../../../config/Roles'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { Link } from 'react-router-dom';

const Users = (props) => {

    const itemsPerPage = 15;
    const fields = ['name', 'email', 'roles', ' '];
    const [users, setUsers] = useState([]);

    const getBadge = role => {
      const name = role.toUpperCase();
      return name.includes('ADMIN') ? 'danger' :
             name.includes('VIP') ? 'warning' :
             name.includes('USER') ? 'secondary' : 'success';
    }

    useEffect(() => {
        UserActions.findAll()
                   .then(response => setUsers(response))
                   .catch(error => console.log(error.response));
    }, []);

    const handleDelete = (id) => {
      const originalUsers = [...users];
      setUsers(users.filter(user => user.id !== id));
      UserActions.delete(id)
                 .catch(error => {
                      setUsers(originalUsers);
                      console.log(error.response);
                 });
  }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
              Liste des utilisateurs
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ users }
              fields={ fields }
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