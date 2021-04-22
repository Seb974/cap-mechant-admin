export const isDefined = variable => variable !== undefined && variable !== null;

export const isDefinedAndNotVoid = variable => Array.isArray(variable) ? 
    isDefined(variable) && variable.length > 0 : 
    isDefined(variable);