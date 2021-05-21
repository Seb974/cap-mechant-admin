import React, { useContext } from 'react';
import { Route, Redirect } from "react-router-dom";
import AuthContext from 'src/contexts/AuthContext';

const PrivateRoute = ({ path, component }) => {
    const enabled = ["ROLE_ADMIN", "ROLE_SUPER_ADMIN"]
    const { isAuthenticated, settings } = useContext(AuthContext);
    return isAuthenticated ? <Route path={ path } component={ component } /> : <Redirect to="/login" />
}
 
export default PrivateRoute;