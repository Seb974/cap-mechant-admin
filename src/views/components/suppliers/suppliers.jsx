import React, { useEffect, useState } from 'react';
import SupplierActions from '../../../services/SupplierActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Suppliers = (props) => {

    const itemsPerPage = 15;
    const fields = ['Vendeur', 'Nom', ' '];
    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => {
        SupplierActions.findAll()
            .then(response => {
              console.log(response);
              setSuppliers(response);
            })
            .catch(error => console.log(error.response));
    }, []);

    const handleDelete = (id) => {
        const originalSuppliers = [...suppliers];
        setSuppliers(suppliers.filter(supplier => supplier.id !== id));
        SupplierActions.delete(id)
                       .catch(error => {
                            setSuppliers(originalSuppliers);
                            console.log(error.response);
                       });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des fournisseurs
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/suppliers/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ suppliers }
              fields={ fields }
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

      </CRow>
    );
}
 
export default Suppliers;