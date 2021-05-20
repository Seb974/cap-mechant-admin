export const isDefined = variable => variable !== undefined && variable !== null;

export const isDefinedAndNotVoid = variable => Array.isArray(variable) ? isDefined(variable) && variable.length > 0 : isDefined(variable);

export const getDateFrom = (date, nbDaysToAdd = 0, hour = 9, minutes = 0) => {
    return new Date(date.getFullYear(), date.getMonth(), (date.getDate() + nbDaysToAdd), hour, minutes, 0);
};

export const getNumericOrNull = value => typeof value === 'string' ? (value.length > 0 ? parseFloat(value) : null) : value;

export const getFloat = value => typeof value === 'string' ? parseFloat(value.replace(',','.')) : value;

export const getInt = value => typeof value === 'string' ? parseInt(value) : value;
