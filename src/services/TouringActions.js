import api from 'src/config/api';
import Roles from 'src/config/Roles';
import { getStringDate } from 'src/helpers/days';
import { formatUTC, isDefined } from 'src/helpers/utils';
import OrderActions from './OrderActions';

function findAll() {
    return api
        .get('/api/tourings')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.start > b.start) ? 1 : -1));
}

function deleteTouring(id) {
    return api.delete('/api/tourings/' + id);
}

function find(id) {
    return api
        .get('/api/tourings/' + id)
        .then(response => response.data);
}

function update(id, touring) {
    return api.put('/api/tourings/' + id, touring);
}

function create(touring) {
    return api.post('/api/tourings', touring);
}

function getTourings(dates, user) {
    const UTCDates = formatUTC(dates);
    const dateLimits = `start[after]=${ getStringDate(UTCDates.start) }&start[before]=${ getStringDate(UTCDates.end) }`
    return api
        .get(`/api/tourings?${ dateLimits }`)
        .then(response => response.data['hydra:member'].sort((a, b) => (new Date(a.deliveryDate) < new Date(b.deliveryDate)) ? -1 : 1));
};

function getOpenedTourings(dates, user) {
    const UTCDates = formatUTC(dates);
    const dateLimits = `start[after]=${ getStringDate(UTCDates.start) }&start[before]=${ getStringDate(UTCDates.end) }`
    const open = `isOpen=true`;
    return api
        .get(`/api/tourings?${ open }&${ dateLimits }`)
        .then(response => response.data['hydra:member'].sort((a, b) => (new Date(a.deliveryDate) < new Date(b.deliveryDate)) ? -1 : 1));
};

function closeTouring(touring) {
    return api.put('/api/tourings/' + touring.id, {
        ...touring,
        end: new Date(),
        isOpen: false,
        orderEntities: touring.orderEntities.map(order => ({id: order.id, status: 'DELIVERED'})),
        deliverer: isDefined(touring.deliverer) ? typeof touring.deliverer === 'string' ? touring.deliverer : touring.deliverer['@id'] : null
    });
}

export default {
    findAll,
    delete: deleteTouring,
    find,
    update,
    create,
    getTourings,
    getOpenedTourings,
    closeTouring
}