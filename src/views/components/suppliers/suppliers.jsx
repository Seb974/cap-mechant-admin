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
    const fields = ['name', ' '];
    const { currentUser } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(Roles.hasAdminPrivileges(currentUser));
    const [suppliers, setSuppliers] = useState([]);
    const [importLoading, setImportLoading] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const successMessage = "Les fournisseurs ont bien été importés.";
    const failMessage = "Un problème est survenu lors de l'importation des fournisseurs.";
    const failLoadingMessage = "Un problème est survenu lors du chargement des données. Vérifiez l'état de votre connexion.\n";
    const successToast = { position: 'top-right', autohide: 3000, closeButton: true, fade: true, color: 'success', messsage: successMessage, title: 'Succès' };
    const failToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'warning', messsage: failMessage, title: 'Importation inachevée' };
    const failLoadingToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'warning', messsage: failLoadingMessage, title: 'Echec du chargement' };

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    useEffect(() => getDisplayedSuppliers(), []);
    useEffect(() => getDisplayedSuppliers(), [search]);
    useEffect(() => getDisplayedSuppliers(currentPage), [currentPage]);

    const getDisplayedSuppliers = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedSuppliers(search, page) : await getSuppliers(page);
        if (isDefined(response)) {
            console.log(response['hydra:member']);
            console.log(response['hydra:totalItems']);
            setSuppliers(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getSuppliers = (page = 1) => page >=1 ? fetchPaginatedSuppliers(page) : undefined;
    const getSearchedSuppliers = (word, page = 1) => fetchSuppliersContainingWord(word, page);

    const fetchPaginatedSuppliers = (page) => {
      return SupplierActions
                .findAllPaginated(page, itemsPerPage)
                .catch(error => addToast(failLoadingToast));
    };

    const fetchSuppliersContainingWord = (word, page) => {
        return SupplierActions
                  .findWord(word, page, itemsPerPage)
                  .catch(error => addToast(failLoadingToast));
    };

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
                      {/* <CCol xs="6" md="3">
                          <Link role="button" to="/components/suppliers/new" block variant="outline" color="warning">
                              <CButton block variant="outline" color="warning">CRÉER</CButton>
                          </Link>
                      </CCol> */}
                      <CCol xs="12" md="6">
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
              items={ suppliers.sort((a, b) => (a.name > b.name) ? 1 : -1) }
              fields={ fields }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination={{
                'pages': Math.ceil(totalItems / itemsPerPage),
                'activePage': currentPage,
                'onActivePageChange': page => setCurrentPage(page),
                'align': 'center',
                'dots': true,
                'className': Math.ceil(totalItems / itemsPerPage) > 1 ? "d-block" : "d-none"
              }}
              tableFilter
              onTableFilterChange={ word => setSearch(word) }
              scopedSlots = {{
                'name':
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