// :copyright: Copyright (c) 2016 ftrack

/** Return if *str* is null/undefined or an empty string. */
export function isEmptyString(str) {
    return (!str || !str.length || !str.trim());
}

/** Return if *value* is a valid list of comma-separated emails. */
export function isValidCommaSeparatedEmails(value) {
    return value.split(',').every(
        (email) => email.includes('@')
    );
}
