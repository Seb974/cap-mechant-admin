import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/products')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function deleteProduct(id) {
    return api
        .delete('/api/products/' + id);
}

function find(id) {
    return api.get('/api/products/' + id)
                .then(response => response.data);
}

function update(id, product) {
    return api.put('/api/products/' + id,
                    {...product,
                        // category: `/api/categories/${ product.category }`,
                        // suppliers: suppliers.map(supplier => `/api/suppliers/${ supplier.id }`),
                        // unit: `/api/units/${ product.unit }`,
                        // userCategories: product.userCategories.map(userCategory => userCategory.value)
                    });
}

function create(product) {
    return api.post('/api/products', 
                    {...product, 
                        // category: `/api/categories/${ product.category }`, 
                        // suppliers: suppliers.map(supplier => `/api/suppliers/${ supplier.id }`),
                        // unit: `/api/units/${ product.unit }`,
                        // userCategories: product.userCategories.map(userCategory => userCategory.value),
                        // picture: null
                    });
}

function updateFromMercure(products, product) {
    const filteredProducts = products.filter(item => item.id !== product.id);
    return [...filteredProducts, product].sort((a, b) => (a.name > b.name) ? 1 : -1);

}

function deleteFromMercure(products, id) {
    return products.filter(item => parseInt(item.id) !== parseInt(id));
}

function createImage(image) {
    let formData = new FormData();
    formData.append('file', image);
    return api.post('/api/pictures', formData, {headers: {'Content-type': 'multipart/form-data'}})
              .then(response => response.data['@id']);
}

export default { 
    findAll,
    delete: deleteProduct,
    find, 
    update, 
    create,
    createImage,
    updateFromMercure,
    deleteFromMercure,
}