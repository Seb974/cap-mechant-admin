function update(data) {
    console.log(data);
//  const newProducts = data['@type'] === 'Product' ?
//      ProductActions.updateFromMercure(products, data) :
//      ProductActions.deleteFromMercure(products, data['@id'].substring(parseInt(data['@id'].lastIndexOf('/')) + 1));
//  setProducts(newProducts);
}

export default {
    update
}