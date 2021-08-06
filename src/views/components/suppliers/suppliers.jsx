import React, { useContext, useEffect, useState } from 'react';
import SupplierActions from '../../../services/SupplierActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
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
          .then(response => setImportLoading(false))
          .catch(error => {
              setImportLoading(false);
              console.log(error);
          });
    };

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des fournisseurs
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

      </CRow>
    );
}
 
export default Suppliers;