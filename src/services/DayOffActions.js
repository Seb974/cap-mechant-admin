import api from 'src/config/api';
import { getAmericanStringDate } from 'src/helpers/utils';

function findAll() {
    return api
        .get('/api/day_offs')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.date > b.date) ? 1 : -1));
}

function deleteDayOff(id) {
    return api.delete('/api/day_offs/' + id);
}

function find(id) {
    return api
        .get('/api/day_offs/' + id)
        .then(response => response.data);
}

function update(id, priceGroup) {
    return api.put('/api/day_offs/' + id, {...priceGroup});
}

function create(priceGroup) {
    return api.post('/api/day_offs', {...priceGroup});
}

function findActives() {
    return api
        .get(`/api/day_offs?date[after]=${ getAmericanStringDate(new Date()) }`)
        .then(response => response.data['hydra:member'].sort((a, b) => (a.date > b.date) ? 1 : -1));
}

export default {
    findAll,
    delete: deleteDayOff,
    find,
    update,
    create,
    findActives
}