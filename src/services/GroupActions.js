import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/groups')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.isFixed > b.isFixed) ? -1 : 1));
}

function deleteGroup(id) {
    return api.delete('/api/groups/' + id);
}

function find(id) {
    return api
        .get('/api/groups/' + id)
        .then(response => response.data);
}

function update(id, group) {
    return api.put('/api/groups/' + id, {...group});
}

function create(group) {
    return api.post('/api/groups', {...group});
}

export default {
    findAll,
    delete: deleteGroup,
    find,
    update,
    create
}