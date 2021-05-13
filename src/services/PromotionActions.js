import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/promotions')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function deletePromotion(id) {
    return api.delete('/api/promotions/' + id);
}

function find(id) {
    return api
        .get('/api/promotions/' + id)
        .then(response => response.data);
}

function update(id, promotion) {
    return api.put('/api/promotions/' + id, {...promotion});
}

function create(promotion) {
    return api.post('/api/promotions', {...promotion});
}

export default {
    findAll,
    delete: deletePromotion,
    find,
    update,
    create
}