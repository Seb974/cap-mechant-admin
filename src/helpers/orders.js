export const getStatus = () => {
    return [
        {value: "ON_PAYMENT", label: "En paiement", isFixed: false},
        {value: "WAITING", label: "En attente", isFixed: false},
        {value: "PRE-PREPARED", label: "En préparation", isFixed: false},
        {value: "PREPARED", label: "A l'expédition", isFixed: false},
        {value: "ON_TRUCK", label: "En livraison", isFixed: false},
        {value: "COLLECTABLE", label: "En point relais", isFixed: false},
        {value: "DELIVERED", label: "Livré", isFixed: false},
        {value: "ABORTED", label: "Abandonné", isFixed: false}
    ];
};

export const getStatusName = (status) => {
    const all = getStatus();
    return all.find(s => s.value === status).label;
};

export const getDeliveredStatus = () => {
    return [
        {value: "COLLECTABLE", label: "En point relais", isFixed: false},
        {value: "DELIVERED", label: "Livré", isFixed: false}
    ];
}

export const getActiveStatus = () => {
    return [
        {value: "WAITING", label: "En attente", isFixed: false},
        {value: "PRE-PREPARED", label: "En préparation", isFixed: false},
        {value: "PREPARED", label: "A l'expédition", isFixed: false},
        {value: "ON_TRUCK", label: "En livraison", isFixed: false},
        {value: "COLLECTABLE", label: "En point relais", isFixed: false},
        {value: "DELIVERED", label: "Livré", isFixed: false}
    ];
}