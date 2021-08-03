import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/stocks')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.id > b.id) ? 1 : -1));
}

function deleteStock(id) {
    return api.delete('/api/stocks/' + id);
}

function find(id) {
    return api
        .get('/api/stocks/' + id)
        .then(response => response.data);
}

function update(id, stock) {
    return api.put('/api/stocks/' + id, {...stock});
}

function create(stock) {
    return api.post('/api/stocks', {...stock});
}

function updateFromMercure(stocks, stock) {
    const filteredStocks = stocks.filter(item => item.id !== stock.id);
    return [...filteredStocks, stock].sort((a, b) => (a.name > b.name) ? 1 : -1);

}

export default { 
    findAll,
    delete: deleteStock,
    find, 
    update, 
    create,
    updateFromMercure,
}