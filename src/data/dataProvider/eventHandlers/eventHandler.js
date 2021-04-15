import productEvents from './productEvents';
import userEvents from './userEvents';

function dispatch(event) {
    const data = JSON.parse(event.data);

    if (data['@id'].includes('products'))
        productEvents.update(data);

    if (data['@id'].includes('users') || data['@id'].includes('metas'))
        userEvents.update(data);
}

export default {
    dispatch
}