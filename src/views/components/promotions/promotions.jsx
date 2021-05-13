import React, { useEffect, useState } from 'react';
import PromotionActions from '../../../services/PromotionActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Promotions = (props) => {

    const itemsPerPage = 15;
    const fields = ['name', 'usage', 'validity', ' '];
    const [promotions, setPromotions] = useState([]);

    useEffect(() => {
        PromotionActions.findAll()
            .then(response => {
                console.log(response);
                setPromotions(response);
            })
            .catch(error => console.log(error));
    }, []);

    const handleDelete = (id) => {
        const originalPromotions = [...promotions];
        setPromotions(promotions.filter(city => city.id !== id));
        PromotionActions
            .delete(id)
            .catch(error => {
                setPromotions(originalPromotions);
                console.log(error.response);
            });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des coupons de réduction
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/promotions/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ promotions }
              fields={ fields }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
              scopedSlots = {{
                'name':
                  item => <td><Link to={ "/components/promotions/" + item.id }>{ item.code }</Link></td>
                ,
                'usage':
                  item => <td>{ item.used } / { item.maxUsage }</td>
                ,
                'validity':
                  item => <td>{ item.used < item.maxUsage && (new Date(item.endsAt)).getTime() > (new Date()).getTime() ? "En cours" : "Périmé" }</td>
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
 
export default Promotions;