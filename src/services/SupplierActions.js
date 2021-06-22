import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/suppliers')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.seller.name > b.seller.name) ? 1 : -1));
}

function deleteSupplier(id) {
    return api.delete('/api/suppliers/' + id);
}

function find(id) {
    return api
        .get('/api/suppliers/' + id)
        .then(response => response.data);
}

function update(id, supplier) {
    return api.put('/api/suppliers/' + id, {...supplier});
}

function create(supplier) {
    return api.post('/api/suppliers', {...supplier});
}

function updateFromMercure(suppliers, supplier) {
    const filteredsuppliers = suppliers.filter(item => item.id !== supplier.id);
    return [...filteredsuppliers, supplier].sort((a, b) => (a.name > b.name) ? 1 : -1);

}

export default { 
    findAll,
    delete: deleteSupplier,
    find, 
    update, 
    create,
    updateFromMercure,
}