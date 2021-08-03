import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/zones')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function deleteZone(id) {
    return api.delete('/api/zones/' + id);
}

function find(id) {
    return api
        .get('/api/zones/' + id)
        .then(response => response.data);
}

function update(id, zone) {
    return api.put('/api/zones/' + id, {...zone});
}

function create(zone) {
    return api.post('/api/zones', {...zone});
}

export default { 
    findAll,
    delete: deleteZone,
    find,
    update,
    create
}