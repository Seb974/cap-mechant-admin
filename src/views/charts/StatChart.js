import React, { useContext, useEffect, useState } from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle, hexToRgba } from '@coreui/utils'
import ProvisionActions from 'src/services/ProvisionActions'
import SellerActions from 'src/services/SellerActions'
import OrderActions from 'src/services/OrderActions'
import { getActiveStatus } from 'src/helpers/orders'
import AuthContext from 'src/contexts/AuthContext'
import { getDateFrom, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils'
import { getDayName, isSameDate } from 'src/helpers/days'

const brandSuccess = getStyle('success') || '#4dbd74'
const brandInfo = getStyle('info') || '#20a8d8'
const brandDanger = getStyle('danger') || '#f86c6b'

const StatChart = attributes => {

  const interval = 30;
  const target = 60;
  const status = getActiveStatus();
  const now = getDateFrom(new Date(), 0, 0);
  const { currentUser } = useContext(AuthContext);
  const dates = { start: getDateFrom(now, -interval, 0), end: now };

  const [period, setPeriod] = useState([]);
  const [sales, setSales] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [provisions, setProvisions] = useState([]);
  const [dataset, setDataset] = useState([]);

  useEffect(() => {
      getPeriod();
      fetchSellers();
      fetchSales();
  }, []);

  useEffect(() => {
      if (isDefinedAndNotVoid(sellers) && !isDefinedAndNotVoid(provisions))
          fetchProvisions();
  }, [sellers]);

  useEffect(() => {
      const provisionList = getFormattedProvisions();
      console.log(provisions);
      console.log(provisionList);
      setDataset(getDatas());
  }, [period, sales, provisions]);

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
          .then(response => {
            console.log(response);
            setSales(response);
          });
  };

  const getFormattedSales = () => {
      return period.map(date => sales.reduce((sum, s) => sum += isSameDate(date, new Date(s.deliveryDate)) ? s.totalHT : 0, 0));
  };

  const getFormattedProvisions = () => {
      return period.map(date => provisions.reduce((sum, p) => sum += isSameDate(date, new Date(p.provisionDate)) ? getTotalProvision(p.goods) : 0, 0));
  };

  const getFormattedTarget = () => {
    return period.map(date => target);
  }

  const getTotalProvision = goods => {
    return goods.reduce((sum, g) => sum += isDefined(g.received) && isDefined(g.price) ? g.received * g.price : 0, 0);
  };

  const getDataMax = data => {
      return data.reduce((max, d) => max = d > max ? d : max, 0);
  };

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

  const getDatas = () => [
      {
        label: 'Ventes',
        backgroundColor: hexToRgba(brandInfo, 10),
        borderColor: brandInfo,
        pointHoverBackgroundColor: brandInfo,
        borderWidth: 2,
        data: getFormattedSales()
      },
      {
        label: 'Achats',
        backgroundColor: 'transparent',
        borderColor: brandSuccess,
        pointHoverBackgroundColor: brandSuccess,
        borderWidth: 2,
        data: getFormattedProvisions()
      },
      {
        label: 'Objectif de vente',
        backgroundColor: 'transparent',
        borderColor: brandDanger,
        pointHoverBackgroundColor: brandDanger,
        borderWidth: 1,
        borderDash: [8, 5],
        data: getFormattedTarget()
      }
  ];

  const defaultOptions = (()=> {
    return {
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            gridLines: {
              drawOnChartArea: false
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
              maxTicksLimit: 5,
              stepSize: Math.ceil(getMax() / 5),
              max: getMax()
            },
            gridLines: {
              display: true
            }
          }]
        },
        elements: {
          point: {
            radius: 0,
            hitRadius: 10,
            hoverRadius: 4,
            hoverBorderWidth: 3
          }
        }
      }
    }
  )()

  return (
    <CChartLine
        { ...attributes }
        datasets={ dataset }
        options={ defaultOptions }
        labels={ period.map(d => getDayName(d)) }
    />
  )
}

export default StatChart;
