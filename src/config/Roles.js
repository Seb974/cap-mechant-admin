import { isDefinedAndNotVoid } from "src/helpers/utils";

function filterAuthorizationRoles(roles) {
    return !isDefinedAndNotVoid(roles) ? getDefaultRole() : roles.length === 1 ? roles[0] : roles.find(role => role.includes('ADMIN'));
}

function filterRoles(roles) {
    return roles.length === 1 ? roles[0] : roles.filter(role => role !== getDefaultRole())[0];
}

function hasPrivileges(user) {
    return hasAdminPrivileges(user) || hasAdminAccess(user);
}

function hasAdminAccess(user) {
    const adminAccessRoles = ["ROLE_SELLER", "ROLE_DELIVERER"];
    return adminAccessRoles.includes(user.roles);
}

function isSeller(user) {
    return user.roles === "ROLE_SELLER";
}

function isDeliverer(user) {
    return user.roles === "ROLE_DELIVERER";
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
    hasAdminAccess,
    hasAdminPrivileges,
    hasAllPrivileges,
    filterAuthorizationRoles,
    isSeller,
    isDeliverer
}