import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/price_groups')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function deletePriceGroup(id) {
    return api.delete('/api/price_groups/' + id);
}

function find(id) {
    return api
        .get('/api/price_groups/' + id)
        .then(response => response.data);
}

function update(id, priceGroup) {
    return api.put('/api/price_groups/' + id, {...priceGroup});
}

function create(priceGroup) {
    return api.post('/api/price_groups', {...priceGroup});
}

export default {
    findAll,
    delete: deletePriceGroup,
    find,
    update,
    create
}