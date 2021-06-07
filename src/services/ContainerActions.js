import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/containers')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.max < b.max) ? -1 : 1));
}

function deleteContainer(id) {
    return api.delete('/api/containers/' + id);
}

function find(id) {
    return api
        .get('/api/containers/' + id)
        .then(response => response.data);
}

function update(id, container) {
    return api.put('/api/containers/' + id, {...container});
}

function create(container) {
    return api.post('/api/containers', {...container});
}

export default {
    findAll,
    delete: deleteContainer,
    find,
    update,
    create
}