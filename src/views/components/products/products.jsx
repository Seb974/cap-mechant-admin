import React, { useContext, useEffect, useState } from 'react';
import ProductsContext from '../../../contexts/ProductsContext'
import ProductActions from '../../../services/ProductActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CToaster, CToast, CToastHeader, CToastBody } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import { Spinner } from 'react-bootstrap';
import { isDefined } from 'src/helpers/utils';

const Products = (props) => {

    const itemsPerPage = 15;
    const fields = ['name', ' '];
    const { currentUser } = useContext(AuthContext);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [toasts, setToasts] = useState([]);

    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    const successMessage = "Les produits ont bien été importés.";
    const failMessage = "Un problème est survenu lors de l'importation des produits.";
    const failLoadingMessage = "Un problème est survenu lors du chargement des données. Vérifiez l'état de votre connexion.\n";
    const successToast = { position: 'top-right', autohide: 3000, closeButton: true, fade: true, color: 'success', messsage: successMessage, title: 'Succès' };
    const failToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'warning', messsage: failMessage, title: 'Importation inachevée' };
    const failLoadingToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'warning', messsage: failLoadingMessage, title: 'Echec du chargement' };

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), []);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => getDisplayedProducts(), []);

    useEffect(() => getDisplayedProducts(), [search]);
    useEffect(() => getDisplayedProducts(currentPage), [currentPage]);

    const getDisplayedProducts = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedProducts(search, page) : await getProducts(page);
        if (isDefined(response)) {
            setDisplayedProducts(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getProducts = (page = 1) => page >=1 ? fetchPaginatedProducts(page) : undefined;
    const getSearchedProducts = (word, page = 1) => fetchProductsContainingWord(word, page);

    const fetchPaginatedProducts = (page) => {
        return ProductActions
                  .findAllPaginated(page, itemsPerPage)
                  .catch(error => addToast(failLoadingToast));
    };

    const fetchProductsContainingWord = (word, page) => {
        return ProductActions
                  .findWord(word, page, itemsPerPage)
                  .catch(error => addToast(failLoadingToast));
    };

    const handleDelete = (id) => {
        const originalProducts = [...displayedProducts];
        setDisplayedProducts(displayedProducts.filter(product => product.id !== id));
        ProductActions.delete(id)
                      .catch(error => {
                           setDisplayedProducts(originalProducts);
                           console.log(error.response);
                      });
    };

    const handleImport = () => {
        setImportLoading(true)
        ProductActions
            .import()
            .then(response => {
              const newToast = response.data === 0 ? successToast : failToast;
              setImportLoading(false);
              addToast(newToast);
            })
            .catch(error => {
                setImportLoading(false);
                addToast(failToast);
                console.log(error);
            });
    }

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
                Liste des produits
                <CCol col="6" sm="12" md="6" className="ml-auto">
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
              items={ displayedProducts }
              fields={ isAdmin ? fields : fields.filter(f => f !== ' ') }
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
                  item => <td><Link to={ "/components/products/" + item.id }>{ item.name }</Link></td>
                ,
                ' ':
                  item => (
                      <td className="mb-3 mb-xl-0 text-center">
                          <CButton 
                              block 
                              color="danger" 
                              disabled={ !isAdmin && !Roles.isSeller(currentUser) }     // { !isAdmin && item.seller.users.find(user => user.id === currentUser.id) === undefined } 
                              onClick={ () => handleDelete(item.id) }
                          >
                              Supprimer
                          </CButton>
                      </td>
                  )
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
 
export default Products;