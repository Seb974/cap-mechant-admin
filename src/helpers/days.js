export const getWeekDays = () => {
    return [
        {value: 1, label: "LUNDI", isFixed: false},
        {value: 2, label: "MARDI", isFixed: false},
        {value: 3, label: "MERCREDI", isFixed: false},
        {value: 4, label: "JEUDI", isFixed: false},
        {value: 5, label: "VENDREDI", isFixed: false},
        {value: 6, label: "SAMEDI", isFixed: false},
        {value: 0, label: "DIMANCHE", isFixed: false}
    ];
}

export const getStringDate = date => {
    return date.getFullYear() + "-" + getTwoDigits(date.getMonth() + 1) + "-" + getTwoDigits(date.getDate());
}

export const getTwoDigits = number => {
    return number < 10 ? '0' + number : number;
}