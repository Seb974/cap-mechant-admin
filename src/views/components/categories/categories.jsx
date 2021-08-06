import React, { useContext, useEffect, useState } from 'react';
import CategoryActions from '../../../services/CategoryActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';

const Categories = (props) => {

    const itemsPerPage = 15;
    const fields = ['name', ' '];
    const { currentUser } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [isAdmin, setIsAdmin] = useState(Roles.hasAdminPrivileges(currentUser));

    useEffect(() => fetchCategories(), []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    const fetchCategories = () => {
        CategoryActions.findAll()
            .then(response => {
              console.log(response);
              setCategories(response);
            })
            .catch(error => console.log(error.response));
    };

    const handleDelete = (id) => {
        const originalCategories = [...categories];
        setCategories(categories.filter(category => category.id !== id));
        CategoryActions.delete(id)
                       .catch(error => {
                            setCategories(originalCategories);
                            console.log(error.response);
                       });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des catégories
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/categories/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ categories }
              fields={ isAdmin ? fields : fields.filter(f => f !== ' ') }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
              scopedSlots = {{
                'name':
                  item => <td><Link to={ "/components/categories/" + item.id }>{ item.name }</Link></td>
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
 
export default Categories;