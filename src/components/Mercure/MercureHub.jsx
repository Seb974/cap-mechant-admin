import React, { useEffect, useContext } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import AuthContext from 'src/contexts/AuthContext';
import api from 'src/config/api';
import eventHandler from '../../data/dataProvider/eventHandlers/eventHandler';
import touringEvents from 'src/data/dataProvider/eventHandlers/touringEvents';
import productEvents from 'src/data/dataProvider/eventHandlers/productEvents';
import categoryEvents from 'src/data/dataProvider/eventHandlers/categoryEvents';
import userEvents from 'src/data/dataProvider/eventHandlers/userEvents';
import DeliveryContext from 'src/contexts/DeliveryContext';
import ProductsContext from 'src/contexts/ProductsContext';
import orderEvents from 'src/data/dataProvider/eventHandlers/orderEvents';
import MercureContext from 'src/contexts/MercureContext';

const MercureHub = ({ children }) => {
    
    const url = new URL(api.MERCURE_DOMAIN + "/.well-known/mercure");
    const { products, setProducts } = useContext(ProductsContext);
    const { updatedOrders, setUpdatedOrders } = useContext(MercureContext);
    const { currentUser, eventSource, setEventSource } = useContext(AuthContext);
    const { packages, setPackages, tourings, setTourings } = useContext(DeliveryContext);

    useEffect(() => {
        closeIfExists();
        url.searchParams.append('topic', api.API_DOMAIN + '/api/products/{id}');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/stocks/{id}');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/categories/{id}');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/tourings/{id}');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/users/{id}');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/users/{id}/metas');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/users/{id}/shipments');
        setEventSource(new EventSourcePolyfill(url, { withCredentials: true }));
    }, [currentUser]);

    const closeIfExists = () => {
        if (eventSource !== undefined && Object.keys(eventSource).find(key => key === 'readyState') !== undefined)
            eventSource.close();
    };

    eventSource.onmessage = event => {
        const data = JSON.parse(event.data);
        console.log(data);
        if (data['@id'].includes('tourings'))
            touringEvents.update(data, tourings, setTourings);

        if (data['@id'].includes('products'))
            productEvents.update(data, products, setProducts);

        if (data['@id'].includes('categories'))
            categoryEvents.update(data);

        if (data['@id'].includes('users') || data['@id'].includes('metas'))
            userEvents.update(data);
        if (data['@id'].includes('order_entities') && updatedOrders.findIndex(o => o.id === data.id) === -1)
            setUpdatedOrders([...updatedOrders, data]);
        // orderEvents.update(data);
    };

    return <>{ children }</>
}

export default MercureHub;