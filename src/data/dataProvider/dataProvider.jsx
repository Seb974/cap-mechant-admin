import React, { useEffect, useState } from 'react';
import ProductsContext from '../../contexts/ProductsContext';
import MercureHub from '../../components/Mercure/MercureHub';
import AuthContext from '../../contexts/AuthContext';
import AuthActions from '../../services/AuthActions';
import ProductActions from 'src/services/ProductActions';
import DeliveryContext from 'src/contexts/DeliveryContext';
import ContainerActions from 'src/services/ContainerActions';
import CatalogActions from 'src/services/CatalogActions';
import CategoryActions from 'src/services/CategoryActions';
import RelaypointActions from 'src/services/RelaypointActions';
import ContainerContext from 'src/contexts/ContainerContext';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';

const DataProvider = ({ children }) => {

    const [isAuthenticated, setIsAuthenticated] = useState(AuthActions.isAuthenticated());
    const [currentUser, setCurrentUser] = useState(AuthActions.getCurrentUser());
    const [country, setCountry] = useState("RE");
    const [products, setProducts] = useState([]);
    const [settings, setSettings] = useState(null);
    const [eventSource, setEventSource] = useState({});
    const [cities, setCities] = useState([]);
    const [relaypoints, setRelaypoints] = useState([]);
    const [condition, setCondition] = useState(undefined);
    const [containers, setContainers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [totalWeight, setTotalWeight] = useState(null);
    const [availableWeight, setAvailableWeight] = useState(null);
    const [catalogs, setCatalogs] = useState([]);
    const [selectedCatalog, setSelectedCatalog] = useState({});
    const [tourings, setTourings] = useState([]);

    useEffect(() => {
        AuthActions.setErrorHandler(setCurrentUser, setIsAuthenticated);
        AuthActions.getGeolocation()
                   .then(response => setCountry(response));
        // AuthActions.getUserSettings()
        //            .then(response => setSettings(response));
        ProductActions.findAll()
                      .then(response => setProducts(response));
        ContainerActions.findAll()
                      .then(response => setContainers(response));
        CatalogActions.findAll()
                    .then(response => setCatalogs(response));
        RelaypointActions.findAll()
                     .then(response => setRelaypoints(response));
    },[]);

    useEffect(() => {
        setCurrentUser(AuthActions.getCurrentUser());
        AuthActions.getUserSettings()
                   .then(response => setSettings(response));
        ProductActions.findAll()
                      .then(response => setProducts(response));
    }, [isAuthenticated]);

    useEffect(() => {
        if (isDefinedAndNotVoid(catalogs) && isDefined(country)) {
            const catalog = catalogs.find(catalogOption => catalogOption.code === country);
            const selection = isDefined(catalog) ? catalog : catalogs.filter(country => country.isDefault);
            setSelectedCatalog(selection);
        }
    }, [catalogs, country]);

    return (
        <AuthContext.Provider value={ {isAuthenticated, setIsAuthenticated, currentUser, setCurrentUser, eventSource, setEventSource, settings, setSettings, selectedCatalog, setSelectedCatalog} }>
        <DeliveryContext.Provider value={ {cities, setCities, relaypoints, setRelaypoints, condition, setCondition, packages, setPackages, totalWeight, setTotalWeight, availableWeight, setAvailableWeight, tourings, setTourings} }>
        <ContainerContext.Provider value={{ containers, setContainers }}>
        <ProductsContext.Provider value={ {products, setProducts} }>
            <MercureHub>
                { children }
            </MercureHub>
        </ProductsContext.Provider>
        </ContainerContext.Provider>
        </DeliveryContext.Provider>
        </AuthContext.Provider>
    );
}
 
export default DataProvider;