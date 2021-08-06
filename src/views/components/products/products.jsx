import React, { useContext, useEffect, useState } from 'react';
import ProductsContext from '../../../contexts/ProductsContext'
import ProductActions from '../../../services/ProductActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';

const Products = (props) => {

    const itemsPerPage = 15;
    const fields = ['name', ' '];
    const { currentUser } = useContext(AuthContext);
    const { products, setProducts } = useContext(ProductsContext);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

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
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des produits
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/products/new" block variant="outline" color="success">CRÉER</Link>
                    {/* <CButton block variant="outline" color="success">CRÉER</CButton> */}
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

      </CRow>
    );
}
 
export default Products;