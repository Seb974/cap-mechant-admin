import React, { useContext, useEffect, useState } from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import ProvisionActions from 'src/services/ProvisionActions'
import SellerActions from 'src/services/SellerActions'
import OrderActions from 'src/services/OrderActions'
import ZoneActions from 'src/services/ZoneActions';
import { getActiveStatus } from 'src/helpers/orders'
import AuthContext from 'src/contexts/AuthContext'
import { getDateFrom, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils'
import { getDayName, isSameDate } from 'src/helpers/days'
import { CCard, CCardBody, CCardFooter, CCol, CProgress, CRow } from '@coreui/react'
import { brandDanger, brandInfo, brandSuccess, getFormattedDatas, getOptions, getProgressColor } from 'src/helpers/stats';
import { updateStatusBetween } from 'src/data/dataProvider/eventHandlers/orderEvents';
import MercureContext from 'src/contexts/MercureContext';

const StatChart = attributes => {

  const interval = 30;
  const target = 60;
  const status = getActiveStatus();
  const now = getDateFrom(new Date(), 0, 0);
  const { currentUser, supervisor } = useContext(AuthContext);
  const { updatedOrders, setUpdatedOrders } = useContext(MercureContext);
  const dates = { start: getDateFrom(now, -interval, 0), end: now };

  const [period, setPeriod] = useState([]);
  const [sales, setSales] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [provisions, setProvisions] = useState([]);
  const [zones, setZones] = useState([]);
  const [viewedZones, setViewedZones] = useState([]);
  const [dataset, setDataset] = useState([]);

  useEffect(() => {
      getPeriod();
      fetchZones();
      fetchSellers();
      fetchSales();
  }, []);

  useEffect(() => {
      if (isDefinedAndNotVoid(updatedOrders))
          updateStatusBetween(updatedOrders, dates, status, sales, setSales, currentUser, supervisor);
  }, [updatedOrders]);

  useEffect(() => {
      if (isDefinedAndNotVoid(sellers) && !isDefinedAndNotVoid(provisions))
          fetchProvisions();
  }, [sellers]);

  useEffect(() => {
      const datas = getFormattedDatas([
          {label: 'Ventes', color: brandSuccess, backgroundColor: brandSuccess, borderWidth: 2, data: getFormattedSales()},
          {label: 'Achats', color: brandInfo, borderWidth: 2, data: getFormattedProvisions()},
          {label: 'Objectif de vente', color: brandDanger, borderWidth: 1, dash: [8, 5], data: getFormattedTarget()}
      ]);
      setDataset(datas);
  }, [period, sales, provisions]);

  useEffect(() => {
      if (isDefinedAndNotVoid(zones))
          setViewedZones(getSalesPerZone())
  }, [sales, zones]);

  const fetchSellers = () => {
      SellerActions
        .findAll()
        .then(response => setSellers(response));
  };

  const fetchProvisions = () => {
      ProvisionActions
          .findBetween(dates, sellers)
          .then(response => setProvisions(response));
  };

  const fetchSales = () => {
      OrderActions
          .findStatusBetween(dates, status, currentUser)
          .then(response => setSales(response));
  };

  const fetchZones = () => {
      ZoneActions.findAll()
          .then(response => setZones(response));
  };

  const getFormattedSales = () => period.map(d => sales.reduce((sum, s) => sum += isSameDate(d, new Date(s.deliveryDate)) ? s.totalHT : 0, 0));
  
  const getFormattedProvisions = () => period.map(d => provisions.reduce((sum, p) => sum += isSameDate(d, new Date(p.provisionDate)) ? getTotalProvision(p.goods) : 0, 0));
  
  const getFormattedTarget = () => period.map(date => target);
  
  const getTotalProvision = goods => goods.reduce((sum, g) => sum += isDefined(g.received) && isDefined(g.price) ? g.received * g.price : 0, 0);
  
  const getDataMax = data => data.reduce((max, d) => max = d > max ? d : max, 0);

  const getSalesPerZone = () => zones.map(z => {
    return { name: z.name, total: sales.reduce((sum, s) => sum += z.cities.findIndex(c => c.zipCode === s.metas.zipcode) !== -1 ? s.totalHT : 0, 0) };
  });

  const getMax = () => {
    const salesMax = getDataMax(getFormattedSales());
    const provisionMax = getDataMax(getFormattedProvisions());
    return salesMax < provisionMax ? provisionMax : salesMax;
  };

  const getPeriod = () => {
      let datesArray = [];
      for (let i = 1; i <= interval; i++) {
          const nextDate = getDateFrom(dates.start, i, 0);
          if (nextDate.getDay() !== 0)
              datesArray = [...datesArray, nextDate];
      }
      setPeriod(datesArray);
  };

  return (
    <CCard>
        <CCardBody>
          <CRow>
            <CCol sm="5">
              <h4 id="traffic" className="card-title mb-0">Activité</h4>
              <div className="small text-muted">{ (new Date()).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: 'UTC'}) }</div>
            </CCol>
          </CRow>
          <CChartLine
              { ...attributes }
              datasets={ dataset }
              options={ getOptions(getMax()) }
              labels={ period.map(d => getDayName(d)) }
          />
        </CCardBody>
        { isDefinedAndNotVoid(viewedZones) && 
            <CCardFooter>
              <CRow className="text-center">
                { viewedZones.map((zone, index) => {
                    const percent = (zone.total / viewedZones.reduce((sum, z) => sum += z.total, 0) * 100).toFixed(2);
                    return (
                        <CCol md sm="12" className="mb-sm-2 mb-0" key={ index }>
                            <div className="text-muted">{ zone.name }</div>
                            <strong>{ percent + "%" }</strong>
                            <CProgress
                                className="progress-xs mt-2"
                                precision={ 1 }
                                color={ getProgressColor(index) }
                                value={ percent }
                            />
                        </CCol>
                    );
                })}
              </CRow>
            </CCardFooter>
        }
      </CCard>
  )
}

export default StatChart;