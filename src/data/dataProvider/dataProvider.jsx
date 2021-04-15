import React, { useEffect, useState } from 'react';
import MercureHub from '../../components/Mercure/MercureHub';
import AuthContext from '../../contexts/AuthContext';
import AuthActions from '../../services/AuthActions';

const DataProvider = ({ children }) => {

    const [isAuthenticated, setIsAuthenticated] = useState(AuthActions.isAuthenticated());
    const [currentUser, setCurrentUser] = useState(AuthActions.getCurrentUser());
    const [eventSource, setEventSource] = useState({});

    useEffect(() => AuthActions.setErrorHandler(setCurrentUser, setIsAuthenticated),[]);
    useEffect(() => setCurrentUser(AuthActions.getCurrentUser()), [isAuthenticated]);

    return (
        <AuthContext.Provider value={ {isAuthenticated, setIsAuthenticated, currentUser, setCurrentUser, eventSource, setEventSource} }>
            <MercureHub>
                { children }
            </MercureHub>
        </AuthContext.Provider>
    );
}
 
export default DataProvider;