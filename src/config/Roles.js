import { isDefinedAndNotVoid } from "src/helpers/utils";

function filterAuthorizationRoles(roles) {
    return !isDefinedAndNotVoid(roles) ? getDefaultRole() : roles.length === 1 ? roles[0] : roles.find(role => role.includes('ADMIN'));
}

function filterRoles(roles) {
    return roles.length === 1 ? roles[0] : roles.filter(role => role !== getDefaultRole())[0];
}

function hasPrivileges(user) {
    return hasAdminPrivileges(user) || user.isSeller || user.isDeliverer;
}

function hasAdminPrivileges(user) {
    return user.roles.includes('ADMIN');
}

function hasAllPrivileges(user) {
    return user.roles.includes('SUPER_ADMIN');
}

function getDefaultRole() {
    return "ROLE_USER";
}

export default {
    filterRoles,
    getDefaultRole,
    hasPrivileges,
    hasAdminPrivileges,
    hasAllPrivileges,
    filterAuthorizationRoles
}