import React, { useContext, useEffect, useState } from 'react'
import UserActions from '../../../services/UserActions'
import Roles from '../../../config/Roles'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CToaster, CToast, CToastHeader, CToastBody } from '@coreui/react';
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
    const [toasts, setToasts] = useState([]);
    const successMessage = "Les utilisateurs ont bien été importés.";
    const failMessage = "Un problème est survenu lors de l'importation des utilisateurs.";
    const successToast = { position: 'top-right', autohide: 3000, closeButton: true, fade: true, color: 'success', messsage: successMessage, title: 'Succès' };
    const failToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'warning', messsage: failMessage, title: 'Importation inachevée' };

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
        .then(response => {
          setImportLoading(false);
          addToast(successToast);
        })
        .catch(error => {
            setImportLoading(false);
            addToast(failToast);
            console.log(error);
        });
  };

  const addToast = newToast => setToasts([...toasts, newToast]);

  const toasters = (()=>{
      return toasts.reduce((toasters, toast) => {
        toasters[toast.position] = toasters[toast.position] || []
        toasters[toast.position].push(toast)
        return toasters
      }, {})
  })();

  return (
      <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
              <CRow>
                  <CCol xs="12" md="6">
                      Liste des utilisateurs
                  </CCol>
                  <CCol xs="6" md="3">
                      <Link role="button" to="/components/users/new" block variant="outline" color="success">
                          <CButton block variant="outline" color="warning">CRÉER</CButton>
                      </Link>
                  </CCol>
                  <CCol xs="6" md="3">
                      <CButton block variant="outline" color="success" onClick={ handleImport }>
                        { importLoading ? 
                            <Spinner as="span" animation="border" size="sm"role="status"/>
                          :
                          <span>IMPORTER</span>
                        }
                      </CButton>
                  </CCol>
              </CRow>
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

        <CCol sm="12" lg="6">
              {Object.keys(toasters).map((toasterKey) => (
                <CToaster
                  position={toasterKey}
                  key={'toaster' + toasterKey}
                >
                  {
                    toasters[toasterKey].map((toast, key)=>{
                    return(
                      <CToast
                        key={ 'toast' + key }
                        show={ true }
                        autohide={ toast.autohide }
                        fade={ toast.fade }
                        color={ toast.color }
                        style={{ color: 'white' }}
                      >
                        <CToastHeader closeButton={ toast.closeButton }>
                            { toast.title }
                        </CToastHeader>
                        <CToastBody style={{ backgroundColor: 'white', color: "black" }}>
                            { toast.messsage }
                        </CToastBody>
                      </CToast>
                    )
                  })
                  }
                </CToaster>
              ))}
        </CCol>

      </CRow>
    );
}
 
export default Users;