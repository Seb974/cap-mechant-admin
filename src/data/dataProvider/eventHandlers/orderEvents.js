import Roles from "src/config/Roles";
import { getActiveStatus } from "src/helpers/orders";
import { isDefined } from "src/helpers/utils";

export const updateStatusBetween = (data, dates, status, orders, setOrders, user, supervisor) => {
    const updatedOrders = getOrdersWithUpdates(data, dates, status, orders, user, supervisor);
    setOrders(updatedOrders);
};

export const updatePreparations = (data, dates, orders, setOrders, user, supervisor) => {
    const status = [{value: "WAITING"}, {value: "PRE_PREPARED"}];
    const ordersWithUpdate = getOrdersWithUpdates(data, dates, status, orders, user, supervisor);
    const updatedOrders = Roles.isSeller(user) ? ordersWithUpdate.filter(o => o.items.findIndex(i => !i.isPrepared) !== -1) : ordersWithUpdate;
    setOrders(updatedOrders);
};

export const updateDeliveries = (data, dates, orders, setOrders, user, supervisor) => {
    const status = [{value: "WAITING"}, {value: "PRE_PREPARED"}, {value: "PREPARED"}];
    const updatedOrders = getOrdersWithUpdates(data, dates, status, orders, user, supervisor);
    setOrders(updatedOrders);
};

export const updateRecoveries = (data, dates, orders, setOrders, user, supervisor) => {
    const status = [{value: "WAITING"}, {value: "PRE_PREPARED"}];
    const updatedOrders = getOrdersWithUpdates(data, dates, status, orders, user, supervisor);
    setOrders(updatedOrders);
};

export const updateCheckouts = (data, dates, orders, setOrders, user, supervisor, relaypoint) => {
    const status = getActiveStatus().filter(s => s.value !== "DELIVERED");
    const ordersWithUpdate = getOrdersWithUpdates(data, dates, status, orders, user, supervisor);
    const updatedOrders = ordersWithUpdate.filter(o => o.metas.id === relaypoint.metas.id);
    setOrders(updatedOrders);
};

const getOrdersWithUpdates = (data, dates, status, orders, user, supervisor) => {
    let updatedOrders = orders;
    const { start, end } = formatUTC(dates);
    data.map(order => {
        const deliveryDate = new Date(order.deliveryDate);
        const orderToEdit = {...order, items : getFormattedItems(order)};
        if (deliveryDate >= start && deliveryDate <= end && hasAccess(orderToEdit, user, supervisor))   // && status.findIndex(s => s.value === order.status) !== -1
            updatedOrders = getUpdatedOrders(orderToEdit, updatedOrders);
    });
    return updatedOrders;
};

const formatUTC = dates => ({ start: new Date(dates.start.toUTCString()), end: new Date(dates.end.toUTCString()) });

const getUpdatedOrders = (newOrder, updatedOrders) => {
    const index = updatedOrders.findIndex(o => o.id === newOrder.id);
    const newOrders = index !== -1 ? updatedOrders.map(o => o.id !== newOrder.id ? o : newOrder) : [...updatedOrders, newOrder];
    return newOrders;
};

const getFormattedItems = order => !Array.isArray(order.items) ? Object.keys(order.items).map(key => order.items[key]) : order.items;

const hasAccess = (order, user, supervisor) => {
    return  Roles.hasAdminPrivileges(user) || Roles.isPicker(user) ? true :
            Roles.isSeller(user) && order.items.findIndex(i => i.product.seller.users.findIndex(u => u.id === user.id) !== -1) !== -1 ? true :
            Roles.isSupervisor(user) && isDefined(supervisor) && supervisor.users.findIndex(u => u.id === order.user.id) !== -1;
};