import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/deliverers')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function deleteDeliverer(id) {
    return api.delete('/api/deliverers/' + id);
}

function find(id) {
    return api
        .get('/api/deliverers/' + id)
        .then(response => response.data);
}

function update(id, deliverer) {
    return api.put('/api/deliverers/' + id, {...deliverer});
}

function create(deliverer) {
    return api.post('/api/deliverers', {...deliverer});
}

export default {
    findAll,
    delete: deleteDeliverer,
    find,
    update,
    create
}