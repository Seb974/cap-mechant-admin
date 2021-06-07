import React, { useEffect, useState } from 'react';
import TaxActions from '../../../services/TaxActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';

const Taxes = (props) => {

    const itemsPerPage = 15;
    const fields = ['name', ' '];
    const [taxes, setTaxes] = useState([]);

    useEffect(() => {
        TaxActions.findAll()
            .then(response => setTaxes(response))
            .catch(error => console.log(error.response));
    }, []);

    const handleDelete = (id) => {
        const originalTaxes = [...taxes];
        setTaxes(taxes.filter(tax => tax.id !== id));
        console.log("Supprimé");
        TaxActions.delete(id)
                       .catch(error => {
                            setTaxes(originalTaxes);
                            console.log(error.response);
                       });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des taxes
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/taxes/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ taxes }
              fields={ fields }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
              scopedSlots = {{
                'name':
                  item => <td><Link to={ "/components/taxes/" + item.id }>{ item.name }</Link></td>
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
 
export default Taxes;