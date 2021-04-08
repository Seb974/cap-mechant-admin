import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/categories')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function deleteCategory(id) {
    return api.delete('/api/categories/' + id);
}

function find(id) {
    return api
        .get('/api/categories/' + id)
        .then(response => response.data);
}

function update(id, category) {
    return api.put('/api/categories/' + id, {...category});
}

function create(category) {
    return api.post('/api/categories', {...category});
}

function updateFromMercure(categories, category) {
    const filteredCategories = categories.filter(item => item.id !== category.id);
    return [...filteredCategories, category].sort((a, b) => (a.name > b.name) ? 1 : -1);

}

function deleteFromMercure(categories, id) {
    return categories.filter(item => parseInt(item.id) !== parseInt(id));
}

export default { 
    findAll,
    delete: deleteCategory,
    find, 
    update, 
    create,
    updateFromMercure,
    deleteFromMercure,
}