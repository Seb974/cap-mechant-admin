import React, { useContext, useEffect, useState } from 'react';
import SupplierActions from '../../../services/SupplierActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CToaster, CToast, CToastHeader, CToastBody } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';
import Roles from 'src/config/Roles';
import AuthContext from 'src/contexts/AuthContext';
import { Spinner } from 'react-bootstrap';

const Suppliers = (props) => {

    const itemsPerPage = 15;
    const fields = ['Vendeur', 'Nom', ' '];
    const { currentUser } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(Roles.hasAdminPrivileges(currentUser));
    const [suppliers, setSuppliers] = useState([]);
    const [importLoading, setImportLoading] = useState(false);
    const [toasts, setToasts] = useState([]);
    const successMessage = "Les fournisseurs ont bien été importés.";
    const failMessage = "Un problème est survenu lors de l'importation des fournisseurs.";
    const successToast = { position: 'top-right', autohide: 3000, closeButton: true, fade: true, color: 'success', messsage: successMessage, title: 'Succès' };
    const failToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'warning', messsage: failMessage, title: 'Importation inachevée' };

    useEffect(() => {
        SupplierActions.findAll()
            .then(response => setSuppliers(response))
            .catch(error => console.log(error.response));
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    const handleDelete = (id) => {
        const originalSuppliers = [...suppliers];
        setSuppliers(suppliers.filter(supplier => supplier.id !== id));
        SupplierActions.delete(id)
                       .catch(error => {
                            setSuppliers(originalSuppliers);
                            console.log(error.response);
                       });
    };

    const handleImport = () => {
      setImportLoading(true)
      SupplierActions
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
                          Liste des fournisseurs
                      </CCol>
                      <CCol xs="6" md="3">
                          <Link role="button" to="/components/suppliers/new" block variant="outline" color="warning">
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
              items={ suppliers }
              fields={ isAdmin ? fields : fields.filter(f => f !== 'Vendeur' && f !== ' ') }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
              scopedSlots = {{
                'Vendeur':
                  item => <td>{ isDefined(item.seller) && isDefined(item.seller.name) ? item.seller.name : "-" }</td>
                ,
                'Nom':
                  item => <td><Link to={ "/components/suppliers/" + item.id }>{ item.name }</Link></td>
                ,
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
 
export default Suppliers;