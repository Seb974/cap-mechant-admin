import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/taxes')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function deleteTax(id) {
    return api.delete('/api/taxes/' + id);
}

function find(id) {
    return api
        .get('/api/taxes/' + id)
        .then(response => response.data);
}

function update(id, tax) {
    return api.put('/api/taxes/' + id, {...tax});
}

function create(tax) {
    return api.post('/api/taxes', {...tax});
}

function updateFromMercure(taxes, tax) {
    const filteredTaxes = taxes.filter(item => item.id !== tax.id);
    return [...filteredTaxes, tax].sort((a, b) => (a.name > b.name) ? 1 : -1);

}

function deleteFromMercure(taxes, id) {
    return taxes.filter(item => parseInt(item.id) !== parseInt(id));
}

export default { 
    findAll,
    delete: deleteTax,
    find, 
    update, 
    create,
    updateFromMercure,
    deleteFromMercure,
}