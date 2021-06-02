import React, { useContext } from 'react';
import { Route, Redirect } from "react-router-dom";
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';

const AdminRoute = ({ path, component }) => {
    const { isAuthenticated, currentUser } = useContext(AuthContext);
    return isAuthenticated && Roles.hasPrivileges(currentUser) ? <Route path={ path } component={ component } /> : <Redirect to="/login" />
}
 
export default AdminRoute;