// :copyright: Copyright (c) 2016 ftrack

import types from 'action/publish';

/**
 * Reduce state for publish view
 *
 * Set options once gathered.
 */
export default function publishReducer(state = null, action) {
    let nextState = state;
    if (action.type === types.PUBLISH_OPTIONS) {
        nextState = Object.assign({}, action.payload);
    }
    return nextState;
}

