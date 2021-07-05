import React from 'react';

export default React.createContext({
    updatedOrders: [],
    setUpdatedOrders: (value) => {},
    updatedProducts: [],
    setUpdatedProducts: (value) => {},
});