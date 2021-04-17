import React, { useEffect, useContext } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import AuthContext from 'src/contexts/AuthContext';
import api from 'src/config/api';
import eventHandler from '../../data/dataProvider/eventHandlers/eventHandler';

// import ProductsContext from '../../contexts/ProductsContext';
// import ProductActions from '../../services/ProductActions';

const MercureHub = ({ children }) => {
    
    const url = new URL(api.MERCURE_DOMAIN + "/.well-known/mercure");
    // const { products, setProducts } = useContext(ProductsContext);
    const { currentUser, eventSource, setEventSource } = useContext(AuthContext);

    useEffect(() => {
        closeIfExists();
        url.searchParams.append('topic', api.API_DOMAIN + '/api/products/{id}');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/categories/{id}');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/users/{id}');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/users/{id}/metas');
        setEventSource(new EventSourcePolyfill(url, { withCredentials: true }));
    }, [currentUser]);

    const closeIfExists = () => {
        if (eventSource !== undefined && Object.keys(eventSource).find(key => key === 'readyState') !== undefined) {
            eventSource.close();
        }
    };

    eventSource.onmessage = event => eventHandler.dispatch(event);
    // {

        // const data = JSON.parse(event.data);
        // if (data['@id'].includes('products')) {
        //     console.log(data);
        // }
        // if (data['@id'].includes('products')) {
        //     const newProducts = data['@type'] === 'Product' ?
        //         ProductActions.updateFromMercure(products, data) :
        //         ProductActions.deleteFromMercure(products, data['@id'].substring(parseInt(data['@id'].lastIndexOf('/')) + 1));
        //     setProducts(newProducts);
        // }

        // if (data['@id'].includes('users') || data['@id'].includes('metas')) {
        //     console.log(data);
        // }
    // };

    // eventSource.onerror = event => console.log(event);
    // eventSource.onopen = event => console.log(event);

    return <>{ children }</>
}

export default MercureHub;