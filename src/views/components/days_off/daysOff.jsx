import React, { useEffect, useState } from 'react';
import DayOffActions from '../../../services/DayOffActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';

const DaysOff = (props) => {

    const itemsPerPage = 15;
    const fields = ['name', 'date', ' '];
    const [daysOff, setDaysOff] = useState([]);

    useEffect(() => {
        DayOffActions.findAll()
            .then(response => setDaysOff(response))
            .catch(error => console.log(error.response));
    }, []);

    const handleDelete = (id) => {
        const originalDaysOff = [...daysOff];
        setDaysOff(daysOff.filter(day => day.id !== id));
        DayOffActions.delete(id)
                       .catch(error => {
                            setDaysOff(originalDaysOff);
                            console.log(error.response);
                       });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des jours à activité réduite
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/days_off/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ daysOff }
              fields={ fields }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
              scopedSlots = {{
                'name':
                  item => <td><Link to={ "/components/days_off/" + item.id }>{ item.name }</Link></td>
                ,
                'date':
                  item => <td>{ (new Date(item.date)).toLocaleDateString("fr-FR", {year:'numeric', month: 'numeric', day: 'numeric'}) }</td>
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
 
export default DaysOff;