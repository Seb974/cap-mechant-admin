import api from 'src/config/api';

function register(user) {
    const { name, email, password } = user;
    return api.post("/api/users", { name, email, password });
}

function findAll() {
    return api
        .get('/api/users')
        .then(response => response.data['hydra:member']);
}

function deleteUser(id) {
    return api
        .delete('/api/users/' + id);
}

function find(id) {
    return api.get('/api/users/' + id)
                .then(response => response.data);
}

function update(id, user) {
    return api.put('/api/users/' + id, user);
}

function create(user) {
    return api.post('/api/users', user);
}

export default {
    register,
    findAll,
    delete: deleteUser,
    find, 
    update, 
    create
}