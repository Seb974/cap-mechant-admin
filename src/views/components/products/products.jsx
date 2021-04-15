import React, { useContext, useEffect, useState } from 'react';
import ProductsContext from '../../../contexts/ProductsContext'
import ProductActions from '../../../services/ProductActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';

const Products = (props) => {

    const itemsPerPage = 15;
    const fields = ['name', ' '];
    const { products } = useContext(ProductsContext);
    const [displayedProducts, setDisplayedProducts] = useState([]);

    useEffect(() => {
        ProductActions.findAll()
                .then(response => setDisplayedProducts(response))
                .catch(error => console.log(error.response));
    }, []);

    useEffect(() => {
        setDisplayedProducts(products);
    }, [products]);

    const handleDelete = (id) => {
        const originalProducts = [...displayedProducts];
        setDisplayedProducts(displayedProducts.filter(product => product.id !== id));
        console.log("Supprimé");
        // ProductActions.delete(id)
        //               .catch(error => {
        //                    setDisplayedProducts(originalProducts);
        //                    console.log(error.response);
        //               });
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
              fields={ fields }
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
                          <CButton block color="danger" onClick={ () => handleDelete(item.id) }>Supprimer</CButton>
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