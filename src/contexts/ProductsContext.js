import React from 'react';

export default React.createContext({
    products: [],
    setProducts: (value) => {},
    navSearch: '',
    setNavSearch: (value) => {}
});