// :copyright: Copyright (c) 2016 ftrack

/**
 * Return guessed name from *email*
 *
 * Retrieves the part before the at sign, replaces separators with space
 * and transform to title case.
 */
export function guessName(email) {
    let name = email.split('@')[0];
    name = name.replace(/[._-]/g, ' ').replace(/\s\s+/g, ' ');
    name = name.replace(
        /\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
    );
    return name;
}
