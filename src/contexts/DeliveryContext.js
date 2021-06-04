import React from 'react';

export default React.createContext({
    cities: [],
    setCities: (value) => {},
    relaypoints: [],
    setRelaypoints: (value) => {},
    condition: {},
    setCondition: (value) => {},
    packages: [],
    setPackages: (value) => {},
    totalWeight: 0,
    setTotalWeight: (value) => {},
    availableWeight: 0,
    setAvailableWeight: (value) => {},
    tourings: [],
    setTourings: (value) => {},
});