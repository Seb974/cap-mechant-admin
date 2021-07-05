import React, { useState } from 'react';
import MercureContext from 'src/contexts/MercureContext';
import MercureHub from 'src/components/Mercure/MercureHub';

const Mercure = ({ children }) => {

    const [updatedOrders, setUpdatedOrders] = useState([]);
    const [updatedProducts, setUpdatedProducts] = useState([]);

    return (
        <MercureContext.Provider value={{ updatedOrders, setUpdatedOrders, updatedProducts, setUpdatedProducts }}>
            <MercureHub>
                { children }
            </MercureHub>
        </MercureContext.Provider>
    );
}

export default Mercure;