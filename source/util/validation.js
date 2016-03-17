// :copyright: Copyright (c) 2016 ftrack

/** Return if *str* is null/undefined or an empty string. */
export function isEmptyString(str) {
    return (!str || !str.length || !str.trim());
}

/** Return *message* if *isValueInvalid* returns true for *value*. */
export function validate(value, isValueInvalid, message) {
    if (isValueInvalid(value)) {
        return message;
    }
    return null;
}
