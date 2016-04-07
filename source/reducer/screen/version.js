// :copyright: Copyright (c) 2016 ftrack

import types from 'action/import';

/**
 * Reduce state for version view
 *
 * Set options once gathered.
 */
export default function versionReducer(state = {}, action) {
    let nextState = state;
    if (action.type === types.IMPORT_RESET) {
        nextState = {};
    } else if (action.type === types.IMPORT_GET_COMPONENTS_SUCCESS) {
        nextState = Object.assign({}, action.payload);
    }
    return nextState;
}
