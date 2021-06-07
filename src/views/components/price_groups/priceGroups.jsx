import React, { useEffect, useState } from 'react';
import PriceGroupActions from '../../../services/PriceGroupActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';

const PriceGroups = (props) => {

    const itemsPerPage = 15;
    const fields = ['name', ' '];
    const [priceGroups, setPriceGroups] = useState([]);

    useEffect(() => {
        PriceGroupActions.findAll()
            .then(response => setPriceGroups(response))
            .catch(error => console.log(error.response));
    }, []);

    const handleDelete = (id) => {
        const originalPriceGroups = [...priceGroups];
        setPriceGroups(priceGroups.filter(group => group.id !== id));
        PriceGroupActions.delete(id)
                       .catch(error => {
                            setPriceGroups(originalPriceGroups);
                            console.log(error.response);
                       });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des groupes de prix
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/price_groups/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ priceGroups }
              fields={ fields }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
              scopedSlots = {{
                'name':
                  item => <td><Link to={ "/components/price_groups/" + item.id }>{ item.name }</Link></td>
                ,
                ' ':
                  item =><td><CButton block color="danger" onClick={ () => handleDelete(item.id) }>Supprimer</CButton></td>
              }}
            />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default PriceGroups;