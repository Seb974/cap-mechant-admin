import axios from 'axios';

const API_DOMAIN = "http://localhost:8000";
const MERCURE_DOMAIN = "http://localhost:3000";
// const API_DOMAIN = "https://api.cap-mechant.re";
// const MERCURE_DOMAIN = "https://api.cap-mechant.re:3000";

function get(route) {
    return axios.get(API_DOMAIN + route);
}

function deleteEntity(route) {
    return axios.delete(API_DOMAIN + route);
}

function post(route, entity) {
    return axios.post(API_DOMAIN + route, entity);
}

function put(route, entity) {
    return axios.put(API_DOMAIN + route, entity);
}

function patch(route, entity) {
    return axios.patch(API_DOMAIN + route, entity, { headers: {'Content-type': 'application/merge-patch+json'} });
}

export default {
    API_DOMAIN,
    MERCURE_DOMAIN,
    get,
    post,
    put,
    patch,
    delete: deleteEntity
}