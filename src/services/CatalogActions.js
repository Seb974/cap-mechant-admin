import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/catalogs')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? -1 : 1));
}

function deleteCatalog(id) {
    return api.delete('/api/catalogs/' + id);
}

function find(id) {
    return api
        .get('/api/catalogs/' + id)
        .then(response => response.data);
}

function update(id, catalog) {
    return api.put('/api/catalogs/' + id, {...catalog});
}

function create(catalog) {
    return api.post('/api/catalogs', {...catalog});
}

export default {
    findAll,
    delete: deleteCatalog,
    find,
    update,
    create
}