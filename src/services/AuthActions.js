import axios from 'axios';
import jwtDecode from 'jwt-decode';
import api from 'src/config/api';
import Roles from '../config/Roles';

function authenticate(credentials) {
    return api.post('/api/login_check', credentials)
                .then(response => response.data.token)
                .then(token => {
                    window.localStorage.setItem("authToken", token);
                    return true;
                })
}

function logout() {
    return api.get('/logout')
                .then(response => {
                    window.localStorage.removeItem("authToken");
                    return true;
                });
}

function setup() {
    const token = window.localStorage.getItem("authToken");
    if (token) {
        const { exp } = jwtDecode(token);
        if (exp * 1000 > new Date().getTime()) {
            return ;
        }
    }
    logout();
}

function isAuthenticated() {
    const token = window.localStorage.getItem("authToken");
    if (token) {
        const { exp } = jwtDecode(token);
        if (exp * 1000 > new Date().getTime())
            return true;
    }
    return false;
}

function getCurrentUser() {
    const token = window.localStorage.getItem("authToken");
    if (token) {
        const { exp, id, name, roles, email, metas } = jwtDecode(token);
        if (exp * 1000 > new Date().getTime())
            return {id, email, name, roles: Roles.filterRoles(roles), metas} ;
    }
    return getDefaultUser();
}

function getDefaultUser() {
    return {id:-1, name: "", email: "", roles: Roles.getDefaultRole(), metas: null};
}

function isDefaultUser(user) {
    const defaultUser = getDefaultUser();
    return defaultUser.id === user.id;
}

function setErrorHandler(setCurrentUser, setIsAuthenticated) {
    axios.defaults.withCredentials = true
    axios.interceptors.response.use(response => response, error => {
        if (error.response !== undefined) {
            if (error.response.status === 401) {
                logout().then(res => {
                    setIsAuthenticated(false);
                    setCurrentUser(getCurrentUser());
                    return ;
                })
            }
        }
        return Promise.reject(error);
    });
}

export default {
    authenticate,
    logout,
    setup,
    isAuthenticated,
    getCurrentUser,
    isDefaultUser,
    setErrorHandler
}