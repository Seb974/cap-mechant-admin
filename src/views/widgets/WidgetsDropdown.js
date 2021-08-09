import React, { useContext, useEffect, useState } from 'react'
import { CWidgetDropdown, CRow, CCol, CDropdown, CDropdownMenu, CDropdownItem, CDropdownToggle } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import ChartLineSimple from '../charts/ChartLineSimple'
import ChartBarSimple from '../charts/ChartBarSimple'
import { getDateFrom, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils'
import { isSameDate } from 'src/helpers/days'
import Roles from 'src/config/Roles'
import AuthContext from 'src/contexts/AuthContext'

const WidgetsDropdown = ({ sales, interval }) => {

  const now = new Date();
  const [period, setPeriod] = useState([]);
  const { currentUser, supervisor } = useContext(AuthContext);
  const dates = { start: getDateFrom(now, -interval, 0), end: now };

  useEffect(() => getPeriod(), []);

  const getOrdersNumber = () => period.map(d => sales.reduce((sum, s) => sum += isSameDate(d, new Date(s.deliveryDate)) ? 1 : 0, 0));

  const getClientsNumber = () => period.map(d => sales.reduce((unique, s) => isSameDate(d, new Date(s.deliveryDate)) && !unique.includes(s.email) ? [...unique, s.email] : unique, []).length);

  const getLastElement = (elements, precision) => {
      return (isDefinedAndNotVoid(elements) ? elements.slice(-1)[0] : 0).toFixed(precision);
  };

  const getPeriod = () => {
    let datesArray = [];
    for (let i = 1; i <= interval; i++) {
        const hour = i === interval ? 23 : 0;
        const nextDate = getDateFrom(dates.start, i, hour);
        if (nextDate.getDay() !== 0)
            datesArray = [...datesArray, nextDate];
    }
    setPeriod(datesArray);
};

const getProductCount = () => {
  return period.map(d => {
        let products = []; 
        sales.map(s => {
              if (isSameDate(d, new Date(s.deliveryDate))) {
                  s.items.map(i => {
                    products = [...products, i.product.id];
                });
              }
        });
        return [...new Set(products)].length;
    });
}

  return (
    <CRow>
      <CCol sm="6" lg="4">
        <CWidgetDropdown
          color="gradient-info"
          header={ 
              getLastElement(getOrdersNumber(), 0) 
          }
          text="Commandes"
          footerSlot={
              <ChartLineSimple
                  pointed
                  className="mt-3 mx-3"
                  style={{height: '70px'}}
                  dataPoints={ getOrdersNumber() }
                  pointHoverBackgroundColor="info"
                  options={{ elements: { line: { tension: 0.00001 }}}}
                  label="Members"
                  labels="months"
              />
          }
        >
          <CDropdown>
            <CDropdownToggle caret={ false } color="transparent">
              <CIcon name="cil-clipboard"/>
            </CDropdownToggle>
          </CDropdown>
        </CWidgetDropdown>
      </CCol>

      <CCol sm="6" lg="4">
        <CWidgetDropdown
          color="gradient-warning"
          header={ getLastElement(getClientsNumber(), 0) }
          text="Clients"
          footerSlot={
            <ChartLineSimple
              className="mt-3"
              style={{height: '70px'}}
              backgroundColor="rgba(255,255,255,.2)"
              dataPoints={ 
                getClientsNumber() 
               }
              options={{ elements: { line: { borderWidth: 2.5 }}}}
              pointHoverBackgroundColor="warning"
              label="Members"
              labels="months"
            />
          }
        >
          <CDropdown>
            <CDropdownToggle caret={ false } color="transparent">
              <CIcon name="cil-people"/>
            </CDropdownToggle>
          </CDropdown>
        </CWidgetDropdown>
      </CCol>

      <CCol sm="6" lg="4">
        <CWidgetDropdown
          color="gradient-danger"
          header={ getLastElement(getProductCount(), 0) }
          text="Produits"
          footerSlot={
            <ChartLineSimple
              pointed
              className="c-chart-wrapper mt-3 mx-3"
              style={{height: '70px'}}
              dataPoints={ getProductCount() }
              pointHoverBackgroundColor="rgb(250, 152, 152)"
              label="Members"
              labels="months"
            />
          }
        >
          <CDropdown>
            <CDropdownToggle caret={ false } color="transparent">
              <CIcon name="cil-fastfood"/>
            </CDropdownToggle>
          </CDropdown>
        </CWidgetDropdown>
      </CCol>

    </CRow>
  )
}

export default WidgetsDropdown;