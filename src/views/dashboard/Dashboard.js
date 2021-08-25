import React, { lazy, useContext, useEffect, useState } from 'react';
import StatChart from '../charts/StatChart.js';
import SalesStats from './salesStats.jsx';
import StockStats from './stockStats.jsx';
import AuthContext from 'src/contexts/AuthContext.js';
import { getDateFrom, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils.js';
import MercureContext from 'src/contexts/MercureContext.js';
import { updateBetween } from 'src/data/dataProvider/eventHandlers/provisionEvents.js';
import ProvisionActions from 'src/services/ProvisionActions.js';

const WidgetsDropdown = lazy(() => import('../widgets/WidgetsDropdown.js'));

const Dashboard = () => {

    const interval = 30;
    const widgetInterval = 7;
    const now = new Date();
    const dates = { start: getDateFrom(now, -interval, 0), end: now };
    const { supervisor, seller } = useContext(AuthContext);
    const { updatedProvisions, setUpdatedProvisions } = useContext(MercureContext);
    const [mercureOpering, setMercureOpering] = useState(false);
    const [sales, setSales] = useState([]);

    useEffect(() => fetchProvisions(), []);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedProvisions) && !mercureOpering) {
            setMercureOpering(true);
            updateBetween(getUTCDates(), sales, setSales, updatedProvisions, setUpdatedProvisions)
                .then(response => setMercureOpering(response));
        }
    }, [updatedProvisions]);

    const fetchProvisions = () => {
        ProvisionActions
            .findBetween(getUTCDates(), [{ value: seller['@id'], label: seller.name }])
            .then(response => setSales(response.filter(p => isDefinedAndNotVoid(p.goods))));
    };

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
  };

    return (
        <>
            <WidgetsDropdown sales={ sales } interval={ widgetInterval }/>
            <SalesStats/>
            { !isDefined(supervisor) && <StockStats/> }
            {/* <StatChart style={{height: '300px', marginTop: '40px'}} sales={ sales } interval={ interval }/> */}
        </>
    );
}

export default Dashboard;
