import React, { useContext, useEffect, useState } from 'react';
import ProductsContext from '../../../contexts/ProductsContext'
import ProductActions from '../../../services/ProductActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CToaster, CToast, CToastHeader, CToastBody } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import { Spinner } from 'react-bootstrap';

const Products = (props) => {

    const itemsPerPage = 15;
    const fields = ['name', ' '];
    const { currentUser } = useContext(AuthContext);
    const { products, setProducts } = useContext(ProductsContext);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [toasts, setToasts] = useState([]);
    const successMessage = "Les produits ont bien été importés.";
    const failMessage = "Un problème est survenu lors de l'importation des produits.";
    const successToast = { position: 'top-right', autohide: 3000, closeButton: true, fade: true, color: 'success', messsage: successMessage, title: 'Succès' };
    const failToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'warning', messsage: failMessage, title: 'Importation inachevée' };


    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), []);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        ProductActions
            .findAll()
            .then(response => {
                setDisplayedProducts(response);
                setProducts(response);
            })
            .catch(error => console.log(error.response));
    }, []);

    useEffect(() => {
        setDisplayedProducts(products);
    }, [products]);

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
              setImportLoading(false);
              addToast(successToast);
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
              items={ displayedProducts }
              fields={ isAdmin ? fields : fields.filter(f => f !== ' ') }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
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