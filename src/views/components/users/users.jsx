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
      switch (role) {
        case 'ROLE_PRO':
        case 'ROLE_CHR':
        case 'ROLE_GC':
        case 'ROLE_VIP': return 'success'
        case 'ROLE_USER_EXT':
        case 'ROLE_USER_EXT_VIP': return 'secondary'
        case 'ROLE_TEAM': return 'warning'
        case 'ROLE_ADMIN':
        case 'ROLE_SUPER_ADMIN': return 'danger'
        default: return 'secondary'
      }
    }

    useEffect(() => {
        UserActions.findAll()
                   .then(response => setUsers(response))
                   .catch(error => console.log(error.response));
    }, []);

    const handleDelete = (id) => {
      const originalUsers = [...users];
      setUsers(users.filter(user => user.id !== id));
      console.log("Supprimé");
      // UserActions.delete(id)
      //            .catch(error => {
      //                 setUsers(originalUsers);
      //                 console.log(error.response);
      //            });
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
                            { Roles.getRoleLabel(item.roles) }
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