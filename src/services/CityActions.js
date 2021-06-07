import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/cities')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function deleteCity(id) {
    return api.delete('/api/cities/' + id);
}

function find(id) {
    return api
        .get('/api/cities/' + id)
        .then(response => response.data);
}

function update(id, city) {
    return api.put('/api/cities/' + id, {...city});
}

function create(city) {
    return api.post('/api/cities', {...city});
}

export default {
    findAll,
    delete: deleteCity,
    find,
    update,
    create
}