import React, { useContext, useEffect, useState } from 'react';
import OrderActions from '../../../services/OrderActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { isDefined } from 'src/helpers/utils';
import Spinner from 'react-bootstrap/Spinner'

const Preparations = (props) => {

    const itemsPerPage = 30;
    const fields = ['name', 'date', 'total', ' '];
    const { currentUser } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        getOrders();
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    useEffect(() => getOrders(), [dates]);

    const getOrders = () => {
        setLoading(true);
        const UTCDates = getUTCDates(dates);
        OrderActions.findPreparations(UTCDates, currentUser)
                .then(response =>{
                    console.log(response);
                    setOrders(response);
                    setLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                });
    }

    const handleDelete = (id) => {
        const originalOrders = [...orders];
        setOrders(orders.filter(order => order.id !== id));
        OrderActions.delete(id)
                      .catch(error => {
                           setOrders(originalOrders);
                           console.log(error.response);
                      });
    }

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])){
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});

        }
    };

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des commandes à préparer
                { isAdmin &&
                    <CCol col="6" sm="4" md="2" className="ml-auto">
                            <Link role="button" to="/components/preparations/new" block variant="outline" color="success">CRÉER</Link>
                    </CCol>
                }
            </CCardHeader>
            <CCardBody>
                <CRow>
                    <CCol xs="12" lg="6">
                    <RangeDatePicker
                        minDate={ dates.start }
                        maxDate={ dates.end }
                        onDateChange={ handleDateChange }
                        label="Date"
                        className = "form-control mb-3"
                    />
                    </CCol>
                </CRow>
                { loading ? 
                    <CRow className="mx-5">
                        <CCol xs="12" lg="12" className="text-center mx-5">
                            <Spinner animation="border" variant="danger"/>
                        </CCol>
                    </CRow> 
                    :
                    <CDataTable
                    items={ orders }
                    fields={ fields }
                    bordered
                    itemsPerPage={ itemsPerPage }
                    pagination
                    scopedSlots = {{
                        'name':
                            item => <td><Link to={ "/components/preparations/" + item.id }>{ item.name }</Link></td>
                        ,
                        'date':
                            item => <td>{ (new Date(item.deliveryDate)).toLocaleDateString('fr-FR', { timeZone: 'UTC'}) }</td>
                        ,
                        'total':
                            item => <td>{ isDefined(item.totalHT) ? item.totalHT.toFixed(2) + " €" : " "}</td>
                        ,
                        ' ':
                            item => (
                                <td className="mb-3 mb-xl-0 text-center">
                                    <CButton block color="danger" disabled={ !isAdmin } onClick={ () => handleDelete(item.id) }>Supprimer</CButton>
                                </td>
                            )
                    }}
                    />
                }
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Preparations;